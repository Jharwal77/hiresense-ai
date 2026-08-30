import express from "express";
import { checkMySQL } from "../config/mysql.js";
import { checkMongo } from "../config/mongo.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const [mysqlHealthy, mongoHealthy] = await Promise.all([
      checkMySQL(),
      checkMongo()
    ]);

    const healthy = mysqlHealthy && mongoHealthy;

    res.status(healthy ? 200 : 503).json({
      success: healthy,
      message: healthy
        ? "HireSense AI backend is healthy"
        : "One or more dependencies are unhealthy",
      data: {
        api: "up",
        mysql: mysqlHealthy ? "up" : "down",
        mongodb: mongoHealthy ? "up" : "down"
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;