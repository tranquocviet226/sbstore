const express = require("express");
const userModel = require("../model/userModel");
const photoModel = require("../model/photos.chunks");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const util = require("util");

// Upload Image to mongodb Binary
const mongoURI =
  "mongodb+srv://tranquocviet226:khoqua226@mydb-unmzm.mongodb.net/dbShop?retryWrites=true&w=majority";
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "photos",
  });
});

const gridStore = new GridFsStorage({
  url:
    "mongodb+srv://tranquocviet226:khoqua226@mydb-unmzm.mongodb.net/dbShop?retryWrites=true&w=majority",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];
    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-bezkoder-${file.originalname}`;
      return filename;
    }
    return {
      bucketName: "photos",
      filename: `${Date.now()}-bezkoder-${file.originalname}`,
    };
  },
});

const upload = multer({ storage: gridStore }).single("avatar");
const uploadFilesMiddleware = util.promisify(upload);

//Multer Upload image to Node
const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/imgUser");
  },
  filename(req, file, callback) {
    callback(null, `${uuidv4()}.jpeg`);
  },
});

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

  router.post("/signup", (req, res, next) => {
    // avatar = "hello";
    passport.authenticate("signup", {
      successRedirect: "/home",
      failureRedirect: "/signup",
      failureFlash: true,
    })(req, res, next);
  });

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
    uploadFilesMiddleware,
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
  // Get image from mongodb
  router.get("/image/:filename", (req, res) => {
    // console.log('id', req.params.id)
    gfs
      .find({
        filename: req.params.filename,
      })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return res.status(404).json({
            err: "no files exist",
          });
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
      });
  });

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
