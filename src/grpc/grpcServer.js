const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const jwt = require('jsonwebtoken');
const { isTokenRevoked } = require('../services/authService');
const redisClient = require('../config/redis');

const packageDefinition = protoLoader.loadSync('src/grpc/auth.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

// gRPC Token Validation Service
async function validateToken(call, callback) {
    const token = call.request.token;
    console.log('🔍 Received gRPC request with token:', token); // ✅ Debug log

    if (!token) {
        console.log('❌ No token provided.');
        return callback(null, { valid: false, message: 'No token provided' });
    }

    try {
        // ✅ Check if the token is blacklisted
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
            console.log('🚨 Token is blacklisted!');
            return callback(null, { valid: false, message: 'Token is revoked' });
        }

        // ✅ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decoded:', decoded);

        // ✅ Send a successful response
        callback(null, {
            valid: true,
            userId: decoded.id,
            email: decoded.email,
            roles: decoded.roles
        });

    } catch (error) {
        console.error('❌ Token validation error:', error);
        return callback(null, { valid: false, message: 'Invalid token' });
    }
}

// Start gRPC Server
const startGrpcServer = () => {
    const server = new grpc.Server();
    server.addService(authProto.AuthService.service, { validateToken });

    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('✅ gRPC Auth Service running on port 50051');
        server.start();
    });
};

module.exports = startGrpcServer;