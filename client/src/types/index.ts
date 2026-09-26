export type UserRole = 'Farm Owner/Admin' | 'Farm Manager' | 'Employee';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  farmName?: string;
  avatar?: string;
  status?: string;
}

export interface Farm {
  _id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  farmType: string;
  registrationNumber?: string;
  establishedYear?: number;
  totalArea?: number;
  areaUnit?: string;
  currency: {
    code: string;
    symbol: string;
  };
  logo?: string;
}

export interface Shed {
  _id: string;
  name: string;
  shedNumber: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  locationNotes?: string;
  ventilationType?: string;
  status: string;
}

export interface Animal {
  _id: string;
  animalId: string;
  tagNumber: string;
  name: string;
  animalType: 'Cow' | 'Buffalo';
  breed: string;
  gender: 'Female' | 'Male';
  dateOfBirth?: string;
  weight?: number;
  purchaseDate?: string;
  purchasePrice?: number;
  healthStatus: 'Healthy' | 'Sick' | 'Under Treatment' | 'Quarantined' | 'Deceased';
  lactationStatus: 'Lactating' | 'Dry' | 'Heifer' | 'Calf';
  pregnancyStatus: 'Not Pregnant' | 'Inseminated' | 'Pregnant' | 'Calved Recently';
  expectedCalvingDate?: string;
  dailyAverageYield?: number;
  shed?: Shed | string;
  notes?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface PoultryBatch {
  _id: string;
  batchId: string;
  batchName: string;
  breed: string;
  birdType: 'Broiler' | 'Layer' | 'Dual-Purpose' | 'Breeder';
  initialCount: number;
  currentCount: number;
  mortalityCount: number;
  arrivalDate: string;
  ageWeeks: number;
  shed?: Shed | string;
  feedType?: string;
  dailyFeedIntakeKg?: number;
  healthStatus: string;
  status: 'Active' | 'Sold' | 'Completed' | 'Culled';
  notes?: string;
}

export interface MilkRecord {
  _id: string;
  date: string;
  animal: Animal | { _id: string; tagNumber: string; name: string; animalType: string; breed: string };
  morningQuantity: number;
  eveningQuantity: number;
  totalQuantity: number;
  fatPercentage?: number;
  snfPercentage?: number;
  recordedBy?: string;
  notes?: string;
}

export interface EggRecord {
  _id: string;
  date: string;
  batch: PoultryBatch | { _id: string; batchId: string; batchName: string; breed: string; currentCount?: number };
  totalEggs: number;
  goodEggs: number;
  brokenEggs: number;
  damagedEggs?: number;
  layRatePercentage?: number;
  collectedBy?: string;
  notes?: string;
}

export interface FeedItem {
  _id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStockAlert: number;
  unitCost: number;
  supplier?: string;
  supplierContact?: string;
  lastRestocked?: string;
  dailyConsumptionRate?: number;
  expiryDate?: string;
  storageShed?: Shed | string;
  notes?: string;
}

export interface MedicineItem {
  _id: string;
  name: string;
  category: string;
  targetSpecies: string;
  currentStock: number;
  unit: string;
  batchNumber?: string;
  unitCost: number;
  supplier?: string;
  expiryDate: string;
  minStockAlert: number;
  administrationRoute?: string;
  storageConditions?: string;
  notes?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  itemCode?: string;
  quantity: number;
  unit: string;
  purchasePrice: number;
  sellingPrice?: number;
  supplier?: string;
  minStockAlert: number;
  expiryDate?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expired';
  shedLocation?: string;
  notes?: string;
}

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  customerType: string;
  totalPurchases: number;
  outstandingBalance: number;
  creditLimit?: number;
  notes?: string;
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  customer?: Customer | string;
  customerName: string;
  customerPhone?: string;
  productType: string;
  itemDescription?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  discount: number;
  netAmount: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  paymentMethod: string;
  amountPaid: number;
  balanceDue: number;
  saleDate: string;
  notes?: string;
}

export interface Expense {
  _id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  vendor?: string;
  receiptNumber?: string;
  recordedBy?: string;
  notes?: string;
}

export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  salary: number;
  salaryType: string;
  joiningDate?: string;
  address?: string;
  assignedShed?: Shed | string;
  status: 'Active' | 'On Leave' | 'Terminated';
  emergencyContact?: string;
  activeTasks: {
    _id?: string;
    task: string;
    dueDate?: string;
    completed: boolean;
  }[];
}

export interface AttendanceRecord {
  _id: string;
  employee: Employee | { _id: string; name: string; employeeId: string; role: string };
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface Vaccination {
  _id: string;
  targetType: 'Animal' | 'PoultryBatch';
  animal?: string;
  poultryBatch?: string;
  targetName: string;
  vaccineName: string;
  diseasePrevented?: string;
  administeredDate?: string;
  dueDate: string;
  nextDueDate?: string;
  veterinarian?: string;
  status: 'Scheduled' | 'Completed' | 'Overdue';
  notes?: string;
}

export interface HealthRecord {
  _id: string;
  targetType: 'Animal' | 'PoultryBatch';
  animal?: string;
  poultryBatch?: string;
  targetName: string;
  recordDate: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  medicationsPrescribed?: string;
  veterinarian?: string;
  followUpDate?: string;
  treatmentCost?: number;
  status: 'Active' | 'Recovered' | 'Critical' | 'Monitoring';
  notes?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  severity: 'info' | 'warning' | 'critical';
  link?: string;
  isRead: boolean;
  createdAt: string;
}
