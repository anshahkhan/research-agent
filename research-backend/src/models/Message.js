import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  whatsappId: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  messageText: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  timestamp: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
});

export default Message; // ✅ important
