import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import authRoutes from './routes/authRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 6050;

const parseOrigins = (value) =>
    (value || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

const corsOriginsFromEnv = parseOrigins(process.env.CORS_ORIGINS);
const allowedOrigins =
    corsOriginsFromEnv.length > 0
        ? corsOriginsFromEnv
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
        ];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) {
                return callback(null, true);
            }
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(null, false);
        },
        credentials: true,
    })
);
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ideas', ideaRoutes);



app.use((req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use(errorHandler);




const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => {

        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1);
});
