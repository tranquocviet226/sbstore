const express = require("express");
const userModel = require("../model/userModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

//Multer
const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/imgUser");
  },
  filename(req, file, callback) {
    callback(null, `${uuidv4()}.jpeg`);
  },
});
const upload = multer({ storage: Storage });

const isAuthenticated = (req, res, next) => {
  //Nếu đã đăng nhập thì tiếp tục điều hướng
  if (req.isAuthenticated()) return next();
  //Nếu chưa đăng nhập thì chuyển về trang đăng nhập
  res.redirect("/");
};

const Routes = (passport) => {
  // Go to Login
  router.get("/", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/home");
    res.render("users/signin.hbs", {
      layout: "index.hbs",
      message: req.flash("message"),
    });
  });

  // SignIn --------------
  router.get("/signin", isAuthenticated, (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/home");
    res.render("users/signin.hbs", {
      layout: "index.hbs",
    });
  });
  // --------------
  router.post(
    "/signin",
    passport.authenticate("signin", {
      successRedirect: "/home",
      failureRedirect: "/",
      failureFlash: true,
    })
  );
  // Signup --------------
  router.get("/signup", (req, res) => {
    if (req.isAuthenticated()) return res.redirect("/home");
    res.render("users/signup.hbs", {
      layout: "index.hbs",
      message: req.flash("message"),
    });
  });

  router.post(
    "/signup", (req, res, next) => {
      // avatar = "hello";
      passport.authenticate("signup", {
        successRedirect: "/home",
        failureRedirect: "/signup",
        failureFlash: true,
      })
      (req,res,next);
    }
   
  );

  // Profile -----------------
  router.get("/profile", (req, res) => {
    if (req.isAuthenticated()) {
      res.render("profiles/profile.hbs", {
        id: req.user.id,
        title: req.user.fullname,
        yourname: req.user.fullname,
        password: req.user.password,
        phone: req.user.phone,
        email: req.user.email,
        birthday: req.user.birthday,
        avatar: req.user.avatar,
      });
    } else {
      res.redirect("/");
    }
  });

  // Update profile
  router.post(
    "/user/update/:id",
    isAuthenticated,
    upload.single("avatar"),
    async (req, res) => {
      const filter = { _id: req.params.id };
      const update = {
        email: req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
        phone: req.body.phone,
        birthday: req.body.birthday,
        avatar: req.file.filename,
      };
      try {
        await userModel.findOneAndUpdate(
          filter,
          update,
          { new: true },
          (err, docs) => {
            if (!err) {
              res.redirect("/home");
            } else {
              console.log(err);
            }
          }
        );
      } catch (error) {
        res.status(500).send(error);
      }
    }
  );

  //Photo
  router.get("/home", isAuthenticated, async (req, res) => {
    // await productModel.find({ productUser: req.user._id }, (err, docs) => {
    res.render("home/home.hbs", {
      title: "Home",
      // products: docs.map((product) => product.toJSON()),
      yourname: req.user.fullname,
      avatar: req.user.avatar,
    });
    // });
  });

  //Chart
  router.get("/chart", isAuthenticated, (req, res) => {
    res.render("charts/chart.hbs", {
      title: "Chart",
      yourname: req.user.fullname,
      avatar: req.user.avatar,
    });
  });

  //------Logout
  router.get("/signout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  return router;
};

module.exports = Routes;
