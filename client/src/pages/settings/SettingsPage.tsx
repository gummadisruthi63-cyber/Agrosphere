import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Lock,
  User,
  Shield,
  RotateCcw,
  CheckCircle,
  Bell,
  Globe,
  Sliders
} from 'lucide-react';
import { settingService, authService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../../components/common/LoadingState';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, hasRole } = useAuth();
  const isAdmin = hasRole(['Farm Owner/Admin']);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState({
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

  // User Profile Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    farmName: user?.farmName || ''
  });

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    settingService.getSettings()
      .then((res) => {
        if (res.data?.settings) {
          setSettings(res.data.settings);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      await settingService.updateSettings(settings);
      setSuccessMessage('Application settings updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);

    try {
      const res = await authService.updateProfile(profileForm);
      updateUser(res.data.user);
      setSuccessMessage('Personal profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', error: true });
      return;
    }

    try {
      await settingService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordMsg({ text: 'Password successfully changed!', error: false });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err: any) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to change password. Check your current password.',
        error: true
      });
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset database and re-seed fresh realistic demo records?')) {
      setIsSaving(true);
      try {
        await settingService.resetDemoData();
        alert('Database restored with fresh demo records!');
        window.location.reload();
      } catch (err) {
        alert('Failed to reset data');
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) return <LoadingState message="Loading farm application settings..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
          Farm System Settings & Preferences
        </h1>
        <p className="text-xs text-slate-500">
          Configure currencies, unit standards, threshold alert parameters, and update account credentials
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile & Security */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-emerald-600" />
              <span>User Profile & Identity</span>
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Update Profile Details
                </button>
              </div>
            </form>
          </div>

          {/* Role & Permissions Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Assigned RBAC Role</span>
            </h3>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Active System Permission
              </span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{user?.role}</p>
              <p className="text-xs text-slate-500 mt-1">
                {user?.role === 'Farm Owner/Admin'
                  ? 'Complete access across all financial ledgers, livestock registry, inventory, and employee records.'
                  : user?.role === 'Farm Manager'
                  ? 'Management access for day-to-day operations, production recording, and task management.'
                  : 'Operational access limited to milk/egg collection, feeding, and shift logs.'}
              </p>
            </div>
          </div>

          {/* Password Security Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Lock className="w-4 h-4 text-slate-600" />
              <span>Change Account Password</span>
            </h3>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMsg.error
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Farm Settings & Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Operational & Metric Units Configuration</h3>
              </div>

              {isAdmin && (
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Currency & Measures */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Currency & Measurement Standards
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={settings.currencySymbol}
                      onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Currency Code</label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={settings.currencyCode}
                      onChange={(e) => setSettings({ ...settings, currencyCode: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Default Weight Unit</label>
                    <select
                      disabled={!isAdmin}
                      value={settings.unitWeight}
                      onChange={(e) => setSettings({ ...settings, unitWeight: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 disabled:bg-slate-50"
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="lbs">lbs (Pounds)</option>
                      <option value="quintal">Quintals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Milk Volume Unit</label>
                    <select
                      disabled={!isAdmin}
                      value={settings.unitMilk}
                      onChange={(e) => setSettings({ ...settings, unitMilk: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 disabled:bg-slate-50"
                    >
                      <option value="Litres">Litres</option>
                      <option value="Gallons">Gallons</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Threshold Alerts */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Automated Proactive Alert Thresholds
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Low Stock Warning Threshold (%)
                    </label>
                    <input
                      type="number"
                      disabled={!isAdmin}
                      value={settings.lowStockAlertThreshold}
                      onChange={(e) => setSettings({ ...settings, lowStockAlertThreshold: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 disabled:bg-slate-50"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Triggers low stock badge when quantity is under threshold</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medicine Expiration Alert Days
                    </label>
                    <input
                      type="number"
                      disabled={!isAdmin}
                      value={settings.medicineExpiryAlertDays}
                      onChange={(e) => setSettings({ ...settings, medicineExpiryAlertDays: Number(e.target.value) })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 disabled:bg-slate-50"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Days before drug expiration to flag in dashboard alerts</p>
                  </div>
                </div>
              </div>

              {/* Notification Channels */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Notification Dispatch Preferences
                </h4>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isAdmin}
                      checked={settings.enableEmailNotifications}
                      onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700">
                      Enable Email Summary Dispatch (Daily operational digests)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!isAdmin}
                      checked={settings.enableSmsAlerts}
                      onChange={(e) => setSettings({ ...settings, enableSmsAlerts: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-700">
                      Enable SMS Emergency Alerts (Epidemic alerts and critical mortalities)
                    </span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Demonstration & Data Reset Card */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-amber-900">Project Review & Demonstration Reset</h4>
              <p className="text-xs text-amber-800/80 mt-1 max-w-xl">
                Reset all MongoDB collections back to the pristine realistic dataset (dairy cattle, Murrah buffaloes, poultry batches, milk records, sales invoices, and expenses).
              </p>
            </div>
            <button
              onClick={handleResetData}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
