const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema({
  imageData: { type: Buffer },
  imageType: { type: String },
  imageName: { type: String },
});

const Photos = mongoose.model("photos.chunks", PhotoSchema);
module.exports = Photos;
