const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
  static init(sequelize) {
    return super.init({
      content: {
        type: Sequelize.STRING(140),
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      // image를 여러개 올리려면 image테이블과 일대다 관계를 맺는다.
      // post hasMany images
    }, {
      sequelize,
      timestamps: true,
      underscored: false,
      modelName: 'Post',
      tableName: 'posts',
      paranoid: false,
      // 유니코드, 이모티콘 저장할 수 있게.
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci',
    });
  }

  static associate(db) {
    // 유저:게시글 일대다 관계
    db.Post.belongsTo(db.User);
    // 해시태그와 다대다 관계
    // 다대다 관계는 필연적으로 중간테이블이 생김 (PostHashtag)
    db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
  }
};