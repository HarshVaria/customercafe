import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordVisit } from '../services/api';
import { 
  Store, 
  ArrowRight, 
  Info, 
  Zap, 
  Smartphone, 
  ShieldCheck,
  Hash
} from 'lucide-react';

const TableNumber = () => {
  const [tableNumber, setTableNumber] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Record a visit as soon as the app loads on a customer's phone
    const hasRecorded = sessionStorage.getItem('visitRecorded');
    if (!hasRecorded) {
      recordVisit();
      sessionStorage.setItem('visitRecorded', 'true');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tableNumber.trim()) {
      localStorage.setItem('tableNumber', tableNumber.trim());
      navigate('/menu');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Soft Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full blur-3xl animate-pulse-slow mix-blend-multiply"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-sky-300/20 rounded-full blur-3xl animate-pulse-slow mix-blend-multiply animation-delay-2000"></div>
      </div>

      {/* Main Card - Reduced padding from p-10 to p-8 to match Login */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 max-w-md w-full border border-white/50 z-10 animate-fade-in">
        
        {/* Brand & Logo Section */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
            <Store className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
            Brew & Bites
          </h1>
          <p className="text-sm text-slate-500 font-medium">Digital Menu & Ordering</p>
          
          <div className="mt-3 inline-flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">System Online</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700 text-center">
              Enter your table number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-slate-300" />
              </div>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="00"
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-2xl font-black text-indigo-900 placeholder-slate-200 transition-all duration-300 text-center"
                required
                autoFocus
                maxLength={3}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!tableNumber.trim()}
            className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>View Menu</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Info Box - Tightened padding and text size */}
        <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed font-medium">
            Find the number printed on the QR code stand at your table to begin ordering.
          </div>
        </div>

        {/* Value Props - Tightened margins and icon sizes */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5">
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-indigo-50 transition-colors">
              <Zap className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Fast</span>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-indigo-50 transition-colors">
              <Smartphone className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Contactless</span>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-indigo-50 transition-colors">
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Secure</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center w-full">
        <p className="text-xs font-semibold text-slate-400">Powered by Brew & Bites Tech</p>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default TableNumber;