"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const drivers_1 = __importDefault(require("./routes/drivers"));
const trips_1 = __importDefault(require("./routes/trips"));
const maintenance_1 = __importDefault(require("./routes/maintenance"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const reports_1 = __importDefault(require("./routes/reports"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to TransitOps API' });
});
// API Routes
app.use('/auth', auth_1.default);
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/drivers', drivers_1.default);
app.use('/api/trips', trips_1.default);
app.use('/api/maintenance', maintenance_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/reports', reports_1.default);
app.listen(port, () => {
    console.log(`TransitOps API is running on port ${port}`);
});
//# sourceMappingURL=index.js.map