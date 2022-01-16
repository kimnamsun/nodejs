const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {

  // init메서드: 테이블에 대한 설정
  static init(sequelize) {
    // 첫번째 인수: 테이블 컬럼에 대한 설정
    // 알아서 기본키를 id로 연결하기 때문에 id 컬럼은 적어줄 필요가 없음.
    return super.init({
      name: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      age: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      married: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    }, {
      // 두번째 인수: 테이블 자체에 대한 설정
      sequelize,
      timestamps: false, //true -> updateAt, createAt을 넣어줌.
      underscored: false, //true -> 시퀄라이즈에서 자동으로 만들어주는 값을 underscored로 작성하게 만들어줌.
      modelName: 'User',
      tableName: 'users',
      paranoid: false, //true -> deletedAt 추가, deletedAt: true -> soft delete 
      charset: 'utf8',
      collate: 'utf8_general_ci',
    });
  }

  // 다른 모델과의 관계 설정
  static associate(db) {
    // 내 id를 남의 commenter가 참조하고 있다.
    db.User.hasMany(db.Comment, { foreignKey: 'commenter', sourceKey: 'id' });
  }
};