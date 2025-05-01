const express = require('express');
const passport = require('passport');
const { signup, login, githubCallback, logout } = require('../controllers/authController');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// Login route
router.get('/login', checkNotAuthenticated, (req, res) => {
  const error = req.query.error || null;
  const message = req.query.message || null;
  console.log('GET /auth/login: Rendering login page, error:', error, 'message:', message);
  res.render('auth', { error, message, signupActive: false });
});

// Signup route
router.get('/signup', checkNotAuthenticated, (req, res) => {
  console.log('GET /auth/signup: Rendering signup page');
  res.render('auth', { error: null, message: null, signupActive: true });
});

// Signup POST route
router.post('/signup', signup);

// Login POST route
router.post('/login', login);

// GitHub OAuth initiation
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub OAuth callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/auth/login?error=GitHub authentication failed' }), 
  githubCallback
);

// Home route
router.get('/home', checkAuthenticated, (req, res) => {
  console.log('GET /auth/home: User authenticated:', req.user);
  res.render('home', { user: req.user, request: req });
});

// Logout route
router.post('/logout', logout);

// User data route
router.get('/user', checkAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.error('GET /auth/user: User not found for ID:', req.user.id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('GET /auth/user: User found:', { id: user.id, username: user.username, auth_method: user.auth_method });
    res.json({
      success: true,
      id: user.id,
      username: user.username,
      auth_method: user.auth_method || 'github',
    });
  } catch (error) {
    console.error('GET /auth/user: Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Token retrieval route
router.get('/token', checkAuthenticated, (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    console.log('GET /auth/token: Returning token for user:', req.user);
    res.json({ success: true, token });
  } else {
    console.error('GET /auth/token: No token found');
    res.status(401).json({ success: false, message: 'No token available' });
  }
});

module.exports = router;
