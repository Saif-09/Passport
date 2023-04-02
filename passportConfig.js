const localStrategy = require('passport-local').Strategy;
const { User } = require('./database.js');
const crypto = require('crypto');

exports.initializingPassport = (passport) => {
    console.log("initializing passport");
  passport.use(
    new localStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        console.log(user);
        if (!user) {
          return done(new Error('User not found'), false);
        }
        const isPasswordCorrect = crypto.timingSafeEqual(
          Buffer.from(user.password),
          Buffer.from(password)
        );
        if (!isPasswordCorrect) {
          return done(new Error('Incorrect password'), false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error('User not found'), false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  });
};

exports.isAuthenticated = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.redirect('/login');
};
