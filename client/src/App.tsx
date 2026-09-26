import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { LoadingState } from './components/common/LoadingState';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Application Pages
import { UnifiedDashboard } from './pages/dashboard/UnifiedDashboard';
import { FarmProfile } from './pages/farm/FarmProfile';
import { ShedsList } from './pages/farm/ShedsList';
import { AnimalsList } from './pages/livestock/AnimalsList';
import { AnimalDetails } from './pages/livestock/AnimalDetails';
import { HealthVaccination } from './pages/livestock/HealthVaccination';
import { PoultryBatches } from './pages/poultry/PoultryBatches';
import { BatchDetails } from './pages/poultry/BatchDetails';
import { MilkProduction } from './pages/production/MilkProduction';
import { EggProduction } from './pages/production/EggProduction';
import { FeedManagement } from './pages/resources/FeedManagement';
import { MedicineManagement } from './pages/resources/MedicineManagement';
import { InventoryManagement } from './pages/resources/InventoryManagement';
import { SalesManagement } from './pages/business/SalesManagement';
import { CustomerManagement } from './pages/business/CustomerManagement';
import { ExpenseManagement } from './pages/business/ExpenseManagement';
import { EmployeeManagement } from './pages/business/EmployeeManagement';
import { FinancialOverview } from './pages/finance/FinancialOverview';
import { ReportsPage } from './pages/reports/ReportsPage';
import { NotificationCenter } from './pages/notifications/NotificationCenter';
import { SettingsPage } from './pages/settings/SettingsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route (Redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<UnifiedDashboard />} />

            {/* Farm Management */}
            <Route path="farm/profile" element={<FarmProfile />} />
            <Route path="farm/sheds" element={<ShedsList />} />

            {/* Livestock */}
            <Route path="livestock/animals" element={<AnimalsList />} />
            <Route path="livestock/animals/:id" element={<AnimalDetails />} />
            <Route path="livestock/health" element={<HealthVaccination />} />

            {/* Poultry */}
            <Route path="poultry/batches" element={<PoultryBatches />} />
            <Route path="poultry/batches/:id" element={<BatchDetails />} />

            {/* Production Daily */}
            <Route path="production/milk" element={<MilkProduction />} />
            <Route path="production/eggs" element={<EggProduction />} />

            {/* Resources & Inventory */}
            <Route path="resources/feed" element={<FeedManagement />} />
            <Route path="resources/medicines" element={<MedicineManagement />} />
            <Route path="resources/inventory" element={<InventoryManagement />} />

            {/* Business & Commercial */}
            <Route path="business/sales" element={<SalesManagement />} />
            <Route path="business/customers" element={<CustomerManagement />} />
            <Route path="business/expenses" element={<ExpenseManagement />} />
            <Route path="business/employees" element={<EmployeeManagement />} />

            {/* Finance */}
            <Route path="finance" element={<FinancialOverview />} />

            {/* Reports */}
            <Route path="reports" element={<ReportsPage />} />

            {/* Notifications */}
            <Route path="notifications" element={<NotificationCenter />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
