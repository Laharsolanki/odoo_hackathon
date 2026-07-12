import { assertTransition as assertVehicleTransition, assertVehicleDispatchable, assertCanEnterMaintenance } from './stateMachines/vehicleStateMachine';
import { assertTransition as assertDriverTransition, assertDriverDispatchable } from './stateMachines/driverStateMachine';
import { assertTransition as assertTripTransition } from './stateMachines/tripStateMachine';

function testVehicleStateMachine() {
  console.log('🧪 Testing Vehicle State Machine...');

  // Valid transitions
  assertVehicleTransition('Available', 'On Trip');
  assertVehicleTransition('Available', 'In Shop');
  assertVehicleTransition('Available', 'Retired');
  assertVehicleTransition('On Trip', 'Available');
  assertVehicleTransition('In Shop', 'Available');
  assertVehicleTransition('In Shop', 'Retired');

  // Illegal transitions (should throw)
  try {
    assertVehicleTransition('On Trip', 'In Shop');
    throw new Error('FAIL: On Trip → In Shop should be blocked');
  } catch (err: any) {
    if (err.code !== 'INVALID_TRANSITION') throw err;
  }

  try {
    assertVehicleTransition('Retired', 'Available');
    throw new Error('FAIL: Retired → Available should be blocked');
  } catch (err: any) {
    if (err.code !== 'INVALID_TRANSITION') throw err;
  }

  // Dispatch checks
  const vehicleAvailable = { id: '1', status: 'Available' };
  assertVehicleDispatchable(vehicleAvailable);

  const vehicleInShop = { id: '2', status: 'In Shop' };
  try {
    assertVehicleDispatchable(vehicleInShop);
    throw new Error('FAIL: In Shop vehicle should not be dispatchable');
  } catch (err: any) {
    if (err.code !== 'VEH_NOT_AVAILABLE') throw err;
  }

  const vehicleOnTrip = { id: '3', status: 'On Trip' };
  try {
    assertVehicleDispatchable(vehicleOnTrip);
    throw new Error('FAIL: On Trip vehicle should not be dispatchable');
  } catch (err: any) {
    if (err.code !== 'VEH_ON_TRIP') throw err;
  }

  // Maintenance entry checks
  assertCanEnterMaintenance(vehicleAvailable);
  try {
    assertCanEnterMaintenance(vehicleInShop);
    throw new Error('FAIL: In Shop vehicle entering maintenance again should fail');
  } catch (err: any) {
    if (err.code !== 'VEH_ALREADY_IN_SHOP') throw err;
  }

  console.log('✅ Vehicle State Machine tests passed.');
}

function testDriverStateMachine() {
  console.log('🧪 Testing Driver State Machine...');

  // Valid transitions
  assertDriverTransition('Available', 'On Trip');
  assertDriverTransition('Available', 'Off Duty');
  assertDriverTransition('Available', 'Suspended');
  assertDriverTransition('On Trip', 'Available');
  assertDriverTransition('Suspended', 'Available');

  // Expiry check
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 2);
  const driverValid = { id: '1', status: 'Available', licenseExpiryDate: futureDate };
  assertDriverDispatchable(driverValid);

  const pastDate = new Date();
  pastDate.setFullYear(pastDate.getFullYear() - 1);
  const driverExpired = { id: '2', status: 'Available', licenseExpiryDate: pastDate };
  try {
    assertDriverDispatchable(driverExpired);
    throw new Error('FAIL: Expired license driver should not be dispatchable');
  } catch (err: any) {
    if (err.code !== 'DRV_LICENSE_EXPIRED') throw err;
  }

  const driverSuspended = { id: '3', status: 'Suspended', licenseExpiryDate: futureDate };
  try {
    assertDriverDispatchable(driverSuspended);
    throw new Error('FAIL: Suspended driver should not be dispatchable');
  } catch (err: any) {
    if (err.code !== 'DRV_SUSPENDED') throw err;
  }

  console.log('✅ Driver State Machine tests passed.');
}

function testTripStateMachine() {
  console.log('🧪 Testing Trip State Machine...');

  // Valid transitions
  assertTripTransition('Draft', 'Dispatched');
  assertTripTransition('Draft', 'Cancelled');
  assertTripTransition('Dispatched', 'Completed');
  assertTripTransition('Dispatched', 'Cancelled');

  // Illegal
  try {
    assertTripTransition('Completed', 'Dispatched');
    throw new Error('FAIL: Completed trip should be a terminal state');
  } catch (err: any) {
    if (err.code !== 'TRIP_ALREADY_DONE') throw err;
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
  } catch (err) {
    console.error('❌ Test execution failed:', err);
    process.exit(1);
  }
}

runAll();
