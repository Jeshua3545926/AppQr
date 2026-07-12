"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Optimized Scanner Routes using repositories and caching
 */
const express_1 = require("express");
const router = (0, express_1.Router)();
/**
 * GET /scanner - Get attendance page info
 */
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        res.json({ user });
    }
    catch (error) {
        console.error('Error fetching scanner data:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});
exports.default = router;
//# sourceMappingURL=scanner.optimized.js.map