import session from 'express-session';
import { loadEnvFile } from 'node:process';
loadEnvFile();

console.log(process.env.SESSION_SECRET)
export const sessionMiddleware = session({
  name: 'paybook.sid',
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}); 
