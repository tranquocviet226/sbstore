const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://tranquocviet226:khoqua226@mydb-unmzm.mongodb.net/dbShop?retryWrites=true&w=majority";
const MONGO_URI_LOCAL =
  "mongodb://localhost:27017/dbShop?readPreference=primary&appname=MongoDB%20Compass%20Community&ssl=false";
const connectDB = async () => {
  const conn = await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};
module.exports = connectDB;

