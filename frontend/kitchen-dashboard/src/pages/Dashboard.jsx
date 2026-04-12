import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../services/api';
import InventoryOverride from '../components/InventoryOverride';
import { 
  ChefHat, 
  LogOut, 
  RefreshCcw, 
  Clock, 
  AlertCircle, 
  UtensilsCrossed, 
  CheckCircle2,
  Receipt,
  Loader2,
  Scale
} from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pending');
  const navigate = useNavigate();

  const statuses = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];

  useEffect(() => {
    loadOrders();
    // Poll every 5 seconds for new orders
    const interval = setInterval(() => loadOrders(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async (showRefreshIndicator = true) => {
    try {
      if (showRefreshIndicator && !loading) setIsRefreshing(true);
      const response = await getOrders({});
      setAllOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.message === 'Not authorized to access this route') {
        handleLogout();
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    // Optimistic UI update for immediate feedback (crucial for fast kitchens)
    setAllOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );

    try {
      await updateOrderStatus(orderId, newStatus);
      // Background sync
      loadOrders(false);
    } catch (error) {
      console.error('Error updating order:', error);
      // Revert if failed (in a real app, use a toast notification here)
      loadOrders(false);
    }
  };

  const filteredOrders = filterStatus === 'All'
    ? allOrders
    : allOrders.filter(order => order.status === filterStatus);

  const getStatusCount = (status) => {
    return allOrders.filter(order => order.status === status).length;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Syncing kitchen display...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
      
      {/* Header Section */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Kitchen Display</h1>
              <p className="text-sm text-slate-500 font-medium">
                Live Order Queue • {allOrders.length} Total Active
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <button
              onClick={() => loadOrders(true)}
              disabled={isRefreshing}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            <button
              onClick={() => setShowOverride(true)}
              className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
               <Scale className="w-4 h-4" />
               <span className="hidden sm:inline">Check Stock</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex overflow-x-auto hide-scrollbar space-x-2 pb-2">
          {statuses.map(status => {
            const isActive = filterStatus === status;
            const count = getStatusCount(status);
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {status}
                {count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <div className="w-px h-8 bg-slate-200 mx-1 self-center hidden sm:block"></div>
          <button
            onClick={() => setFilterStatus('All')}
            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all border ${
              filterStatus === 'All'
                ? 'bg-slate-800 text-white border-slate-800 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            All Orders
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filterStatus === 'All' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {allOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
        {filteredOrders.map(order => (
          <div 
            key={order._id} 
            className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Ticket Header */}
            <div className={`p-4 border-b ${
              order.status === 'Pending' ? 'bg-amber-50 border-amber-100' :
              order.status === 'Preparing' ? 'bg-blue-50 border-blue-100' :
              order.status === 'Ready' ? 'bg-emerald-50 border-emerald-100' :
              order.status === 'Cancelled' ? 'bg-red-50 border-red-100' :
              'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-500">#{order.orderNumber}</span>
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-800 text-sm">Table {order.tableNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mt-2">
                <Clock className="w-3.5 h-3.5" />
                Ordered at {formatTime(order.createdAt)}
              </div>
            </div>

            {/* Ticket Items */}
            <div className="p-4 flex-1 bg-white">
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item._id} className="flex items-start justify-between gap-3 group">
                    <div className="flex gap-3">
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-sm shrink-0 h-fit">
                        {item.quantity}x
                      </span>
                      <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions (If any) */}
            {order.specialInstructions && (
              <div className="px-4 pb-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">Notes</p>
                    <p className="text-sm font-medium text-amber-900 leading-tight">
                      {order.specialInstructions}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2">
                {['Pending', 'Preparing', 'Ready'].map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(order._id, status)}
                    disabled={order.status === status || order.status === 'Served' || order.status === 'Cancelled'}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      order.status === status
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              
              {/* Served / Cancelled toggle options (Secondary actions) */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                   onClick={() => handleStatusUpdate(order._id, 'Served')}
                   disabled={order.status === 'Served' || order.status === 'Cancelled'}
                   className="py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Served
                </button>
                <button
                   onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                   disabled={order.status === 'Cancelled' || order.status === 'Served'}
                   className="py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 mt-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-6">
            <Receipt className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            No active orders
          </h2>
          <p className="text-slate-500 mb-6 font-medium text-center max-w-sm">
            {filterStatus === 'All' 
              ? "The kitchen is clear. Waiting for new orders to arrive." 
              : `There are currently no orders in the "${filterStatus}" queue.`}
          </p>
          <button
            onClick={() => loadOrders(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Refresh Queue
          </button>
        </div>
      )}

      {showOverride && <InventoryOverride onClose={() => setShowOverride(false)} />}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;