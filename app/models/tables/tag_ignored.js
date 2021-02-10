module.exports = function(sequelize, DataTypes) {
  return sequelize.define("tag_ignored", {
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id",
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
    tableName: "tag_ignored",
  });
};
