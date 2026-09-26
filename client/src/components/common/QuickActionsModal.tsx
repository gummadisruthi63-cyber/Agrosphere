import React, { useState, useEffect } from 'react';
import { Milk, Egg, DollarSign, TrendingUp, Sparkles, Boxes, Users } from 'lucide-react';
import { Modal } from './Modal';
import {
  animalService,
  poultryService,
  milkService,
  eggService,
  expenseService,
  salesService,
  customerService,
  inventoryService,
  farmService
} from '../../services/api';
import { Animal, PoultryBatch, Shed, Customer } from '../../types';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialAction?: string;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialAction = 'record_milk'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialAction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Common reference data
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [batches, setBatches] = useState<PoultryBatch[]>([]);
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Form states
  // 1. Milk
  const [milkForm, setMilkForm] = useState({
    animal: '',
    morningQuantity: '',
    eveningQuantity: '',
    fatPercentage: '4.2',
    date: new Date().toISOString().split('T')[0]
  });

  // 2. Eggs
  const [eggForm, setEggForm] = useState({
    batch: '',
    totalEggs: '',
    goodEggs: '',
    brokenEggs: '0',
    date: new Date().toISOString().split('T')[0]
  });

  // 3. Expense
  const [expenseForm, setExpenseForm] = useState({
    category: 'Feed & Nutrition',
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    vendor: '',
    date: new Date().toISOString().split('T')[0]
  });

  // 4. Sale
  const [saleForm, setSaleForm] = useState({
    customer: '',
    customerName: '',
    productType: 'Fresh Cow Milk',
    quantity: '',
    unit: 'Litres',
    unitPrice: '42',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash'
  });

  // 5. Animal
  const [animalForm, setAnimalForm] = useState({
    animalId: '',
    tagNumber: '',
    name: '',
    animalType: 'Cow',
    breed: 'Holstein Friesian Cross',
    weight: '450',
    healthStatus: 'Healthy',
    lactationStatus: 'Lactating',
    pregnancyStatus: 'Not Pregnant',
    shed: ''
  });

  // 6. Customer
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    customerType: 'Wholesaler / Distributor'
  });

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      // Fetch references
      animalService.getAll().then((r) => setAnimals(r.data.animals || []));
      poultryService.getAll().then((r) => setBatches(r.data.batches || []));
      farmService.getSheds().then((r) => setSheds(r.data.sheds || []));
      customerService.getAll().then((r) => setCustomers(r.data.customers || []));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      if (activeTab === 'record_milk') {
        const morning = Number(milkForm.morningQuantity) || 0;
        const evening = Number(milkForm.eveningQuantity) || 0;
        await milkService.record({
          ...milkForm,
          morningQuantity: morning,
          eveningQuantity: evening,
          totalQuantity: morning + evening
        });
        setFeedback({ type: 'success', message: 'Milk production record saved successfully!' });
      } else if (activeTab === 'record_egg') {
        const total = Number(eggForm.totalEggs);
        const good = Number(eggForm.goodEggs) || total;
        const broken = Number(eggForm.brokenEggs) || 0;
        await eggService.record({
          ...eggForm,
          totalEggs: total,
          goodEggs: good,
          brokenEggs: broken
        });
        setFeedback({ type: 'success', message: 'Egg collection recorded successfully!' });
      } else if (activeTab === 'add_expense') {
        await expenseService.create({
          ...expenseForm,
          amount: Number(expenseForm.amount)
        });
        setFeedback({ type: 'success', message: 'Farm expense logged successfully!' });
      } else if (activeTab === 'add_sale') {
        const qty = Number(saleForm.quantity);
        const price = Number(saleForm.unitPrice);
        const total = qty * price;
        const cust = customers.find((c) => c._id === saleForm.customer);

        await salesService.create({
          ...saleForm,
          customerName: cust ? cust.name : saleForm.customerName,
          quantity: qty,
          unitPrice: price,
          totalAmount: total,
          netAmount: total
        });
        setFeedback({ type: 'success', message: 'Sale invoice recorded successfully!' });
      } else if (activeTab === 'add_animal') {
        await animalService.create({
          ...animalForm,
          weight: Number(animalForm.weight) || 400
        });
        setFeedback({ type: 'success', message: 'Animal registered into livestock registry!' });
      } else if (activeTab === 'add_customer') {
        await customerService.create(customerForm);
        setFeedback({ type: 'success', message: 'Customer profile created successfully!' });
      }

      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit form. Please check inputs.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'record_milk', label: 'Record Milk', icon: Milk },
    { id: 'record_egg', label: 'Record Eggs', icon: Egg },
    { id: 'add_sale', label: 'Add Sale', icon: TrendingUp },
    { id: 'add_expense', label: 'Add Expense', icon: DollarSign },
    { id: 'add_animal', label: 'Add Animal', icon: Sparkles },
    { id: 'add_customer', label: 'Add Customer', icon: Users }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Farm Quick Actions" subtitle="Record daily operations and transactions instantly" maxWidth="2xl">
      {/* Action Selector Pills */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl mb-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setFeedback(null);
              }}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl mb-4 text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Forms */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TAB 1: Record Milk */}
        {activeTab === 'record_milk' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Animal *</label>
              <select
                required
                value={milkForm.animal}
                onChange={(e) => setMilkForm({ ...milkForm, animal: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Animal --</option>
                {animals.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.animalType} #{a.tagNumber} ({a.name || a.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={milkForm.date}
                onChange={(e) => setMilkForm({ ...milkForm, date: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Morning Yield (Litres) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 12.5"
                value={milkForm.morningQuantity}
                onChange={(e) => setMilkForm({ ...milkForm, morningQuantity: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Evening Yield (Litres) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="e.g. 10.0"
                value={milkForm.eveningQuantity}
                onChange={(e) => setMilkForm({ ...milkForm, eveningQuantity: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fat Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                placeholder="4.2"
                value={milkForm.fatPercentage}
                onChange={(e) => setMilkForm({ ...milkForm, fatPercentage: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Record Eggs */}
        {activeTab === 'record_egg' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Poultry Batch *</label>
              <select
                required
                value={eggForm.batch}
                onChange={(e) => setEggForm({ ...eggForm, batch: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Layer Flock --</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batchId} - {b.batchName} ({b.currentCount} birds)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Collection Date *</label>
              <input
                type="date"
                required
                value={eggForm.date}
                onChange={(e) => setEggForm({ ...eggForm, date: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Eggs Collected *</label>
              <input
                type="number"
                required
                placeholder="e.g. 2250"
                value={eggForm.totalEggs}
                onChange={(e) => {
                  const val = e.target.value;
                  setEggForm({
                    ...eggForm,
                    totalEggs: val,
                    goodEggs: val
                  });
                }}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Good / Sellable Eggs</label>
              <input
                type="number"
                value={eggForm.goodEggs}
                onChange={(e) => setEggForm({ ...eggForm, goodEggs: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Broken / Cracked Eggs</label>
              <input
                type="number"
                value={eggForm.brokenEggs}
                onChange={(e) => setEggForm({ ...eggForm, brokenEggs: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Add Sale */}
        {activeTab === 'add_sale' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer</label>
              <select
                value={saleForm.customer}
                onChange={(e) => {
                  const cId = e.target.value;
                  const found = customers.find((c) => c._id === cId);
                  setSaleForm({
                    ...saleForm,
                    customer: cId,
                    customerName: found ? found.name : ''
                  });
                }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Direct Retail / Select Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.customerType})
                  </option>
                ))}
              </select>
            </div>

            {!saleForm.customer && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Direct Customer Name"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Type *</label>
              <select
                value={saleForm.productType}
                onChange={(e) => setSaleForm({ ...saleForm, productType: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Fresh Cow Milk">Fresh Cow Milk</option>
                <option value="Buffalo Milk">Buffalo Milk</option>
                <option value="Table Eggs">Table Eggs</option>
                <option value="Broiler Birds">Broiler Birds</option>
                <option value="Other Farm Products">Other Farm Products</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="100"
                value={saleForm.quantity}
                onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="42"
                value={saleForm.unitPrice}
                onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
              <select
                value={saleForm.paymentStatus}
                onChange={(e) => setSaleForm({ ...saleForm, paymentStatus: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 4: Add Expense */}
        {activeTab === 'add_expense' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expense Category *</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Feed & Nutrition">Feed & Nutrition</option>
                <option value="Medicine & Vaccines">Medicine & Vaccines</option>
                <option value="Salaries & Wages">Salaries & Wages</option>
                <option value="Electricity & Power">Electricity & Power</option>
                <option value="Water & Irrigation">Water & Irrigation</option>
                <option value="Transportation & Logistics">Transportation & Logistics</option>
                <option value="Farm Maintenance & Repair">Farm Maintenance & Repair</option>
                <option value="Machinery & Equipment">Machinery & Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 5000"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. Purchased 10 bags of cattle feed concentrate"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Payee</label>
              <input
                type="text"
                placeholder="Vendor Name"
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={expenseForm.paymentMethod}
                onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 5: Add Animal */}
        {activeTab === 'add_animal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Animal Tag Number *</label>
              <input
                type="text"
                required
                placeholder="IND-9021-XX"
                value={animalForm.tagNumber}
                onChange={(e) => setAnimalForm({ ...animalForm, tagNumber: e.target.value, animalId: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Name / Call Sign</label>
              <input
                type="text"
                placeholder="e.g. Kamadhenu 2"
                value={animalForm.name}
                onChange={(e) => setAnimalForm({ ...animalForm, name: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Type *</label>
              <select
                value={animalForm.animalType}
                onChange={(e) => setAnimalForm({ ...animalForm, animalType: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Cow">Cow</option>
                <option value="Buffalo">Buffalo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Breed *</label>
              <input
                type="text"
                required
                placeholder="e.g. HF Cross / Murrah"
                value={animalForm.breed}
                onChange={(e) => setAnimalForm({ ...animalForm, breed: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lactation Status</label>
              <select
                value={animalForm.lactationStatus}
                onChange={(e) => setAnimalForm({ ...animalForm, lactationStatus: e.target.value as any })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Lactating">Lactating</option>
                <option value="Dry">Dry</option>
                <option value="Heifer">Heifer</option>
                <option value="Calf">Calf</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assign Shed</label>
              <select
                value={animalForm.shed}
                onChange={(e) => setAnimalForm({ ...animalForm, shed: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Barn/Shed --</option>
                {sheds.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.shedNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* TAB 6: Add Customer */}
        {activeTab === 'add_customer' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Entity Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Metro Cooperative"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98XXX XXXXX"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Customer Type</label>
              <select
                value={customerForm.customerType}
                onChange={(e) => setCustomerForm({ ...customerForm, customerType: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Dairy Cooperative">Dairy Cooperative</option>
                <option value="Wholesaler / Distributor">Wholesaler / Distributor</option>
                <option value="Local Retailer">Local Retailer</option>
                <option value="Hotel / Restaurant">Hotel / Restaurant</option>
                <option value="Individual Consumer">Individual Consumer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="buyer@example.com"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Address / Delivery Point</label>
              <input
                type="text"
                placeholder="City, State"
                value={customerForm.address}
                onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            {isSubmitting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            <span>Save to AgroSphere</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
