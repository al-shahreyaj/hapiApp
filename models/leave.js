'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Leave extends Model {
    static associate(models) {
      Leave.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Leave.init(
    {
      from: { type: DataTypes.DATE, allowNull: false },
      to: { type: DataTypes.DATE, allowNull: false },
      type: { type: DataTypes.STRING, allowNull: false },
      reason: { type: DataTypes.STRING, allowNull: false },
      emergencyContact: { type: DataTypes.STRING, allowNull: false },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        allowNull: false,
      },
    },
    { sequelize, modelName: "Leave" }
  );
  return Leave;
};