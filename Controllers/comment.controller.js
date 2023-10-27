const AsyncHandler = require("express-async-handler");
const {
  Comment,
  validateCreateComment,
  validateUpdatecomment,
} = require("../models/comment.model");
const { User } = require("../models/users.model");
const { Post } = require("../models/post.model");

/*
*  @desc create comment
*  @route /api/comment/
*  @access private (only login user)

*/
const createComment = AsyncHandler(async (req, res, next) => {
  // validate for data
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const profile = await User.findById(req.user.id);

  const comment = await Comment.create({
    text: req.body.text,
    postId: req.body.postId,
    user: req.user.id,
    username: profile.username,
  });

  const addedComment = await comment.save();
  await addedComment.populate("user", [
    "-password",
    "-email",
    "-isAdmin",
    "-isAccountVerified",
    "-createdAt",
    "-updatedAt",
  ]);
  const post = await Post.findById(req.body.postId)
    .populate("user", ["-password"])
    .populate("comment")
    .populate({
      path: "comment",
      populate: {
        path: "user",
        select: [
          "-password",
          "-email",
          "-isAdmin",
          "-isAccountVerified",
          "-createdAt",
          "-updatedAt",
        ],
      },
    });
  // send response to the client
  return res.status(201).json({ post, comment: addedComment });
});

/*
/*
*  @desc get all  post
*  @route /api/posts/
*  @access private (only login user)

*/
const getAllComment = AsyncHandler(async (req, res, next) => {
  const Comment_PER_PAGE = 3;
  const { pageNumber } = req.query;
  let comment;
  if (req.user.isAdmin) {
    if (pageNumber) {
      comment = await Comment.find()
        .skip((pageNumber - 1) * Comment_PER_PAGE)
        .limit(Comment_PER_PAGE)
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);
    } else {
      comment = await Comment.find()
        .sort({ createdAt: -1 })
        .populate("user", ["-password"]);
    }
  } else {
    return res.status(400).json({
      message: "access denied , only admin can access",
    });
  }
  return res.status(200).json(comment);
});

/*
*  @desc delete  comment
*  @route /api/comments/:id
*  @access private (only owner post or admin)

*/
const deletecomment = AsyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(400).json({
      message: "comment not found",
    });
  }

  if (req.user.isAdmin || req.user.id == comment.user._id) {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) {
      return res.status(404).json({ message: "comment not found" });
    }
    return res.status(200).json({
      message: "comeent deleted successfuly",
      deletedComment,
    });
  } else {
    return res.status(400).json({
      message: "you aren't allow to delete this comment",
    });
  }
});

/*
*  @desc update comment
*  @route /api/comment/:id/
*  @access private (only owner comment)

*/
const updateComment = AsyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(400).json({
      message: "comment not found",
    });
  }
  // validate for data
  const { error } = validateUpdatecomment(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  if (req.user.id == comment.user._id) {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true }
    ).populate("user", [
      "-password",
      "-email",
      "-isAdmin",
      "-isAccountVerified",
      "-createdAt",
      "-updatedAt",
    ]);

    return res.status(200).json({
      message: "comment updated successfuly",
      updatedComment,
    });
  } else {
    return res.status(400).json({
      message: "you aren't allow to delete this comment",
    });
  }
});

module.exports = {
  createComment,
  getAllComment,
  deletecomment,
  updateComment,
};
