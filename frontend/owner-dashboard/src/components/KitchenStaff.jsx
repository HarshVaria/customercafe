import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, Plus, CheckCircle2, XCircle, Clock, Trash2, ShieldCheck, Mail, KeyRound } from 'lucide-react';

const KitchenStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'kitchen',
    cafeName: JSON.parse(localStorage.getItem('user') || '{}').cafeName || 'My Cafe'
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/kitchen-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch kitchen staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      setSubmitMessage({ type: '', text: '' });
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
      setSubmitMessage({ type: 'success', text: 'Chef account created successfully!' });
      setFormData({ ...formData, username: '', password: '' });
      fetchStaff();
      setTimeout(() => {
        setShowAddForm(false);
        setSubmitMessage({ type: '', text: '' });
      }, 2000);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create account.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.06)]">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Kitchen Staff Management
          </h3>
          <p className="text-slate-500 text-sm mt-1">Manage chef accounts and monitor kitchen status.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          {showAddForm ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAddForm ? 'Cancel' : 'Add New Chef'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4">
          <h4 className="text-lg font-semibold text-indigo-900 mb-4">Register New Kitchen Account</h4>
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" /> Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                placeholder="e.g., chef_john"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-slate-400" /> Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength="6"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                placeholder="Enter password..."
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {submitLoading ? 'Creating Account...' : 'Create Kitchen Account'}
              </button>
              {submitMessage.text && (
                <p className={`mt-3 text-sm font-medium ${submitMessage.type === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
                  {submitMessage.text}
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-slate-500" />
            Active Kitchen Accounts
          </h4>
          <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
            {staff.length} Accounts Found
          </span>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
             <span className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
             Loading staff data...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500 bg-red-50">{error}</div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <ChefHat className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-lg font-medium text-slate-700">No kitchen staff accounts yet.</p>
            <p className="text-sm">Click "Add New Chef" above to create an account for your kitchen team.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {staff.map((user) => (
              <div key={user._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border
                    ${user.isAvailable ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}
                  `}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-lg mb-0.5">{user.username}</h5>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">ID: <span className="font-mono text-slate-400">{user._id.slice(-6)}</span></span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border w-full sm:w-auto justify-center
                    ${user.isAvailable 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                    }
                  `}>
                    {user.isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {user.isAvailable ? 'Online & Accepting Orders' : 'Offline / Busy'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw MongoDB Data View (For Professor Demo) */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-700">
        <div className="px-5 py-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <span className="text-slate-300 text-xs font-mono font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            db.users.find(&#123; role: "kitchen" &#125;)
          </span>
          <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Professor Demo View</span>
        </div>
        <div className="p-5 overflow-x-auto">
          <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
            {JSON.stringify(staff, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default KitchenStaff;
