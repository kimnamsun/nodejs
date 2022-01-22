// 패키지 import
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

// dotenv는 최대한 위에 적어주는 것이 좋다.
dotenv.config();
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();

// 개발할때와 배포할때 포트를 다르게 사용하기 위해 
app.set('port', process.env.PORT || 8001);

// 넌적스 설정 코드
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

// 시퀄라이즈 연결
// 시퀄라이즈는 promise이기 때문에 then, catch작성해주면 좋다.

// force: true -> 테이블을 삭제했다가 다시 생성 (데이터 날아감.)
// alter: true -> 데이터 유지하고 컬럼 바뀐거 반영 (컬럼과 기존 데이터들이 안맞아서 에러날 가능성이 있음.)
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  })

// passport연결
passportConfig()

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
// express 세션보다 아래에 위치해야함.
app.use(passport.initialize());
app.use(passport.session());

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
// router.use() requires a middleware function but got a object
// : app.use에 넣은 것이 middleware가 아닐 경우에 나타나는 에러
app.use('/user', userRouter);


// 404처리 미들웨어
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error); // 에러미들웨어로 넘겨줌
});

// 에러처리 미들웨어
// 인자 반드시 4개 작성
app.use((err, req, res, next) => {

  // 템플릿엔진에서 message, error변수 사용할 수 있게 해주는 코드
  res.locals.message = err.message;

  // 개발시에만 보여주고 배포일땐 안보여주게.
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};

  // 체이닝 가능
  res.status(err.status || 500).render('error');
  // res.status(err.status || 500);
  // res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});