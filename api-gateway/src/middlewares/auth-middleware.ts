import { Request, Response, NextFunction } from "express";
import  redis  from "../config/redis";


export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      return res.status(401).json({
        message: "Unauthorized - No session",
      });
    }

    const userData = await redis.get(`session:${sessionId}`);

    if (!userData) {
      return res.status(401).json({
        message: "Session expired",
      });
    }

    req.user = JSON.parse(userData);

    next();
  } catch (error) {
    console.error("Auth error:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};
