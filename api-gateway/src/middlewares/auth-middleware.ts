import { Request, Response, NextFunction } from "express"
import redis from "../config/redis"

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.cookies?.sessionId

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No session",
      });
    }

    // 🔎 Check Redis
    const userData = await redis.get(`session:${sessionId}`);

    if (!userData) {
      // Optional: clear invalid cookie
      res.clearCookie("sessionId")

      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    // 🔎 Attach user to request
    req.user = JSON.parse(userData);

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
