const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter a valid email address"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Please enter a valid password"],
      minlength: [6, "minimum password length is 6 characters"],
    },
  },
  {
    collection: "CustomUser",
  }
);

userSchema.post("save", function (doc, next) {
  console.log("new user created and saved", doc);
  next();
});

//fire a function before dock saved to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
