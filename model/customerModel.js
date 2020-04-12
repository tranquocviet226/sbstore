const mongoose = require("mongoose");

const CustomerSchame = new mongoose.Schema({
  customerUser: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerAge: {
    type: String,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerAddress: {
    type: String,
  },
  customerAmount: {
    type: String,
  },
});

const Customers = mongoose.model("customers", CustomerSchame);
module.exports = Customers;
