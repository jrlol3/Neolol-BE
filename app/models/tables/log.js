module.exports = function (sequelize, DataTypes) {
  return sequelize.define("log", {
    log_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    date_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "D", // 'D' for Debug, 'I' for Information, 'W' for Warning, 'E' for Error', 'C' for Critical
    },
    message: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: "log",
  });
};
