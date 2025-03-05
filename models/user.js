'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Leave, { foreignKey: "userId" });
      User.hasMany(User, { foreignKey: "managerId", as: "subordinates" });
    }
  }
  User.init(
    {
      firstName: { type: DataTypes.STRING, allowNull: false },
      lastName: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      designation: { type: DataTypes.STRING },
      dateOfBirth: { type: DataTypes.DATE },
      role: {
        type: DataTypes.ENUM("developer", "manager", "hr"),
        allowNull: false,
      },
      managerId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        allowNull: true,
      },
    },
    { sequelize, modelName: "User" }
  );

  return User;
};