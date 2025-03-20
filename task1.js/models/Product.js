const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./User').sequelize;

const Product = sequelize.define('Product', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = { Product };
