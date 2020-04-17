const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productUser: {
    type: String,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: String,
    required: true,
  },
  productQuantity: {
    type: String,
    required: true,
  },
  productDate: {
    type: String,
    // required: true,
  },
  productDescription: {
    type: String,
    // required: true,
  },
  productImage: {
    type: String,
  },
});

const Products = mongoose.model("products", ProductSchema);
module.exports = Products;
