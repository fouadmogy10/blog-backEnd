const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

// define the Schema (the structure of the article)
const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "please add a title"],
      minlength: 2,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "please add a description"],
      minlength: 5,
      trim: true,
    },
    user: {
      ref: "user",
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comment", {
  ref: "comment",
  foreignField: "postId",
  localField: "_id",
});

const Post = mongoose.model("post", postSchema);
//validate create post
function validateCreatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().min(5).required(),
    category: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// Validate Update Post
function validateUpdatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().trim().min(10),
    category: Joi.string().trim(),
  });
  return schema.validate(obj);
}
module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};
