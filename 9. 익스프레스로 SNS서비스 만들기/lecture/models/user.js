const Sequelize = require('sequelize');

// mysql 테이블과 매칭 
module.exports = class User extends Sequelize.Model {
  // 반드시 static으로 사용해야 mysql의 table과 1:1매칭이 된다.
  static init(sequelize) {
    // super: 부모인 Model을 가리킴.
    return super.init({
      // primary key인 id는 기본적으로 생략가능
      email: {
        type: Sequelize.STRING(40),
        // null값 두개가 있어도 같은 컬럼으로 인정하지 않기 때문에 unique가 걸려있어도 nullable한 컬럼 생성 가능
        allowNull: true,
        unique: true,
      },
      nick: {
        type: Sequelize.STRING(15),
        allowNull: false,
      },
      password: {
        // 추후의 hash화를 위해 여유롭게 100글자
        type: Sequelize.STRING(100),
        // sns로그인 등으로 비밀번호가 없을 수 있다.
        allowNull: true,
      },
      provider: {
        type: Sequelize.STRING(10),
        allowNull: false,
        // local or kakao
        defaultValue: 'local',
      },
      snsId: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
    }, {
      sequelize,
      // createAt, updateAt, deleteAt  
      timestamps: true,
      paranoid: true,
      underscored: false,
      modelName: 'User',
      tableName: 'users',
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    // 유저:유저 다대다관계
    db.User.belongsToMany(db.User, {
      // foreignKey 넣어주는이유: 팔로워, 팔로잉 아이디를 구분하기 위해 (안넣어주면 userId라는 이름으로 들어감)
      foreignKey: 'followingId',
      // foreignKey와 as가 서로 반대가 되어야함.
      as: 'Followers',
      through: 'Follow',
    });
    db.User.belongsToMany(db.User, {
      foreignKey: 'followerId',
      as: 'Followings',
      through: 'Follow',
    });
  }
};