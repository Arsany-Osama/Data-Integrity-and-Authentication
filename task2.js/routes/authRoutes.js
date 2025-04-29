const express = require('express');
const passport = require('passport');
const { signup, login, logout, githubCallback } = require('../controllers/authController');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/login', checkNotAuthenticated, (req, res) => res.render('auth', { error: req.session.error, signupActive: false }));
router.post('/login', checkNotAuthenticated, login); // Use login array directly
router.get('/signup', checkNotAuthenticated, (req, res) => res.render('auth', { error: req.session.error, signupActive: true }));
router.post('/signup', checkNotAuthenticated, signup); // Use signup array directly
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/auth/login' }), githubCallback);
router.get('/logout', checkAuthenticated, logout);
router.get('/home', checkAuthenticated, (req, res) => {
  console.log('Home route - req.user:', req.user); // Debug
  res.render('home', { user: req.user || {} });
});

module.exports = router;
