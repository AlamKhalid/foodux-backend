const mongoose = require("mongoose");
const { getDate, getTime } = require("../helper/date");

// defining the scheme for post document
const postSchema = new mongoose.Schema({
  postBody: { type: String, required: true, trim: true },
  comments: [
    {
      commentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      commentBody: String,
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  postBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  creator: {
    type: String,
    require: true,
    enum: ["User", "Restaurant"],
  },
  postType: {
    type: String,
    enum: [
      "Deal",
      "Announcement",
      "Review",
      "Discount",
      "Recommendation",
      "What",
    ],
    required: true,
    trim: true,
  },
  date: { type: String, default: getDate },
  time: { type: String, default: getTime },
  // start of deal post attributes
  oldPrice: Number,
  dealPrice: Number,
  validOn: String,
  validTill: String,
  dealItems: [String],
  // start of discount post attributes, deal attrs above are also included in this except for deal and old price
  discount: Number,
  exceptFor: [String],
  // start of review post attributes
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
  },
  location: { type: String, trim: true }, // same for recommendation asking
  amountSpend: { type: String, trim: true },
  ateFood: [String],
  opinion: { type: String, trim: true },
  tasteRating: Number,
  serviceRating: Number,
  ambienceRating: Number,
  overallRating: Number,
  // start of new addition announcement attributes
  price: Number,
  foodType: String,
  // start of recommendation asking attributes
  // location - same as above defined
  preferredFood: [String],
  preferredType: [String],
  budget: String,
  // start of what you can eat post attributes
  // locaiton - same as above defined
  // budget - same as above
  // ateFood - same as above
  // overallRating - same as above
  restaurantsBeen: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// making the model of Post document depending upon the schema created above
const Post = mongoose.model("Post", postSchema);

module.exports.Post = Post;
