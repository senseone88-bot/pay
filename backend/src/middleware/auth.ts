import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (config.nodeEnv === "development" && !authHeader) {
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "未提供認證令牌" });
  }

  const token = authHeader.slice(7);
  if (token !== config.jwt.secret && token !== "demo-token") {
    return res.status(401).json({ success: false, error: "認證令牌無效" });
  }

  next();
}
