const LocalStrategy = require("passport-local").Strategy;
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");

const signIn = (passport) => {
  passport.use(
    "signin",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      (req, email, password, done) => {
        userModel.findOne({ email: email }, (err, user) => {
          if (err) return done(err);
          if (!user) {
            return done(
              null,
              false,
              req.flash("message", "Không có tài khoản này!!!")
            );
          }
          if (user.password !== password) {
            return done(
              null,
              false,
              req.flash(
                "message",
                "Tài khoản hoặc mật khẩu đăng nhập không chính xác."
              )
            );
          }
          return done(null, user);
        });
      }
    )
  );
  const isValidPassword = (user, password) => {
    const by = bcrypt.compareSync(password, user.password);
    return by;
  };
};

module.exports = signIn;
