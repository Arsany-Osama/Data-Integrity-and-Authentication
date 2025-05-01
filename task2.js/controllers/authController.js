const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
require('dotenv').config();

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
      return res.status(400).json({
        success: false,
        message: errors.array().map(err => err.msg).join(', '),
      });
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }

      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists',
        });
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
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, auth_method: user.auth_method },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(201).json({
        success: true,
        message: 'Sign up successful!',
        token,
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred during signup',
      });
    }
  },
];

const login = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map(err => err.msg).join(', '),
      });
    }

    const { email, password, remember } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email not registered',
        });
      }
      if (user.auth_method !== 'manual') {
        return res.status(401).json({
          success: false,
          message: 'Account registered via GitHub. Use GitHub login.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password',
        });
      }

      await LoginLog.create({
        user_id: user.id,
        ip_address: req.ip,
      });

      const expiresIn = remember ? '7d' : '1d';
      const token = jwt.sign(
        { id: user.id, username: user.username, auth_method: user.auth_method },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 days or 1 day
      });

      return res.json({
        success: true,
        message: 'Login successful',
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred during login',
      });
    }
  },
];

const githubCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      console.error('GitHub callback: No user found in req.user');
      return res.redirect('/auth/login?error=GitHub authentication failed');
    }

    console.log('GitHub callback: User found:', { id: user.id, username:

 user.username, auth_method: user.auth_method });

    await LoginLog.create({
      user_id: user.id,
      ip_address: req.ip,
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, auth_method: user.auth_method },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('GitHub callback: JWT token generated');

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('GitHub callback: JWT cookie set');

    // Clear Passport session
    req.logout((err) => {
      if (err) {
        console.error('Passport logout error in githubCallback:', err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error in githubCallback:', err);
        }
        res.clearCookie('connect.sid');
        console.log('GitHub callback: Session destroyed, redirecting to /auth/home');
        res.redirect('/auth/home'); // Removed token query parameter
      });
    });
  } catch (error) {
    console.error('GitHub callback error:', error);
    return res.redirect('/auth/login?error=An error occurred during GitHub login');
  }
};

const logout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        console.error('Passport logout error:', err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.clearCookie('jwt');
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully',
        });
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
    });
  }
};

module.exports = { signup, login, githubCallback, logout };
