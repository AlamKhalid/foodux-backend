const mongoose = require("mongoose");
const { getDate } = require("../helper/date");

// defining the scheme for post document
const blogPostSchema = new mongoose.Schema({
  date: { type: String, default: getDate },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  body: String,
  img: String,
});

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports.BlogPost = BlogPost;
