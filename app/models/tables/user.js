module.exports = function(sequelize, DataTypes) {
  const userModel = sequelize.define("user", {
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        min: {
          args: [3],
          msg: "TOO_SHORT",
        },
        max: {
          args: [24],
          msg: "TOO_LONG",
        },
      },
    },
    nickname: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        min: {
          args: [3],
          msg: "TOO_SHORT",
        },
        max: {
          args: [24],
          msg: "TOO_LONG",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    about: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        max: {
          args: [258],
          msg: "TOO_LONG",
        },
      },
    },
    joined: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_mod: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    public_comments: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "1",
    },
    public_upvotes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    public_downvotes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: "0",
    },
    show_mature: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: "user",
    sequelize,
  });
  userModel.updateUserProfile = async (userId, nickname, about, showMature) => {
    const userToEdit = await userModel.findByPk(userId);
    // first do it the verbose way, then the cool way
    const fieldsToUpdate = [];
    if (nickname) { userToEdit.nickname = nickname; fieldsToUpdate.push("nickname"); }
    if (about) { userToEdit.about = about; fieldsToUpdate.push("about"); }
    if (showMature) { userToEdit.show_mature = showMature; fieldsToUpdate.push("show_mature"); }

    return userToEdit.save({ fields: fieldsToUpdate });
  };
  return userModel;
};
