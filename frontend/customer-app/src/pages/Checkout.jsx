import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder } from '../services/api';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Clock, 
  FileText, 
  Receipt, 
  UtensilsCrossed, 
  Loader2, 
  Info,
  ChevronRight,
  Store
} from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = location.state || { cart: [] };
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const tableNumber = localStorage.getItem('tableNumber');

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const subtotal = getSubtotal();
  const gst = subtotal * 0.05;
  const grandTotal = subtotal + gst;
  const estimatedPrepTime = cart.length > 0 ? Math.max(...cart.map(item => item.preparationTime || 15)) : 0;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setLoading(true);

    const orderData = {
      tableNumber,
      items: cart.map(item => ({
        menuItem: item._id,
        quantity: item.quantity
      })),
      specialInstructions
    };

    try {
      const response = await createOrder(orderData);
      
      if (response.success) {
        navigate('/order-success', { 
          state: { 
            orderNumber: response.data.orderNumber,
            orderId: response.data._id
          } 
        });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // EMPTY STATE UI
  // ----------------------------------------
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 text-center max-w-sm w-full border border-slate-100 flex flex-col items-center animate-fade-in">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 text-sm">Looks like you haven't added any items yet. Let's fix that!</p>
          <button
            onClick={() => navigate('/menu')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <UtensilsCrossed className="w-5 h-5" />
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // CHECKOUT UI
  // ----------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:py-10 font-sans animate-fade-in">
      <div className="container mx-auto max-w-5xl">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-200/50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Menu</span>
          </button>
          
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full shadow-sm">
            <Store className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-900">Table {tableNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Items & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items List */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Review Order <span className="text-slate-400 font-normal ml-1">({cart.length} items)</span>
                </h2>
              </div>
              
              <div className="divide-y divide-slate-100">
                {cart.map(item => (
                  <div key={item._id} className="p-5 flex flex-col sm:flex-row gap-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="shrink-0">
                      <img
                        src={item.image || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shadow-sm border border-slate-100"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight mb-1">{item.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold">
                              {item.category}
                            </span>
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {item.preparationTime}m
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                          <p className="text-sm font-medium text-slate-500 mt-0.5">₹{item.price} each</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 text-sm font-bold px-3 py-1 rounded-lg">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-200 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-50 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Add cooking requests</h2>
              </div>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., Extra spicy, sauce on the side, no onions..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-sm"
                rows="3"
              />
            </div>
          </div>

          {/* Right Column: Order Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Bill Details</h2>
              </div>
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Item Total</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5%)</span>
                  <span className="font-semibold text-slate-900">₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="block text-sm font-semibold text-slate-500">To Pay</span>
                      <span className="block text-2xl font-bold text-slate-900">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex gap-3 items-start">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Your order will be sent to the kitchen instantly. Estimated prep time is <span className="font-bold">~{estimatedPrepTime} mins</span>.
                </p>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                    </span>
                  )}
                  <span className="text-sm">{loading ? 'Processing...' : 'Place Order'}</span>
                </div>
                {!loading && (
                  <div className="flex items-center gap-1">
                    <span>₹{grandTotal.toFixed(2)}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                )}
              </button>
            </div>
          </div>
          
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

export default Checkout;