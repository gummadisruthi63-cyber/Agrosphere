import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Shed from '../models/Shed.js';
import Animal from '../models/Animal.js';
import PoultryBatch from '../models/PoultryBatch.js';
import MilkProduction from '../models/MilkProduction.js';
import EggProduction from '../models/EggProduction.js';
import Feed from '../models/Feed.js';
import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Sale from '../models/Sale.js';
import Customer from '../models/Customer.js';
import Expense from '../models/Expense.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Vaccination from '../models/Vaccination.js';
import HealthRecord from '../models/HealthRecord.js';
import Notification from '../models/Notification.js';
import Setting from '../models/Setting.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agrosphere';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seed] Connected to database. Preparing fresh data...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Farm.deleteMany({}),
      Shed.deleteMany({}),
      Animal.deleteMany({}),
      PoultryBatch.deleteMany({}),
      MilkProduction.deleteMany({}),
      EggProduction.deleteMany({}),
      Feed.deleteMany({}),
      Medicine.deleteMany({}),
      Inventory.deleteMany({}),
      Sale.deleteMany({}),
      Customer.deleteMany({}),
      Expense.deleteMany({}),
      Employee.deleteMany({}),
      Attendance.deleteMany({}),
      Vaccination.deleteMany({}),
      HealthRecord.deleteMany({}),
      Notification.deleteMany({}),
      Setting.deleteMany({})
    ]);

    // 1. Users for each role
    const users = await User.create([
      {
        name: 'Rajesh Patil (Farm Owner)',
        email: 'admin@agrosphere.com',
        password: 'password123',
        role: 'Farm Owner/Admin',
        phone: '+91 98450 11223',
        farmName: 'AgroSphere Integrated Dairy & Poultry Farm'
      },
      {
        name: 'Suresh Gaikwad (Operations Manager)',
        email: 'manager@agrosphere.com',
        password: 'password123',
        role: 'Farm Manager',
        phone: '+91 98450 22334',
        farmName: 'AgroSphere Integrated Dairy & Poultry Farm'
      },
      {
        name: 'Ramesh Kulkarni (Dairy Attendant)',
        email: 'employee@agrosphere.com',
        password: 'password123',
        role: 'Employee',
        phone: '+91 98450 33445',
        farmName: 'AgroSphere Integrated Dairy & Poultry Farm'
      }
    ]);
    console.log(`[Seed] Created ${users.length} authenticated users (admin, manager, employee).`);

    // 2. Farm Profile
    const farm = await Farm.create({
      name: 'AgroSphere Integrated Dairy & Poultry Farm',
      ownerName: 'Rajesh Patil',
      email: 'contact@agrosphere-farm.com',
      phone: '+91 98450 11223',
      address: {
        street: 'Survey No. 104, Green Valley Agro Corridor',
        city: 'Baramati',
        state: 'Maharashtra',
        pincode: '413102',
        country: 'India'
      },
      farmType: 'Integrated Mixed Farm',
      registrationNumber: 'MAH-AGRO-2023-7741',
      establishedYear: 2021,
      totalArea: 65,
      areaUnit: 'Acres',
      currency: { code: 'INR', symbol: '₹' }
    });

    // 3. Sheds / Compartments
    const sheds = await Shed.create([
      {
        name: 'Milking Cows Barn A',
        shedNumber: 'SHED-01',
        type: 'Dairy Cattle',
        capacity: 40,
        currentOccupancy: 28,
        locationNotes: 'North Wing, close to automated milking parlor',
        ventilationType: 'High-volume Low-speed fans + foggers'
      },
      {
        name: 'Murrah Buffalo Enclosure',
        shedNumber: 'SHED-02',
        type: 'Buffalo Barn',
        capacity: 35,
        currentOccupancy: 22,
        locationNotes: 'East Wing with integrated cooling water wall',
        ventilationType: 'Natural cross ventilation & water sprayers'
      },
      {
        name: 'Commercial Layer House 1',
        shedNumber: 'SHED-03',
        type: 'Poultry Layer',
        capacity: 5000,
        currentOccupancy: 4200,
        locationNotes: 'South Ridge, elevated wire mesh flooring',
        ventilationType: 'Tunnel ventilation with evaporative cooling pads'
      },
      {
        name: 'Broiler House 2',
        shedNumber: 'SHED-04',
        type: 'Poultry Broiler',
        capacity: 4000,
        currentOccupancy: 3500,
        locationNotes: 'South-East boundary with bio-security gate',
        ventilationType: 'Controlled climate automatic ventilation'
      },
      {
        name: 'Main Silage & Feed Godown',
        shedNumber: 'SHED-05',
        type: 'Feed Storage',
        capacity: 200,
        currentOccupancy: 120,
        locationNotes: 'Central courtyard with heavy vehicle unloading dock',
        ventilationType: 'Dry ventilated storage'
      },
      {
        name: 'Veterinary Isolation & Maternity Unit',
        shedNumber: 'SHED-06',
        type: 'Quarantine / Hospital',
        capacity: 15,
        currentOccupancy: 4,
        locationNotes: 'Isolated West Perimeter with sanitization dip',
        ventilationType: 'Controlled isolation airflow'
      }
    ]);

    // 4. Animals (Cows and Buffaloes)
    const animals = await Animal.create([
      {
        animalId: 'COW-101',
        tagNumber: 'IND-9021-01',
        name: 'Kamadhenu (HF)',
        animalType: 'Cow',
        breed: 'Holstein Friesian Cross',
        gender: 'Female',
        dateOfBirth: new Date('2021-04-12'),
        weight: 520,
        purchaseDate: new Date('2022-06-15'),
        purchasePrice: 75000,
        healthStatus: 'Healthy',
        lactationStatus: 'Lactating',
        pregnancyStatus: 'Pregnant',
        expectedCalvingDate: new Date('2026-11-20'),
        dailyAverageYield: 24.5,
        shed: sheds[0]._id,
        notes: 'High producer, gentle temperament, peak 2nd lactation cycle.'
      },
      {
        animalId: 'COW-102',
        tagNumber: 'IND-9021-02',
        name: 'Gauri (Jersey)',
        animalType: 'Cow',
        breed: 'Jersey Pure',
        gender: 'Female',
        dateOfBirth: new Date('2022-01-10'),
        weight: 430,
        purchaseDate: new Date('2023-02-18'),
        purchasePrice: 62000,
        healthStatus: 'Healthy',
        lactationStatus: 'Lactating',
        pregnancyStatus: 'Not Pregnant',
        dailyAverageYield: 18.2,
        shed: sheds[0]._id,
        notes: 'High butterfat content average 4.8%.'
      },
      {
        animalId: 'COW-103',
        tagNumber: 'IND-9021-03',
        name: 'Nandini (Gir)',
        animalType: 'Cow',
        breed: 'Gir Indigenous A2',
        gender: 'Female',
        dateOfBirth: new Date('2020-08-25'),
        weight: 460,
        purchaseDate: new Date('2021-11-05'),
        purchasePrice: 85000,
        healthStatus: 'Healthy',
        lactationStatus: 'Lactating',
        pregnancyStatus: 'Inseminated',
        dailyAverageYield: 14.0,
        shed: sheds[0]._id,
        notes: 'Certified A2 milk line. Highly resilient to heat.'
      },
      {
        animalId: 'COW-104',
        tagNumber: 'IND-9021-04',
        name: 'Lakshmi (Sahiwal)',
        animalType: 'Cow',
        breed: 'Sahiwal Indigenous',
        gender: 'Female',
        dateOfBirth: new Date('2022-07-14'),
        weight: 440,
        purchaseDate: new Date('2023-09-10'),
        purchasePrice: 68000,
        healthStatus: 'Healthy',
        lactationStatus: 'Dry',
        pregnancyStatus: 'Pregnant',
        expectedCalvingDate: new Date('2026-10-15'),
        dailyAverageYield: 0,
        shed: sheds[0]._id,
        notes: 'Currently in late dry period before calving.'
      },
      {
        animalId: 'BUF-201',
        tagNumber: 'IND-9022-01',
        name: 'Ganga (Murrah)',
        animalType: 'Buffalo',
        breed: 'Murrah Buffalo',
        gender: 'Female',
        dateOfBirth: new Date('2020-03-18'),
        weight: 640,
        purchaseDate: new Date('2021-08-20'),
        purchasePrice: 95000,
        healthStatus: 'Healthy',
        lactationStatus: 'Lactating',
        pregnancyStatus: 'Not Pregnant',
        dailyAverageYield: 16.5,
        shed: sheds[1]._id,
        notes: 'Premium rich milk with 7.4% fat content.'
      },
      {
        animalId: 'BUF-202',
        tagNumber: 'IND-9022-02',
        name: 'Yamuna (Murrah)',
        animalType: 'Buffalo',
        breed: 'Murrah Buffalo',
        gender: 'Female',
        dateOfBirth: new Date('2021-06-30'),
        weight: 610,
        purchaseDate: new Date('2022-10-12'),
        purchasePrice: 92000,
        healthStatus: 'Under Treatment',
        lactationStatus: 'Lactating',
        pregnancyStatus: 'Not Pregnant',
        dailyAverageYield: 12.0,
        shed: sheds[5]._id,
        notes: 'Recovering from mild mastitis in right forequarter. Under vet observation.'
      },
      {
        animalId: 'BUF-203',
        tagNumber: 'IND-9022-03',
        name: 'Bhairavi (Jaffarabadi)',
        animalType: 'Buffalo',
        breed: 'Jaffarabadi Heavy',
        gender: 'Female',
        dateOfBirth: new Date('2019-11-04'),
        weight: 710,
        purchaseDate: new Date('2021-05-18'),
        purchasePrice: 110000,
        healthStatus: 'Healthy',
        lactationStatus: 'Lactating',
        pregnancyStatus: 'Pregnant',
        expectedCalvingDate: new Date('2026-12-05'),
        dailyAverageYield: 17.8,
        shed: sheds[1]._id,
        notes: 'Exceptional size and docility. Excellent mothering ability.'
      },
      {
        animalId: 'COW-105',
        tagNumber: 'IND-9021-05',
        name: 'Surabhi (HF Cross)',
        animalType: 'Cow',
        breed: 'Holstein Friesian Cross',
        gender: 'Female',
        dateOfBirth: new Date('2023-02-14'),
        weight: 380,
        purchaseDate: new Date('2024-03-01'),
        purchasePrice: 50000,
        healthStatus: 'Healthy',
        lactationStatus: 'Heifer',
        pregnancyStatus: 'Inseminated',
        dailyAverageYield: 0,
        shed: sheds[0]._id,
        notes: 'First calf heifer. Artificial insemination confirmed.'
      }
    ]);

    // 5. Poultry Batches
    const batches = await PoultryBatch.create([
      {
        batchId: 'BATCH-LYR-24',
        batchName: 'Layer Flock 24 (BV-300)',
        breed: 'BV-300 Commercial White',
        birdType: 'Layer',
        initialCount: 2500,
        currentCount: 2420,
        mortalityCount: 80,
        arrivalDate: new Date('2025-08-10'),
        ageWeeks: 38,
        shed: sheds[2]._id,
        feedType: 'Phase 1 Layer Mash',
        dailyFeedIntakeKg: 280,
        healthStatus: 'Healthy',
        status: 'Active',
        notes: 'Peak laying phase. Average egg production rate 92.5%.'
      },
      {
        batchId: 'BATCH-LYR-25',
        batchName: 'Layer Flock 25 (Lohmann Brown)',
        breed: 'Lohmann Brown Classic',
        birdType: 'Layer',
        initialCount: 1800,
        currentCount: 1780,
        mortalityCount: 20,
        arrivalDate: new Date('2025-12-15'),
        ageWeeks: 22,
        shed: sheds[2]._id,
        feedType: 'Layer Developer Mash',
        dailyFeedIntakeKg: 205,
        healthStatus: 'Healthy',
        status: 'Active',
        notes: 'Brown shell egg flock. Currently ramping up laying.'
      },
      {
        batchId: 'BATCH-BRL-88',
        batchName: 'Broiler Batch 88 (Cobb 500)',
        breed: 'Cobb 500 Fast Growth',
        birdType: 'Broiler',
        initialCount: 3500,
        currentCount: 3435,
        mortalityCount: 65,
        arrivalDate: new Date('2026-08-20'),
        ageWeeks: 5,
        shed: sheds[3]._id,
        feedType: 'Broiler Finisher Pellets',
        dailyFeedIntakeKg: 420,
        healthStatus: 'Healthy',
        status: 'Active',
        notes: 'Approaching market target weight (2.2kg). Scheduled for sale next week.'
      },
      {
        batchId: 'BATCH-NAT-12',
        batchName: 'Country Dual Purpose (Kuroiler)',
        breed: 'Kuroiler Free-Range',
        birdType: 'Dual-Purpose',
        initialCount: 600,
        currentCount: 585,
        mortalityCount: 15,
        arrivalDate: new Date('2025-10-01'),
        ageWeeks: 32,
        shed: sheds[3]._id,
        feedType: 'Country Grain Mix & Greens',
        dailyFeedIntakeKg: 65,
        healthStatus: 'Healthy',
        status: 'Active',
        notes: 'Free-range desi egg and bird market. High premium price.'
      }
    ]);

    // 6. Milk Production Records (Past 14 Days)
    const milkRecords = [];
    const lactatingAnimals = animals.filter(a => a.lactationStatus === 'Lactating');

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const recDate = new Date();
      recDate.setDate(recDate.getDate() - dayOffset);
      recDate.setHours(7, 30, 0, 0);

      lactatingAnimals.forEach(animal => {
        const base = animal.dailyAverageYield || 15;
        const morning = Number((base * 0.55 + (Math.random() * 2 - 1)).toFixed(1));
        const evening = Number((base * 0.45 + (Math.random() * 2 - 1)).toFixed(1));
        const fat = animal.animalType === 'Buffalo' ? Number((6.8 + Math.random() * 0.8).toFixed(1)) : Number((4.1 + Math.random() * 0.5).toFixed(1));
        const snf = animal.animalType === 'Buffalo' ? 9.2 : 8.6;

        milkRecords.push({
          date: recDate,
          animal: animal._id,
          morningQuantity: morning,
          eveningQuantity: evening,
          totalQuantity: Number((morning + evening).toFixed(1)),
          fatPercentage: fat,
          snfPercentage: snf,
          recordedBy: 'Ramesh Kulkarni',
          notes: 'Standard hygienic machine milking'
        });
      });
    }
    await MilkProduction.create(milkRecords);

    // 7. Egg Production Records (Past 14 Days)
    const eggRecords = [];
    const layerBatches = batches.filter(b => b.birdType === 'Layer' || b.birdType === 'Dual-Purpose');

    for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
      const eggDate = new Date();
      eggDate.setDate(eggDate.getDate() - dayOffset);
      eggDate.setHours(11, 0, 0, 0);

      layerBatches.forEach(batch => {
        const expected = Math.floor(batch.currentCount * (batch.breed.includes('BV-300') ? 0.92 : batch.breed.includes('Lohmann') ? 0.85 : 0.65));
        const total = expected + Math.floor(Math.random() * 40 - 20);
        const broken = Math.floor(total * 0.015);
        const damaged = Math.floor(total * 0.008);
        const good = total - broken - damaged;

        eggRecords.push({
          date: eggDate,
          batch: batch._id,
          totalEggs: total,
          goodEggs: good,
          brokenEggs: broken,
          damagedEggs: damaged,
          layRatePercentage: Number(((total / batch.currentCount) * 100).toFixed(1)),
          collectedBy: 'Poultry Team',
          notes: 'Automated belt collection + manual grading'
        });
      });
    }
    await EggProduction.create(eggRecords);

    // 8. Feed Management Items
    const feeds = await Feed.create([
      {
        name: 'High-Yield Dairy Cattle Pellets (20% CP)',
        category: 'Cattle Feed',
        currentStock: 3200,
        unit: 'kg',
        minStockAlert: 800,
        unitCost: 26,
        supplier: 'Kisan Cattle Feeds Ltd',
        supplierContact: '+91 98220 44551',
        lastRestocked: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        dailyConsumptionRate: 180,
        storageShed: sheds[4]._id,
        notes: 'Compound feed with bypass protein for lactating cows'
      },
      {
        name: 'Murrah Buffalo Concentrate Mash',
        category: 'Buffalo Concentrate',
        currentStock: 2400,
        unit: 'kg',
        minStockAlert: 600,
        unitCost: 28,
        supplier: 'Kisan Cattle Feeds Ltd',
        supplierContact: '+91 98220 44551',
        lastRestocked: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        dailyConsumptionRate: 140,
        storageShed: sheds[4]._id,
        notes: 'Formulated with cottonseed cake and mustard meal'
      },
      {
        name: 'Commercial Layer Phase-1 Crumbles',
        category: 'Poultry Layer Mash',
        currentStock: 4800,
        unit: 'kg',
        minStockAlert: 1200,
        unitCost: 32,
        supplier: 'Godrej Agrovet Feed Mill',
        supplierContact: '+91 98230 66772',
        lastRestocked: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        dailyConsumptionRate: 350,
        storageShed: sheds[4]._id,
        notes: 'Fortified with calcium shell grit and lysine'
      },
      {
        name: 'Broiler Finisher Pellets',
        category: 'Poultry Starter',
        currentStock: 1950,
        unit: 'kg',
        minStockAlert: 1000,
        unitCost: 36,
        supplier: 'Godrej Agrovet Feed Mill',
        supplierContact: '+91 98230 66772',
        lastRestocked: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        dailyConsumptionRate: 420,
        storageShed: sheds[4]._id,
        notes: 'High energy finisher for rapid weight gain'
      },
      {
        name: 'Fermented Green Corn Silage',
        category: 'Dry Fodder / Silage',
        currentStock: 14500,
        unit: 'kg',
        minStockAlert: 3000,
        unitCost: 6.5,
        supplier: 'Farm In-House Production & Local Farmers',
        supplierContact: '+91 98450 11223',
        lastRestocked: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        dailyConsumptionRate: 650,
        storageShed: sheds[4]._id,
        notes: 'Bunker silo sealed with bacterial inoculant'
      },
      {
        name: 'Chelated Mineral Mixture (Agrimin Forte)',
        category: 'Minerals & Salts',
        currentStock: 45,
        unit: 'kg',
        minStockAlert: 50, // Low stock trigger!
        unitCost: 120,
        supplier: 'Virbac Animal Health',
        supplierContact: '+91 98110 33221',
        lastRestocked: new Date(Date.now() - 25 * 24 * 3600 * 1000),
        dailyConsumptionRate: 4,
        storageShed: sheds[4]._id,
        notes: 'Trace mineral supplement given at 50g per adult cow'
      },
      {
        name: 'Liquid Calcium & Vitamin D3 Tonic (Ostocalcium)',
        category: 'Supplements',
        currentStock: 30,
        unit: 'litres',
        minStockAlert: 20,
        unitCost: 280,
        supplier: 'Virbac Animal Health',
        supplierContact: '+91 98110 33221',
        lastRestocked: new Date(Date.now() - 12 * 24 * 3600 * 1000),
        dailyConsumptionRate: 2,
        storageShed: sheds[4]._id,
        notes: 'Prevents milk fever in early lactating cattle'
      }
    ]);

    // 9. Medicines & Health
    const medicines = await Medicine.create([
      {
        name: 'Raksha-Ovac FMD Vaccine (Foot & Mouth)',
        category: 'Vaccine',
        targetSpecies: 'Cattle',
        currentStock: 40,
        unit: 'doses',
        batchNumber: 'FMD-2026-B81',
        unitCost: 65,
        supplier: 'Indian Immunologicals Ltd',
        expiryDate: new Date('2027-04-30'),
        minStockAlert: 25,
        administrationRoute: 'Subcutaneous (SC)',
        storageConditions: 'Refrigerated 2-8°C'
      },
      {
        name: 'Ranikhet Disease LaSota Vaccine',
        category: 'Vaccine',
        targetSpecies: 'Poultry',
        currentStock: 12,
        unit: 'vials',
        batchNumber: 'ND-LS-994',
        unitCost: 140,
        supplier: 'Venky\'s India Ltd',
        expiryDate: new Date('2026-11-30'),
        minStockAlert: 10,
        administrationRoute: 'Oral / In Feed / Water',
        storageConditions: 'Refrigerated 2-8°C'
      },
      {
        name: 'Terramycin / Oxytetracycline LA 200mg/ml',
        category: 'Antibiotic',
        targetSpecies: 'All',
        currentStock: 6,
        unit: 'vials',
        batchNumber: 'OXY-4421',
        unitCost: 240,
        supplier: 'Zoetis Animal Health',
        expiryDate: new Date('2026-10-15'), // Expiring soon alert!
        minStockAlert: 8, // Low stock alert!
        administrationRoute: 'Intramuscular (IM)',
        storageConditions: 'Room temperature below 25°C'
      },
      {
        name: 'Albendazole 2.5% Oral Suspension (Dewormer)',
        category: 'Dewormer',
        targetSpecies: 'Cattle',
        currentStock: 8,
        unit: 'bottles',
        batchNumber: 'ALB-8910',
        unitCost: 180,
        supplier: 'Mankind Agri-Vet',
        expiryDate: new Date('2027-08-31'),
        minStockAlert: 5,
        administrationRoute: 'Oral / In Feed / Water'
      },
      {
        name: 'Mastalone Intramammary Infusion',
        category: 'Antibiotic',
        targetSpecies: 'Cattle',
        currentStock: 15,
        unit: 'sachets',
        batchNumber: 'MST-301',
        unitCost: 95,
        supplier: 'Pfizer Animal Health',
        expiryDate: new Date('2026-10-05'), // Expiring soon!
        minStockAlert: 10,
        administrationRoute: 'Topical'
      },
      {
        name: 'Povidone Iodine 5% Surgical Antiseptic',
        category: 'Antiseptic',
        targetSpecies: 'All',
        currentStock: 10,
        unit: 'bottles',
        batchNumber: 'PVD-110',
        unitCost: 110,
        supplier: 'Sun Vet Pharma',
        expiryDate: new Date('2028-01-30'),
        minStockAlert: 4,
        administrationRoute: 'Topical'
      }
    ]);

    // 10. Centralized General Inventory
    const inventory = await Inventory.create([
      {
        name: 'Silicone Milking Machine Liners (Set of 4)',
        category: 'Dairy Supplies',
        itemCode: 'MLK-LIN-04',
        quantity: 12,
        unit: 'sets',
        purchasePrice: 1800,
        sellingPrice: 0,
        supplier: 'DeLaval India Equipment',
        minStockAlert: 4,
        status: 'In Stock',
        shedLocation: 'Milking Parlor Store'
      },
      {
        name: 'Rigid Pulp Egg Trays (30 Eggs Capacity)',
        category: 'Poultry Supplies',
        itemCode: 'EGG-TRY-30',
        quantity: 850,
        unit: 'trays',
        purchasePrice: 6.5,
        sellingPrice: 0,
        supplier: 'Swaraj Packaging Ltd',
        minStockAlert: 300,
        status: 'In Stock',
        shedLocation: 'Egg Grading Room'
      },
      {
        name: 'Virucidial Barn Disinfectant (Virkon S 5kg)',
        category: 'Cleaning & Sanitation',
        itemCode: 'SAN-VRK-05',
        quantity: 3, // Low stock!
        unit: 'buckets',
        purchasePrice: 3800,
        sellingPrice: 0,
        supplier: 'Antec International',
        minStockAlert: 5,
        status: 'Low Stock',
        shedLocation: 'Central Store'
      },
      {
        name: 'Infrared Poultry Brooder Lamps 250W',
        category: 'Farm Equipment',
        itemCode: 'EQP-BRD-250',
        quantity: 18,
        unit: 'pieces',
        purchasePrice: 420,
        sellingPrice: 0,
        supplier: 'Philips Lighting',
        minStockAlert: 8,
        status: 'In Stock',
        shedLocation: 'Maintenance Workshop'
      },
      {
        name: 'RFID Animal Ear Tags with Applicator Pins',
        category: 'Dairy Supplies',
        itemCode: 'TAG-RFID-50',
        quantity: 45,
        unit: 'tags',
        purchasePrice: 55,
        sellingPrice: 0,
        supplier: 'Allflex Livestock Intelligence',
        minStockAlert: 20,
        status: 'In Stock',
        shedLocation: 'Vet Dispensary'
      },
      {
        name: 'Heavy Duty Stainless Steel Milk Cans (40 Litres)',
        category: 'Dairy Supplies',
        itemCode: 'CAN-SS-40L',
        quantity: 16,
        unit: 'cans',
        purchasePrice: 3400,
        sellingPrice: 0,
        supplier: 'DairyCraft Utensils',
        minStockAlert: 6,
        status: 'In Stock',
        shedLocation: 'Milk Chilling Room'
      }
    ]);

    // 11. Customers
    const customers = await Customer.create([
      {
        name: 'Baramati District Co-operative Milk Union (Amul / Mahanand)',
        phone: '+91 98221 00112',
        email: 'procurement@baramatidairy.coop',
        address: 'Plot 12, Industrial MIDC Area, Baramati',
        customerType: 'Dairy Cooperative',
        totalPurchases: 485000,
        outstandingBalance: 32000,
        notes: 'Primary bulk milk buyer. Bi-weekly settlement cycle.'
      },
      {
        name: 'Sahyadri Premium Supermarkets Pvt Ltd',
        phone: '+91 98450 77889',
        email: 'orders@sahyadrimart.com',
        address: 'Shop 101-105, Mega Mall, FC Road, Pune',
        customerType: 'Wholesaler / Distributor',
        totalPurchases: 230000,
        outstandingBalance: 18500,
        notes: 'Regular buyer of farm-fresh grade A eggs and bottled Gir cow milk.'
      },
      {
        name: 'Grand Hyatt & Orchard Luxury Resorts',
        phone: '+91 98110 55443',
        email: 'chef.sanjay@orchardresort.com',
        address: 'Hills Retreat, Mahabaleshwar Road',
        customerType: 'Hotel / Restaurant',
        totalPurchases: 145000,
        outstandingBalance: 0,
        notes: 'Buys country eggs, premium buffalo cream, and broiler birds.'
      },
      {
        name: 'Sunrise Bakeries & Confectionery Chain',
        phone: '+91 98901 33224',
        email: 'purchase@sunrisebakers.in',
        address: 'Unit 4, Bakery Complex, Hadapsar, Pune',
        customerType: 'Wholesaler / Distributor',
        totalPurchases: 180000,
        outstandingBalance: 12000,
        notes: 'Weekly commercial table egg orders (35-50 trays).'
      },
      {
        name: 'Nitin Deshmukh (Wholesale Poultry Trader)',
        phone: '+91 98229 11990',
        email: 'deshmukh.poultry@gmail.com',
        address: 'Live Bird Market Yard, Saswad',
        customerType: 'Wholesaler / Distributor',
        totalPurchases: 320000,
        outstandingBalance: 25000,
        notes: 'Lifts entire broiler batches upon maturity.'
      }
    ]);

    // 12. Sales & Invoices
    const sales = await Sale.create([
      {
        invoiceNumber: 'INV-2026-0101',
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        productType: 'Fresh Cow Milk',
        itemDescription: 'Bulk Fresh Cow Milk chilled (Fat 4.2%, SNF 8.6%)',
        quantity: 1250,
        unit: 'Litres',
        unitPrice: 42,
        totalAmount: 52500,
        discount: 500,
        netAmount: 52000,
        paymentStatus: 'Paid',
        paymentMethod: 'Bank Transfer (NEFT/IMPS)',
        amountPaid: 52000,
        balanceDue: 0,
        saleDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        notes: 'Payment received in Union Bank account'
      },
      {
        invoiceNumber: 'INV-2026-0102',
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        productType: 'Buffalo Milk',
        itemDescription: 'Murrah Buffalo Rich Milk (Fat 7.2%, SNF 9.2%)',
        quantity: 800,
        unit: 'Litres',
        unitPrice: 65,
        totalAmount: 52000,
        discount: 0,
        netAmount: 52000,
        paymentStatus: 'Paid',
        paymentMethod: 'Bank Transfer (NEFT/IMPS)',
        amountPaid: 52000,
        balanceDue: 0,
        saleDate: new Date(Date.now() - 2 * 24 * 3600 * 1000)
      },
      {
        invoiceNumber: 'INV-2026-0103',
        customer: customers[1]._id,
        customerName: customers[1].name,
        customerPhone: customers[1].phone,
        productType: 'Table Eggs',
        itemDescription: 'Grade A Farm Fresh Table Eggs (Crates of 30)',
        quantity: 4500,
        unit: 'Pieces',
        unitPrice: 6.2,
        totalAmount: 27900,
        discount: 400,
        netAmount: 27500,
        paymentStatus: 'Partially Paid',
        paymentMethod: 'UPI / QR',
        amountPaid: 15000,
        balanceDue: 12500,
        saleDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        notes: 'Balance due on next dispatch'
      },
      {
        invoiceNumber: 'INV-2026-0104',
        customer: customers[3]._id,
        customerName: customers[3].name,
        customerPhone: customers[3].phone,
        productType: 'Table Eggs',
        itemDescription: 'Commercial Brown & White Eggs for confectionery',
        quantity: 3200,
        unit: 'Pieces',
        unitPrice: 6.0,
        totalAmount: 19200,
        discount: 200,
        netAmount: 19000,
        paymentStatus: 'Paid',
        paymentMethod: 'UPI / QR',
        amountPaid: 19000,
        balanceDue: 0,
        saleDate: new Date(Date.now() - 5 * 24 * 3600 * 1000)
      },
      {
        invoiceNumber: 'INV-2026-0105',
        customer: customers[4]._id,
        customerName: customers[4].name,
        customerPhone: customers[4].phone,
        productType: 'Broiler Birds',
        itemDescription: 'Cobb 500 Live Mature Birds (Batch 87 harvest)',
        quantity: 1800,
        unit: 'kg',
        unitPrice: 115,
        totalAmount: 207000,
        discount: 2000,
        netAmount: 205000,
        paymentStatus: 'Partially Paid',
        paymentMethod: 'Bank Transfer (NEFT/IMPS)',
        amountPaid: 180000,
        balanceDue: 25000,
        saleDate: new Date(Date.now() - 8 * 24 * 3600 * 1000),
        notes: 'Remaining Rs. 25,000 promised by end of month'
      },
      {
        invoiceNumber: 'INV-2026-0106',
        customer: customers[2]._id,
        customerName: customers[2].name,
        customerPhone: customers[2].phone,
        productType: 'Other Farm Products',
        itemDescription: 'Enriched Vermicompost / Organic Cow Dung Manure',
        quantity: 50,
        unit: 'Bags (40kg)',
        unitPrice: 280,
        totalAmount: 14000,
        discount: 0,
        netAmount: 14000,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        amountPaid: 14000,
        balanceDue: 0,
        saleDate: new Date(Date.now() - 9 * 24 * 3600 * 1000)
      },
      {
        invoiceNumber: 'INV-2026-0107',
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerPhone: customers[0].phone,
        productType: 'Fresh Cow Milk',
        itemDescription: 'Daily cooperative dispatch',
        quantity: 1180,
        unit: 'Litres',
        unitPrice: 42,
        totalAmount: 49560,
        discount: 0,
        netAmount: 49560,
        paymentStatus: 'Pending',
        paymentMethod: 'Bank Transfer (NEFT/IMPS)',
        amountPaid: 0,
        balanceDue: 49560,
        saleDate: new Date(),
        notes: 'Cooperative weekly batch clearing on Friday'
      }
    ]);

    // 13. Operational Expenses
    const expenses = await Expense.create([
      {
        category: 'Feed & Nutrition',
        amount: 45000,
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        description: 'Bulk purchase of Cattle Pellets and Layer Mash from Godrej Agrovet',
        paymentMethod: 'Bank Transfer',
        vendor: 'Godrej Agrovet Feed Mill',
        receiptNumber: 'RCP-GAV-8921',
        recordedBy: 'Rajesh Patil'
      },
      {
        category: 'Salaries & Wages',
        amount: 88000,
        date: new Date(Date.now() - 6 * 24 * 3600 * 1000),
        description: 'Monthly payroll disbursement for 6 farm personnel',
        paymentMethod: 'Bank Transfer',
        vendor: 'Farm Workforce',
        receiptNumber: 'PAY-2026-09',
        recordedBy: 'Rajesh Patil'
      },
      {
        category: 'Electricity & Power',
        amount: 14200,
        date: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        description: 'Monthly electricity bill for bulk milk cooler, fans, and poultry sheds',
        paymentMethod: 'UPI / QR',
        vendor: 'MSEDCL Maharashtra Power',
        receiptNumber: 'MSE-904123',
        recordedBy: 'Suresh Gaikwad'
      },
      {
        category: 'Medicine & Vaccines',
        amount: 6800,
        date: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        description: 'Procured FMD vaccines, dewormers, and mastitis treatments',
        paymentMethod: 'UPI / QR',
        vendor: 'Baramati Veterinary Medical Stores',
        receiptNumber: 'VET-88210',
        recordedBy: 'Suresh Gaikwad'
      },
      {
        category: 'Transportation & Logistics',
        amount: 8500,
        date: new Date(Date.now() - 12 * 24 * 3600 * 1000),
        description: 'Diesel for insulated milk transport tanker and tractor silage hauling',
        paymentMethod: 'Cash',
        vendor: 'HPCL Highway Petrol Pump',
        receiptNumber: 'PET-6651',
        recordedBy: 'Ramesh Kulkarni'
      },
      {
        category: 'Farm Maintenance & Repair',
        amount: 7200,
        date: new Date(Date.now() - 14 * 24 * 3600 * 1000),
        description: 'Replacement of vacuum pump seals in milking parlor and poultry fan servicing',
        paymentMethod: 'Cash',
        vendor: 'Shree Agro Machinery Repair Works',
        receiptNumber: 'REP-1102',
        recordedBy: 'Suresh Gaikwad'
      },
      {
        category: 'Packaging Materials',
        amount: 4500,
        date: new Date(Date.now() - 18 * 24 * 3600 * 1000),
        description: '800 pulp egg trays and packaging tape',
        paymentMethod: 'UPI / QR',
        vendor: 'Swaraj Packaging Ltd',
        receiptNumber: 'SW-9982',
        recordedBy: 'Suresh Gaikwad'
      }
    ]);

    // 14. Employees
    const employees = await Employee.create([
      {
        employeeId: 'EMP-101',
        name: 'Suresh Gaikwad',
        phone: '+91 98450 22334',
        email: 'manager@agrosphere.com',
        role: 'Farm Manager',
        salary: 32000,
        salaryType: 'Monthly',
        joiningDate: new Date('2022-01-15'),
        address: 'House 14, Agri Colony, Baramati',
        status: 'Active',
        assignedShed: sheds[0]._id,
        emergencyContact: '+91 98450 99887 (Wife)',
        activeTasks: [
          { task: 'Oversee weekly FMD booster vaccination in Shed 1 & 2', dueDate: new Date(Date.now() + 2 * 24 * 3600 * 1000), completed: false },
          { task: 'Order 3 tons of Layer Mash feed from Godrej', dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000), completed: false }
        ]
      },
      {
        employeeId: 'EMP-102',
        name: 'Ramesh Kulkarni',
        phone: '+91 98450 33445',
        email: 'ramesh.milker@agrosphere.com',
        role: 'Milking Specialist',
        salary: 18000,
        salaryType: 'Monthly',
        joiningDate: new Date('2022-05-10'),
        address: 'Baramati Rural, Ward 3',
        status: 'Active',
        assignedShed: sheds[0]._id,
        emergencyContact: '+91 98221 44556',
        activeTasks: [
          { task: 'Perform post-milking teat dip on cow #COW-101 & #BUF-202', dueDate: new Date(), completed: true },
          { task: 'Clean and sanitize milk chilling receiver tank', dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000), completed: false }
        ]
      },
      {
        employeeId: 'EMP-103',
        name: 'Vikas Shinde',
        phone: '+91 98901 88776',
        email: 'vikas.poultry@agrosphere.com',
        role: 'Poultry Flock Supervisor',
        salary: 20000,
        salaryType: 'Monthly',
        joiningDate: new Date('2023-03-01'),
        address: 'Malegaon Village, Taluka Baramati',
        status: 'Active',
        assignedShed: sheds[2]._id,
        emergencyContact: '+91 98901 99001',
        activeTasks: [
          { task: 'Calibrate drinking nipple water pressure in Layer House 1', dueDate: new Date(Date.now() + 1 * 24 * 3600 * 1000), completed: false },
          { task: 'Record 2:00 PM egg collection tally and check egg weights', dueDate: new Date(), completed: false }
        ]
      },
      {
        employeeId: 'EMP-104',
        name: 'Dr. Anand Joshi',
        phone: '+91 98224 55667',
        email: 'dr.anand@agrosphere.com',
        role: 'Veterinary Assistant',
        salary: 24000,
        salaryType: 'Monthly',
        joiningDate: new Date('2023-08-20'),
        address: 'Somalwar Road, Baramati',
        status: 'Active',
        assignedShed: sheds[5]._id,
        emergencyContact: '+91 98224 99990',
        activeTasks: [
          { task: 'Examine Buffalo #BUF-202 mastitis recovery and test milk CMT', dueDate: new Date(), completed: false },
          { task: 'Check pregnancy palpation results on Heifer #COW-105', dueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000), completed: false }
        ]
      }
    ]);

    // 15. Attendance for Today
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);

    for (const emp of employees) {
      await Attendance.create({
        employee: emp._id,
        date: todayZero,
        status: 'Present',
        checkInTime: '06:45 AM',
        checkOutTime: '05:15 PM',
        notes: 'Regular on-time shift'
      });
    }

    // 16. Vaccinations
    await Vaccination.create([
      {
        targetType: 'Animal',
        animal: animals[0]._id,
        targetName: 'Cow #IND-9021-01 (Kamadhenu)',
        vaccineName: 'Raksha-Ovac FMD (Foot & Mouth Disease)',
        diseasePrevented: 'Foot and Mouth Disease (FMD)',
        dueDate: new Date(Date.now() + 5 * 24 * 3600 * 1000), // Due in 5 days!
        veterinarian: 'Dr. Anand Joshi',
        status: 'Scheduled',
        notes: 'Bi-annual herd booster'
      },
      {
        targetType: 'Animal',
        animal: animals[4]._id,
        targetName: 'Buffalo #IND-9022-01 (Ganga)',
        vaccineName: 'Haemorrhagic Septicaemia (HS) Vaccine',
        diseasePrevented: 'Haemorrhagic Septicaemia',
        dueDate: new Date(Date.now() + 12 * 24 * 3600 * 1000),
        veterinarian: 'Dr. Anand Joshi',
        status: 'Scheduled',
        notes: 'Pre-monsoon booster schedule'
      },
      {
        targetType: 'PoultryBatch',
        poultryBatch: batches[0]._id,
        targetName: 'Layer Flock 24 (BV-300)',
        vaccineName: 'Ranikhet Disease LaSota',
        diseasePrevented: 'Newcastle Disease',
        dueDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        administeredDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        veterinarian: 'Dr. Anand Joshi',
        status: 'Completed',
        notes: 'Administered via drinking water successfully'
      },
      {
        targetType: 'Animal',
        animal: animals[1]._id,
        targetName: 'Cow #IND-9021-02 (Gauri)',
        vaccineName: 'Black Quarter (BQ) Vaccine',
        diseasePrevented: 'Black Quarter',
        dueDate: new Date(Date.now() - 2 * 24 * 3600 * 1000), // Overdue!
        veterinarian: 'Dr. Anand Joshi',
        status: 'Overdue',
        notes: 'Vaccination kit was out of stock, urgent restock needed'
      }
    ]);

    // 17. Health Clinical Records
    await HealthRecord.create([
      {
        targetType: 'Animal',
        animal: animals[5]._id,
        targetName: 'Buffalo #IND-9022-02 (Yamuna)',
        diagnosis: 'Sub-acute Mastitis in Right Forequarter',
        symptoms: 'Swollen quarter, slightly curdled milk on strip cup test, mild fever 102.8°F',
        treatment: 'Intramammary Mastalone infusion for 3 days + Flunixin Meglumine anti-inflammatory injection',
        medicationsPrescribed: 'Mastalone, Flunixin 15ml, Vitamin H supplement',
        veterinarian: 'Dr. Anand Joshi',
        followUpDate: new Date(Date.now() + 2 * 24 * 3600 * 1000),
        treatmentCost: 1450,
        status: 'Active',
        notes: 'Swelling reduced by 70%. Milk discarded from affected teat.'
      },
      {
        targetType: 'Animal',
        animal: animals[0]._id,
        targetName: 'Cow #IND-9021-01 (Kamadhenu)',
        diagnosis: 'Routine Gestation Ultrasound Check',
        symptoms: 'None, healthy pregnancy check at 180 days',
        treatment: 'Confirmed single viable fetus, normal heart rate',
        medicationsPrescribed: 'Prenatal mineral bolus',
        veterinarian: 'Dr. Anand Joshi',
        followUpDate: new Date(Date.now() + 45 * 24 * 3600 * 1000),
        treatmentCost: 500,
        status: 'Recovered',
        notes: 'Expected calving on track for November.'
      }
    ]);

    // 18. Notifications & Alerts
    await Notification.create([
      {
        title: 'Low Feed Stock Alert',
        message: 'Chelated Mineral Mixture (Agrimin Forte) is down to 45 kg, below minimum threshold of 50 kg.',
        type: 'low_stock',
        severity: 'warning',
        link: '/resources/feed'
      },
      {
        title: 'Medicine Expiring Soon',
        message: 'Terramycin LA (Batch OXY-4421) expires on Oct 15, 2026. 6 vials remaining.',
        type: 'expiry',
        severity: 'critical',
        link: '/resources/medicines'
      },
      {
        title: 'Vaccination Due This Week',
        message: 'FMD Booster due for Cow #IND-9021-01 (Kamadhenu) within 5 days.',
        type: 'vaccination',
        severity: 'warning',
        link: '/livestock/health'
      },
      {
        title: 'Pending Customer Receivables',
        message: 'Invoice INV-2026-0105 for Nitin Deshmukh has an outstanding balance of ₹25,000.',
        type: 'payment',
        severity: 'info',
        link: '/business/sales'
      },
      {
        title: 'Clinical Follow-Up Scheduled',
        message: 'Follow-up exam for Buffalo #IND-9022-02 (Yamuna) recovering from mastitis.',
        type: 'health',
        severity: 'warning',
        link: '/livestock/health'
      }
    ]);

    // 19. Setting
    await Setting.create({
      farmName: 'AgroSphere Integrated Dairy & Poultry Farm',
      currencySymbol: '₹',
      currencyCode: 'INR',
      unitWeight: 'kg',
      unitMilk: 'Litres',
      timezone: 'Asia/Kolkata',
      lowStockAlertThreshold: 20,
      medicineExpiryAlertDays: 30,
      enableEmailNotifications: true,
      enableSmsAlerts: false
    });

    console.log('[Seed] Database successfully populated with realistic farm data!');
    return true;
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    throw error;
  }
};

// If run directly via CLI `node seed/seedData.js`
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase().then(() => {
    console.log('[Seed] Seeding completed successfully. Exiting.');
    process.exit(0);
  }).catch((err) => {
    console.error('[Seed] Seeding failed:', err);
    process.exit(1);
  });
}
