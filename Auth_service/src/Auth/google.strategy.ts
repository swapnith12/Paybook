import passport from "passport";
//@ts-ignore
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../utils/prisma.js";
import './passport.js'


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3001/api/v1/auth/oauth2/redirect/google",
      scope: ["profile","email"],
    },
    async (_accessToken:any, _refreshToken:any, profile:any, done:any) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!profile.id) {
          return done(new Error("Google account has no email"));
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { name: profile.displayName },
            ],
          },
        });

        
        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
            },
          });
        }

        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    } 
  )
);
