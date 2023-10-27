const AsyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/post.model");

const path = require("path");
const fs = require("fs");
const { CloudUploadImage, CloudRemoveImage } = require("../utils/cloudnary");
const { Comment } = require("../models/comment.model");
const xss =require("xss")
/*
*  @desc create post
*  @route /api/posts/
*  @access private (only login user)

*/
const createPost = AsyncHandler(async (req, res, next) => {
  // validate for image
  if (!req.file) {
    res.status(400).json({
      message: "post image required",
    });
  }
  // validate for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    res.status(400).json({
      message: error.details[0].message,
    });
  }
  // upload photo
  const imagePath = path.join(__dirname, `../public/images/${req.file.filename}`);
  // UPLOAD TO CLOUDNARY
  const result = await CloudUploadImage(imagePath);

  // create new post and save it in db

  const post = await Post.create({
    title:xss( req.body.title),
    description:xss( req.body.description),
    category:xss( req.body.category),
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // send response to the client
  res.status(201).json(post);

  // remove image from server
  fs.unlinkSync(imagePath);
});

/*
*  @desc get all  post
*  @route /api/posts/
*  @access private (only login user)

*/
const getAllPost = AsyncHandler(async (req, res, next) => {
  const POST_PER_PAGE = 3;
  const { category, pageNumber } = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]).populate("comment");
  }
  return res.status(200).json(posts);
});
/*
*  @desc get Single  post
*  @route /api/posts/:id
*  @access private (only login user)
*/
const getSinglePost = AsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
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

  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  return res.status(200).json(post);
});
/*
*  @desc delete Single  post
*  @route /api/posts/:id
*  @access private (only owner post or admin)

*/
const deletePost = AsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404).json({ message: "post not found" });
  }
  if (req.user.isAdmin || req.user.id.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    CloudRemoveImage(post.image.publicId);
    await Comment.deleteMany({
      postId: post._id,
    });
    return res.status(200).json(post);
  } else {
    res.status(403).json({
      message: "access denied,forbidden  ",
    });
  }
});
/*
*  @desc get  post count
*  @route /api/posts/count
*  @access public 

*/

const getPostCount = AsyncHandler(async (req, res, next) => {
  const count = await Post.count();
  return res.status(200).json(count);
});

/*
*  @desc update post
*  @route /api/posts/
*  @access private (only login user)

*/
const updatePost = AsyncHandler(async (req, res, next) => {
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  // 3. check if this post belong to logged in user
  if (req.user.id !== post.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // 4. Update post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title:xss( req.body.title),
        description:xss( req.body.description),
        category:xss( req.body.category),
      },
    },
    { new: true }
  )
    .populate("user", ["-password"])
    .populate("comment").populate({
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
    });;

  // 5. Send response to the client
  return res.status(200).json(updatedPost);
});
/*
*  @desc update post image
*  @route /api/posts/upload-image/:id
*  @access private (only owner of post )

*/
const updatePostImage = AsyncHandler(async (req, res, next) => {
  // validate for image
  if (!req.file) {
    res.status(400).json({
      message: "no image provided ",
    });
  }
  // get the post from db
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(400).json({
      message: "post not found",
    });
  }

  // update post
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({
      message: "access denied , you are not allawed",
    });
  }

  // updatePostImage
  await CloudRemoveImage(post.image.publicId);
  // upload new image
  const imagePath = path.join(__dirname, `../public/images/${req.file.filename}`);
  // UPLOAD TO CLOUDNARY
  const result = await CloudUploadImage(imagePath);

  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  ).populate("user", ["-password"]);
  // send response to client
  await fs.unlinkSync(imagePath);
  return res.status(200).json(updatePost);
  // remove image from server
});

/*
*  @desc toggle post likes
*  @route /api/posts/likes/:id
*  @access private (only loged in user )

*/

const toggleLikes = AsyncHandler(async (req, res, next) => {
  const loggedUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);

  if (!post) {
    res.status(404).json({ message: "post not found" });
  }

  const ispostLiked = post.likes.find((user) => user.toString() == loggedUser);
  if (ispostLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: loggedUser,
        },
      },
      { new: true }
    )
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
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: loggedUser,
        },
      },
      { new: true }
    )
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
  }
  return res.status(200).json(post);
});

module.exports = {
  createPost,
  getAllPost,
  getSinglePost,
  getPostCount,
  deletePost,
  toggleLikes,
  updatePost,
  updatePostImage,
};
