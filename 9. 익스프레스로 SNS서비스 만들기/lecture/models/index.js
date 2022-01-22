const Sequelize = require('sequelize');

// NODE_ENV 따로 설정하지 않으면 기본값이 development
const env = process.env.NODE_ENV || 'development';

// 설정파일에서 development 가져오기
const config = require('../config/config')[env];
const User = require('./user');
const Post = require('./post');
const Hashtag = require('./hashtag');

const db = {};

// 설정 연결해서 연결객체 만들기
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;

// 유저:게시글 일대다
// 게시글:해시태그 다대다
// 유저:유저 다대다
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;