"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrTokensCache = exports.registrosCache = exports.localesCache = exports.empleadosCache = void 0;
/**
 * Memory-based LRU Cache for optimizing database queries
 * Reduces database load by caching frequently accessed data
 */
class LRUCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.maxSize) {
            // Remove least recently used (first item)
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
}
class TTLCache {
    constructor(maxSize = 100, defaultTTL = 300000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return undefined;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return undefined;
        }
        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.data;
    }
    set(key, value, ttl) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.maxSize) {
            // Remove least recently used
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, {
            data: value,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL
        });
    }
    has(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return false;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    delete(key) {
        return this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    // Clean up expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
// Cache instances for different data types
exports.empleadosCache = new TTLCache(50, 60000); // 1 minute
exports.localesCache = new TTLCache(20, 300000); // 5 minutes
exports.registrosCache = new TTLCache(100, 30000); // 30 seconds
exports.qrTokensCache = new TTLCache(50, 60000); // 1 minute
// Cleanup expired entries every minute
setInterval(() => {
    exports.empleadosCache.cleanup();
    exports.localesCache.cleanup();
    exports.registrosCache.cleanup();
    exports.qrTokensCache.cleanup();
}, 60000);
//# sourceMappingURL=cache.js.map