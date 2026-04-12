const Order = require('../models/Order');
const MenuItem = require('../models/Menu');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Kitchen/Owner)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, tableNumber, startDate, endDate } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (tableNumber) filter.tableNumber = tableNumber;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Public
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, items, specialInstructions } = req.body;

    // Validate items and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (let item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item not found: ${item.menuItem}`
        });
      }

      if (!menuItem.available) {
        return res.status(400).json({
          success: false,
          message: `${menuItem.name} is currently unavailable`
        });
      }

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });

      totalPrice += menuItem.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      tableNumber,
      items: orderItems,
      totalPrice,
      specialInstructions
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Kitchen/Owner)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;

    // Deduct inventory when order is Served
    if (status === 'Served' && !order.ingredientsDeducted) {
      const Ingredient = require('../models/Ingredient');
      
      for (const item of order.items) {
        const menuItem = await MenuItem.findById(item.menuItem);
        if (menuItem && menuItem.recipe && menuItem.recipe.length > 0) {
          for (const recipeItem of menuItem.recipe) {
            const deductionAmount = recipeItem.amount * item.quantity;
            await Ingredient.findByIdAndUpdate(
              recipeItem.ingredient,
              { $inc: { currentStock: -deductionAmount } }
            );
          }
        }
      }
      order.ingredientsDeducted = true;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get orders by table number
// @route   GET /api/orders/table/:tableNumber
// @access  Public
exports.getOrdersByTable = async (req, res) => {
  try {
    const orders = await Order.find({ 
      tableNumber: req.params.tableNumber,
      status: { $ne: 'Served' }
    }).populate('items.menuItem').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};