const {
  createPost,
  getAllPost,
  getSinglePost,
  getPostCount,
  deletePost,
  updatePost,
  updatePostImage,
  toggleLikes,
} = require("../Controllers/post.controller");
const uploadPhoto = require("../middelware/photoMiddelware");
const {
  verifyToken,
  verifyTokenAndUserandAdmin,
  verifyTokenAndUser,
} = require("../middelware/verifyToken");

const router = require("express").Router();
router
  .route("/")
  .post(verifyToken, uploadPhoto.single("image"), createPost)
  .get(getAllPost);

router.get("/count", getPostCount);

router
  .route("/:id")
  .get(getSinglePost)
  .delete(verifyToken, deletePost)
  .put(verifyToken, updatePost);

router
  .route("/update-image/:id")
  .put(verifyToken, uploadPhoto.single("image"), updatePostImage);
router.route("/likes/:id").put(verifyToken, toggleLikes);

module.exports = router;
