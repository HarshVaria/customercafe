import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenuItems } from '../services/api';
import { 
  Search, 
  ShoppingBag, 
  Store, 
  Clock, 
  Plus, 
  Minus, 
  LayoutGrid, 
  Coffee, 
  Cookie, 
  UtensilsCrossed, 
  Sunrise, 
  Cake, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = ['All', 'Beverages', 'Snacks', 'Main Course', 'Breakfast', 'Desserts'];

  const categoryIcons = {
    'All': LayoutGrid,
    'Beverages': Coffee,
    'Snacks': Cookie,
    'Main Course': UtensilsCrossed,
    'Breakfast': Sunrise,
    'Desserts': Cake
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    let items = menuItems;
    
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredItems(items);
  }, [selectedCategory, menuItems, searchQuery]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await getMenuItems();
      setMenuItems(response.data || []);
      setFilteredItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      // Fallback for errors handled natively
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem._id === item._id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem._id === item._id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem._id === itemId);
    
    if (existingItem.quantity === 1) {
      setCart(cart.filter(cartItem => cartItem._id !== itemId));
    } else {
      setCart(cart.map(cartItem =>
        cartItem._id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout', { state: { cart } });
  };

  const tableNumber = localStorage.getItem('tableNumber') || 'Guest';

  // ----------------------------------------
  // LOADER STATE
  // ----------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading delicious menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* ---------------------------------------- */}
      {/* CONSOLIDATED STICKY HEADER               */}
      {/* ---------------------------------------- */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        
        {/* Top Bar: Brand & Table */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  Brew & Bites
                </h1>
                <p className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Table {tableNumber}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCheckout}
              className="relative p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center text-[10px] font-bold px-1.5 border-2 border-white animate-fade-in">
                  {getTotalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Middle Bar: Search */}
        <div className="container mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for your cravings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Bottom Bar: Categories scroll */}
        <div className="container mx-auto px-4 pb-3 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2">
            {categories.map(category => {
              const Icon = categoryIcons[category];
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------------------------------- */}
      {/* MENU GRID                                */}
      {/* ---------------------------------------- */}
      <div className="container mx-auto px-4 py-6 pb-28">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map(item => {
              const cartItem = cart.find(c => c._id === item._id);
              
              return (
                <div key={item._id} className="group flex flex-col bg-white rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300">
                  
                  {/* Image Container */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image || 'https://via.placeholder.com/400x300'}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!item.available ? 'grayscale opacity-50' : ''}`}
                    />
                    
                    {!item.available && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
                        <span className="bg-white/90 text-slate-800 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm backdrop-blur-md">
                          Sold Out
                        </span>
                      </div>
                    )}
                    
                    {/* Category Overlay */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                      {item.category}
                    </div>
                  </div>
                  
                  {/* Content Container */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-base sm:text-lg font-bold text-indigo-600 shrink-0">
                        ₹{item.price}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center text-xs font-medium text-slate-500 mb-4 gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.preparationTime} mins prep
                    </div>

                    {/* Action Area */}
                    <div className="mt-auto">
                      {item.available ? (
                        cartItem ? (
                          // Quantity Controller
                          <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-1 h-11">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="w-9 h-9 flex items-center justify-center bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-base font-bold text-indigo-900 w-8 text-center">
                              {cartItem.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-9 h-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // Add to Cart Button
                          <button
                            onClick={() => addToCart(item)}
                            className="w-full h-11 bg-white border-2 border-slate-100 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 group-hover:border-indigo-600 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                          >
                            <Plus className="w-4 h-4" />
                            Add to Cart
                          </button>
                        )
                      ) : (
                        // Disabled Button
                        <button
                          disabled
                          className="w-full h-11 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed text-sm"
                        >
                          Currently Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ---------------------------------------- */}
      {/* FLOATING CART SUMMARY                    */}
      {/* ---------------------------------------- */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-slide-up">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 mb-0.5">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
              </span>
              <span className="text-lg font-bold text-white leading-none">
                ₹{getTotalPrice().toLocaleString()}
              </span>
            </div>
            
            <button
              onClick={handleCheckout}
              className="bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 group"
            >
              Checkout
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
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
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes slide-up {
          from { transform: translateY(120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Menu;