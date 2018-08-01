const express = require("express");
const authRoutes = express.Router();

const passport = require("passport");
const bcrypt = require("bcryptjs");
const uploadCloud = require('../config/cloudinary');
// Our user model
const User = require("../models/user");

authRoutes.post("/signup", uploadCloud.single("photo"), (req, res, next) => {
  const role = req.body.role;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  if (!role || !firstName || !lastName || !email || !password) {
    res.status(400).json({ message: "Please complete all required fields" });
    return;
  }

  // this is where you can set limits on username and password specifics
  if (password.length < 7) {
    res
      .status(400)
      .json({
        message:
          "Please make your password 7 characters long for security purposes"
      });
    return;
  }

  User.findOne({ email }, "_id", (err, foundUser) => {
    if (foundUser) {
      res
        .status(400)
        .json({ message: "An account with this email already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPass = bcrypt.hashSync(password, salt);

    let theUser;

    if (role === "Client") {
      theUser = new User({
        role,
        firstName,
        lastName,
        email,
        password: hashPass
      });
    } else if (role === "Freelancer") {
      theUser = new User({
        role,
        firstName,
        lastName,
        email,
        password: hashPass,
        description: null,
        portfolio: null,
        location: null,
        radiusFromZip: null
      });
    }

    theUser.save(err => {
      if (err) {
        res.status(400).json({ message: "Something went wrong" });
        return;
      }

      req.login(theUser, err => {
        if (err) {
          res.status(500).json({ message: "Something went wrong" });
          return;
        }

        res.status(200).json(req.user);
      });
    });
  });
});



authRoutes.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, theUser, failureDetails) => {
      if (err) {
        res.status(500).json({ message: 'Something went wrong' });
        return;
      }
  
      if (!theUser) {
        res.status(401).json(failureDetails);
        return;
      }
  
      req.login(theUser, (err) => {
        if (err) {
          res.status(500).json({ message: 'Something went wrong' });
          return;
        }
  
        // We are now logged in (notice req.user)
        res.status(200).json(req.user);
      });
    })(req, res, next);
});

authRoutes.post('/logout', (req, res, next) => {
    req.logout();
    res.status(200).json({ message: 'Success' });
});

authRoutes.get('/loggedin', (req, res, next) => {
    if (req.isAuthenticated()) {
      res.status(200).json(req.user);
      return;
    }
  
    res.status(403).json({ message: 'Unauthorized' });
});


module.exports = authRoutes;