const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session')

const indexRouter = require('./routes');
const userRouter = require('./routes/user');


// 익스프레스 내부에 http모듈이 내장되어 있음.
const app = express();

app.set('port', 3000);

app.use(morgan('dev'));
app.use(cookieParser());
// app.use(cookieParser('secretPassword'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  // secret: 'secretPassword',
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
  },
  name: 'connect.sid',
}))

app.use('/', indexRouter);
app.use('/user', userRouter);

// app.get('/', (req, res) => {
//   res.send('Hello express!');
// });

app.get('/', (req, res) => {
  req.cookies // { mycookie: 'test' }

  //쿠키 암호화
  req.signedCookies

  //쿠키 설정
  res.cookie('name', encodeURIComponent(name), {
    expires: new Date(),
    httpOnly: true,
    path: '/',
  })

  // 쿠키 지우기
  res.clearCookie('name', encodeURIComponent(name), {
    httpOnly: true,
    path: '/',
  })
  res.sendFile(path.join(__dirname, 'index.html'));
});

//set으로 설정한 port를 가져올 수 있음.
app.listen(app.get('port'), () => {
  console.log('익스프레스 서버 실행')
})

const multer = require("multer");
const fs = require("fs");

// 시작전에 업로드 폴더를 만들어줌.
try {
  fs.readdirSync("uploads");
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads");
}

const upload = multer({
  // storage: 업로드한 파일 어디에 저장할지 선택하는 옵션
  storage: multer.diskStorage({
    // 어디다 저장할지
    destination(req, file, done) {
      // done의 첫번째 인수로 에러처리할때 에러처리 미들웨어로 넘기기 위해 error를 넘김.
      // 두번째 인수로는 성공할때 값
      done(null, "uploads/"); //uploads 폴더에 저장
    },
    // 어떤 이름으로 저장할지
    filename(req, file, done) {
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "multipart.html"));
});

// upload객체를 라우터에 장착.
// 보통 모든 미들웨어에서 사용하지 않기 때문에 한 라우터에서만 적용
app.post("/upload", upload.single("image"), (req, res) => {
  console.log(req.file);
  res.send("ok");
});
