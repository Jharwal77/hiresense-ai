import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import env from "./config/env.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import candidateDetailsRoutes from "./routes/candidateDetailsRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";

import {
  notFound,
  errorHandler
} from "./middleware/errorHandler.js";

const app = express();

app.disable("x-powered-by");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    errorCode: "RATE_LIMIT_EXCEEDED"
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
    errorCode: "AUTH_RATE_LIMIT_EXCEEDED"
  }
});

app.use(helmet());

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
);

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

app.use(cookieParser());

app.use(globalLimiter);

if (env.nodeEnv !== "test") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to HireSense AI API",
    version: "v1"
  });
});

app.use(
  "/api/health",
  healthRoutes
);

app.use("/api/auth", authLimiter, authRoutes);

app.use(
  "/api/candidates",
  candidateRoutes
);

app.use(
  "/api/companies",
  companyRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/applications",
  applicationRoutes
);

app.use(
  "/api/employer/candidates",
  candidateDetailsRoutes
);

app.use(
  "/api",
  matchingRoutes
);

app.use(notFound);

app.use(errorHandler);

export default app;