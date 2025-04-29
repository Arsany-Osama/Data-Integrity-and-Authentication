const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');

const passwordPolicy = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
];

const signup = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email'),
  ...passwordPolicy,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array().map(err => err.msg).join(', ');
      return res.redirect('/auth/signup');
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        req.session.error = 'Email already exists';
        return res.redirect('/auth/signup');
      }

      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        req.session.error = 'Username already exists';
        return res.redirect('/auth/signup');
      }

      const user = await User.create({
        username,
        email,
        password,
        auth_method: 'manual',
      });

      await LoginLog.create({
        user_id: user.id,
        ip_address: req.ip,
        login_method: 'manual',
      });

      req.session.error = null;
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Signup error:', error);
      req.session.error = 'An error occurred during signup';
      res.redirect('/auth/signup');
    }
  },
];

const login = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.session.error = errors.array().map(err => err.msg).join(', ');
      return res.redirect('/auth/login');
    }

    const { email, password, remember } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user || user.auth_method !== 'manual') {
        console.log('Login failed: Invalid email or user not manual');
        req.session.error = 'Invalid credentials';
        return res.redirect('/auth/login');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Login failed: Invalid password');
        req.session.error = 'Invalid credentials';
        return res.redirect('/auth/login');
      }

      // Set session maxAge based on remember checkbox
      req.session.cookie.maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
      console.log('Session maxAge set to:', req.session.cookie.maxAge, 'Remember Me:', remember);

      await LoginLog.create({
        user_id: user.id,
        ip_address: req.ip,
        login_method: 'manual',
      });

      // Use Passport's req.login to establish session
      req.login(user, (error) => {
        if (error) {
          console.error('req.login error:', error);
          req.session.error = 'Login failed';
          return next(error);
        }
        console.log('Login successful, user:', user.toJSON());
        req.session.error = null;
        res.redirect('/auth/home');
      });
    } catch (error) {
      console.error('Login error:', error);
      req.session.error = 'An error occurred during login';
      res.redirect('/auth/login');
    }
  },
];

const githubCallback = async (req, res) => {
  try {
    await LoginLog.create({
      user_id: req.user.id,
      ip_address: req.ip,
      login_method: 'github',
    });

    req.session.error = null;
    res.redirect('/auth/home');
  } catch (error) {
    console.error('GitHub callback error:', error);
    req.session.error = 'An error occurred during GitHub login';
    res.redirect('/auth/login');
  }
};

const logout = (req, res) => {
  req.logout((error) => {
    if (error) {
      console.error('Logout error:', error);
      return res.redirect('/auth/home');
    }
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  });
};

module.exports = { signup, login, githubCallback, logout };
