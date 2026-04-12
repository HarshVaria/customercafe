import { useState, useEffect } from 'react';
import { getOrders } from '../services/api';
import { 
  ShoppingBag, 
  RefreshCcw, 
  Search, 
  Inbox, 
  TrendingUp, 
  Receipt, 
  CheckCircle2,
  Loader2,
  Clock
} from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTable, setSearchTable] = useState('');

  const statuses = ['All', 'Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoading(true);
      
      const response = await getOrders({});
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      // In a real app, use a toast notification here instead of alert
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesTable = searchTable === '' || order.tableNumber.toString().includes(searchTable);
    return matchesStatus && matchesTable;
  });

  const validOrders = filteredOrders.filter(order => order.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  const avgOrderValue = validOrders.length > 0 ? (totalRevenue / validOrders.length).toFixed(2) : 0;
  const servedOrdersCount = filteredOrders.filter(o => o.status === 'Served').length;

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'Preparing': 'bg-blue-50 text-blue-700 border-blue-200',
      'Ready': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Served': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Cancelled': 'bg-slate-100 text-slate-600 border-slate-200 line-through decoration-slate-400'
    };
    
    return `px-2.5 py-1 rounded-md text-xs font-semibold border ${styles[status] || styles['Pending']}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Fetching latest orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            Order History
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track, filter, and analyze all cafe orders</p>
        </div>
        <button
          onClick={() => loadOrders(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Total Orders</p>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{filteredOrders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Revenue</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹{totalRevenue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Avg Value</p>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">₹{avgOrderValue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Served</p>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{servedOrdersCount}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
        <div className="flex overflow-x-auto hide-scrollbar space-x-1 p-1">
          {statuses.map(status => {
            const count = status === 'All' ? orders.length : orders.filter(o => o.status === status).length;
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
                }`}
              >
                {status}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative p-1 shrink-0">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search table..."
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            className="w-full md:w-48 pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Table</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => {
                  const { date, time } = formatDate(order.createdAt);
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold text-sm border border-indigo-100">
                          {order.tableNumber}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-slate-600 flex justify-between gap-4">
                              <span className="truncate">{item.name}</span>
                              <span className="text-slate-400 font-medium shrink-0">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-bold text-slate-900">₹{order.totalPrice}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={getStatusBadge(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {time}
                          </span>
                          <span className="text-xs text-slate-400 pl-5">{date}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No orders found</h3>
          <p className="text-slate-500 text-sm text-center max-w-sm">
            {searchTable 
              ? `We couldn't find any orders for table "${searchTable}". Try clearing your search.` 
              : `There are currently no orders in the "${filterStatus}" category.`}
          </p>
          {searchTable && (
            <button 
              onClick={() => setSearchTable('')}
              className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;