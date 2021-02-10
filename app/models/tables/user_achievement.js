module.exports = function(sequelize, DataTypes) {
  return sequelize.define("user_achievement", {
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    achievement_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "achievement",
        key: "achievement_id",
      },
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      primaryKey: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: "user_achievement",
  });
};
