const AsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const xss =require("xss")
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/users.model");
// @desc register user
// @route /api/user/
//@access public
const register = AsyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const { error } = validateRegisterUser(req.body);
  if (error) {
    res.status(400).json({
      message: error.details[0].message,
    });
  }

  //Find if user exist
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error("user already exist");
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  //Create user
  const user = await User.create({
    username:xss(username),
    email:xss(email),
    password: hashedPass,
  });


  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "you are register successfully",
      password:hashedPass,
    });

  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc login user
// @route /api/user/login
//@access public
const login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = validateLoginUser(req.body);
  if (error) {
    res.status(400).json({
      message: error.details[0].message,
    });
  }
  //Find if user exist
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = user.generateAuthToken();
    res.status(200).json({
      _id: user._id,
      name: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      profilePhoto: user.profilePhoto,
      token,
    });
  } else {
    res.status(401);
    throw new Error("invalid email or password");
  }
});

// @desc get current user
// @route /api/user/me
//@access private
const getMe = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }
  res.status(200).json(user);
});
module.exports = {
  register,
  login,
  getMe,
};
