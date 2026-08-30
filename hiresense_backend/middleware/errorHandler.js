function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: "Route not found",
    errorCode: "ROUTE_NOT_FOUND"
  });
}

export function errorHandler(err, req, res, next) {
  // Keep production logs minimal.
  // Detailed error information should not be returned to clients.
  if (isProduction()) {
    console.error(
      `[ERROR] ${req.method} ${req.originalUrl} - ${err?.name || "Error"}`
    );
  } else {
    console.error(
      `[ERROR] ${req.method} ${req.originalUrl}`,
      err
    );
  }

  let statusCode = Number(err?.statusCode) || 500;
  let errorCode = err?.errorCode || "INTERNAL_ERROR";
  let message = err?.message || "Internal server error";

  // Multer file-size error.
  if (err?.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    errorCode = "FILE_TOO_LARGE";
    message = "File size must not exceed 10 MB";
  }

  // Never allow invalid status codes to reach Express.
  if (
    !Number.isInteger(statusCode) ||
    statusCode < 400 ||
    statusCode > 599
  ) {
    statusCode = 500;
    errorCode = "INTERNAL_ERROR";
    message = "Internal server error";
  }

  // Hide internal error details in production.
  if (isProduction() && statusCode >= 500) {
    message = "Internal server error";
    errorCode = "INTERNAL_ERROR";
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode
  });
}