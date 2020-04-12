const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const handlebars = require("express-handlebars");
const passport = require("passport");
const expressSession = require("express-session");
const Routes = require("./routes/index");
const productRoutes = require("./routes/product");
const customerRoutes = require("./routes/customer");
const userRoutesRn = require("./routes/indexrn");
const flash = require("connect-flash");
const initPassport = require("./passport/initialPassport");

//Initial app
const app = express();

app.use(flash());
//Configure handlebars
app.engine(".hbs", handlebars());
app.set("view engine", ".hbs");

//Configure passport
app.use(
  expressSession({
    secret: "TQV",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
initPassport(passport);

//Kết nối Mongo DB
const connectDB = require("./config/db");
connectDB();
//Configure app

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//Configure routes
app.use("/", Routes(passport));
app.use("/product", productRoutes(passport));
app.use("/customer", customerRoutes(passport));
app.use("/userRn", userRoutesRn);
app.get("*", (req, res) => {
  res.render("errors/error404.hbs", {
    layout: "index.hbs",
  });
});

//Running server

app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
