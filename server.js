if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
// const session = require("express-session");
// const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./model/user");
const events = require("./model/events");
const { Console } = require("console");
const alert = require("alert");
const { findByIdAndUpdate } = require("./model/user");
// const { events } = require("./model/user");
const JWT_SECRET =
  "sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk";

mongoose.connect("mongodb://localhost:27017/final-wmc", {});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
// app.use(express.session());
// app.use(session({
//   secret: process.env.SECRET,
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(passport.initialize());
// app.use(passport.session());

app.get("/", function (req, res) {
  res.redirect("/index");
});

app.get("/index", function (req, res) {
  res.render("index");
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/admin", function (req, res) {
  res.render("admin");
});

app.get("/user", async (req, res) => {
  res.render("user");
});

app.post("/signup", async (req, res) => {
  const { username, password: plainTextPassword } = req.body;

  if (plainTextPassword.length < 5) {
    // res.json({
    //   status: "error",
    //   error: "Password too small. Should be atleast 6 characters",
    // });
  }
  if (!username || typeof username != "string") {
    // res.json({ status: "error", error: "Invalid username" });
  }

  if (!plainTextPassword || typeof plainTextPassword != "string") {
    // res.json({ status: "error", error: "Invalid password" });
  }
  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const response = await User.create({
      username,
      password,
    });
    console.log("User created successfully: ", response);
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      // res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }

  res.redirect("/user");

  // res.json({ status: "ok" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  const user = await User.findOne({ username }).lean();

  if (!user) {
    res.json({ status: "error", error: "Invalid username" });
    // res.redirect("/login");
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      JWT_SECRET
    );
    console.log(token);
    if (password === "admin" && username === "admin") {
      console.log(username);
      console.log(password);
      res.redirect("/admin");
    } else {
      res.redirect("/user");
    }
  }
});

//Admin
// new event
app.get("/addevent", function (req, res) {
  res.render("addevent");
});

app.post("/addevent", function (req, res) {
  const newEvent = new events({
    name: req.body.name,
    location: req.body.location,
    day: req.body.day,
    month: req.body.month,
    year: req.body.year,
    price: req.body.price,
  });

  newEvent.save(function (err) {
    if (err) console.log(err);
    else {
      console.log(newEvent);
      res.redirect("/admin");
    }
  });
});
// show events
app.get("/showeventsadmin", async (req, res) => {
  const event = await events.find().sort({ createdAt: "desc" });
  res.render("showeventsadmin", { events: event });
});

//delete
app.get("/deleteevent/:id", async (req, res) => {
  await events.findByIdAndDelete(req.params.id);
  res.redirect("/showeventsadmin");
});
app.listen(3000, () => {
  console.log("running at 3000");
});
// edit event
app.get("/editevent/:id", async (req, res) => {
  const event = await events.findById(req.params.id);
  res.render("editevent", event);
});

app.post("/editevent/:id", function (req, res) {
  events.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      price: req.body.price,
      location: req.body.location,
      day: req.body.day,
      month: req.body.month,
      year: req.body.year,
    },
    function (err, event) {
      if (err) {
        console.log(error);
      } else {
        res.redirect("/showeventsadmin");
      }
    }
  );
});
//Admin-user-portal
app.get("/adminuser", function (req, res) {
  res.render("adminuser");
});

//show users
app.get("/showusers", async (req, res) => {
  const user = await User.find().sort({ createdAt: "desc" });
  res.render("showusers", { users: user });
});
//delete user
app.get("/deleteuser/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/showusers");
});
// add user

app.get("/signupadmin", async (req, res) => {
  // const user = await User.findById(req.params.id);
  res.render("signupadmin");
});

app.post("/signupadmin", async (req, res) => {
  const { username, password: plainTextPassword } = req.body;

  // if (plainTextPassword.length < 5) {
  //   // res.json({
  //   //   status: "error",
  //   //   error: "Password too small. Should be atleast 6 characters",
  //   // });
  // }
  if (!username || typeof username != "string") {
    // res.json({ status: "error", error: "Invalid username" });
  }

  if (!plainTextPassword || typeof plainTextPassword != "string") {
    // res.json({ status: "error", error: "Invalid password" });
  }
  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    const response = await User.create({
      username,
      password,
    });
    console.log("User created successfully: ", response);
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      // res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }

  res.redirect("/showusers");

  // res.json({ status: "ok" });
});

app.get("/showeventUsers", async (req, res) => {
  const event = await events.find().sort({ createdAt: "desc" });
  // const user = await User.find().sort({ createdAt: "desc" });

  res.render("showeventUsers", { events: event });
});

//register events in user
app.get("/registerEvent/:id", async (req, res) => {
  const event = await events.findById(req.params.id);
  // const user = await User.findById(req.params.id);

  console.log(event);
  // console.log(user);
  res.render("registerEvent", event);
});
// app.post("/registerEvent", async (req, res) => {
//   User.findByIdAndUpdate(
//     req.params.id,
//     {
//       regUser: req.body.id,

//       // name: req.body.name,
//       // price: req.body.price,
//       // location: req.body.location,
//       // day: req.body.day,
//       // month: req.body.month,
//       // year: req.body.year,
//     },
//     console.log(req.body.id),

//     function (err, event) {
//       if (err) {
//         console.log(error);
//       } else {
//         res.redirect("/showeventUsers");
//       }
//     }
//   );
// });
