const {
  getAllUsers,
  getuserProfile,
  updateuserProfile,
  ProfilePhotoUpload,
  getUsersCount,
  deleteuserProfile,
} = require("../Controllers/users.controller");
const uploadPhoto = require("../middelware/photoMiddelware");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUser,
  verifyTokenAndUserandAdmin,
} = require("../middelware/verifyToken");

const router = require("express").Router();

router.get("/profile", verifyTokenAndAdmin, getAllUsers);
router.get("/count", verifyTokenAndAdmin, getUsersCount);
router
  .route("/profile/:id")
  .get(getuserProfile)
  .put(verifyTokenAndUser, updateuserProfile)
  .delete(verifyTokenAndUserandAdmin, deleteuserProfile);
router.post(
  "/profile/Photo-upload",
  verifyTokenAndUser,
  uploadPhoto.single("image"),
  ProfilePhotoUpload
);

module.exports = router;
