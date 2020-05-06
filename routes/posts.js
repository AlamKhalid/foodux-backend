require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const { Post } = require("../models/posts");
const { User } = require("../models/users");
const { Restaurant } = require("../models/restaurants");
const router = express.Router();

// get details of a specific post from the database
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("postBy", "name")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name");
  res.send(post);
});

// get all posts from the database
router.get("/", async (req, res) => {
  const posts = await Post.find()
    .populate("postBy", "name")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name")
    .populate("likes", "name")
    .populate("restaurantsBeen", "name")
    .sort("-date -time");
  res.send(posts);
});

router.put("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
});

router.post("/", async (req, res) => {
  let post;

  const commonAttr = {
    postBody: req.body.postBody,
    postType: req.body.postType,
    postBy: req.body.postBy,
    creator: req.body.creator,
  };

  switch (req.body.postType) {
    case "Deal":
      post = new Post({
        ...commonAttr,
        // start of deal post attr
        oldPrice: req.body.oldPrice,
        dealPrice: req.body.dealPrice,
        validOn: req.body.validOn,
        validTill: req.body.validTill,
        dealItems: [...req.body.dealItems],
      });
      break;
    case "Review":
      post = new Post({
        ...commonAttr,
        // start of review post attr
        location: req.body.location,
        amountSpend: req.body.amountSpend,
        restaurant: req.body.restaurant,
        ateFood: [...req.body.ateFood],
        opinion: req.body.opinion,
        tasteRating: req.body.tasteRating,
        serviceRating: req.body.serviceRating,
        ambienceRating: req.body.ambienceRating,
        overallRating: req.body.overallRating,
      });
      break;
    case "Discount":
      post = new Post({
        ...commonAttr,
        // start of deal post attr
        exceptFor: [...req.body.exceptFor],
        discount: req.body.discount,
        validOn: req.body.validOn,
        validTill: req.body.validTill,
        dealItems: [...req.body.dealItems],
      });
      break;
    case "Announcement":
      post = new Post({
        ...commonAttr,
        // start of new item announcement post attr
        price: req.body.price,
        foodType: req.body.foodType,
      });
      break;
    case "Recommendation":
      post = new Post({
        ...commonAttr,
        location: req.body.location,
        budget: req.body.budget,
        preferredType: req.body.preferredType,
        preferredFood: req.body.preferredFood,
      });
      break;
    case "What":
      post = new Post({
        ...commonAttr,
        location: req.body.location,
        budget: req.body.budget,
        restaurantsBeen: req.body.restaurantsBeen,
        ateFood: req.body.ateFood,
        overallRating: req.body.overallRating,
      });
      break;
  }

  await post.save();
  if (req.body.creator === "Restaurant") {
    const restaurant = await Restaurant.findById(req.body.postBy);
    restaurant.posts.push(post._id);
    await restaurant.save();
  } else {
    const user = await User.findById(req.body.postBy);
    user.posts.push(post._id);
    const restaurant = user.restaurantsVisited.find(
      (rest) => rest.restaurantId === req.body.restaurant
    );
    if (restaurant) {
      const index = user.restaurantsVisited.indexOf(restaurant);
      user.restaurantsVisited[index].times += 1;
    } else {
      user.restaurantsVisited.push({
        restaurantId: req.body.restaurant,
        times: 1,
      });
    }
    await user.save();
  }
  res.send(post);
});

router.delete("/", async (req, res) => {
  const user = await User.findById(req.body.userId);
  user.posts = user.posts.filter((post) => post != req.body.postId);
  await user.save();
  await Post.findByIdAndDelete(req.body.postId);
  res.send(user.posts);
});

module.exports = router;
