import React, { useState, useEffect } from 'react';
import { Home, Save, CheckCircle, MapPin, Building, ShieldCheck, Phone, Mail } from 'lucide-react';
import { farmService } from '../../services/api';
import { Farm } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { useAuth } from '../../context/AuthContext';

export const FarmProfile: React.FC = () => {
  const { hasRole } = useAuth();
  const canEdit = hasRole(['Farm Owner/Admin']);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [farm, setFarm] = useState<Partial<Farm>>({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', pincode: '', country: 'India' },
    farmType: 'Integrated Mixed Farm',
    registrationNumber: '',
    establishedYear: 2021,
    totalArea: 50,
    areaUnit: 'Acres',
    currency: { code: 'INR', symbol: '₹' }
  });

  useEffect(() => {
    farmService.getProfile().then((res) => {
      if (res.data?.farm) {
        setFarm(res.data.farm);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setIsSaving(true);
    setSuccessMsg(null);

    try {
      const res = await farmService.updateProfile(farm);
      setFarm(res.data.farm);
      setSuccessMsg('Farm profile settings successfully saved to database!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update farm profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingState message="Loading farm enterprise profile..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Farm Enterprise Profile</h1>
          <p className="text-xs text-slate-500">
            Manage your registered farm entity, legal licenses, land assets, and operating credentials
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save Farm Profile</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>General Entity Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farm / Business Name *</label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={farm.name || ''}
                  onChange={(e) => setFarm({ ...farm, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner / Director Name *</label>
                <input
                  type="text"
                  required
                  disabled={!canEdit}
                  value={farm.ownerName || ''}
                  onChange={(e) => setFarm({ ...farm, ownerName: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Farm Operation Type</label>
                <select
                  disabled={!canEdit}
                  value={farm.farmType || 'Integrated Mixed Farm'}
                  onChange={(e) => setFarm({ ...farm, farmType: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                >
                  <option value="Dairy & Buffalo">Dairy & Buffalo</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Integrated Mixed Farm">Integrated Mixed Farm</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    disabled={!canEdit}
                    value={farm.email || ''}
                    onChange={(e) => setFarm({ ...farm, email: e.target.value })}
                    className="w-full text-xs pl-8 p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    disabled={!canEdit}
                    value={farm.phone || ''}
                    onChange={(e) => setFarm({ ...farm, phone: e.target.value })}
                    className="w-full text-xs pl-8 p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Govt. Registration Number</label>
                <div className="relative">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={farm.registrationNumber || ''}
                    onChange={(e) => setFarm({ ...farm, registrationNumber: e.target.value })}
                    className="w-full text-xs pl-8 p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Land & Geographical Address */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center space-x-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location & Land Allocation</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Survey / Street Address</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={farm.address?.street || ''}
                  onChange={(e) =>
                    setFarm({
                      ...farm,
                      address: { ...farm.address, street: e.target.value }
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City / Taluka</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={farm.address?.city || ''}
                  onChange={(e) =>
                    setFarm({
                      ...farm,
                      address: { ...farm.address, city: e.target.value }
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={farm.address?.state || ''}
                  onChange={(e) =>
                    setFarm({
                      ...farm,
                      address: { ...farm.address, state: e.target.value }
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code</label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={farm.address?.pincode || ''}
                  onChange={(e) =>
                    setFarm({
                      ...farm,
                      address: { ...farm.address, pincode: e.target.value }
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Farm Land Area</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    disabled={!canEdit}
                    value={farm.totalArea || 0}
                    onChange={(e) => setFarm({ ...farm, totalArea: Number(e.target.value) })}
                    className="w-2/3 text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  />
                  <select
                    disabled={!canEdit}
                    value={farm.areaUnit || 'Acres'}
                    onChange={(e) => setFarm({ ...farm, areaUnit: e.target.value })}
                    className="w-1/3 text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Sq Ft">Sq Ft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
