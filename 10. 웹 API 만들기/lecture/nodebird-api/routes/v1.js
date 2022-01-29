const express = require('express');
const jwt = require('jsonwebtoken');

const { verifyToken, deprecated } = require('./middlewares');
const { Domain, User, Hashtag } = require('../models');

const router = express.Router();

// 토큰 발급해주는 router
router.post('/token', async (req, res) => {
  const { clientSecret } = req.body;
  try {

    // 도메인이 등록되어있는지 검사
    const domain = await Domain.findOne({
      where: { clientSecret },
      include: {
        model: User,
        attribute: ['nick', 'id'],
      },
    });
    if (!domain) {
      return res.status(401).json({
        code: 401,
        message: '등록되지 않은 도메인입니다. 먼저 도메인을 등록하세요',
      });
    }

    // 토큰 발급 (sign)
    // nodecat은 발급받은 토큰을 이용해 api를 요청할 수 있다.
    const token = jwt.sign({
      id: domain.User.id,
      nick: domain.User.nick,
    }, process.env.JWT_SECRET, {
      // 토큰옵션. 유효기간 지나면 오류남.
      expiresIn: '1m', // 1분
      issuer: 'nodebird',
    });

    // response로 token내려줌.
    return res.json({
      code: 200,
      message: '토큰이 발급되었습니다',
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    });
  }
});

// 토큰이 제대로 발급되었는지 확인하는 test 라우터
router.get('/test', verifyToken, (req, res) => {
  res.json(req.decoded);
});

router.get('/posts/my', verifyToken, (req, res) => {
  Post.findAll({ where: { userId: req.decoded.id } })
    .then((posts) => {
      res.json({
        code: 200,
        payload: posts,
      })
    })
    .catch((error) => {
      console.log(err)
      return res.status(500).json({
        code: 500,
        message: '서버 에러',
      })
    })
})

router.get('/posts/hashtag/:title', verifyToken, async (req, res) => {
  try {
    const hashtag = await Hashtag.findOne({ where: { title: req.params.title } })

    if (!hashtag) {
      return res.status(404).json({
        code: 404,
        message: '검색 결과가 없습니다.'
      })
    }

    const posts = await hashtag.getPosts()
    return res.json({
      code: 200,
      payload: posts
    })
  } catch (error) {
    console.log(err)
    return res.status(500).json({
      code: 500,
      message: '서버 에러',
    })
  }
})

module.exports = router;