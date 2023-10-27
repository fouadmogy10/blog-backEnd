const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

// define the Schema (the structure of the article)
const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "please add a text"],
    },
    username: {
      type: String,
      required: true,
    },
    user: {
      ref: "user",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    postId: {
      ref: "post",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("comment", commentSchema);

//validate create comment
function validateCreateComment(obj) {
  const schema = Joi.object({
    postId: Joi.string().label("post ID"),
    text: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

//validate update
function validateUpdatecomment(obj) {
  const schema = Joi.object({
    text: Joi.string().trim().required().label("Text"),
  });
  return schema.validate(obj);
}
module.exports = {
  Comment,
  validateCreateComment,
  validateUpdatecomment,
};
