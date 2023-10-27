const { createCategory, getAllCategory, deleteCategory, updateCategory} = require("../Controllers/category.controller");
const {  verifyTokenAndAdmin } = require("../middelware/verifyToken");


const router = require("express").Router();


router.route("/")
    .post(verifyTokenAndAdmin,createCategory)
    .get(getAllCategory)

    //  @route /api/comments/:id
router.route("/:id")
    .delete(verifyTokenAndAdmin,deleteCategory)
    .put(verifyTokenAndAdmin,updateCategory)

module.exports = router 