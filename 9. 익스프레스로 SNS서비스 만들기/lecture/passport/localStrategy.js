const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', // req.body.email
    passwordField: 'password', // req.body.password
  }, async (email, password, done) => {
    try {
      // 가입되어있는 회원인지 체크
      const exUser = await User.findOne({ where: { email } });
      if (exUser) {
        // 비밀번호 비교.
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};

/* 
- done : 인자 세개를 받음.
첫번째 인자는 서버. 기본적으로는 null이 들어감.
두번째 인자는 로그인이 성공한 경우에 유저객체
세번째 인자는 로그인이 실패했을때의 메세지

done함수를 호출하면 auth라우터로 이동함.
*/