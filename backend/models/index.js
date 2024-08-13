// models.js
const { Sequelize, DataTypes } = require('sequelize');

// Initialize MySQL database
const sequelize = new Sequelize('session', 'root', null, {
  host: '127.0.0.1',
  dialect: 'mysql',
});

// Define User model
const User = sequelize.define('users', { // Note the table name 'users'
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',// Explicitly define table name
  timestamps: true,
}
);

// Define Session model
const Session = sequelize.define('sessions', { // Note the table name 'sessions'
  session_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  expires: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  data: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'sessions',// Explicitly define table name
  timestamps: false, 
});

// Define Item model
const Item = sequelize.define('items', { // Note the table name 'items'
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'items', // Explicitly define table name
  timestamps: false,
});

// Sync database and create tables
const initDb = async () => {
  await sequelize.sync({ force: true }); // Force true to recreate tables
  console.log('Database synced');
};

module.exports = { sequelize, User, Session, Item, initDb };
