const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

// ✅ Define User Model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true // Ensures valid email format
        }
    },
    mobile: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isNumeric: true,
            len: [10, 10] // Exactly 10 digits
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 255] // Min 8 characters
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW // Auto-update timestamp
    }
});

// ✅ Hook: Validate, Prevent Reuse & Hash Password Before Update
User.beforeUpdate(async (user) => {
    if (!user.changed('password')) return; // ✅ Skip validation if password isn't changing

    // Fetch existing user data
    const existingUser = await User.findByPk(user.id);
    if (!existingUser) throw new Error('User not found.');

    // Prevent reusing old password
    const isSamePassword = await bcrypt.compare(user.password, existingUser.password);
    if (isSamePassword) {
        throw new Error('New password cannot be the same as the old password.');
    }

    // Validate new password
    if (!strongPasswordRegex.test(user.password)) {
        throw new Error('Password must have at least 8 characters, one uppercase, one lowercase, one digit, and one special character.');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;
