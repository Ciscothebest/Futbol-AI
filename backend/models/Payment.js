const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD'
    },
    tier: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    cardholderName: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    cardLast4: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'success'
    },
    userAccount: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'payments',
    timestamps: true
  });

  return Payment;
};
