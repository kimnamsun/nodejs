const express = require("express");
const router = express.Router();

// GET /user 라우터
router.get("/", (req, res) => {
  res.send("hello user");
});

module.exports = router;