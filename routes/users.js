require("express-async-errors");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const express = require("express");
const { User, validate } = require("../models/users");
const { sendMail } = require("../helper/sendVerificationEmail");
const { getJoinedDate } = require("../helper/date");
const router = express.Router();

router.post("/", async (req, res) => {
  const { error } = validate(_.pick(req.body, ["name", "email", "password"]));
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");
  const commonAttr = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isRestaurant: req.body.isRestaurant,
  };
  if (req.body.isRestaurant) {
    user = new User({
      ...commonAttr,
      website: req.body.website,
    });
  } else {
    user = new User({
      ...commonAttr,
      birthday: req.body.birthday,
      gender: req.body.gender,
    });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.joinedOn = getJoinedDate();
  await user.save();
  const token = user.generateAuthToken();
  sendMail(req.body.email, `http://localhost:3000/${user._id}/verify`);
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["name", "email"]));
});

router.get("/:id/hidden-posts", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.hiddenPosts);
});

router.get("/:id/saved-posts", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.savedPosts);
});

router.get("/:id/posts", async (req, res) => {
  const userPosts = await User.findById(req.params.id).select("posts");
  return res.send(userPosts.posts);
});

router.get("/:id/hidden-comments", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.hiddenComments);
});

router.get("/:id/verify", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isVerified = true;
  await user.save();
  res.send(user.isVerified);
});

router.get("/:id/is-verified", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.send(user.isVerified);
});

router.get("/:id/followers", async (req, res) => {
  const followers = await User.findById(req.params.id)
    .select("followers -_id")
    .populate("followers", "name profilePic");
  res.send(followers);
});

router.get("/:id/following", async (req, res) => {
  const following = await User.findById(req.params.id)
    .select("following -_id")
    .populate("following", "name profilePic");
  res.send(following);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate("livesIn", " name")
    .populate("favFood", " name")
    .populate("favRestaurant", " name")
    .populate("restaurantsVisited.restaurantId", "name")
    .populate("type", "name")
    .populate("serves", "name")
    .populate({ path: "savedPosts", populate: { path: "postBy" } })
    .populate({ path: "hiddenPosts", populate: { path: "postBy" } })
    .populate("posts");
  res.send(user);
});

router.put("/:id/change-password", async (req, res) => {
  const user = await User.findById(req.params.id);
  const validPassword = await bcrypt.compare(req.body.oldPass, user.password);
  if (!validPassword) return res.send("wrong");
  const compareOld = await bcrypt.compare(req.body.newPass, user.password);
  if (compareOld) return res.send("same");
  await user
    .populate("livesIn", " name")
    .populate("favFood", " name")
    .populate("favRestaurant", " name")
    .populate("restaurantsVisited.restaurantId", "name")
    .populate("type", "name")
    .populate("serves", "name")
    .populate({ path: "savedPosts", populate: { path: "postBy" } })
    .populate({ path: "hiddenPosts", populate: { path: "postBy" } })
    .populate("posts")
    .execPopulate();
  res.send(user);
});

router.put("/:id/update-bio", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.bio = req.body.bio;
  await user.save();
  res.send(user);
});

router.put("/:id/basic-settings", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.name = req.body.name;
  if (user.isRestaurant) {
    user.website = req.body.website;
  } else {
    user.birthday = `${req.body.date}-${req.body.month}-${req.body.year}`;
    user.gender = req.body.gender;
  }
  await user.save();
  await user
    .populate("livesIn", " name")
    .populate("favFood", " name")
    .populate("favRestaurant", " name")
    .populate("restaurantsVisited.restaurantId", "name")
    .populate("type", "name")
    .populate("serves", "name")
    .populate({ path: "savedPosts", populate: { path: "postBy" } })
    .populate({ path: "hiddenPosts", populate: { path: "postBy" } })
    .populate("posts")
    .execPopulate();
  res.send(user);
});

router.get("/:id/notifications", async (req, res) => {
  const user = await User.findById(req.params.id).populate(
    "notifications.doneBy",
    "name profilePic"
  );
  res.send(user.notifications.slice(0, 5).map((i) => i));
});

router.get("/restaurants/get", async (req, res) => {
  const users = await User.find({ isRestaurant: true }).select(
    "name profilePic"
  );
  res.send(users);
});

router.get("/restaurants/get-deals-and-discounts", async (req, res) => {
  const restaurants = await User.find({ isRestaurant: true })
    .select("posts name profilePic")
    .populate(
      "posts",
      "dealItems postType oldPrice dealPrice validTill validOn images"
    );
  const nowTime = new Date().getTime();
  for (let i in restaurants) {
    restaurants[i].posts = restaurants[i].posts.filter((p) => {
      const validTillSplit = p.validTill.split("-");
      const dealTime = new Date(
        validTillSplit[2],
        parseInt(validTillSplit[1]) - 1,
        validTillSplit[0]
      );
      return dealTime > nowTime;
    });
  }
  res.send(restaurants);
});

router.get("/:id/details-filled", async (req, res) => {
  const user = await User.findById(req.params.id);
  const detailsFilled = user.isRestaurant ? user.phone : user.livesIn;
  res.send(detailsFilled);
});

router.get("/:id/get-serves", async (req, res) => {
  const resServes = await User.findById(req.params.id)
    .select("name serves")
    .populate("serves", "name");
  res.send(resServes.serves);
});

router.get("/restaurants/featured", async (req, res) => {
  const restaurants = await User.find({ isRestaurant: true }).populate(
    "serves",
    "name"
  );
  const len = restaurants.length;
  const featured = [restaurants[len - 1], restaurants[len - 2]];
  res.send(featured);
});

router.get("/restaurants/:city", async (req, res) => {
  const rests = await User.find({ "branches.city": req.params.city }).select(
    "name"
  );
  res.send(rests);
});

router.get("/:id/get-branches", async (req, res) => {
  const branches = await User.findById(req.params.id).select("branches -_id");
  res.send(branches.branches);
});

router.put("/:id/change-pic", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.profilePic = req.body.pic;
  await user.save();
  res.send(user.profilePic);
});

router.put("/:id/profile-settings", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.favRestaurant = req.body.favRestaurant;
  user.livesIn = req.body.livesIn;
  user.favFood = req.body.favFood;
  user.bio = req.body.bio;

  await user.save();
  await user
    .populate("livesIn", " name")
    .populate("favFood", " name")
    .populate("favRestaurant", " name")
    .populate("restaurantsVisited.restaurantId", "name")
    .populate("type", "name")
    .populate("serves", "name")
    .populate({ path: "savedPosts", populate: { path: "postBy" } })
    .populate({ path: "hiddenPosts", populate: { path: "postBy" } })
    .populate("posts")
    .execPopulate();
  res.send(user);
});

router.post("/:id/start-following-user", async (req, res) => {
  const follower = await User.findById(req.params.id);
  if (follower.following.indexOf(req.body.userId) > -1) {
    return res.status(400).send("Already following the user");
  }

  follower.following.push(req.body.userId);
  await follower.save();
  const following = await User.findById(req.body.userId);
  following.followers.push(req.params.id);
  following.notifications.unshift({
    doneBy: req.params.id,
    notType: "started following",
  });
  await following.save();

  res.send(follower.following);
});

router.post("/:id/stop-following-user", async (req, res) => {
  const follower = await User.findById(req.params.id);
  if (follower.following.indexOf(req.body.userId) === -1) {
    return res.status(400).send("Follower does not exist");
  }

  follower.following.splice(req.body.userId, 1);
  await follower.save();
  const following = await User.findById(req.body.userId);
  following.followers.splice(req.params.id, 1);
  await following.save();

  res.send(follower.following);
});

router.post("/save-post/add", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const index = user.savedPosts.indexOf(req.body.postId);
  if (index > -1) return res.send("Post is already saved");

  user.savedPosts.push(req.body.postId);
  await user.save();
  res.send(user.savedPosts);
});

router.post("/save-post/remove", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const index = user.savedPosts.indexOf(req.body.postId);
  if (index === -1) return res.send("Post is already unsaved");

  user.savedPosts.splice(index, 1);
  await user.save();
  res.send(user.savedPosts);
});

router.post("/:id/add-details", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.profilePic = req.body.profilePic;
  if (user.isRestaurant) {
    user.branches = req.body.branches;
    user.type = req.body.type;
    user.phone = req.body.phone;
    user.serves = req.body.serves;
    user.menuPic = req.body.menuPic;
  } else {
    user.bio = req.body.bio;
    user.livesIn = req.body.livesIn;
    user.favFood = req.body.favFood;
    user.favRestaurant = req.body.favRestaurant;
  }
  await user.save();
  res.send(user);
});

router.post("/hidden-post/add", async (req, res) => {
  const user = await User.findById(req.body.userId);
  if (user.hiddenPosts.indexOf(req.body.postId) > -1)
    return res.status(400).send("Post already hidden");

  user.hiddenPosts.push(req.body.postId);
  await user.save();
  res.send(user.hiddenPosts);
});

router.post("/hidden-post/remove", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const index = user.hiddenPosts.indexOf(req.body.postId);
  if (index === -1) return res.status(400).send("Post is not hidden");

  user.hiddenPosts.splice(index, 1);
  await user.save();
  res.send(user.hiddenPosts);
});

router.post("/hidden-comment/add", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const index = user.hiddenComments.indexOf(req.body.commentId);
  if (index !== -1) return res.status(400).send("Comment already hidden");

  user.hiddenComments.push(req.body.commentId);
  await user.save();

  res.send(user.hiddenComments);
});

router.get("/:id/blog-posts", async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("blogPosts")
    .populate("blogPosts", "title body img date");
  res.send(user.blogPosts);
});

router.post("/hidden-comment/remove", async (req, res) => {
  const user = await User.findById(req.body.userId);
  const index = user.hiddenComments.indexOf(req.body.commentId);
  if (index === -1) return res.status(400).send("Comment is not hidden");

  user.hiddenComments.splice(index, 1);
  await user.save();

  res.send(user.hiddenComments);
});

module.exports = router;
