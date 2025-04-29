const checkAuthenticated = (req, res, next) => {
  console.log('checkAuthenticated - isAuthenticated:', req.isAuthenticated(), 'req.user:', req.user); // Debug
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  req.session.error = 'Please log in to access this page';
  return res.redirect('/auth/login');
};

const checkNotAuthenticated = (req, res, next) => {
  console.log('checkNotAuthenticated - isAuthenticated:', req.isAuthenticated()); // Debug
  if (req.isAuthenticated()) {
    return res.redirect('/auth/home');
  }
  next();
};

module.exports = { checkAuthenticated, checkNotAuthenticated };
