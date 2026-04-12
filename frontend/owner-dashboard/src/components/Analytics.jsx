import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Legend,
  Filler
} from 'chart.js';
import { getRevenueAnalytics, getPopularItems, getPeakHours, getTableOrders, getIngredientAnalytics } from '../services/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  BarChart3, 
  Activity, 
  PieChart, 
  Trophy, 
  Trophy, 
  Utensils,
  Loader2,
  DollarSign,
  PackageSearch
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global Chart settings for a modern look
ChartJS.defaults.font.family = 'system-ui, -apple-system, sans-serif';
ChartJS.defaults.color = '#64748b';

const Analytics = () => {
  const [revenue, setRevenue] = useState(null);
  const [popularItems, setPopularItems] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [tableOrders, setTableOrders] = useState([]);
  const [ingredientStats, setIngredientStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [revenueData, itemsData, hoursData, tablesData, ingredientsData] = await Promise.all([
        getRevenueAnalytics(),
        getPopularItems(),
        getPeakHours(),
        getTableOrders(),
        getIngredientAnalytics(30)
      ]);

      setRevenue(revenueData.data);
      setPopularItems(itemsData.data || []);
      setPeakHours(hoursData.data || []);
      setTableOrders(tablesData.data || []);
      setIngredientStats(ingredientsData.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">Processing analytics...</p>
      </div>
    );
  }

  // Modern Chart Options Template
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true, boxWidth: 8, padding: 20 }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#f8fafc',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      }
    },
  };

  const axisOptions = {
    ...baseChartOptions,
    scales: {
      x: {
        grid: { display: false },
        border: { display: false }
      },
      y: {
        border: { display: false },
        grid: { color: '#f1f5f9', drawTicks: false }
      }
    }
  };

  // Popular Items Chart Data
  const popularItemsChart = {
    labels: popularItems.slice(0, 10).map(item => item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: popularItems.slice(0, 10).map(item => item.quantity),
        backgroundColor: '#6366f1', // Indigo 500
        borderRadius: 6,
        barThickness: 'flex',
        maxBarThickness: 40,
      },
    ],
  };

  // Peak Hours Chart Data
  const peakHoursChart = {
    labels: peakHours.map(item => item.hour),
    datasets: [
      {
        label: 'Orders per Hour',
        data: peakHours.map(item => item.orders),
        fill: true,
        backgroundColor: 'rgba(56, 189, 248, 0.1)', // Sky 400 transparent
        borderColor: '#0ea5e9', // Sky 500
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#0ea5e9',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Ingredient Forecast Chart Data
  const ingredientForecastChart = {
    labels: ingredientStats.slice(0, 10).map(item => item.name),
    datasets: [
      {
        label: 'Current Stock',
        data: ingredientStats.slice(0, 10).map(item => item.currentStock),
        backgroundColor: '#cbd5e1', // Slate 300
        borderRadius: 4,
      },
      {
        label: 'Predicted 7-Day Need',
        data: ingredientStats.slice(0, 10).map(item => item.weeklyForecast),
        backgroundColor: '#f43f5e', // Rose 500
        borderRadius: 4,
      }
    ],
  };

  // Table Revenue Chart Data
  const tableRevenueChart = {
    labels: tableOrders.slice(0, 10).map(item => `Table ${item.tableNumber}`),
    datasets: [
      {
        data: tableOrders.slice(0, 10).map(item => item.revenue),
        backgroundColor: [
          '#6366f1', // Indigo
          '#8b5cf6', // Violet
          '#ec4899', // Pink
          '#f43f5e', // Rose
          '#f97316', // Orange
          '#eab308', // Yellow
          '#22c55e', // Green
          '#10b981', // Emerald
          '#14b8a6', // Teal
          '#0ea5e9', // Sky
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Dashboard Analytics
        </h2>
        <p className="text-sm text-slate-500 mt-1">Overview of your cafe's performance and sales metrics.</p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-emerald-200 transition-colors">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Revenue</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              ₹{revenue?.totalRevenue?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-blue-200 transition-colors">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              {revenue?.totalOrders?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {/* Avg Value Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex items-center justify-between group hover:border-indigo-200 transition-colors">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Avg Order Value</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              ₹{revenue?.averageOrderValue?.toLocaleString() || 0}
            </h3>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Popular Items Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">Most Popular Items</h3>
          </div>
          <div className="h-[300px] w-full">
            {popularItems.length > 0 ? (
              <Bar data={popularItemsChart} options={axisOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Utensils className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Not enough data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-sky-500" />
            <h3 className="text-lg font-bold text-slate-900">Peak Ordering Hours</h3>
          </div>
          <div className="h-[300px] w-full">
            {peakHours.length > 0 ? (
              <Line data={peakHoursChart} options={axisOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Not enough data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Table Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-bold text-slate-900">Table-wise Revenue Distribution</h3>
          </div>
          <div className="h-[300px] w-full flex justify-center">
            {tableOrders.length > 0 ? (
              <Doughnut data={tableRevenueChart} options={{...baseChartOptions, cutout: '70%'}} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <PieChart className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Not enough data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Ingredient Forecasting Chart */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <PackageSearch className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900">Inventory Supply vs 7-Day Projected Demand</h3>
          </div>
          <div className="h-[300px] w-full">
            {ingredientStats.length > 0 ? (
              <Bar data={ingredientForecastChart} options={axisOptions} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <PackageSearch className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Not enough ingredient usage data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Tables List */}
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Top Performing Tables</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {tableOrders.slice(0, 5).map((table, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-sm ${
                    index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                    index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-white text-slate-600 border border-slate-200'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Table {table.tableNumber}</p>
                    <p className="text-xs font-medium text-slate-500">{table.orders} total orders</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-emerald-600">₹{table.revenue.toLocaleString()}</p>
              </div>
            ))}
            {tableOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                <Trophy className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No table data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Items Table List */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-slate-900">Detailed Item Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quantity Sold</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {popularItems.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{item.quantity}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 text-right">₹{item.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {popularItems.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm font-medium">No detailed item data available</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Analytics;