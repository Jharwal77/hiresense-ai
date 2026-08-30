import multer from "multer";
import path from "path";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_FILES = {
  ".pdf": [
    "application/pdf"
  ],

  ".doc": [
    "application/msword"
  ],

  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],

  ".txt": [
    "text/plain"
  ],

  ".rtf": [
    "application/rtf",
    "text/rtf"
  ],

  ".odt": [
    "application/vnd.oasis.opendocument.text"
  ]
};

const storage = multer.memoryStorage();

function normalizeExtension(originalName) {
  return path
    .extname(originalName || "")
    .toLowerCase()
    .trim();
}

function createUploadError(
  message,
  errorCode = "UNSUPPORTED_FILE_TYPE"
) {
  const error = new Error(message);

  error.statusCode = 400;
  error.errorCode = errorCode;

  return error;
}

function fileFilter(req, file, callback) {
  try {
    const extension =
      normalizeExtension(file.originalname);

    if (!extension) {
      return callback(
        createUploadError(
          "File extension is required",
          "FILE_EXTENSION_REQUIRED"
        )
      );
    }

    const allowedMimeTypes =
      ALLOWED_FILES[extension];

    if (!allowedMimeTypes) {
      return callback(
        createUploadError(
          "Unsupported file type. Allowed formats: PDF, DOC, DOCX, TXT, RTF, ODT",
          "UNSUPPORTED_FILE_TYPE"
        )
      );
    }

    if (
      !allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      return callback(
        createUploadError(
          "File MIME type does not match the allowed format",
          "INVALID_FILE_MIME_TYPE"
        )
      );
    }

    return callback(null, true);
  } catch (error) {
    return callback(error);
  }
}

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },

  fileFilter
});

export {
  upload,
  MAX_FILE_SIZE,
  ALLOWED_FILES,
  normalizeExtension
};

export default upload;