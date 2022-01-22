const express = require('express');

const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// POST /user/1/follow
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    // 내가 누군지를 먼저 찾기.
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      // models/user의 as에 따라 메서드명이 정해짐.
      // setFollowings(수정), removeFollowings(삭제), getFollowings(조회)
      // 배열로 추가 가능
      await user.addFollowings([parseInt(req.params.id, 10)]);
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;