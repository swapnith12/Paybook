import { Router } from 'express'
import type { Request, Response } from "express";
import passport from 'passport'
import '../../Auth/google.strategy.js'
import {prisma} from '../../utils/prisma.js'
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import RedisClient from '../../config/redis.js';


const router = Router()

// 🔐 Start Google OAuth login
router.get(
  
  '/me',isAuthenticated,async(req,res)=>{
    const user = req.user
    res.send(user)
  }
)
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)
// 🔁 Google OAuth callback
router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', { failureRedirect: '/google' }),
   async (req, res) => {
    try {
      const sessionId = req.sessionID; // unique per user

      await RedisClient.set(
        `session:${sessionId}`,
        JSON.stringify(req.user),
        "EX",
        60 * 60 * 24 // 1 day expiry
      );

      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send("Redis error");
    }
  }
);


router.post('/makeAdmin',isAuthenticated,async(req:Request,res:Response)=>{
  const user = req.body.user
  let userDB = await prisma.user.findFirst({
            where: {
              name:user
            },
          });
    if(userDB?.isAdmin===true){
      return res.status(500).json({"message":"Already he/she is admin"})
    }
    if(userDB && userDB.googleId){
      await prisma.user.update({
        where:{name:user,googleId:userDB.googleId},
        data: { isAdmin: true },
      })
      return res.status(200).json(userDB);
    }
    return res.status(500).json({"message":"No User found with that Name"})
})
// // 👤 Get current logged-in user
// router.get('/me', authenticate, me)

// // 🚪 Logout
// router.post('/logout', logout)

export default router 
