module.exports = function (sequelize, DataTypes) {
  return sequelize.define("history_voting", {
    history_voting_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    start_search_date: {
      type: DataTypes.DATE,
    },
    end_search_date: {
      type: DataTypes.DATE,
    },
    real_start_date: {
      type: DataTypes.DATE,
    },
    real_end_date: {
      type: DataTypes.DATE,
    },
    updated_user_count: {
      type: DataTypes.INTEGER(11),
    },
    total_karma_changed: {
      type: DataTypes.INTEGER(11),
    },
    rollbacked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
  }, {
    tableName: "history_voting",
  });
};
