const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nombres: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    role: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    onboardingComplete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    selectedCountry: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    selectedClub: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    preferredFormation: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    preferredStyle: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    selectedTier: {
      type: DataTypes.STRING(50),
      defaultValue: 'Gratis'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          const isBcrypt = user.passwordHash.startsWith('$2a$') || 
                           user.passwordHash.startsWith('$2b$') || 
                           user.passwordHash.startsWith('$2y$');
          if (!isBcrypt) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
          }
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash') && user.passwordHash) {
          const isBcrypt = user.passwordHash.startsWith('$2a$') || 
                           user.passwordHash.startsWith('$2b$') || 
                           user.passwordHash.startsWith('$2y$');
          if (!isBcrypt) {
            user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
          }
        }
      }
    }
  });

  User.prototype.validatePassword = async function(plainPassword) {
    if (!this.passwordHash) return false;
    const isBcrypt = this.passwordHash.startsWith('$2a$') || 
                     this.passwordHash.startsWith('$2b$') || 
                     this.passwordHash.startsWith('$2y$');
    if (!isBcrypt) {
      // Dev/Local fallback for plain text entries
      return plainPassword === this.passwordHash;
    }
    return bcrypt.compare(plainPassword, this.passwordHash);
  };

  User.prototype.toPublicJSON = function() {
    const data = this.toJSON();
    delete data.passwordHash;
    return data;
  };

  return User;
};
