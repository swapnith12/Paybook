import { RequestHandler } from "express";
import redis from "../config/redis";

export const authenticate: RequestHandler = (req, res, next) => {
  const sessionId = req.cookies?.sessionId;

  if (!sessionId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized - No session",
    });
    return;
  }

  redis.get(`session:${sessionId}`)
    .then((userData) => {
      if (!userData) {
        res.clearCookie("sessionId");
        res.status(401).json({
          success: false,
          message: "Session expired or invalid",
        });
        return;
      }

      req.user = JSON.parse(userData);
      next();
    })
    .catch((error) => {
      console.error("Auth middleware error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
};