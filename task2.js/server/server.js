const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', '../client/views');

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`);
  next();
});

// Serve static files from client/public
app.use(express.static('../client/public'));

// Session middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Serialize/deserialize user for Passport
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ where: { github_id: profile.id } });
        if (!user) {
          let baseUsername = profile.username || `github_user_${profile.id}`;
          let username = baseUsername;
          let counter = 1;
          while (await User.findOne({ where: { username } })) {
            username = `${baseUsername}_${counter}`;
            counter++;
          }
          user = await User.create({
            username,
            email: profile.emails?.[0]?.value || `${profile.id}@github.com`,
            github_id: profile.id,
            auth_method: 'github',
          });
        } else if (!user.auth_method || !user.username) {
          user.auth_method = 'github';
          user.username = user.username || `github_user_${profile.id}`;
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Routes
app.use('/auth', authRoutes);

// Cache control middleware
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
