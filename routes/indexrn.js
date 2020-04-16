const express = require("express");
const userModel = require("../model/userModel");
const productModel = require("../model/productModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const util = require("util");

//Multer
// const Storage = multer.diskStorage({
//   destination(req, file, callback) {
//     callback(null, "public/imgUser");
//   },
//   filename(req, file, callback) {
//     callback(null, `${uuidv4()}.jpeg`);
//   },
// });
// const upload = multer({ storage: Storage });

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

//------------ SignUp
router.get("/signUp", async (req, res) => {
  await userModel.findOne({ email: req.query.email }, (err, user) => {
    if (err) return res.status(500).json(err);
    if (user) {
      return res.status(500).json("Email has been register");
    } else {
      try {
        let User = new userModel({
          email: req.query.email,
          password: req.query.password,
          fullname: "",
          phone: req.query.phone,
          birthday: "",
          avatar: "avatarReplace.jpeg",
        });
        User.save();
        return res.status(200).json("Success!");
      } catch (error) {
        return res.status(500).json("Some thing wrong!");
      }
    }
  });
});

//------------Check login
router.get("/checkLogin", async (req, res) => {
  await userModel.findOne({ email: req.query.email }, (err, user) => {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(404).send("User not found!");
    if (user.password !== req.query.password)
      return res.status(401).send("Not match");
    res.status(200).json(user);
  });
});

//----------Detail User
router.get("/getAllProduct", async (req, res) => {
  try {
    const allProduct = await productModel.find({});
    res.json(allProduct);
  } catch (error) {
    res.status(500).send(error);
    console.log(error)
  }
});

//------------Update information
router.get("/updateInfo", async (req, res) => {
  const filter = req.query.id;
  const update = {
    fullname: req.query.fullname,
    phone: req.query.phone,
    birthday: req.query.birthday,
    password: req.query.password,
  };
  try {
    await userModel.findByIdAndUpdate(
      filter,
      update,
      { new: true },
      (err, docs) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.status(200).json(docs);
        }
      }
    );
  } catch (error) {
    res.status(500).json(error);
  }
});

//----------- Update Avatar
router.post("/updateAvatar", uploadFilesMiddleware, async(req, res) => {
  const id = req.query.id;
  const update = {avatar: req.file.filename};
  try {
    await userModel.findByIdAndUpdate(id, update, {new: true}, (err, docs) => {
      if (err) {
        res.status(500).json(err);
      } else {
        res.status(200).json(docs);
      }
    })
  } catch (error) {
    res.status(500).json(error)
  }
  
});

//Fetch user
router.get("/fetchUser", async (req, res) => {
  await userModel.findOne({ email: req.query.email }, (err, user) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(user);
    }
  });
});

module.exports = router;
