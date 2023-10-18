const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  //check jwt existence
  if (token) {
    jwt.verify(
      token,
      "w34443de1kj23gy21f312g3fr12t3f1t2d31t2312t32tkj45345g3h45v3k4hv5kg4qleer4luq35d3123",
      (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.redirect("/login");
        } else {
          console.log(decodedToken);
          next();
        }
      }
    );
  } else {
    res.redirect("/login");
  }
};

module.exports = {
  requireAuth,
};
