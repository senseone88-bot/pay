import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Error]", err.message);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "伺服器內部錯誤" : err.message,
  });
}
