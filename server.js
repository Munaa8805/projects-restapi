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
import countryRoutes from './routes/countryRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 6050;



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const corsOptions = {
    // 1. Origin: String, RegExp, Array, or Function
    origin: (origin, callback) => {
        const whitelist = ['http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            "https://ideas.munaa.dev",
            "https://ais-dev-npkplxdr7bt5fvgqf5xxln-245806968768.us-west2.run.app"];
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },

    // 2. Methods: Allowed HTTP verbs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],

    // 3. Allowed Headers: Custom headers the client can send
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

    // 4. Exposed Headers: Headers the client is allowed to see in the response
    exposedHeaders: ['X-Total-Count'],

    // 5. Credentials: Set to true if sending Cookies or Auth headers
    credentials: true,

    // 6. Max Age: How long (in seconds) the browser caches the preflight (OPTIONS) request
    maxAge: 86400, // 24 hours

    // 7. Success Status: Provides a status code for successful OPTIONS requests
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ideas', ideaRoutes);
app.use('/api/v1/countries', countryRoutes);


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
