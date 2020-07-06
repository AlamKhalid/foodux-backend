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
const types = require("./routes/types");
const posts = require("./routes/posts");
const blogPosts = require("./routes/blogPosts");

const app = express();

if (!config.get("jwtPrivateKey")) {
  console.log("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

mongoose
  .connect(
    "mongodb+srv://alamkhalid:0803@webproject-sdtr6.mongodb.net/foodux?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .catch((err) => {
    console.error("Error connecting to database...", err);
  });

app.get("/", (req, res) => res.send({ status: "200", message: "Connected" }));

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
app.use("/api/posts", posts);
app.use("/api/blog-posts", blogPosts);
app.use(error);

const port = process.env.PORT || 4000;
app.listen(port, process.env.IP, () => {
  console.log(`Listening at port ${port}...`);
});
