const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");


// define the Schema (the structure of the article)
const categorySchema = new Schema({

  title: {
    type: String,
    required: [true, 'please add a text'],
  },
  user: {
    ref: "user",
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
}, {
  timestamps: true
});



const Category = mongoose.model("category", categorySchema)

//validate create category
function validateCreateCategory(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().required(),
    
  })
  return schema.validate(obj)
}

//validate update
function validateUpdateCategory(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().required().label("title"),

  })
  return schema.validate(obj)
}
module.exports = {
  Category, validateCreateCategory, validateUpdateCategory
}

 