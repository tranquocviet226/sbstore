const express = require("express");
const productModel = require("../model/productModel");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const fs = require("fs");

//Multer
const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "public/imgProduct");
  },
  filename(req, file, callback) {
    callback(null, `${uuidv4()}.jpeg`);
  },
});
const upload = multer({ storage: Storage });

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
    upload.single("product"),
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
    upload.single("product"),
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
        fs.unlink(`public/imgProduct/${result.productImage}`, (err) => {
          if (err) {
            res.status(500).send(err);
          }
        });
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
