const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("config");
const error = require("./middleware/error");
const auth = require("./routes/auth");
const users = require("./routes/users");
const cities = require("./routes/cities");
const categories = require("./routes/categories");
const comments = require("./routes/comments");
const likes = require("./routes/likes");
const foods = require("./routes/foods");
const restaurants = require("./routes/restaurants");
const types = require("./routes/types");
const posts = require("./routes/posts");

const app = express();

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost:27017/foodux", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .catch((err) => {
    console.error("Error connecting to database...", err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/cities", cities);
app.use("/api/categories", categories);
app.use("/api/comments", comments);
app.use("/api/likes", likes);
app.use("/api/foods", foods);
app.use("/api/types", types);
app.use("/api/restaurants", restaurants);
app.use("/api/posts", posts);
app.use(error);

const port = process.env.PORT || 4000;
app.listen(port, process.env.IP, () => {
  console.log(`Listening at port ${port}...`);
});
