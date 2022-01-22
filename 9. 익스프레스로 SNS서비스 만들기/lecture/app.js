// 패키지 import
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

// dotenv는 최대한 위에 적어주는 것이 좋다.
dotenv.config();
const pageRouter = require('./routes/page');

const app = express();

// 개발할때와 배포할때 포트를 다르게 사용하기 위해 
app.set('port', process.env.PORT || 8001);

// 넌적스 설정 코드
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
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

app.use('/', pageRouter);

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