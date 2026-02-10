import { Router } from 'express'
import passport from 'passport'
import '../../Auth/google.strategy.js'
// import {
//   googleCallback,
//   logout,
//   me,
// } from '../auth/auth.controller'
// import { authenticate } from '../middleware/authenticate'

const router = Router()

// 🔐 Start Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)
// 🔁 Google OAuth callback
router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

// // 👤 Get current logged-in user
// router.get('/me', authenticate, me)

// // 🚪 Logout
// router.post('/logout', logout)

export default router 
