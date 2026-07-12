"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.use((0, auth_1.requireRole)(['Safety Officer', 'Fleet Manager']));
// Get all drivers
router.get('/', async (req, res) => {
    try {
        const drivers = await prisma_1.default.driver.findMany();
        res.json(drivers);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});
// Get a single driver
router.get('/:id', async (req, res) => {
    try {
        const driver = await prisma_1.default.driver.findUnique({
            where: { id: req.params.id }
        });
        if (!driver)
            return res.status(404).json({ error: 'Driver not found' });
        res.json(driver);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch driver' });
    }
});
// Create a new driver
router.post('/', async (req, res) => {
    try {
        const { name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status, userId } = req.body;
        const driver = await prisma_1.default.driver.create({
            data: { name, licenseNumber, licenseCategory, licenseExpiryDate: new Date(licenseExpiryDate), contactNumber, safetyScore, status, userId }
        });
        res.status(201).json(driver);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to create driver' });
    }
});
// Update a driver
router.put('/:id', async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.licenseExpiryDate) {
            data.licenseExpiryDate = new Date(data.licenseExpiryDate);
        }
        const driver = await prisma_1.default.driver.update({
            where: { id: req.params.id },
            data
        });
        res.json(driver);
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to update driver' });
    }
});
// Delete a driver
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.default.driver.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(400).json({ error: 'Failed to delete driver' });
    }
});
exports.default = router;
//# sourceMappingURL=drivers.js.map