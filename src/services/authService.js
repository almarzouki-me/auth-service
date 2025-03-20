const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole } = require('../database/models'); // Import models
const redis = require('../config/redis'); // Import Redis connection
const validator = require('validator'); // ✅ Added for input validation

// ✅ Register a User
exports.registerUser = async (email, mobile, password, roleName = 'admin', appId) => {
    try {
        if (!appId) throw new Error('appId is required');
        
        // ✅ Input Validation
        if (!validator.isEmail(email)) throw new Error('Invalid email format');
        if (!validator.isMobilePhone(mobile, 'any')) throw new Error('Invalid mobile number');
        if (!validator.isStrongPassword(password)) throw new Error('Password must contain at least 8 characters, one uppercase, one lowercase, one digit, and one special character.');

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) throw new Error('User already exists');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create user first and ensure it is saved
        const user = await User.create({ email, mobile, password: hashedPassword });

        // ✅ Find role
        const role = await Role.findOne({ where: { name: roleName } });
        if (!role) throw new Error(`Role '${roleName}' does not exist`);

        // ✅ Assign user to role using `addRole` method from Many-to-Many association
        await user.addRole(role, { through: { appId } });

        return { id: user.id, email: user.email, mobile: user.mobile, role: role.name, appId };
    } catch (error) {
        throw new Error(`Registration failed: ${error.message}`);
    }
};

// ✅ Login a User & Generate JWT
exports.loginUser = async (email, password) => {
    try {
        // ✅ Validate Email
        if (!validator.isEmail(email)) throw new Error('Invalid email format');

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) throw new Error('User does not exist');

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        // ✅ Fetch user roles with optimized query
        const userRoles = await UserRole.findAll({
            where: { userId: user.id },
            include: { model: Role, attributes: ['name'] }
        });

        if (userRoles.length === 0) {
            throw new Error('User does not have an assigned role!');
        }

        const roleNames = userRoles.map(r => r.Role.name); // Extract role names

        // ✅ Generate Short-Lived JWT (15 min expiration)
        const token = jwt.sign(
            { id: user.id, email: user.email, roles: roleNames },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        return { token, roles: roleNames };
    } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
};

// ✅ Store Revoked Token in Redis (On Logout)
exports.storeRevokedToken = async (token, expiry) => {
    try {
        if (!token) throw new Error('No token provided');
        await redis.set(`blacklist:${token}`, "revoked", "EX", expiry); // EX = Expiration
    } catch (error) {
        throw new Error(`Error storing revoked token: ${error.message}`);
    }
};

// ✅ Check if Token is Revoked (Used in gRPC Authentication)
exports.isTokenRevoked = async (token) => {
    try {
        if (!token) return false;
        const result = await redis.get(`blacklist:${token}`);
        return result !== null; // If found, token is revoked
    } catch (error) {
        console.error('Redis error checking revoked token:', error.message);
        return false; // Fail-safe: Assume token is valid if Redis fails
    }
};

// ✅ Logout User & Revoke Token
exports.logoutUser = async (token) => {
    try {
        if (!token) throw new Error("No token provided");

        // Decode JWT to get expiration time
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) throw new Error("Invalid token");

        const expiry = decoded.exp - Math.floor(Date.now() / 1000); // Time left in seconds

        // ✅ Blacklist token in Redis
        await exports.storeRevokedToken(token, expiry);

        return { message: "Logged out successfully" };
    } catch (error) {
        throw new Error(`Logout failed: ${error.message}`);
    }
};
