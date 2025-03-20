const Redis = require('ioredis');

// 🔹 Initialize Redis Client
const redis = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => Math.min(times * 50, 2000) // Auto-reconnect
});

// 🔹 Handle Redis Connection Errors
redis.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis');
});

module.exports = redis;
