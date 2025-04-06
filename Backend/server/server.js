const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

// Configure Passport with Google Strategy
passport.use(new GoogleStrategy({
  clientID: '520016725734-7mq3cl77tq37cm20tqss1j99q8kfrtoa.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:4001/auth/google/callback'
},
(_accessToken, _refreshToken, profile, done) => {
  // Here, you can handle user profile information
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();

// Configure Passport with Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
},
(accessToken, refreshToken, profile, done) => {
  // Here, you can handle user profile information
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Endpoint to start Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Endpoint for Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect to your desired route after successful login
  }
);

app.listen(4001, () => {
  console.log(`Server is running on ${process.env.BACKEND_URL}`);
});

});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(session({ secret: 'SECRET', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Endpoint to start Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Endpoint for Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect to your desired route after successful login
  }
);

app.listen(4001, () => {
  console.log('Server is running on http://localhost:4001');
});
