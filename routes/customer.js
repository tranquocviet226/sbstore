const express = require("express");
const customerModel = require("../model/customerModel");
const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

const Routes = (passport) => {
  //Get customer
  router.get("/", isAuthenticated, async (req, res) => {
    await customerModel.find({ customerUser: req.user._id }, (err, docs) => {
      if (err) {
        res.status(500).send(err);
      }
      res.render("customers/customer.hbs", {
        title: "Customer",
        customers: docs.map((cus, index) => ({
          ...cus.toJSON(),
          noNum: index + 1,
        })),
        yourname: req.user.fullname,
        avatar: req.user.avatar,
      });
    });
  });
  // Form customer
  router.get("/create", isAuthenticated, (req, res) => {
    res.render("customers/customerCreate.hbs", {
      title: "Customer",
      yourname: req.user.fullname,
      avatar: req.user.avatar,
    });
  });
  //Add customer
  router.post("/create/creating", isAuthenticated, async (req, res) => {
    try {
      const Customer = new customerModel({
        customerUser: req.user._id,
        customerName: req.body.customerName,
        customerPhone: req.body.customerPhone,
        customerAge: req.body.customerAge,
        customerAddress: req.body.customerAddress,
        customerAmount: req.body.customerAmount,
      });
      await Customer.save();
      res.redirect("/customer");
    } catch (error) {
      res.status(500).send(error);
    }
  });
  //Delete customer
  router.get("/delete/:id", isAuthenticated, async(req, res) => {
      await customerModel.findOneAndDelete({_id: req.params.id}, (err, docs) => {
          if(err) {
              res.status(500).send(err);
          }
          res.redirect("/customer")
      })
  })

  return router;
};

module.exports = Routes;
