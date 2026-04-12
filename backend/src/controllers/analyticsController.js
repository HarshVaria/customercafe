const Order = require('../models/Order');
const MenuItem = require('../models/Menu');

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private (Owner)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { status: { $ne: 'Cancelled' } };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter);

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get popular items
// @route   GET /api/analytics/popular-items
// @access  Private (Owner)
exports.getPopularItems = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });

    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemName = item.name;
        if (itemCounts[itemName]) {
          itemCounts[itemName].quantity += item.quantity;
          itemCounts[itemName].revenue += item.price * item.quantity;
        } else {
          itemCounts[itemName] = {
            name: itemName,
            quantity: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });
    });

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: popularItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get peak hours
// @route   GET /api/analytics/peak-hours
// @access  Private (Owner)
exports.getPeakHours = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });

    const hourCounts = Array(24).fill(0);
    orders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour]++;
    });

    const peakHours = hourCounts.map((count, hour) => ({
      hour: `${hour}:00`,
      orders: count
    })).filter(item => item.orders > 0);

    res.status(200).json({
      success: true,
      data: peakHours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get table-wise orders
// @route   GET /api/analytics/table-orders
// @access  Private (Owner)
exports.getTableOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'Cancelled' } });

    const tableStats = {};
    orders.forEach(order => {
      const table = order.tableNumber;
      if (tableStats[table]) {
        tableStats[table].orders++;
        tableStats[table].revenue += order.totalPrice;
      } else {
        tableStats[table] = {
          tableNumber: table,
          orders: 1,
          revenue: order.totalPrice
        };
      }
    });

    const tableData = Object.values(tableStats).sort((a, b) => b.revenue - a.revenue);

    res.status(200).json({
      success: true,
      data: tableData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get ingredient consumption and forecast
// @route   GET /api/analytics/ingredients
// @access  Private (Owner)
exports.getIngredientUsage = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);

    // Only look at Served orders 
    const orders = await Order.find({ 
      status: 'Served',
      createdAt: { $gte: pastDate }
    });

    const Ingredient = require('../models/Ingredient');
    const allIngredients = await Ingredient.find({});
    
    // Initialize usage tracking map
    const usageMap = {};
    for (const ing of allIngredients) {
      usageMap[ing._id.toString()] = {
        name: ing.name,
        unit: ing.unit,
        currentStock: ing.currentStock,
        threshold: ing.lowStockThreshold,
        consumedAmount: 0
      };
    }

    // Tally up consumption from orders
    for (const order of orders) {
      if (order.ingredientsDeducted) {
        // If they were deducted we can calculate how much using the recipe 
        for (const item of order.items) {
          const menuItem = await MenuItem.findById(item.menuItem);
          if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
            for (const rec of menuItem.recipe) {
              const ingId = rec.ingredient.toString();
              if (usageMap[ingId]) {
                usageMap[ingId].consumedAmount += (rec.amount * item.quantity);
              }
            }
          }
        }
      }
    }

    // Project usage for the next 7 days based on the daily average of the selected period
    // e.g. consumedAmount / 30 = daily average -> multiply by 7 = next week forecast
    const analyticsData = Object.values(usageMap).map(ing => {
      const dailyAverage = ing.consumedAmount / days;
      const weeklyForecast = dailyAverage * 7;
      const status = ing.currentStock < weeklyForecast 
        ? 'critical_need' 
        : (ing.currentStock < ing.threshold ? 'low_stock' : 'healthy');

      return {
        ...ing,
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        weeklyForecast: parseFloat(weeklyForecast.toFixed(2)),
        status
      };
    });

    // Sort by most critical first
    const sortedData = analyticsData.sort((a, b) => {
      if (a.status === 'critical_need') return -1;
      if (b.status === 'critical_need') return 1;
      return a.currentStock - b.currentStock;
    });

    res.status(200).json({
      success: true,
      timeframeDays: parseInt(days),
      data: sortedData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
