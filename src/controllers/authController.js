const authService = require('../services/authService');

// ✅ Register Controller
exports.register = async (req, res) => {
    try {
        let appId = req.body.appId; // ✅ Declare appId separately before reassigning

        if (!appId) {
            return res.status(400).json({ error: "appId is required" });
        }

        appId = parseInt(appId, 10); // ✅ Convert appId to an integer
        if (isNaN(appId)) {
            return res.status(400).json({ error: "appId must be a valid number" });
        }

        const { email, mobile, password, role} = req.body;
        const user = await authService.registerUser(email, mobile, password, role, appId);
        res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ✅ Login Controller
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

// ✅ Logout Controller
exports.logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(400).json({ error: "No token provided" });

        await authService.logoutUser(token);
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
