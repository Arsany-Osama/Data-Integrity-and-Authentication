const sequelize = require('./config/database');
const User = require('./models/User');
const LoginLog = require('./models/LoginLog');

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync({ force: true }); // Use { force: true } for development only
    console.log('Database synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

initDb();
