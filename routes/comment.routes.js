const {
  createComment,
  getAllComment,
  deletecomment,
  updateComment,
} = require("../Controllers/comment.controller");
const { verifyToken } = require("../middelware/verifyToken");

const router = require("express").Router();

router
  .route("/")
  .post(verifyToken, createComment)
  .get(verifyToken, getAllComment);

//  @route /api/comments/:id
router
  .route("/:id")
  .delete(verifyToken, deletecomment)
  .put(verifyToken, updateComment);

module.exports = router;
