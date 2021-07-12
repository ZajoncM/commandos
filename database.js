const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('db', 'user', 'pass', {
    dialect: 'sqlite',
    host: './data.sqlite'
})

module.exports = sequelize