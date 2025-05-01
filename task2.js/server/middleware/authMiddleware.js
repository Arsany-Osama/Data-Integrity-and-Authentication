const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkAuthenticated = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log('checkAuthenticated: Token found in Authorization header');
  } else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('checkAuthenticated: Token found in jwt cookie');
  } else {
    console.log('checkAuthenticated: No token found, redirecting to /auth/login');
    return res.redirect('/auth/login?error=Please log in to access this page');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('checkAuthenticated: Token verified, user:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('checkAuthenticated: JWT verification error:', error);
    res.clearCookie('jwt');
    return res.redirect('/auth/login?error=Invalid or expired token');
  }
};

const checkNotAuthenticated = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1] || req.cookies.jwt;

  // Log the request path for debugging
  console.log(`checkNotAuthenticated: Processing request for path: ${req.path}`);

  // Allow static asset paths
  const staticPaths = ['/js/', '/css/', '/images/', '/fonts/', '/favicon.ico'];
  if (staticPaths.some(path => req.path.startsWith(path) || req.path === path)) {
    console.log(`checkNotAuthenticated: Static asset request (${req.path}), proceeding`);
    return next();
  }

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      console.log('checkNotAuthenticated: Valid token found');
      // Prevent redirect loop for /auth/home and /auth/user
      if (req.path === '/auth/home' || req.path === '/auth/user' || req.path === '/auth/token') {
        console.log(`checkNotAuthenticated: Request for ${req.path}, proceeding`);
        return next();
      }
      console.log('checkNotAuthenticated: Redirecting to /auth/home');
      return res.redirect('/auth/home');
    } catch (error) {
      console.log('checkNotAuthenticated: Invalid token, proceeding as unauthenticated');
      next();
    }
  } else if (req.isAuthenticated()) {
    console.log('checkNotAuthenticated: Passport session found, redirecting to /auth/home');
    return res.redirect('/auth/home');
  } else {
    console.log('checkNotAuthenticated: No token or session, proceeding');
    next();
  }
};

module.exports = { checkAuthenticated, checkNotAuthenticated };
