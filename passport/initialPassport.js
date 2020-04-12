var signin = require("./signIn");
var signup = require("./signUp");
var userModel = require("../model/userModel");

const initPassport = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    userModel.findById(id, (err, user) => {
      done(err, user);
    });
  });

  signin(passport);
  signup(passport);
};

module.exports = initPassport;
