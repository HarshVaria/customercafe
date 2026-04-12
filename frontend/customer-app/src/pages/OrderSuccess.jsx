import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Info, 
  Home, 
  Plus, 
  Sparkles
} from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderNumber } = location.state || {};

  useEffect(() => {
    if (!orderNumber) {
      navigate('/');
    }
  }, [orderNumber, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-300/20 rounded-full blur-3xl animate-pulse-slow mix-blend-multiply"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-indigo-300/20 rounded-full blur-3xl animate-pulse-slow mix-blend-multiply animation-delay-2000"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 max-w-md w-full border border-white z-10 animate-slide-up">
        
        {/* Success Animation - Compacted */}
        <div className="relative mb-5 flex justify-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center animate-scale-up relative">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-75"></div>
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 z-10">
              <Check className="w-6 h-6 text-white stroke-[3]" />
            </div>
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs text-slate-500 font-medium px-4">
            Our kitchen team has received your order and is starting preparation.
          </p>
        </div>

        {/* Order Number Display - Compacted */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border border-slate-100"></div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white rounded-full border border-slate-100"></div>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Your Order Number</p>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            {orderNumber}
          </p>
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-semibold">
            <Info className="w-3 h-3" />
            Keep this handy for the staff
          </div>
        </div>

        {/* Action Buttons - Placed Side-by-Side to save vertical space */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/menu')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Order More
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
          >
            <Home className="w-4 h-4 text-slate-400" />
            Home
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;