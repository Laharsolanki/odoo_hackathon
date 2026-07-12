"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = (process.env.JWT_SECRET || 'transitops-super-secret-key-2026');
const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length !== 2 || parts[0] !== 'Bearer') {
                res.status(401).json({ error: 'Unauthorized: Invalid token format' });
                return;
            }
            const token = parts[1];
            jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    res.status(403).json({ error: 'Forbidden: Invalid token' });
                    return;
                }
                req.user = user;
                next();
            });
        }
        else {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
exports.authenticateJWT = authenticateJWT;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized: No user found in request' });
            return;
        }
        if (roles.includes(req.user.role)) {
            next();
        }
        else {
            res.status(403).json({ error: `Forbidden: Requires one of roles: ${roles.join(', ')}` });
            return;
        }
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.js.map