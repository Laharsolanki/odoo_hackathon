"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'transitops-super-secret-key-2026';
router.get('/me', auth_1.authenticateJWT, async (req, res) => {
    const user = await prisma_1.default.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, role: true }
    });
    if (!user)
        return res.status(401).json({ error: 'User no longer exists' });
    res.json({ user });
});
router.post('/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Missing required fields: email, password, role' });
        }
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                email,
                passwordHash,
                role
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Missing required fields: email, password' });
        }
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ user: { id: user.id, email: user.email, role: user.role }, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map