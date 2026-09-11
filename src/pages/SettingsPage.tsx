import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Building2, 
  Printer, 
  Percent, 
  RotateCcw, 
  Check, 
  FileText, 
  Info, 
  ShieldCheck,
  Smartphone,
  Store,
  Receipt,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { BRANCHES } from '../data/mockData';

export const SettingsPage: React.FC = () => {
  const { resetDemoData, showToast, branches, currentBranch } = useApp();

  // Restaurant Info
  const [restaurantName, setRestaurantName] = useState<string>('Zaffran Restaurant');
  const [brandName, setBrandName] = useState<string>('Zaffran Indian Kitchen & Bar');
  const [gstNumber, setGstNumber] = useState<string>('29AAAAA0000A1Z5');
  const [fssaiNumber, setFssaiNumber] = useState<string>('11223344556677');
  const [defaultTaxPercent, setDefaultTaxPercent] = useState<number>(5.0);

  // Branch Settings
  const [selectedBranchId, setSelectedBranchId] = useState<string>('main');
  const [branchDetails, setBranchDetails] = useState({
    main: {
      name: 'Main Branch',
      address: '102 MG Road, Central Business District, Bangalore',
      phone: '+91 80 2345 6789',
      headerText: 'Welcome to Zaffran MG Road - Premium Dine-In',
      footerText: 'Thank you for dining with us! Please visit again. Follow @zaffrankitchen'
    },
    city: {
      name: 'City Branch',
      address: '45, 11th Main, 4th Block, Jayanagar, Bangalore',
      phone: '+91 80 8765 4321',
      headerText: 'Zaffran Express & Family Dining - Jayanagar',
      footerText: 'We appreciate your patronage! Rate us on Google & Zomato.'
    },
    beach: {
      name: 'Beach Road Branch',
      address: '88 Coastal Promenade, Beach View Boulevard, Pondicherry',
      phone: '+91 413 2233 445',
      headerText: 'Zaffran Coastal Grill & Rooftop - Seaside',
      footerText: 'Hope you enjoyed the ocean breeze! Have a safe journey.'
    }
  });

  // Printer Settings
  const [defaultPrinter, setDefaultPrinter] = useState<string>('80mm Thermal Printer');
  const [kotPrinter, setKotPrinter] = useState<string>('Kitchen Printer');
  const [autoPrintOnBill, setAutoPrintOnBill] = useState<boolean>(true);

  const currentBranchData = branchDetails[selectedBranchId as keyof typeof branchDetails];

  const handleBranchDetailChange = (field: string, val: string) => {
    setBranchDetails(prev => ({
      ...prev,
      [selectedBranchId]: {
        ...prev[selectedBranchId as keyof typeof branchDetails],
        [field]: val
      }
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings Saved', 'Restaurant configuration and branch preferences updated.');
  };

  const handleConfirmReset = () => {
    if (window.confirm('Are you sure you want to reset all demo data back to default factory state?')) {
      resetDemoData();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">System & Branch Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Configure brand metadata, multi-branch information, tax rates, and thermal hardware
          </p>
        </div>

        <button
          type="button"
          onClick={handleConfirmReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
          title="Reset database to initial demo state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Restaurant Info */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Restaurant Info</h3>
              <p className="text-[11px] text-slate-500 font-sans">Primary legal entity and default tax parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={e => setBrandName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">GST Number (GSTIN)</label>
              <input
                type="text"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">FSSAI Number (Food License)</label>
              <input
                type="text"
                value={fssaiNumber}
                onChange={e => setFssaiNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Tax %</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={defaultTaxPercent}
                  onChange={e => setDefaultTaxPercent(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Split evenly into 2.5% CGST + 2.5% SGST</p>
            </div>
          </div>
        </div>

        {/* Section 2: Branch Settings */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Branch Settings</h3>
                <p className="text-[11px] text-slate-500 font-sans">Location specifics, contact info, and receipt text</p>
              </div>
            </div>

            {/* Branch Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Configure:</span>
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
              >
                <option value="main">Main Branch (MG Road)</option>
                <option value="city">City Branch (Jayanagar)</option>
                <option value="beach">Beach Road Branch (Promenade)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Branch Name</label>
                <input
                  type="text"
                  value={currentBranchData.name}
                  onChange={e => handleBranchDetailChange('name', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={currentBranchData.phone}
                  onChange={e => handleBranchDetailChange('phone', e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Address</label>
              <input
                type="text"
                value={currentBranchData.address}
                onChange={e => handleBranchDetailChange('address', e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Receipt Header Text</label>
                <input
                  type="text"
                  value={currentBranchData.headerText}
                  onChange={e => handleBranchDetailChange('headerText', e.target.value)}
                  placeholder="Greeting printed under branch name"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Receipt Footer Text</label>
                <input
                  type="text"
                  value={currentBranchData.footerText}
                  onChange={e => handleBranchDetailChange('footerText', e.target.value)}
                  placeholder="Thank you note at bottom of receipt"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Printer Settings (Demo) */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Printer className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Printer Settings (Demo)</h3>
              <p className="text-[11px] text-slate-500 font-sans">Hardware targets for customer receipts and kitchen tickets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Default Printer</label>
              <select
                value={defaultPrinter}
                onChange={e => setDefaultPrinter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="80mm Thermal Printer">80mm Thermal Printer</option>
                <option value="58mm Compact Thermal Printer">58mm Compact Thermal Printer</option>
                <option value="Standard A4 Invoice Printer">Standard A4 Invoice Printer</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Assigned for POS final bills</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">KOT Printer</label>
              <select
                value={kotPrinter}
                onChange={e => setKotPrinter(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Kitchen Printer">Kitchen Printer (Main Cooking Station)</option>
                <option value="Bar Printer">Bar Printer (Beverage Station)</option>
                <option value="Grill Station Printer">Grill Station Printer (Tandoor)</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Routing for kitchen dispatch</p>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Auto-print on Bill</label>
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAutoPrintOnBill(!autoPrintOnBill)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-colors ${
                    autoPrintOnBill
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-100 border-slate-300 text-slate-600'
                  }`}
                >
                  {autoPrintOnBill ? (
                    <>
                      <ToggleRight className="w-5 h-5 text-emerald-600" />
                      <span>ON (Automatic)</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                      <span>OFF (Manual)</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Triggers print dialog upon bill settlement</p>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end gap-3 font-mono">
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
