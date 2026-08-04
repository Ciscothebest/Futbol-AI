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
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    otpCode: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    localCoachData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    billingCycleStart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    billingCycleEnd: {
      type: DataTypes.DATE,
      allowNull: true
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxPaidTierInCycle: {
      type: DataTypes.STRING(50),
      defaultValue: 'Gratis'
    },
    hasPasskey: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    passkeyCredentialId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passkeyPublicKey: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passkeyCounter: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    passkeyPinHash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passkeyChallenge: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    passkeyDeviceInfo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passkeyWebAuthnDevice: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passkeyPinDevice: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    securityQuestions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featureSettings: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dailyComparisonsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstDailyComparisonAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dailyAiMessagesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstDailyAiMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    weeklyComparisonsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstWeeklyComparisonAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    weeklyAiMessagesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstWeeklyAiMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    monthlySimulationsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstMonthlySimulationAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    monthlyComparisonsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    firstMonthlyComparisonAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastDailyResetDate: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    lastWeeklyResetDate: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    lastMonthlyResetDate: {
      type: DataTypes.STRING(10),
      allowNull: true
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

  User.prototype.checkAndResetDailyLimits = async function() {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

    let changed = false;

    // Daily Comparisons (24h)
    if (this.firstDailyComparisonAt && (now - new Date(this.firstDailyComparisonAt).getTime() >= DAY_MS)) {
      this.dailyComparisonsCount = 0;
      this.firstDailyComparisonAt = null;
      changed = true;
    }

    // Daily AI Messages (24h)
    if (this.firstDailyAiMessageAt && (now - new Date(this.firstDailyAiMessageAt).getTime() >= DAY_MS)) {
      this.dailyAiMessagesCount = 0;
      this.firstDailyAiMessageAt = null;
      changed = true;
    }

    // Weekly Comparisons (7d)
    if (this.firstWeeklyComparisonAt && (now - new Date(this.firstWeeklyComparisonAt).getTime() >= WEEK_MS)) {
      this.weeklyComparisonsCount = 0;
      this.firstWeeklyComparisonAt = null;
      changed = true;
    }

    // Weekly AI Messages (7d)
    if (this.firstWeeklyAiMessageAt && (now - new Date(this.firstWeeklyAiMessageAt).getTime() >= WEEK_MS)) {
      this.weeklyAiMessagesCount = 0;
      this.firstWeeklyAiMessageAt = null;
      changed = true;
    }

    // Monthly Simulations (30d)
    if (this.firstMonthlySimulationAt && (now - new Date(this.firstMonthlySimulationAt).getTime() >= MONTH_MS)) {
      this.monthlySimulationsCount = 0;
      this.firstMonthlySimulationAt = null;
      changed = true;
    }

    // Monthly Comparisons (30d)
    if (this.firstMonthlyComparisonAt && (now - new Date(this.firstMonthlyComparisonAt).getTime() >= MONTH_MS)) {
      this.monthlyComparisonsCount = 0;
      this.firstMonthlyComparisonAt = null;
      changed = true;
    }

    if (changed) {
      await this.save();
    }
  };

  User.prototype.toPublicJSON = function() {
    const data = this.toJSON();
    delete data.passwordHash;
    delete data.otpCode;
    delete data.otpExpires;

    data.hasWebAuthn = !!data.passkeyCredentialId;
    data.hasPasskeyPin = !!data.passkeyPinHash;
    if (data.hasPasskey && !data.hasWebAuthn && !data.hasPasskeyPin) {
      data.hasWebAuthn = true;
    }
    data.hasPasskey = !!(data.hasPasskey || data.hasWebAuthn || data.hasPasskeyPin);
    data.passkeyDeviceInfo = this.passkeyDeviceInfo || data.passkeyDeviceInfo || null;
    data.passkeyWebAuthnDevice = this.passkeyWebAuthnDevice || data.passkeyWebAuthnDevice || null;
    data.passkeyPinDevice = this.passkeyPinDevice || data.passkeyPinDevice || null;

    delete data.passkeyPinHash;
    delete data.passkeyChallenge;
    delete data.passkeyPublicKey;
    
    if (data.securityQuestions) {
      try {
        const parsed = typeof data.securityQuestions === 'string' ? JSON.parse(data.securityQuestions) : data.securityQuestions;
        data.securityQuestions = Array.isArray(parsed) ? parsed.map(q => ({ question: q.question })) : [];
        data.hasSecurityQuestions = data.securityQuestions.length === 3;
      } catch (e) {
        data.securityQuestions = [];
        data.hasSecurityQuestions = false;
      }
    } else {
      data.securityQuestions = [];
      data.hasSecurityQuestions = false;
    }

    if (data.featureSettings) {
      try {
        data.featureSettings = typeof data.featureSettings === 'string' ? JSON.parse(data.featureSettings) : data.featureSettings;
      } catch (e) {
        data.featureSettings = {};
      }
    } else {
      data.featureSettings = {};
    }

    const tier = (data.selectedTier || 'Gratis').toLowerCase();
    let dailyComparisonsLimit = null;
    let dailyAiMessagesLimit = null;
    let weeklyComparisonsLimit = null;
    let weeklyAiMessagesLimit = null;
    let monthlyComparisonsLimit = null;
    let monthlySimulationsLimit = null;

    if (tier === 'gratis') {
      dailyComparisonsLimit = 2;
      dailyAiMessagesLimit = 5;
      monthlySimulationsLimit = 0;
    } else if (tier === 'pro') {
      dailyComparisonsLimit = 5;
      dailyAiMessagesLimit = 10;
      monthlySimulationsLimit = 0;
    } else if (tier === 'plus') {
      weeklyComparisonsLimit = 15;
      weeklyAiMessagesLimit = 30;
      monthlySimulationsLimit = 5;
    } else if (tier === 'enterprise') {
      monthlyComparisonsLimit = 50;
      weeklyAiMessagesLimit = 50;
      monthlySimulationsLimit = 25;
    }

    data.dailyComparisonsCount = this.dailyComparisonsCount || 0;
    data.dailyAiMessagesCount = this.dailyAiMessagesCount || 0;
    data.weeklyComparisonsCount = this.weeklyComparisonsCount || 0;
    data.weeklyAiMessagesCount = this.weeklyAiMessagesCount || 0;
    data.monthlySimulationsCount = this.monthlySimulationsCount || 0;
    data.monthlyComparisonsCount = this.monthlyComparisonsCount || 0;

    data.dailyComparisonsLimit = dailyComparisonsLimit;
    data.dailyAiMessagesLimit = dailyAiMessagesLimit;
    data.weeklyComparisonsLimit = weeklyComparisonsLimit;
    data.weeklyAiMessagesLimit = weeklyAiMessagesLimit;
    data.monthlyComparisonsLimit = monthlyComparisonsLimit;
    data.monthlySimulationsLimit = monthlySimulationsLimit;

    if (tier === 'gratis' || tier === 'pro') {
      data.dailyComparisonsRemaining = Math.max(0, dailyComparisonsLimit - (this.dailyComparisonsCount || 0));
      data.dailyAiMessagesRemaining = Math.max(0, dailyAiMessagesLimit - (this.dailyAiMessagesCount || 0));
    } else {
      data.dailyComparisonsRemaining = null;
      data.dailyAiMessagesRemaining = null;
    }

    if (tier === 'plus') {
      data.weeklyComparisonsRemaining = Math.max(0, weeklyComparisonsLimit - (this.weeklyComparisonsCount || 0));
      data.weeklyAiMessagesRemaining = Math.max(0, weeklyAiMessagesLimit - (this.weeklyAiMessagesCount || 0));
      data.monthlySimulationsRemaining = Math.max(0, monthlySimulationsLimit - (this.monthlySimulationsCount || 0));
      data.monthlyComparisonsRemaining = null;
    } else if (tier === 'enterprise') {
      data.weeklyComparisonsRemaining = null;
      data.weeklyAiMessagesRemaining = Math.max(0, weeklyAiMessagesLimit - (this.weeklyAiMessagesCount || 0));
      data.monthlySimulationsRemaining = Math.max(0, monthlySimulationsLimit - (this.monthlySimulationsCount || 0));
      data.monthlyComparisonsRemaining = Math.max(0, monthlyComparisonsLimit - (this.monthlyComparisonsCount || 0));
    } else {
      data.weeklyComparisonsRemaining = null;
      data.weeklyAiMessagesRemaining = null;
      data.monthlySimulationsRemaining = (tier === 'gratis' || tier === 'pro') ? 0 : null;
      data.monthlyComparisonsRemaining = null;
    }

    return data;
  };

  return User;
};
