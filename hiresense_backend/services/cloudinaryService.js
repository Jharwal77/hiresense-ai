import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

export async function uploadResume(buffer, originalName) {
  const extension = getExtension(originalName);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "hiresense/resumes",
        use_filename: false,
        unique_filename: true,
        format: extension || undefined
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: result.resource_type,
          bytes: result.bytes,
          format: result.format
        });
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteResume(publicId) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw"
  });
}

function getExtension(filename) {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return filename
    .slice(lastDot + 1)
    .toLowerCase();
}