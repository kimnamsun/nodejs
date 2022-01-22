const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

// passport에서는 로그인 어떻게 할지 적어둔 파일을 전략이라고 부름.

module.exports = () => {

  // auth라우터에 넣어준 user가 여기로 와서 serializeUser가 실행됨.
  passport.serializeUser((user, done) => {
    done(null, user.id); // 세션에 user id만 저장 -> 메모리 문제로 id만 저장
    // done(null, user); // 세션에 user 통째로 저장

    // done이 실행되는 순간, auth.js의 (loginError) ~ 부분이 실행됨.
  });

  // 아이디와 세션쿠키가 매칭되게 메모리에 들고있게 됨.
  // connect.sid : 세션쿠키 , 브라우저에서 요청을 보낼때마다 이 쿠키를 같이 넣어서 보내줌.
  // { id: 3, 'connect.sid': 's%3Ae0f1f8f8' }

  passport.deserializeUser((id, done) => {
    // userid를 가져와서 findOne으로 유저를 다시 복구하는 과정
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user)) //req.user, req.isAuthenticated() -> 로그인했다면 true반환.
      .catch(err => done(err));
  });
  // strategy 등록
  local();
  kakao();
};