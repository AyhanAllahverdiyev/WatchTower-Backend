const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const SecretString= process.env.secret.toString();
 

module.exports.get_All_Users = (req, res) => {
  User.find()
    .sort({ createdAt: -1 })
    .then((result) => {
       console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports.change_auth_level = (req, res) => {
  const { email, auth_level } = req.body;

  //  use findOne instead of findById
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.auth_level = auth_level;
      return user.updateOne(user);
    })
    .then((updatedUser) => {
      console.log(updatedUser);
      res.status(200).json(updatedUser); // Send a response if needed
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' }); // Handle errors
    });
};
 

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  // incorrect email
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }
  // validation errors
  if (err.message.includes("user validation failed")) {
     Object.values(err.errors).forEach(({ properties }) => {
       errors[properties.path] = properties.message;
    });
  }

  return errors;
};

// create json web token
const maxAge =  24*60*60;
const createToken = (id) => {
  return jwt.sign(
    { id },
    SecretString,
    {
      expiresIn: maxAge,
    }
  );
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password ,auth_level} = req.body;

  try {
    const user = await User.create({ email, password,auth_level });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
 
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id,auth_level:user.auth_level});
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
};

// Modify the /refresh-token route
module.exports.jwt_get=('refresh-token', async (req, res) => {
     const jwtCookie = req.cookies.jwt; // Retrieve the JWT token from cookies
  
    if (!jwtCookie) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      const decodedToken = jwt.verify(jwtCookie, SecretString);
  
      const userId = decodedToken.id;
    console.log(userId);
  
      const user = await User.findById(userId);
  
  
      const newAccessToken = jwt.sign({ id: userId }, SecretString, { expiresIn: maxAge });
  
      sendAccessTokenCookie(res, newAccessToken);
  
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: 'JWT verification failed' });
    }
  });
   
  module.exports.jwt_verify = (req, res) => {
    const jwtToken = req.body.jwt;

    if (!jwtToken) {
      return res.status(400).json({ verify: false, message: 'JWT token missing in request' });
    }
  
    try {
      const decodedToken = jwt.verify(jwtToken, SecretString);
      const currentTimestamp = Math.floor(Date.now() / 1000);
  
      if (decodedToken.exp && currentTimestamp > decodedToken.exp) {
        return res.status(401).json({ verify: false, message: 'JWT token has expired' });
      }
  
      return res.status(200).json({ verify: true });
    } catch (err) {
      return res.status(400).json({ verify: false, message: 'JWT token verification failed', error: err.message });
    }
  };
  
  sendAccessTokenCookie = (res, newAccessToken) => {
    res.cookie('jwt', newAccessToken, {
      httpOnly: true,
      maxAge: maxAge * 1000, // Convert seconds to milliseconds
    });
  };
  