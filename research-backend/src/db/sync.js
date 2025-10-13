import sequelize from '../config/database.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database sync failed:", err);
    process.exit(1);
  }
})();
