const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

// 회원가입 라우터
// 로그인하지 않은 사람들만 접근 가능
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 기존에 가입했는지 여부를 검사
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 이미 존재하는 회원이면 쿼리스트링으로 error메세지를 보내줌.
      return res.redirect('/join?error=exist');
    }
    // 비밀번호 해쉬화 
    // 12는 얼마나 복잡하게 해시할건지를 나타냄
    // 숫자가 높을수록 보안이 좋지만 소요시간이 오래걸림
    const hash = await bcrypt.hash(password, 12);
    // 유저 생성
    await User.create({
      email,
      nick,
      password: hash,
    });
    // 메인페이지로 리다이렉트
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  // 미들웨어 확장
  // passport.authenticate('local', -> 이 부분이 실행되는 순간 localStrategy.js 로 이동
  // (passport/index.js 에서 설정해놓았기 때문에)

  // done함수가 실행되면 (authError, user, info ~ 이부분이 실행됨.
  // done함수의 인자 세개와 매칭됨.
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    // 로그인이 실패한 경우
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    // 로그인이 성공한 경우, 사용자 객체를 넣어줌. -> passport/index로 이동
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 로그인 성공시 메인페이지로 리다이렉트
      // 이 과정에서 세션쿠키를 브라우저로 보내줌. -> 브라우저에 들어가있게돼서 그 다음요청부터는 세션쿠키가 보내져서 서버가 누가 보낸 요청인지 알 수 있게 됨.
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.user // 사용자 정보
  req.logout(); // 세션쿠키 지움.
  req.session.destroy();
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;