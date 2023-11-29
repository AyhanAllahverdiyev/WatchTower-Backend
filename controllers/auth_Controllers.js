const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs=require('fs');
const path =require('path');
dotenv.config();
const SecretString= process.env.secret.toString();
const tokenBlacklistPath = path.join(__dirname, 'tokenblacklist.txt');
// Check if the blacklist file exists; if not, create it
if (!fs.existsSync(tokenBlacklistPath)) {
  fs.writeFileSync(tokenBlacklistPath, '');
} 
module.exports.get_All_Users = (req, res) => {
  User.find()
    .sort({ createdAt: -1 })
    .then((users) => {
      const usersDTO = users.map(user => DTO(user));
      res.send(usersDTO);
      console.log(usersDTO);
    })
    .catch((err) => {
      console.log(err);
    });
};
module.exports.delete_user = async (req, res) => {
  const { _id } = req.body;
  try {
    const user = await User.findOneAndDelete({ _id });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("User deleted with id:", _id);
    return res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.log("Error deleting user:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function DTO(user) {
  return {
    _id: user._id,
    email: user.email,
    auth_level: user.auth_level,
  };
}
module.exports.change_auth_level = (req, res) => {
  const { _id, auth_level } = req.body;

  //  use findOne instead of findById
  User.findOne({ _id })
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

//////////////////////////////// DEFINING MAX AGE FOR COOKIE ////////////////////////////////////////////////////
const maxAge = 3 * 24 * 60 * 60;
//////////////////////////////// DEFINING MAX AGE FOR COOKIE ////////////////////////////////////////////////////

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
};module.exports.logout = (req, res) => {
  const jwt = req.body.jwt;
  console.log('Logging out user with JWT:', jwt);
   if (isTokenBlacklisted(jwt)) {
    res.clearCookie('jwt');
    res.status(300).send('Token already blacklisted');
  } else {
    addToBlacklistFile(jwt);
    res.clearCookie('jwt');
    res.status(200).send('Logout successful');
  }
};

// Function to add a token to the blacklist file
function addToBlacklistFile(token) {
  fs.appendFileSync(tokenBlacklistPath, token + '\n');
}

// Function to check if a token is in the blacklist file
function isTokenBlacklisted(token) {
  console.log('Logging out user with JWT inside trim function:', token);
  const tokens = fs.readFileSync(tokenBlacklistPath, 'utf8').split('\n');
  return tokens.includes(token.trim());
}
 
   
  module.exports.jwt_verify = (req, res) => {
    const jwtToken = req.body.jwt;

    if (!jwtToken) {
      return res.status(400).json({ verify: false, message: 'JWT token missing in request' });
    }
  
    try {
      const decodedToken = jwt.verify(jwtToken, SecretString);
      const currentTimestamp = Math.floor(Date.now() / 1000);
  
      if (decodedToken.exp && currentTimestamp > decodedToken.exp) {
         if(isTokenBlacklisted(jwtToken)){
        return res.status(401).json({ verify: false, message: 'JWT token is blacklisted' });
         }
         else{
            addToBlacklistFile(jwtToken);
          return res.status(402).json({ verify: false, message: 'JWT token is expired' });
         }
      }
      else if (isTokenBlacklisted(jwtToken)){
        return res.status(402).json({ verify: false, message: 'JWT token is blacklisted' });
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
  