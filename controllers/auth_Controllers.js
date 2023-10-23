const User = require("../models/User");
const jwt = require("jsonwebtoken");

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
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
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
    "w34443de1kj23gy21f312g3fr12t3f1t2d31t2312t32tkj45345g3h45v3k4hv5kg4qleer4luq35d3123",
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
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
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
    res.status(200).json({ user: user._id });
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
  // Modify the /refresh-token route
    const jwtCookie = req.cookies.jwt; // Retrieve the JWT token from cookies
  
    if (!jwtCookie) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    try {
      // Verify the JWT token using the secret key to get the user's ID
      const decodedToken = jwt.verify(jwtCookie, 'w34443de1kj23gy21f312g3fr12t3f1t2d31t2312t32tkj45345g3h45v3k4hv5kg4qleer4luq35d3123');
  
      // Extract user ID from the token
      const userId = decodedToken.id;
    console.log(userId);
  
      // Fetch user details from the user ID, for example using your User model
      const user = await User.findById(userId);
  
      // You now have user details. You can use this information to re-log the user if necessary.
  
      // Create a new JWT using the user's ID
      const newAccessToken = jwt.sign({ id: userId }, 'w34443de1kj23gy21f312g3fr12t3f1t2d31t2312t32tkj45345g3h45v3k4hv5kg4qleer4luq35d3123', { expiresIn: maxAge });
  
      // Set the new JWT cookie
      sendAccessTokenCookie(res, newAccessToken);
  
      res.json({ success: true });
    } catch (err) {
      // Handle JWT verification errors here
      res.status(400).json({ error: 'JWT verification failed' });
    }
  });
  
  sendAccessTokenCookie = (res, newAccessToken) => {
    res.cookie('jwt', newAccessToken, {
      httpOnly: true,
      maxAge: maxAge * 1000, // Convert seconds to milliseconds
    });
  };
  