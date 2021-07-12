const {Model, DataTypes} = require('sequelize');
const sequelize = require('../database');


class Point extends Model {}

Point.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    number:{
        type: DataTypes.INTEGER
    },
    userId:{
        type: DataTypes.INTEGER
    }
},
{
    sequelize,
    modelName: 'point'
})

module.exports = Point