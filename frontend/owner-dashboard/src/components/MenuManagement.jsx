import { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability, getIngredients } from '../services/api';
import { 
  UtensilsCrossed, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Clock, 
  Image as ImageIcon,
  Tag,
  Loader2,
  Save,
  Minus
} from 'lucide-react';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [ingredientsDB, setIngredientsDB] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Beverages',
    image: '',
    preparationTime: 15,
    available: true,
    recipe: [] // { ingredient: id, amount: 0, unit: 'g' } purely for UI tracking initially
  });

  const categories = ['Beverages', 'Snacks', 'Main Course', 'Breakfast', 'Desserts'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuRes, ingRes] = await Promise.all([
        getMenuItems(),
        getIngredients().catch(() => ({ data: [] }))
      ]);
      setMenuItems(menuRes.data || []);
      setIngredientsDB(ingRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Clean up recipe array for backend submission structure
      const cleanedRecipe = formData.recipe.map(r => ({
        ingredient: r.ingredient,
        amount: parseFloat(r.amount)
      }));

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('price', parseFloat(formData.price));
      formPayload.append('category', formData.category);
      formPayload.append('preparationTime', parseInt(formData.preparationTime));
      formPayload.append('available', formData.available);
      formPayload.append('recipe', JSON.stringify(cleanedRecipe));

      if (formData.image instanceof File) {
        formPayload.append('image', formData.image);
      } else if (typeof formData.image === 'string' && formData.image !== '') {
        formPayload.append('image', formData.image); // keep existing URL
      }

      if (editingItem) {
        await updateMenuItem(editingItem._id, formPayload);
      } else {
        await createMenuItem(formPayload);
      }

      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    
    // Map existing recipe back to UI structure
    const mappedRecipe = (item.recipe || []).map(r => {
      // Find the ingredient to get the correct unit
      const matchedIng = ingredientsDB.find(dbIng => dbIng._id === (typeof r.ingredient === 'object' ? r.ingredient._id : r.ingredient));
      return {
        ingredient: typeof r.ingredient === 'object' ? r.ingredient._id : r.ingredient,
        amount: r.amount,
        unit: matchedIng ? matchedIng.unit : 'unit'
      };
    });

    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || '',
      preparationTime: item.preparationTime,
      available: item.available,
      recipe: mappedRecipe
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMenuItem(id);
        loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete menu item');
      }
    }
  };

  const handleToggleAvailability = async (id) => {
    setMenuItems(items => items.map(item => 
      item._id === id ? { ...item, available: !item.available } : item
    ));
    try {
      await toggleMenuItemAvailability(id);
    } catch (error) {
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Beverages',
      image: '',
      preparationTime: 15,
      available: true,
      recipe: []
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const addRecipeRow = () => {
    if (ingredientsDB.length === 0) return;
    setFormData({
      ...formData,
      recipe: [...formData.recipe, { ingredient: ingredientsDB[0]._id, amount: 0, unit: ingredientsDB[0].unit }]
    });
  };

  const updateRecipeRow = (index, field, value) => {
    const updated = [...formData.recipe];
    if (field === 'ingredient') {
      const selected = ingredientsDB.find(ing => ing._id === value);
      updated[index].ingredient = value;
      updated[index].unit = selected ? selected.unit : 'unit';
    } else {
      updated[index][field] = value;
    }
    setFormData({ ...formData, recipe: updated });
  };

  const removeRecipeRow = (index) => {
    const updated = [...formData.recipe];
    updated.splice(index, 1);
    setFormData({ ...formData, recipe: updated });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-indigo-600" />
            Menu & Recipe Builder
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage items and map them to inventory ingredients</p>
        </div>
        <button
          onClick={() => showForm ? resetForm() : setShowForm(true)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            showForm 
              ? 'bg-white border text-slate-700 hover:bg-slate-50' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel Form' : 'Add New Item'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-indigo-100 rounded-2xl shadow-sm p-6 sm:p-8 animate-slide-down relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            {editingItem ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
            {editingItem ? 'Edit Menu Item' : 'Create New Menu Item'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Preparation (mins) *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="2"
                  required
                />
              </div>
              
              {/* Recipe Mapping Box */}
              <div className="md:col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-800">Recipe Inventory Mapping</h4>
                  <button type="button" onClick={addRecipeRow} className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Plus className="w-3 h-3"/> Add Ingredient
                  </button>
                </div>
                {formData.recipe.length === 0 ? (
                  <p className="text-xs text-slate-500">No ingredients mapped. Adding mapped ingredients will auto-deduct inventory later.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.recipe.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <select 
                          value={row.ingredient} 
                          onChange={e => updateRecipeRow(idx, 'ingredient', e.target.value)}
                          className="flex-1 p-2 rounded-lg border text-sm"
                        >
                          {ingredientsDB.map(ing => <option key={ing._id} value={ing._id}>{ing.name}</option>)}
                        </select>
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          min="0" 
                          step="0.1"
                          value={row.amount} 
                          onChange={e => updateRecipeRow(idx, 'amount', e.target.value)}
                          className="w-24 p-2 rounded-lg border text-sm text-center"
                        />
                        <span className="text-xs font-bold text-slate-500 w-8">{row.unit}</span>
                        <button type="button" onClick={() => removeRecipeRow(idx)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                          <Minus className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Image Upload (S3)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {typeof formData.image === 'string' && formData.image && (
                    <p className="text-xs text-slate-500 mt-2">Current image: <a href={formData.image} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View</a></p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={resetForm} className="px-5 py-2 hover:bg-slate-50 rounded-xl font-semibold">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm flex items-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Menus remains exactly similar structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menuItems.map(item => (
          <div key={item._id} className="group bg-white rounded-2xl border hover:shadow-xl transition-all">
            <div className="relative h-48 bg-slate-100 overflow-hidden">
               {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-12 h-12" /></div>}
               <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-lg text-xs font-bold text-slate-700">{item.category}</div>
            </div>
            <div className="p-4 flex flex-col h-auto">
              <div className="flex justify-between font-bold text-slate-900">
                 <h3 className="line-clamp-1">{item.name}</h3>
                 <span className="text-indigo-600">₹{item.price}</span>
              </div>
              <p className="text-sm text-slate-500 my-2 line-clamp-2">{item.description}</p>
              
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                 <button onClick={() => handleToggleAvailability(item._id)} className={`text-xs font-bold px-2 py-1 rounded-full ${item.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.available ? 'Available' : 'Hidden'}
                 </button>
                 <div className="flex gap-2">
                   <button onClick={() => handleEdit(item)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                   <button onClick={() => handleDelete(item._id, item.name)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default MenuManagement;