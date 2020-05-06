// default handler for errors in catch block
module.exports = function (err, req, res, next) {
  // Log the error - use winston
  res.status(500).send("Something went wrong " + err);
};
