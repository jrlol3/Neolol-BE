module.exports = function(sequelize, DataTypes) {
  return sequelize.define("post_tag", {
    post_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "post",
        key: "post_id",
      },
    },
    tag_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "tag",
        key: "tag_id",
      },
    },
  }, {
    tableName: "post_tag",
  });
};
