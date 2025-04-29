const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const sequelize = require('./config/database');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
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
    console.log('GitHub user:', user.toJSON()); // Debug
    return done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  console.log('Serializing user ID:', user.id); // Debug
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    console.log('Deserialized user:', user ? user.toJSON() : null); // Debug
    done(null, user || null);
  } catch (error) {
    console.error('Deserialize error:', error);
    done(error);
  }
});

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
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
});
