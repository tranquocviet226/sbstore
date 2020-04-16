const express = require("express");
const productModel = require("../model/productModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs");
const GridFsStorage = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const util = require("util");

//Multer
const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/imgProduct");
  },
  filename(req, file, callback) {
    callback(null, `${uuidv4()}.jpeg`);
  },
});

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

const upload = multer({ storage: gridStore }).single("product");
const uploadFilesMiddleware = util.promisify(upload);

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

const routers = (passport) => {
  //List product
  router.get("/", isAuthenticated, async (req, res) => {
    await productModel.find({ productUser: req.user._id }, (err, docs) => {
      res.render("products/product.hbs", {
        title: "Product",
        products: docs.map((product, index) => ({
          ...product.toJSON(),
          noNum: index + 1,
        })),
        yourname: req.user.fullname,
        avatar: req.user.avatar,
      });
    });
  });

  //Form create
  router.get("/create", isAuthenticated, (req, res) => {
    res.render("products/productCreate.hbs", {
      title: "Product",
      yourname: req.user.fullname,
      avatar: req.user.avatar,
    });
  });
  //Add product
  router.post(
    "/create/creating",
    isAuthenticated,
    uploadFilesMiddleware,
    async (req, res) => {
      try {
        const Product = new productModel({
          productUser: req.user._id,
          productId: req.body.productId,
          productName: req.body.productName,
          productPrice: req.body.productPrice,
          productQuantity: req.body.productQuantity,
          productDate: req.body.productDate,
          productDescription: req.body.productDescription,
          productImage: req.file.filename,
        });
        await Product.save();
        res.redirect("/product");
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

  //Form update product
  router.get("/update/:id", isAuthenticated, async (req, res) => {
    await productModel.findOne({ _id: req.params.id }, (err, products) => {
      if (err) {
        res.status(500).send(err);
      }
      res.render("products/productUpdate.hbs", {
        products: products.toJSON(),
      });
    });
  });
  //Update product
  router.post(
    "/update/updating/:id",
    isAuthenticated,
    uploadFilesMiddleware,
    async (req, res) => {
      const filter = { _id: req.params.id };
      const update = {
        productUser: req.user._id,
        productId: req.body.productId,
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        productQuantity: req.body.productQuantity,
        productDate: req.body.productDate,
        productDescription: req.body.productDescription,
        productImage: req.file.filename,
      };
      try {
        await productModel.findOneAndUpdate(
          filter,
          update,
          { new: true },
          (err, docs) => {
            if (!err) {
              res.redirect("/product");
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

  router.get("/delete/:id", isAuthenticated, async (req, res) => {
    await productModel.findOneAndDelete(
      { _id: req.params.id },
      (err, result) => {
        if (err) {
          res.status(500).send(err);
        }
        // fs.unlink(`public/imgProduct/${result.productImage}`, (err) => {
        //   if (err) {
        //     res.status(500).send(err);
        //   }
        // });
      }
    );
    res.redirect("/product");
  });

  //Photo
  router.get("/photo", isAuthenticated, async (req, res) => {
    await productModel.find({ productUser: req.user._id }, (err, docs) => {
      res.render("photos/photo.hbs", {
        title: "Photo",
        products: docs.map((product) => product.toJSON()),
        yourname: req.user.fullname,
        avatar: req.user.avatar,
      });
    });
  });

  return router;
};

module.exports = routers;
