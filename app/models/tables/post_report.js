module.exports = function(sequelize, DataTypes) {
  return sequelize.define("post_report", {
    user_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "user",
        key: "user_id",
      },
    },
    post_fk: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: "post",
        key: "post_id",
      },
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        max: {
          args: [256],
          msg: "TOO_LONG",
        },
      },
    },
  }, {
    tableName: "post_report",
  });
};
