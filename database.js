const Sequelize = require('sequelize')

// Initialize sequelize connection
const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false, 
  // SQLITE only
  storage: 'database.sqlite',
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch (err => {
    console.error('Unable to connect to the database: ', err)
  })

// Define sql tables
const Tags = sequelize.define('tags', {
  name: {
      type: Sequelize.STRING,
      unique: true,
  },
  description: Sequelize.STRING,
  username: Sequelize.STRING,
  force: true,
  usage_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
  },
})

module.exports = { Tags, sequelize }