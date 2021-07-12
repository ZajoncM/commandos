const {Model, DataTypes} = require('sequelize');
const sequelize = require('../database');


class User extends Model {}

User.init({
    id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    group:{
        type: DataTypes.INTEGER
    }
},
{
    sequelize,
    modelName: 'user'
})

module.exports = User