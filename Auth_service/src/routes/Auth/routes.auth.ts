import { Router } from 'express';
import type { Request, Response } from 'express';
import passport from 'passport';
import '../../Auth/google.strategy.js';
import { prisma } from '../../utils/prisma.js';
import { isAuthenticated } from '../../middleware/auth.middleware.js';
import RedisClient from '../../config/redis.js';
import crypto from 'crypto';

const router = Router();

/**
 * 🔐 Get Current Logged-in User
 */
router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});


router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/oauth2/redirect/google',
  passport.authenticate('google', { session: false, failureRedirect: '/google' }),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
        });
      }

     
      const sessionId = crypto.randomUUID();

      await RedisClient.set(
        `session:${sessionId}`,
        JSON.stringify(req.user),
        'EX',
        60 * 60 * 24 
      );

     
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      });

      return res.redirect('http://localhost:3000');
    } catch (error) {
      console.error('OAuth callback error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);


router.post(
  '/makeAdmin',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { user } = req.body;

      const userDB = await prisma.user.findFirst({
        where: { name: user },
      });

      if (!userDB) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (userDB.isAdmin) {
        return res.status(400).json({
          success: false,
          message: 'User is already admin',
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userDB.id },
        data: { isAdmin: true },
      });

      return res.status(200).json({
        success: true,
        user: updatedUser,
      });
    } catch (error) {
      console.error('MakeAdmin error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
);


router.post(
  '/logout',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const sessionId = req.cookies?.sessionId;

      if (sessionId) {
        await RedisClient.del(`session:${sessionId}`);
      }

      res.clearCookie('sessionId');

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }
);

export default router;
