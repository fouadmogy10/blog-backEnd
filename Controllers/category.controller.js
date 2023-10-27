const AsyncHandler = require("express-async-handler")
const { Category, validateCreateCategory, validateUpdateCategory } = require("../models/category.model")
const xss = require("xss");

/*
*  @desc create category
*  @route /api/category/
*  @access private (only admin)

*/
const createCategory = AsyncHandler(async (req, res, next) => {

    // validate for data 
    const { error } = validateCreateCategory(req.body)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    const category = await Category.create({
        title: xss(req.body.title),
        user:req.user.id
    })

    // send response to the client
    return res.status(201).json(category)

})

/*
/*
*  @desc get all  category
*  @route /api/category/
*  @access public

*/
const getAllCategory = AsyncHandler(async (req, res, next) => {

    const category= await Category.find()
    return res.status(200).json(category)
})

/*
*  @desc delete  category
*  @route /api/categorys/:id
*  @access private (only  admin)

*/
const deleteCategory = AsyncHandler(async (req, res, next) => {


    const category = await Category.findById(req.params.id)
    if (!category) {
        return  res.status(400).json({
            message: "category not found",
        })
    }

    if (req.user.isAdmin) {

        const deletedCategory = await Category.findByIdAndDelete(req.params.id)
        if (!deletedCategory) {
            return res.status(404).json({ message: "category not found" })
        }
        return res.status(200).json({
            message: "category deleted successfuly",
            deletedCategory
        })
    } else {
        return res.status(400).json({
            message: "you aren't allow to delete this category",
        })

    }



})


/*
*  @desc update category
*  @route /api/category/:id/
*  @access private (only admin)

*/
const updateCategory = AsyncHandler(async (req, res, next) => {

    const category = await Category.findById(req.params.id)
    if (!category) {
        return  res.status(400).json({
            message: "category not found",
        })
    }
    // validate for data 
    const { error } = validateUpdateCategory(req.body)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }


        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
            $set: {
                title: req.body.title
            }
        }, { new: true })

        return res.status(200).json({
            message: "category updated successfuly",
            updatedCategory
        })
       


})



module.exports = {
    createCategory, getAllCategory, deleteCategory, updateCategory
}