import jwt from "jsonwebtoken";
import env from "../config/env.js";

function authenticate(req, res, next) {
  try {
    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errorCode: "AUTHENTICATION_REQUIRED"
      });
    }

    const [scheme, token] =
      authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization header",
        errorCode:
          "INVALID_AUTHORIZATION_HEADER"
      });
    }

    const decoded = jwt.verify(
      token,
      env.jwt.accessSecret
    );

    req.user = {
      userId: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
        errorCode: "ACCESS_TOKEN_EXPIRED"
      });
    }

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
        errorCode: "INVALID_ACCESS_TOKEN"
      });
    }

    next(error);
  }
}

export { authenticate };

export default authenticate;