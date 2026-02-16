import { NextFunction, Request, Response } from 'express';

export interface ServiceConfig {
  path: string;
  url: string;
  pathRewrite: Record<string, string>;
  name: string;
  timeout?: number;
  isProtected?:boolean
}

export interface ProxyErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  googleId: string;
  isAdmin: boolean;
}
