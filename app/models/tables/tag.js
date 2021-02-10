module.exports = function (sequelize, DataTypes) {
  return sequelize.define("tag", {
    tag_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Tag name already in use!",
      },
      validate: {
        max: {
          args: [64],
          msg: "TOO_LONG",
        },
      },
    },
  }, {
    tableName: "tag",
  });
};
