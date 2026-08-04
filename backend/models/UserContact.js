const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserContact = sequelize.define('UserContact', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    contactUserId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'user_contacts',
    timestamps: true
  });

  return UserContact;
};
