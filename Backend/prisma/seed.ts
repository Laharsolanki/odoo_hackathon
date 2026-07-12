import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('Seeding database...');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const fleetManager = await prisma.user.upsert({
    where: { email: 'manager@transitops.com' },
    update: {},
    create: {
      email: 'manager@transitops.com',
      passwordHash,
      role: 'Fleet Manager',
    },
  });

  const safetyOfficer = await prisma.user.upsert({
    where: { email: 'safety@transitops.com' },
    update: {},
    create: {
      email: 'safety@transitops.com',
      passwordHash,
      role: 'Safety Officer',
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@transitops.com' },
    update: {},
    create: {
      email: 'dispatcher@transitops.com',
      passwordHash,
      role: 'Dispatcher',
    },
  });

  const financialAnalyst = await prisma.user.upsert({
    where: { email: 'finance@transitops.com' },
    update: {},
    create: {
      email: 'finance@transitops.com',
      passwordHash,
      role: 'Financial Analyst',
    },
  });

  // Create Vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { registrationNumber: 'TRK-9988' },
    update: {},
    create: {
      registrationNumber: 'TRK-9988',
      modelName: 'Volvo VNL 860',
      type: 'Heavy Truck',
      maxLoadCapacity: 15000,
      odometer: 12500,
      acquisitionCost: 150000,
      status: 'Available',
    },
  });

  // Create Driver
  const driver = await prisma.driver.upsert({
    where: { licenseNumber: 'DL-55443322' },
    update: {},
    create: {
      name: 'John Doe',
      licenseNumber: 'DL-55443322',
      licenseCategory: 'CDL-A',
      licenseExpiryDate: new Date('2028-12-31'),
      contactNumber: '555-0100',
      safetyScore: 98.5,
      status: 'Available',
    },
  });

  // Create Trip
  const trip = await prisma.trip.create({
    data: {
      source: 'New York, NY',
      destination: 'Chicago, IL',
      vehicleId: vehicle.id,
      driverId: driver.id,
      cargoWeight: 12000,
      plannedDistance: 790,
      revenue: 3500,
      status: 'Completed',
    },
  });

  // Create Expense (Fuel)
  await prisma.expenseLog.create({
    data: {
      vehicleId: vehicle.id,
      type: 'Fuel',
      metricUnits: 120, // 120 Liters
      cost: 450,
      date: new Date(),
    },
  });

  // Create Maintenance Log
  await prisma.maintenanceLog.create({
    data: {
      vehicleId: vehicle.id,
      description: 'Routine Oil Change & Brake Inspection',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-02'),
      status: 'Closed',
      cost: 800,
    },
  });

  console.log('Seeding complete!');
  console.log('Test Users (password: password123):');
  console.log('manager@transitops.com');
  console.log('dispatcher@transitops.com');
  console.log('safety@transitops.com');
  console.log('finance@transitops.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
