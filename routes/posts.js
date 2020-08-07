require("express-async-errors");
const _ = require("lodash");
const express = require("express");
const { Post } = require("../models/posts");
const { User } = require("../models/users");
const router = express.Router();

// search post or user
router.get("/search/?", async (req, res) => {
  const searchValue = req.query.value;
  const foundUsers = await User.find({
    name: { $regex: searchValue, $options: "i" },
  }).select("name profilePic isRestaurant");
  const foundPosts = await Post.find({
    postBody: { $regex: searchValue, $options: "i" },
  })
    .select("postBy postBody images")
    .populate("postBy", "name profilePic");
  res.send({ users: foundUsers, posts: foundPosts });
});

// get details of a specific post from the database
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("postBy", "name profilePic")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name profilePic isRestaurant")
    .populate("likes", "name");
  res.send(post);
});

// get all posts from the database
router.get("/", async (req, res) => {
  const posts = await Post.find()
    .populate("postBy", "name profilePic")
    .populate("restaurant", "name")
    .populate("comments.commentBy", "name profilePic isRestaurant")
    .populate("likes", "name")
    .populate("restaurantsBeen", "name")
    .populate("restaurant", "name")
    .sort("-date -time");
  res.send(posts);
});

router.put("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.postBody = req.body.postBody;
  post.images = req.body.images;
  switch (post.postType) {
    case "What":
      post.location = req.body.location;
      post.budget = req.body.budget;
      post.restaurantsBeen = req.body.restaurantsBeen;
      post.ateFood = req.body.ateFood;
      post.overallRating = req.body.overallRating;
      break;
    case "Recommendation":
      post.location = req.body.location;
      post.budget = req.body.budget;
      post.preferredType = req.body.preferredType;
      post.preferredFood = req.body.preferredFood;
      break;
    case "Review":
      post.branchCity = req.body.branchCity;
      post.branchArea = req.body.branchArea;
      post.amountSpend = req.body.amountSpend;
      post.restaurant = req.body.restaurant;
      post.ateFood = [...req.body.ateFood];
      post.opinion = req.body.opinion;
      post.tasteRating = req.body.tasteRating;
      post.serviceRating = req.body.serviceRating;
      post.ambienceRating = req.body.ambienceRating;
      post.overallRating = req.body.overallRating;
      break;
    case "Deal":
      post.oldPrice = req.body.oldPrice;
      post.dealPrice = req.body.dealPrice;
      post.validOn = req.body.validOn;
      post.validTill = req.body.validTill;
      post.dealItems = [...req.body.dealItems];
      break;
    case "Discount":
      post.exceptFor = [...req.body.exceptFor];
      post.discount = req.body.discount;
      post.validOn = req.body.validOn;
      post.validTill = req.body.validTill;
      post.dealItems = [...req.body.dealItems];
      break;
    case "Announcement":
      post.price = req.body.price;
      post.foodType = req.body.foodType;
      break;
  }
  await post.save();
  res.send(post);
});

router.post("/", async (req, res) => {
  let post;

  const commonAttr = {
    postBody: req.body.postBody,
    postType: req.body.postType,
    postBy: req.body.postBy,
    creator: req.body.creator,
    images: req.body.images,
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
        branchCity: req.body.branchCity,
        branchArea: req.body.branchArea,
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

  const user = await User.findById(req.body.postBy);
  user.posts.push(post._id);
  if (req.body.creator === "User") {
    if (req.body.postType === "Review") {
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
    } else if (req.body.postType === "What") {
      let notVisited = [];
      user.restaurantsVisited.forEach((rest) => {
        if (req.body.restaurantsBeen.indexOf(rest.restaurantId) > -1) {
          rest.times += 1;
        } else notVisited.push({ restaurantId: rest, times: 1 });
      });
      user.restaurantsVisited.push([...notVisited]);
    }
  }
  await user.save();
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
