const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

// ✅ Define Role Model
const Role = sequelize.define('Role', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
});

// // ✅ Import User & UserRole after defining Role to avoid circular dependency
// const User = require('./User');
// const UserRole = require('./UserRole');

// // ✅ Define Many-to-Many Relationship
// Role.belongsToMany(User, { through: UserRole });

module.exports = Role;
