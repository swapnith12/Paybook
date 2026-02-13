import passport from "passport";
import { prisma } from "../utils/prisma.js";

passport.serializeUser((user: any, done) => {
  console.log(user,"serialize called")
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    console.log(user)
    done(null, user);
  } catch (err) {
    done(err);
  }
});
