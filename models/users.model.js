const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");
// define the Schema (the structure of the article)
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "please add a name"],
      minlength: 2,
      maxlength: 100,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "please add a email"],
      unique: true,
      minlength: 5,
      maxlength: 100,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460__340.png",
        publicId: null,
      },
    },
    password: {
      type: String,
      required: [true, "please add a password"],
    },
    bio: {
      type: String,
    },
    job: {
      type: String,
      default: "Bloger",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("posts", {
  ref: "post",
  foreignField: "user",
  localField: "_id",
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const User = mongoose.model("user", userSchema);
//validate register
function validateRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}
//validate login
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}
//validate update
function validateUpdateUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100),
    password: Joi.string().trim().min(8),
    job: Joi.string(),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}
// Validate Email
function validateEmail(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
  });
  return schema.validate(obj);
}

// Validate New Password
function validateNewPassword(obj) {
  const schema = Joi.object({
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
  validateEmail,
  validateNewPassword,
};
