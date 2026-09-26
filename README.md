# 🌾 AgroSphere — Unified Livestock & Farm Business Management Platform

> **Modern agricultural SaaS platform engineered for integrated dairy, buffalo, and poultry commercial farm enterprises.**

AgroSphere bridges the gap between daily biological farm operations and business accounting. It equips commercial dairy farmers, buffalo breeders, and poultry producers with a single command center to monitor animal health, milk yields, egg collections, feed inventories, veterinary pharmacy stocks, sales invoicing, customer credits, operating expenses, and net profit margins.

---

## 🚀 Key Highlights & Architecture

- **Unified Farm Business Dashboard**: Combines real-time livestock herd metrics, poultry flock populations, daily milk/egg yields, inventory valuations, sales cashflow, and net P&L.
- **Bi-Sector Farming Support**: Full native workflows for **Dairy & Murrah Buffaloes** (individual ear-tag tracking, lactation curves, breeding milestones) and **Commercial Poultry** (batch flocks, broilers vs layers, daily egg grading, and mortality curves).
- **Proactive Agricultural Alerts**: Automated threshold detectors for feed stock replenishment, expiring veterinary medications, scheduled herd vaccinations, and overdue customer invoice payments.
- **Enterprise-Grade Role-Based Access Control (RBAC)**: Fine-grained permissions tailored for Farm Owners/Admins, Farm Operations Managers, and Field Workers.
- **Production-Ready Full-Stack Stack**: Built with TypeScript, React 18, Tailwind CSS, Lucide Icons, Recharts, Node.js, Express.js (ES modules), and MongoDB (Mongoose).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6, Axios |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose ODM, JWT Authentication, bcryptjs, Morgan |
| **Database** | MongoDB (`mongodb://127.0.0.1:27017/agrosphere`) |
| **Design System**| Emerald & Sage natural farming palette, Glassmorphism, Tailwind custom utilities, SaaS cards & charts |

---

## 📊 Feature Modules

### 1. Unified Farm Business Dashboard (`/dashboard`)
- **Executive KPIs**: Total Livestock Head, Active Poultry Birds, Today's Milk Output (Litres), Today's Egg Collection (Good vs Damaged), Monthly Gross Revenue, Monthly Operating Expenses, Net Farm Profit/Loss.
- **Interactive Visualizations**:
  - 7-Day comparative Area Chart of daily milk yield (L) and egg collection (count).
  - 6-Month comparative Bar Chart of Sales Revenue vs Operating Expenses.
  - Livestock & Poultry population distribution Pie Chart.
- **Proactive Alert Center**: Real-time notifications for low feed bags, vaccine appointments within 30 days, expiring medicines, and pending invoice dues.
- **Global "+ Quick Action"**: Modal to quickly record milk yields, egg collections, log expenses, generate sales invoices, or register cattle from any screen.

### 2. Dairy & Buffalo Livestock Management (`/livestock/animals`)
- **Individual Animal Profiles**: Tag ID, Breed, Shed, Birth Date, Weight, Lactation Status, and Sire/Dam pedigree.
- **Comprehensive Animal Dossier (`/livestock/animals/:id`)**:
  - 30-day lactation yield curve chart.
  - Breeding milestones: Insemination date, pregnancy check, expected calving date, dry-off date.
  - Health & vaccination ledger with veterinarian notes.

### 3. Poultry Farm Operations (`/poultry/batches`)
- **Batch Tracking**: Flocks categorized as Broilers, Commercial Layers, or Dual-Purpose.
- **Flock Dossier (`/poultry/batches/:id`)**:
  - Age in weeks, initial placement count vs current live bird population.
  - Daily mortality tracker with cause classification.
  - Daily egg production yield and feed conversion ratio (FCR).

### 4. Daily Production Logging
- **Milk Production (`/production/milk`)**: Morning & evening milk recording by animal tag, automated total calculation, Fat % and SNF % logging for dairy pricing.
- **Egg Production (`/production/eggs`)**: Daily egg count by batch, segregated into Good Eggs, Cracked/Broken, and Hatchable eggs.

### 5. Farm Resources & Supply Chain
- **Feed Management (`/resources/feed`)**: Cattle concentrates, silage, broiler mash, and layer crumbles with stock logging and automated low-stock warnings.
- **Veterinary Pharmacy (`/resources/medicines`)**: Vaccine vials, antibiotics, and dewormers tracked with batch numbers, expiration dates, and dosage history.
- **Central Equipment & Inventory (`/resources/inventory`)**: Milking machines, egg incubators, ear tags, feeders, and irrigation equipment with valuation.

### 6. Commercial Operations & Accounting
- **Sales & Invoicing (`/business/sales`)**: Invoice creation with customer selection, itemization, payment status tracking (Paid, Partial, Pending), and **one-click printable thermal/A4 invoice modal**.
- **Customer Directory (`/business/customers`)**: Wholesale milk dairies, egg distributors, and local buyers with purchase history and outstanding balances.
- **Expense Tracker (`/business/expenses`)**: Categorized cost tracker (Feed, Veterinary, Labor, Power, Maintenance) with monthly expenditure breakdown.
- **Staff & Attendance (`/business/employees`)**: Employee database, daily attendance logging, and assignment of daily farm chores.

### 7. Financial Statements & Reporting (`/finance`, `/reports`)
- **Financial Overview**: Profit & Loss breakdown, revenue trends, expense ratios, and net profit margins.
- **Custom Report Generator**: Filter data by date range and module (Milk, Eggs, Sales, Expenses, Inventory, Livestock) with **one-click CSV export** and formatted print view.

---

## 👥 Demo User Accounts (Pre-Seeded)

The database includes realistic demo accounts with 1-click login buttons directly on the login screen:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Farm Owner / Admin** | `admin@agrosphere.com` | `password123` | Full administrative control, all financial records, user & farm settings |
| **Farm Manager** | `manager@agrosphere.com` | `password123` | Operational management, production logging, inventory & staff management |
| **Farm Employee** | `employee@agrosphere.com` | `password123` | Routine production entry (milk, eggs) and daily assigned tasks |

---

## 🚀 Running AgroSphere Locally

### Prerequisites
1. **Node.js** (v18 or higher)
2. **MongoDB** (running on default port `27017`)

### 1. Start the Backend API Server
```bash
cd server
npm install
npm run dev
```
- API will run on `http://localhost:5000`
- MongoDB connects to `mongodb://127.0.0.1:27017/agrosphere`
- The database is automatically seeded with realistic cattle, Murrah buffaloes, poultry flocks, 14 days of milk & egg logs, feed stocks, sales invoices, and expenses on first run.

### 2. Start the Frontend Application
```bash
cd client
npm install
npm run dev
```
- Vite dev server will run on `http://localhost:3000`
- API calls to `/api` are automatically proxied to `http://localhost:5000`

### 3. Build for Production
```bash
cd client
npm run build
```
- Compiles the optimized production bundle in `client/dist/`.

---

## 🔒 Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/agrosphere
JWT_SECRET=agrosphere_ultra_secure_jwt_secret_key_2026_farm_app
JWT_EXPIRE=30d
```

---

## 📂 Project Directory Structure

```text
Agrosphere/
├── client/                     # Frontend Application (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components (DashboardCard, DataTable, Modal, Invoice, QuickActions)
│   │   ├── context/            # AuthContext & Session management
│   │   ├── layouts/            # MainLayout (Sidebar + Sticky Header + Content)
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, Forgot Password
│   │   │   ├── dashboard/      # Unified Farm Business Dashboard
│   │   │   ├── farm/           # Farm Profile & Sheds
│   │   │   ├── livestock/      # Cattle & Buffalo management, Animal Dossier, Health
│   │   │   ├── poultry/        # Flock Batches & Batch Details
│   │   │   ├── production/     # Daily Milk & Egg production logs
│   │   │   ├── resources/      # Feed, Veterinary Pharmacy, Central Inventory
│   │   │   ├── business/       # Sales Invoices, Customers, Expenses, Staff
│   │   │   ├── finance/        # Financial Overview & P&L
│   │   │   ├── reports/        # Comprehensive Reports & CSV Exports
│   │   │   ├── notifications/  # Smart Proactive Notification Center
│   │   │   └── settings/       # Farm Preferences & Demo Re-seed
│   │   ├── services/           # Axios API Client & Services
│   │   ├── types/              # TypeScript interface definitions
│   │   └── utils/              # Currency (₹ INR), Date, CSV formatters
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Backend API (Express.js + Mongoose)
│   ├── config/                 # Database connection
│   ├── controllers/            # Controller logic for all 18 modules
│   ├── middleware/             # JWT auth & error handling middleware
│   ├── models/                 # 19 Mongoose Schemas (User, Animal, Batch, Milk, Egg, Sale, Expense, Feed, etc.)
│   ├── routes/                 # Express API routes
│   ├── seed/                   # Seed script populating realistic agricultural data
│   ├── package.json
│   └── server.js               # Application entry point
│
└── README.md                   # System documentation
```

---

## 📜 License
AgroSphere is released under the **MIT License**.
