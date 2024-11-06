
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/repair-system', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected Successfully');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Repair System API is running' });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Try to find an available port
const findAvailablePort = (startPort) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(startPort, '127.0.0.1', () => {
            const port = server.address().port;
            server.close(() => resolve(port));
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Try the next port
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
};

// Start server
const startServer = async () => {
    try {
        await connectDB();
        
        const basePort = parseInt(process.env.PORT || '3001');
        const port = await findAvailablePort(basePort);
        
        app.listen(port, '127.0.0.1', () => {
            console.log(`
🚀 Server is running successfully!
📍 Server URL: http://localhost:${port}
🏥 Health Check: http://localhost:${port}/health
💾 Database: Connected
⌛ Time: ${new Date().toLocaleString()}
            `);
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

startServer();

export default app;
