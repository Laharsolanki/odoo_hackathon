"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vehicleStateMachine_1 = require("./stateMachines/vehicleStateMachine");
const driverStateMachine_1 = require("./stateMachines/driverStateMachine");
const tripStateMachine_1 = require("./stateMachines/tripStateMachine");
function testVehicleStateMachine() {
    console.log('🧪 Testing Vehicle State Machine...');
    // Valid transitions
    (0, vehicleStateMachine_1.assertTransition)('Available', 'On Trip');
    (0, vehicleStateMachine_1.assertTransition)('Available', 'In Shop');
    (0, vehicleStateMachine_1.assertTransition)('Available', 'Retired');
    (0, vehicleStateMachine_1.assertTransition)('On Trip', 'Available');
    (0, vehicleStateMachine_1.assertTransition)('In Shop', 'Available');
    (0, vehicleStateMachine_1.assertTransition)('In Shop', 'Retired');
    // Illegal transitions (should throw)
    try {
        (0, vehicleStateMachine_1.assertTransition)('On Trip', 'In Shop');
        throw new Error('FAIL: On Trip → In Shop should be blocked');
    }
    catch (err) {
        if (err.code !== 'INVALID_TRANSITION')
            throw err;
    }
    try {
        (0, vehicleStateMachine_1.assertTransition)('Retired', 'Available');
        throw new Error('FAIL: Retired → Available should be blocked');
    }
    catch (err) {
        if (err.code !== 'INVALID_TRANSITION')
            throw err;
    }
    // Dispatch checks
    const vehicleAvailable = { id: '1', status: 'Available' };
    (0, vehicleStateMachine_1.assertVehicleDispatchable)(vehicleAvailable);
    const vehicleInShop = { id: '2', status: 'In Shop' };
    try {
        (0, vehicleStateMachine_1.assertVehicleDispatchable)(vehicleInShop);
        throw new Error('FAIL: In Shop vehicle should not be dispatchable');
    }
    catch (err) {
        if (err.code !== 'VEH_NOT_AVAILABLE')
            throw err;
    }
    const vehicleOnTrip = { id: '3', status: 'On Trip' };
    try {
        (0, vehicleStateMachine_1.assertVehicleDispatchable)(vehicleOnTrip);
        throw new Error('FAIL: On Trip vehicle should not be dispatchable');
    }
    catch (err) {
        if (err.code !== 'VEH_ON_TRIP')
            throw err;
    }
    // Maintenance entry checks
    (0, vehicleStateMachine_1.assertCanEnterMaintenance)(vehicleAvailable);
    try {
        (0, vehicleStateMachine_1.assertCanEnterMaintenance)(vehicleInShop);
        throw new Error('FAIL: In Shop vehicle entering maintenance again should fail');
    }
    catch (err) {
        if (err.code !== 'VEH_ALREADY_IN_SHOP')
            throw err;
    }
    console.log('✅ Vehicle State Machine tests passed.');
}
function testDriverStateMachine() {
    console.log('🧪 Testing Driver State Machine...');
    // Valid transitions
    (0, driverStateMachine_1.assertTransition)('Available', 'On Trip');
    (0, driverStateMachine_1.assertTransition)('Available', 'Off Duty');
    (0, driverStateMachine_1.assertTransition)('Available', 'Suspended');
    (0, driverStateMachine_1.assertTransition)('On Trip', 'Available');
    (0, driverStateMachine_1.assertTransition)('Suspended', 'Available');
    // Expiry check
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const driverValid = { id: '1', status: 'Available', licenseExpiryDate: futureDate };
    (0, driverStateMachine_1.assertDriverDispatchable)(driverValid);
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    const driverExpired = { id: '2', status: 'Available', licenseExpiryDate: pastDate };
    try {
        (0, driverStateMachine_1.assertDriverDispatchable)(driverExpired);
        throw new Error('FAIL: Expired license driver should not be dispatchable');
    }
    catch (err) {
        if (err.code !== 'DRV_LICENSE_EXPIRED')
            throw err;
    }
    const driverSuspended = { id: '3', status: 'Suspended', licenseExpiryDate: futureDate };
    try {
        (0, driverStateMachine_1.assertDriverDispatchable)(driverSuspended);
        throw new Error('FAIL: Suspended driver should not be dispatchable');
    }
    catch (err) {
        if (err.code !== 'DRV_SUSPENDED')
            throw err;
    }
    console.log('✅ Driver State Machine tests passed.');
}
function testTripStateMachine() {
    console.log('🧪 Testing Trip State Machine...');
    // Valid transitions
    (0, tripStateMachine_1.assertTransition)('Draft', 'Dispatched');
    (0, tripStateMachine_1.assertTransition)('Draft', 'Cancelled');
    (0, tripStateMachine_1.assertTransition)('Dispatched', 'Completed');
    (0, tripStateMachine_1.assertTransition)('Dispatched', 'Cancelled');
    // Illegal
    try {
        (0, tripStateMachine_1.assertTransition)('Completed', 'Dispatched');
        throw new Error('FAIL: Completed trip should be a terminal state');
    }
    catch (err) {
        if (err.code !== 'TRIP_ALREADY_DONE')
            throw err;
    }
    console.log('✅ Trip State Machine tests passed.');
}
function runAll() {
    console.log('====================================');
    console.log('🏃 Running Operational Verification Tests');
    console.log('====================================');
    try {
        testVehicleStateMachine();
        testDriverStateMachine();
        testTripStateMachine();
        console.log('====================================');
        console.log('🎉 ALL INTEGRATION RULES VERIFIED CLEAN');
        console.log('====================================');
    }
    catch (err) {
        console.error('❌ Test execution failed:', err);
        process.exit(1);
    }
}
runAll();
//# sourceMappingURL=test-state-machines.js.map