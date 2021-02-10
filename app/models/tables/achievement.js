module.exports = function(sequelize, DataTypes) {
  const achievementModel = sequelize.define("achievement", {
    achievement_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: "true",
        msg: "Achievement name already in use!",
      },
      validate: {
        min: {
          args: [2],
          msg: "TOO_SHORT",
        },
        max: {
          args: [24],
          msg: "TOO_LONG",
        },
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: "achievement",
    sequelize,
    validate: {
      isUnique(next) {
        const { name } = this;
        achievementModel.findOne({ where: { name } })
          .done(function(existing) {
            // No duplicates found
            if (existing === null) {
              return next();
            }
            return next({ name: "NOT_UNIQUE" });
          });
      },
    },
  });
  return achievementModel;
};
