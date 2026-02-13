import session from 'express-session';
import { loadEnvFile } from 'node:process';
loadEnvFile();

export const sessionMiddleware = session({
  name: 'paybook.sid',
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}); 
