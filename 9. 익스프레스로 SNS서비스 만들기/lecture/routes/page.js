const express = require('express');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

router.use(({ user }, { locals }, next) => {
  // 모든 라우터에 user정보가 들어가게 됨.
  locals.user = user;

  // req.user는 deserializeUser에서 생성되기 때문에 deserializeUser에서 follower, following을 넣어줘야함.
  locals.followerCount = user ? user.Followers.length : 0;
  locals.followingCount = user ? user.Followings.length : 0;
  locals.followingIdList = user ? user.Followings.map(({ id }) => id) : [];
  next();
});

router.get('/profile', (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' });
});

router.get('/join', (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' });
});


router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.findAll({
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// GET /hashtag?hashtag=노드
router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;

  // 검색할 해시태그가 없을 경우 리다이렉트
  if (!query) {
    return res.redirect('/');
  }

  try {
    // 해시태그가 존재하는지 찾기
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      // 해시태그가 가지고 있는 게시글들을 가져오기
      // include User : 게시글의 작성자까지 가져오기
      // attributes로 필요한 컬럼들만 가져오기 (보안)
      posts = await hashtag.getPosts({ include: [{ model: User, attributes: ['id', 'nick'] }] });
    }

    return res.render('main', {
      title: `#${query} 검색 결과 | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;