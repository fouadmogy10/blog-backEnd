const AsyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/users.model");
const bycrpt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
  CloudUploadImage,
  CloudRemoveImage,
  CloudRemoveMultiImage,
} = require("../utils/cloudnary");
const { Post } = require("../models/post.model");
const { Comment } = require("../models/comment.model");
// @desc get all user
// @route /api/user/login
//@access privte (only admin)
const getAllUsers = AsyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});
// @desc get  user count
// @route /api/users/count
//@access privte (only admin)
const getUsersCount = AsyncHandler(async (req, res, next) => {
  const count = await User.count();
  res.status(200).json(count);
});
// @desc get  user profile
// @route /api/users/profile/:id
//@access public
const getuserProfile = AsyncHandler(async (req, res, next) => {
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
// @desc get  user profile
// @route /api/users/profile/:id
//@access private
const updateuserProfile = AsyncHandler(async (req, res, next) => {
  const { error } = validateUpdateUser(req.body);

  if (error) {
    return res.status(404).json({
      message: error.details[0].message,
    });
  }

  if (req.body.password) {
    const salt = await bycrpt.genSalt(10);
    req.body.password = await bycrpt.hash(req.body.password, salt);
  }

  const UpdatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
        job: req.body.job,
      },
    },
    { new: true }
  ).populate("posts").select("-password");
  res.status(200).json(UpdatedUser);
});
// @desc upload  user profile image
// @route /api/users/profile/photo-upload
//@access private
const ProfilePhotoUpload = AsyncHandler(async (req, res, next) => {
  // VALIDATE
  if (!req.file) {
    return res.status(400).json({
      message: "no file provided",
    });
  }
  // GET PATH TO IMAGE
  const imagePath = path.join(__dirname, `../public/images/${req.file.filename}`);
  // UPLOAD TO CLOUDNARY
  const result = await CloudUploadImage(imagePath);
  //Get the user from db
  const user = await User.findById(req.user.id);
  // delete the old user photo if exist
  if (user.profilePhoto.publicId != null) {
    await CloudRemoveImage(user.profilePhoto.publicId);
  }
  // change the profile field in db
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  res.status(200).json({
    message: "your  photo profile uploaded successfully ",
    profilePhoto: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  fs.unlinkSync(imagePath);
});

// @desc delete  user profile
// @route /api/users/profile/:id
// @access private
const deleteuserProfile = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      message: "user not found",
    });
  }
  console.log(user, "user");
  //get all post from db
  const posts = await Post.find({ user: user._id });
  console.log(posts, "posts");
  //get all public id from the posts
  const publicIds = posts?.map((post) => post.image.publicId);
  console.log(publicIds, "publicIds");
  //delete all image posts from cloudnary for this user
  if (publicIds?.length > 0) {
    await CloudRemoveMultiImage(publicIds);
  }
  //delete user post
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });
  //delete the profile  pic from cloudnary
  if (publicIds.length !== 0) {
    await CloudRemoveImage(user.profilePhoto.publicId);
  }
  // delete user
  const DeletedUser = await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "your profile deleted successfully" });

  res.status(200).json(DeletedUser);
});
module.exports = {
  deleteuserProfile,
  getUsersCount,
  getAllUsers,
  getuserProfile,
  updateuserProfile,
  ProfilePhotoUpload,
};
