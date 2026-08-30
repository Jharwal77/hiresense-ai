import path from "path";
import { createRequire } from "module";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import JSZip from "jszip";

const require = createRequire(import.meta.url);
const rtfToText = require("rtf-to-text");

const SUPPORTED_FORMATS = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "rtf",
  "odt"
];

const MAX_EXTRACTED_TEXT_LENGTH = 2_000_000;

function createParserError(
  message,
  errorCode = "DOCUMENT_PARSE_FAILED"
) {
  const error = new Error(message);

  error.statusCode = 400;
  error.errorCode = errorCode;

  return error;
}

function normalizeText(text) {
  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ensureBuffer(buffer) {
  if (!Buffer.isBuffer(buffer)) {
    throw createParserError(
      "Uploaded file buffer is missing",
      "FILE_BUFFER_MISSING"
    );
  }

  if (buffer.length === 0) {
    throw createParserError(
      "Uploaded file is empty",
      "EMPTY_FILE"
    );
  }
}

function detectPdf(buffer) {
  if (buffer.length < 5) {
    return false;
  }

  return (
    buffer
      .subarray(0, 5)
      .toString("ascii") === "%PDF-"
  );
}

function detectZip(buffer) {
  if (buffer.length < 4) {
    return false;
  }

  const signature = buffer.readUInt32LE(0);

  return (
    signature === 0x04034b50 ||
    signature === 0x06054b50 ||
    signature === 0x08074b50
  );
}

function detectRtf(buffer) {
  const header = buffer
    .subarray(0, Math.min(buffer.length, 32))
    .toString("ascii");

  return header.startsWith("{\\rtf");
}

function detectText(buffer) {
  const sample = buffer.subarray(
    0,
    Math.min(buffer.length, 8192)
  );

  for (const byte of sample) {
    if (
      byte === 0 ||
      byte < 7 ||
      (
        byte >= 14 &&
        byte < 32 &&
        byte !== 27 &&
        byte !== 9 &&
        byte !== 10 &&
        byte !== 13
      )
    ) {
      return false;
    }
  }

  return true;
}

async function detectZipDocumentFormat(buffer) {
  try {
    const zip = await JSZip.loadAsync(buffer, {
      checkCRC32: false
    });

    const entries = Object.keys(zip.files);

    const hasWordDocument =
      entries.includes("word/document.xml");

    const hasContentTypes =
      entries.includes("[Content_Types].xml");

    if (hasWordDocument && hasContentTypes) {
      return "docx";
    }

    const hasOdtContent =
      entries.includes("content.xml");

    const hasOdtManifest =
      entries.some((entry) =>
        entry.startsWith("META-INF/")
      );

    if (hasOdtContent && hasOdtManifest) {
      return "odt";
    }

    return null;
  } catch {
    return null;
  }
}

async function detectDocumentFormat({
  buffer,
  extension,
  mimeType
}) {
  ensureBuffer(buffer);

  const normalizedExtension = String(extension || "")
    .toLowerCase()
    .replace(".", "");

  const normalizedMime = String(mimeType || "")
    .toLowerCase()
    .trim();

  if (detectPdf(buffer)) {
    return "pdf";
  }

  if (detectRtf(buffer)) {
    return "rtf";
  }

  if (detectZip(buffer)) {
    const zipFormat =
      await detectZipDocumentFormat(buffer);

    if (zipFormat) {
      return zipFormat;
    }

    throw createParserError(
      "Uploaded archive is not a supported DOCX or ODT document",
      "INVALID_DOCUMENT_SIGNATURE"
    );
  }

  if (
    normalizedExtension === "doc" ||
    normalizedMime === "application/msword"
  ) {
    throw createParserError(
      "Legacy DOC files require binary document extraction support",
      "DOC_EXTRACTION_UNSUPPORTED"
    );
  }

  if (
    normalizedExtension === "txt" ||
    normalizedMime === "text/plain"
  ) {
    if (detectText(buffer)) {
      return "txt";
    }

    throw createParserError(
      "Uploaded TXT file contains invalid text data",
      "INVALID_TEXT_FILE"
    );
  }

  throw createParserError(
    "Unable to determine the actual document format",
    "INVALID_DOCUMENT_SIGNATURE"
  );
}

async function extractPdf(buffer) {
  const parser = new PDFParse({
    data: buffer
  });

  try {
    const result = await parser.getText();

    return result?.text || "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer) {
  const result =
    await mammoth.extractRawText({
      buffer
    });

  return result?.value || "";
}

function extractTxt(buffer) {
  return buffer.toString("utf8");
}

function extractRtf(buffer) {
  return rtfToText.fromString(
    buffer.toString("utf8")
  );
}

async function extractOdt(buffer) {
  const zip = await JSZip.loadAsync(buffer, {
    checkCRC32: false
  });

  const contentFile =
    zip.file("content.xml");

  if (!contentFile) {
    throw createParserError(
      "ODT content.xml was not found",
      "ODT_CONTENT_MISSING"
    );
  }

  const xml = await contentFile.async("text");

  return xml
    .replace(/<text:tab\/>/g, "\t")
    .replace(/<\/text:p>/g, "\n")
    .replace(/<\/text:h>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function extractTextByFormat(
  format,
  buffer
) {
  switch (format) {
    case "pdf":
      return extractPdf(buffer);

    case "docx":
      return extractDocx(buffer);

    case "txt":
      return extractTxt(buffer);

    case "rtf":
      return extractRtf(buffer);

    case "odt":
      return extractOdt(buffer);

    case "doc":
      throw createParserError(
        "Legacy DOC extraction is not enabled yet",
        "DOC_EXTRACTION_UNSUPPORTED"
      );

    default:
      throw createParserError(
        `Unsupported document format: ${format}`,
        "UNSUPPORTED_DOCUMENT_FORMAT"
      );
  }
}

export async function parseDocument({
  buffer,
  originalName,
  mimeType
}) {
  ensureBuffer(buffer);

  const extension = path
    .extname(originalName || "")
    .toLowerCase();

  const format =
    await detectDocumentFormat({
      buffer,
      extension,
      mimeType
    });

  if (!SUPPORTED_FORMATS.includes(format)) {
    throw createParserError(
      "Unsupported document format",
      "UNSUPPORTED_DOCUMENT_FORMAT"
    );
  }

  let rawText;

  try {
    rawText =
      await extractTextByFormat(
        format,
        buffer
      );
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const parserError = new Error(
      `Failed to extract text from ${format.toUpperCase()} document`
    );

    parserError.statusCode = 400;
    parserError.errorCode =
      "TEXT_EXTRACTION_FAILED";

    parserError.cause = error;

    throw parserError;
  }

  const text = normalizeText(rawText);

  if (!text) {
    throw createParserError(
      "No readable text could be extracted from the document",
      "EMPTY_EXTRACTED_TEXT"
    );
  }

  if (
    text.length >
    MAX_EXTRACTED_TEXT_LENGTH
  ) {
    throw createParserError(
      "Extracted document text is too large",
      "EXTRACTED_TEXT_TOO_LARGE"
    );
  }

  return {
    format,
    extension,
    mimeType,
    text,
    characterCount: text.length
  };
}

export function normalizeExtractedText(text) {
  return normalizeText(text);
}

export {
  detectDocumentFormat,
  extractTextByFormat,
  MAX_EXTRACTED_TEXT_LENGTH,
  SUPPORTED_FORMATS
};

export default {
  parseDocument,
  normalizeExtractedText,
  detectDocumentFormat
};