const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cardholderName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cardBrand: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Visa'
    },
    last4: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    expMonth: {
      type: DataTypes.STRING(2),
      allowNull: false
    },
    expYear: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    encryptedCardDetails: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userAccount: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'payment_methods',
    timestamps: true
  });

  return PaymentMethod;
};
