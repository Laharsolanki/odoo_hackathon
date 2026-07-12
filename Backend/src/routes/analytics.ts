import { Router } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager', 'Financial Analyst']));

// Total Operational Cost (Maintenance + Expenses) for a vehicle
router.get('/vehicle/:id/cost', async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const maintenanceAgg = await prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
      where: { vehicleId }
    });

    const expenseAgg = await prisma.expenseLog.aggregate({
      _sum: { cost: true },
      where: { vehicleId }
    });

    const totalMaintenance = maintenanceAgg._sum.cost || 0;
    const totalExpenses = expenseAgg._sum.cost || 0;
    const totalCost = totalMaintenance + totalExpenses;

    res.json({ vehicleId, totalMaintenance, totalExpenses, totalOperationalCost: totalCost });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate cost' });
  }
});

// Fuel Efficiency (Distance / Fuel Consumed)
router.get('/vehicle/:id/efficiency', async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const tripsAgg = await prisma.trip.aggregate({
      _sum: { plannedDistance: true },
      where: { vehicleId, status: 'Completed' }
    });

    const fuelAgg = await prisma.expenseLog.aggregate({
      _sum: { metricUnits: true },
      where: { vehicleId, type: 'Fuel' }
    });

    const totalDistance = tripsAgg._sum.plannedDistance || 0;
    const totalFuel = fuelAgg._sum.metricUnits || 0;
    const efficiency = totalFuel > 0 ? (totalDistance / totalFuel) : 0;

    res.json({ vehicleId, totalDistance, totalFuel, fuelEfficiency: efficiency });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate efficiency' });
  }
});

// Vehicle ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
router.get('/vehicle/:id/roi', async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const tripsAgg = await prisma.trip.aggregate({
      _sum: { revenue: true },
      where: { vehicleId, status: 'Completed' } // Only completed trips contribute to realized revenue
    });

    const maintenanceAgg = await prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
      where: { vehicleId }
    });

    const expenseAgg = await prisma.expenseLog.aggregate({
      _sum: { cost: true },
      where: { vehicleId }
    });

    const totalRevenue = tripsAgg._sum.revenue || 0;
    const totalMaintenance = maintenanceAgg._sum.cost || 0;
    const totalExpenses = expenseAgg._sum.cost || 0;
    const acquisitionCost = vehicle.acquisitionCost;

    const roi = acquisitionCost > 0 
      ? (totalRevenue - (totalMaintenance + totalExpenses)) / acquisitionCost 
      : 0;

    res.json({ 
      vehicleId, 
      totalRevenue, 
      totalMaintenance, 
      totalExpenses, 
      acquisitionCost, 
      roi 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate ROI' });
  }
});

// Fleet Status Counts
router.get('/fleet-status', async (req, res) => {
  try {
    const statusGroups = await prisma.vehicle.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const statusCounts = statusGroups.map(group => ({
      status: group.status,
      count: group._count.status
    }));

    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate fleet status' });
  }
});

// Dashboard KPIs
router.get('/dashboard-kpis', async (req, res) => {
  try {
    const { type, status } = req.query;
    
    // Base vehicle filter
    const vehicleFilter: any = {};
    if (type) vehicleFilter.type = type;
    if (status) vehicleFilter.status = status;

    const totalVehicles = await prisma.vehicle.count({ where: vehicleFilter });
    const activeVehicles = await prisma.vehicle.count({ where: { ...vehicleFilter, status: 'On Trip' } });
    const availableVehicles = await prisma.vehicle.count({ where: { ...vehicleFilter, status: 'Available' } });
    const inMaintenanceVehicles = await prisma.vehicle.count({ where: { ...vehicleFilter, status: 'In Shop' } });
    
    // For trips, if vehicle filter is applied, we'd ideally join, but Prisma count doesn't easily join on arbitrary fields without nested where.
    const tripFilter: any = {};
    if (type || status) {
      tripFilter.vehicle = {};
      if (type) tripFilter.vehicle.type = type;
      if (status) tripFilter.vehicle.status = status;
    }

    const activeTrips = await prisma.trip.count({ where: { ...tripFilter, status: 'Dispatched' } });
    const pendingTrips = await prisma.trip.count({ where: { ...tripFilter, status: 'Draft' } });
    
    const driversOnDuty = await prisma.driver.count({ where: { status: 'On Trip' } });
    
    const fleetUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

    res.json({
      totalVehicles,
      activeVehicles,
      availableVehicles,
      inMaintenanceVehicles,
      activeTrips,
      pendingTrips,
      driversOnDuty,
      fleetUtilization
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard KPIs' });
  }
});

export default router;
