import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  whatsappId: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  consentGiven: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false 
  },
  sessionData: { 
    type: DataTypes.JSON, 
    allowNull: true 
  }
});

export default User; // ✅ important
