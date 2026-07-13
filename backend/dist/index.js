"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("./middleware/auth");
const auth_optimized_1 = __importDefault(require("./routes/auth.optimized"));
const admin_optimized_1 = __importDefault(require("./routes/admin.optimized"));
const scanner_optimized_1 = __importDefault(require("./routes/scanner.optimized"));
const api_optimized_1 = __importDefault(require("./routes/api.optimized"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://192.168.100.8:5173',
    'http://192.168.100.8:4173',
    'https://qrapptest.onrender.com'
].filter(Boolean);
// Middleware - Optimized for performance
app.use((0, compression_1.default)()); // Compress all responses
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express_1.default.json({ limit: '10mb' })); // Limit payload size for security
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
// Serve static files with caching
app.use('/static', express_1.default.static(path_1.default.join(__dirname, '../static'), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
}));
// Request logging middleware (optimized - only log slow requests)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    next();
});
// Routes
app.use('/', auth_optimized_1.default);
app.use('/admin', auth_1.authenticateToken, (0, auth_1.requireRole)(['admin']), admin_optimized_1.default);
app.use('/scanner', auth_1.authenticateToken, (0, auth_1.requireRole)(['user']), scanner_optimized_1.default);
app.use('/api', api_optimized_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map