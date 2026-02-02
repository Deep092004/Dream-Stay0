// ================== ENV SETUP ==================
require("dotenv").config();

// ================== PACKAGES ==================
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// ================== ROUTES ==================
const lisingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ================== DATABASE ==================
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// main()
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect(MONGO_URL);
// }
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}


// ================== APP CONFIG ==================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ================== SESSION ==================
const sessionOptions = {
  secret: process.env.SECRET || "fallbacksecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ================== PASSPORT ==================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================== GLOBAL MIDDLEWARE ==================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ================== ROUTES ==================
app.use("/", userRouter);
app.use("/listings", lisingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

// ================== DEMO USER ==================
app.get("/demouser", async (req, res) => {
  let fakeuser = new User({
    username: "demouser",
    email: "bHf2o@example.com",
  });
  let newUser = await User.register(fakeuser, "helloworld");
  res.send(newUser);
});

// ================== HOME ==================
app.get("/", (req, res) => {
  res.send("Working the route");
});

// ================== 404 HANDLER ==================
// app.all("/*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found"));
// });

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// ================== SERVER ==================
// app.listen(8080, () => {
//   console.log("Server is running on port 8080");
// });
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
