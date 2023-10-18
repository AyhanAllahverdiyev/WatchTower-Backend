const User = require("../models/user.js");

 const handleErrors = (err) => {
  let errors = {
    email: "",
    password: "",
  };

  //dublicate email
  if (err.code == 11000) {
    errors.email = "email already registered";
    return errors;
  }
  if (err.message.includes("User validation failed:")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

module.exports.signup_get = (req, res) => {
  res.send("signup_get");
};
module.exports.login_get = (req, res) => {
  res.send("login_get");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    res.status(201).json(user);
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  console.log("email: " + email, "password: " + password);
  res.send("login_post");
};
