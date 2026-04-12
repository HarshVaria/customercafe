import { useState, useEffect } from 'react';
import { getIngredientAnalytics, getIngredients, createIngredient, updateIngredient } from '../services/api';
import { PackageSearch, AlertTriangle, TrendingUp, Plus, Settings2, ShieldCheck, HeartPulse } from 'lucide-react';

const Inventory = () => {
  const [ingredients, setIngredients] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: 'kg', currentStock: '', lowStockThreshold: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [ingRes, anaRes] = await Promise.all([
        getIngredients(),
        getIngredientAnalytics(30)
      ]);
      setIngredients(ingRes.data || []);
      setAnalytics(anaRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIngredient(formData);
      setShowAddModal(false);
      setFormData({ name: '', unit: 'kg', currentStock: '', lowStockThreshold: '' });
      fetchInventory();
    } catch (error) {
      alert(error.message || 'Error adding ingredient');
    }
  };

  const getStatusColor = (status) => {
    if (status === 'critical_need') return 'bg-rose-100 text-rose-700 border-rose-200';
    if (status === 'low_stock') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'critical_need') return <AlertTriangle className="w-4 h-4" />;
    if (status === 'low_stock') return <Settings2 className="w-4 h-4" />;
    return <ShieldCheck className="w-4 h-4" />;
  };

  if (loading) {
    return <div className="flex justify-center p-20"><PackageSearch className="w-10 h-10 text-indigo-500 animate-bounce" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageSearch className="w-6 h-6 text-indigo-600" />
            Inventory & Forecasting
          </h2>
          <p className="text-slate-500 text-sm mt-1">AI-powered stock predictions based on 30-day order trends</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Ingredient
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analytics Forecasting Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              7-Day Actionable Forecast
            </h3>
          </div>
          <div className="p-5 overflow-y-auto max-h-[500px]">
            {analytics.length === 0 ? (
              <p className="text-center text-slate-500 my-10">No order data yet to forecast.</p>
            ) : (
              <div className="space-y-4">
                {analytics.map(item => (
                  <div key={item._id} className={`p-4 rounded-xl border ${getStatusColor(item.status)} bg-opacity-20`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 font-bold">
                        {getStatusIcon(item.status)}
                        {item.name}
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-white/50 rounded-lg">
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                      <div className="bg-white/60 p-2 rounded-lg">
                        <p className="text-opacity-70 text-xs font-semibold">Current</p>
                        <p className="font-bold">{item.currentStock} {item.unit}</p>
                      </div>
                      <div className="bg-white/60 p-2 rounded-lg">
                        <p className="text-opacity-70 text-xs font-semibold">Daily Avg</p>
                        <p className="font-bold">~{item.dailyAverage} {item.unit}</p>
                      </div>
                      <div className="bg-white/60 p-2 rounded-lg">
                        <p className="text-opacity-70 text-xs font-semibold">7-Day Need</p>
                        <p className="font-bold">{item.weeklyForecast} {item.unit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Master Inventory List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Master Ingredient List
            </h3>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
              {ingredients.length} items
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Item Name</th>
                  <th className="px-5 py-3">In Stock</th>
                  <th className="px-5 py-3">Warning At</th>
                  <th className="px-5 py-3 text-right">Unit</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map(item => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-medium text-slate-800">{item.name}</td>
                    <td className={`px-5 py-4 font-bold ${item.currentStock < item.lowStockThreshold ? 'text-rose-600' : 'text-slate-700'}`}>
                      {item.currentStock}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{item.lowStockThreshold}</td>
                    <td className="px-5 py-4 text-right text-slate-400 font-medium">{item.unit}</td>
                  </tr>
                ))}
                {ingredients.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-500">No ingredients added yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">Add New Ingredient</h3>
            </div>
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Ingredient Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Coffee Beans" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Measurement Unit</label>
                  <select value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    <option value="g">Grams (g)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="l">Liters (l)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Initial Stock</label>
                  <input type="number" required min="0" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Low Stock Alert Threshold</label>
                <input type="number" required min="0" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">Save Ingredient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
