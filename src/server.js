require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');
const User = require('../src/database/models/User');
const startGrpcServer = require('../src/grpc/grpcServer'); // ✅ Import gRPC Server

const PORT = process.env.PORT || 4000;

// Connect to DB and Sync Models
connectDB().then(async () => {
    await sequelize.sync({ alter: true }); // Creates table if not exists, updates if schema changes
    console.log('✅ Database Synced');

    app.listen(PORT, () => {
        console.log(`✅ Auth Service running on port ${PORT}`);
    });
});

startGrpcServer();