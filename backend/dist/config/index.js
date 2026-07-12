"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'qr_asistencia_secret_key_2024_fixed',
    baseUrl: process.env.BASE_URL || 'http://127.0.0.1:5000',
    // Paths
    paths: {
        base: path_1.default.resolve(__dirname, '../../'),
        static: path_1.default.resolve(__dirname, '../static'),
        qrcodes: path_1.default.resolve(__dirname, '../static/qrcodes'),
        pdfs: path_1.default.resolve(__dirname, '../static/pdfs')
    }
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map