import { useState, useEffect } from 'react';
import { getIngredients, logStockUsage } from '../services/api';
import { Scale, PackageSearch, X, Save, ShieldCheck, Loader2 } from 'lucide-react';

const InventoryOverride = ({ onClose }) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [updates, setUpdates] = useState({}); // { id: newCurrentStock }

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const res = await getIngredients();
      setIngredients(res.data || []);
      
      const initialUpdates = {};
      (res.data || []).forEach(ing => {
        initialUpdates[ing._id] = ing.currentStock;
      });
      setUpdates(initialUpdates);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (id, value) => {
    setUpdates({ ...updates, [id]: parseFloat(value) || 0 });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = Object.keys(updates).map(id => ({
        ingredientId: id,
        currentStock: updates[id]
      }));
      // Filter out unchanged ones if needed, but for daily log, sending all is fine
      await logStockUsage(payload);
      onClose(); // close modal on success
    } catch (error) {
      alert('Failed to log stock');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              Daily Stock Override
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Log physical inventory at the end of the shift.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
          {loading ? (
             <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>
          ) : ingredients.length === 0 ? (
             <div className="text-center p-10">
               <PackageSearch className="w-10 h-10 text-slate-300 mx-auto mb-3" />
               <p className="text-slate-500 font-medium">No ingredients found. Have the owner add them first.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ingredients.map(ing => (
                <div key={ing._id} className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-slate-800">{ing.name}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      updates[ing._id] < ing.lowStockThreshold ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {updates[ing._id] < ing.lowStockThreshold ? 'Low' : 'OK'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={updates[ing._id] ?? 0}
                      onChange={(e) => handleStockChange(ing._id, e.target.value)}
                      className="flex-1 w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700" 
                      min="0"
                      step="0.1"
                    />
                    <span className="text-slate-500 font-medium w-6">{ing.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
             Cancel
           </button>
           <button onClick={handleSave} disabled={isSaving || ingredients.length === 0} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm">
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             Submit Daily Log
           </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverride;
