const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// uploads 폴더 생성
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

// multer자체는 미들웨어가 아님. 
// multer함수를 실행하면 함수를 실행한 객체 안에 네개의 미들웨어가 들어있음.
const upload = multer({
  // multer 설정
  storage: multer.diskStorage({
    destination(req, file, cb) {
      // uploads폴더에 이미지 업로드
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      // 파일명 지정
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  // 파일 용량 제한
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 로그인한 사람이 post image요청을 보낼 수 있음.
// form에서 img라는 키로 요청을 보내야함. (키가 일치해야함.)
// 실제 파일은 uploads안에 들어있고 요청주소는 img -> 이걸 해주는게 express static
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  // 업로드 완료 후 url을 프론트로 돌려보내줌. -> 게시글을 쓸 때 이걸 같이 전달해줘야하기 때문에 
  res.json({ url: `/img/${req.file.filename}` });
});

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);

    // [#노드, #익스프레스]
    // [노드, 익스프레스]
    // [findOrCreate(노드), findOrCreate(익스프레스)]
    // findOrCreate -> Promise이기 때문에 Promise all로 한꺼번에 처리해주기
    // result = [[해시태그, true], [해시태그, true]]
    // find-> false(이미 기존에 등록되어있던 것), create -> true
    /**
     [
  [
    Hashtag {
      dataValues: [Object],
      _previousDataValues: [Object],
      _changed: [Object],
      _modelOptions: [Object],
      _options: [Object],
      isNewRecord: false
    },
    true
  ]
]
    */
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),

        // update + insert (존재하지 않으면 insert, 기존에 존재하면 업데이트)
        // Hashtag.upsert()
      );
      console.log(result)
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;