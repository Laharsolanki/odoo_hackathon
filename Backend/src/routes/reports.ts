import { Router } from 'express';
import prisma from '../prisma';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { parse } from 'json2csv';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['Fleet Manager', 'Financial Analyst']));

router.get('/export', async (req, res) => {
  try {
    const { type, startDate, endDate, vehicleType } = req.query;

    if (!type) {
      return res.status(400).json({ error: 'Missing report type (e.g., type=trips or type=vehicles)' });
    }

    let data: any[] = [];
    let filename = 'export.csv';

    if (type === 'trips') {
      const where: any = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }
      
      const trips = await prisma.trip.findMany({
        where,
        include: { vehicle: true, driver: true }
      });
      
      data = trips.map(t => ({
        ID: t.id,
        Source: t.source,
        Destination: t.destination,
        VehicleRegistration: t.vehicle?.registrationNumber,
        DriverName: t.driver?.name,
        CargoWeight: t.cargoWeight,
        PlannedDistance: t.plannedDistance,
        Revenue: t.revenue,
        Status: t.status,
        Date: t.createdAt.toISOString()
      }));
      
      filename = 'trips_report.csv';
      
    } else if (type === 'vehicles') {
      const where: any = {};
      if (vehicleType) {
        where.type = vehicleType;
      }
      
      data = await prisma.vehicle.findMany({ where });
      filename = 'vehicles_report.csv';
      
    } else if (type === 'expenses') {
      const where: any = {};
      if (startDate && endDate) {
        where.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }
      
      const expenses = await prisma.expenseLog.findMany({
        where,
        include: { vehicle: true }
      });
      
      data = expenses.map(e => ({
        ID: e.id,
        VehicleRegistration: e.vehicle?.registrationNumber,
        Type: e.type,
        MetricUnits: e.metricUnits,
        Cost: e.cost,
        Date: e.date.toISOString()
      }));
      
      filename = 'expenses_report.csv';
    } else {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'No data found for the given criteria' });
    }

    const csv = parse(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

export default router;
