import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import FoodItem from '../models/FoodItem.js';

const getNextQueueToken = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const todayCount = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
    queueToken: { $exists: true, $ne: null },
  });

  return todayCount + 1;
};

const buildCustomerNotification = (status, queueToken, rejectionReason) => {
  const tokenLabel = queueToken ? `Token ${queueToken}` : 'Your token';

  switch (status) {
    case 'awaiting_approval':
      return 'Order submitted. Waiting for admin approval.';
    case 'pending':
      return queueToken
        ? `Order approved. ${tokenLabel} has been assigned.`
        : 'Order approved. Token will be assigned shortly.';
    case 'preparing':
      return `${tokenLabel} is being prepared`;
    case 'ready':
      return `${tokenLabel} is ready for pickup`;
    case 'served':
    case 'completed':
      return `${tokenLabel} has been served`;
    case 'cancelled':
      return `${tokenLabel} was cancelled`;
    case 'rejected':
      return rejectionReason
        ? `Order rejected: ${rejectionReason}`
        : 'Order was rejected by admin';
    default:
      return 'Order submitted. Waiting for admin approval.';
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { customerId, items, detectedMood, notes } = req.body;
    const isUserOrder = req.user?.role === 'user';
    const isPublicOrder = !req.user;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!isUserOrder && !customerId) {
      return res.status(400).json({ message: 'Customer is required for staff/admin orders' });
    }

    // Verify customer exists when placing staff/admin order
    if (customerId) {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
    }

    // Calculate total and validate items
    let totalAmount = 0;
    const orderItems = [];
    for (const item of items) {
      const foodItem = await FoodItem.findById(item.foodItemId);
      if (!foodItem) {
        return res.status(404).json({ 
          message: `Food item ${item.foodItemId} not found` 
        });
      }

      if (!foodItem.isAvailable) {
        return res.status(400).json({ 
          message: `${foodItem.name} is not available` 
        });
      }

      const itemTotal = foodItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        foodItem: foodItem._id,
        quantity: item.quantity,
        price: foodItem.price,
      });
    }

    const order = await Order.create({
      customer: customerId || undefined,
      userAccount: isUserOrder ? req.user.id : undefined,
      items: orderItems,
      totalAmount,
      customerNotification: 'Order submitted. Waiting for admin approval.',
      status: 'awaiting_approval',
      detectedMood,
      notes,
      servedBy: req.user?.id,
      source: isUserOrder ? 'user' : isPublicOrder ? 'guest' : 'staff',
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone email')
      .populate('userAccount', 'name email')
      .populate('items.foodItem')
      .populate('servedBy', 'name');

    res.status(201).json({
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { status, customerId } = req.query;

    const filter = {};
    if (req.user?.role === 'user') {
      filter.userAccount = req.user.id;
    }
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;

    const orders = await Order.find(filter)
      .populate('customer', 'name phone email')
      .populate('userAccount', 'name email')
      .populate('items.foodItem')
      .populate('servedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('customer', 'name phone email')
      .populate('userAccount', 'name email')
      .populate('items.foodItem')
      .populate('servedBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user?.role === 'user' && order.userAccount?._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    if (req.user?.role === 'user') {
      return res.status(403).json({ message: 'Users cannot update order status' });
    }

    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const isAdmin = req.user?.role === 'admin';

    const validStatuses = [
      'awaiting_approval',
      'pending',
      'preparing',
      'ready',
      'served',
      'completed',
      'cancelled',
      'rejected',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const existingOrder = await Order.findById(id).select('queueToken status');
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (
      existingOrder.status === 'awaiting_approval' &&
      ['pending', 'rejected'].includes(status) &&
      !isAdmin
    ) {
      return res.status(403).json({ message: 'Only admin can approve or reject orders' });
    }

    if (status === 'rejected' && !isAdmin) {
      return res.status(403).json({ message: 'Only admin can reject orders' });
    }

    if (status === 'rejected' && !String(rejectionReason || '').trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    let queueToken = existingOrder.queueToken;
    if (status === 'pending' && existingOrder.status === 'awaiting_approval' && !queueToken) {
      queueToken = await getNextQueueToken();
    }

    const rejectionReasonText =
      status === 'rejected' ? String(rejectionReason || '').trim() : undefined;
    const customerNotification = buildCustomerNotification(status, queueToken, rejectionReasonText);

    const order = await Order.findByIdAndUpdate(
      id,
      {
        status,
        queueToken,
        customerNotification,
        rejectionReason: status === 'rejected' ? rejectionReasonText : undefined,
      },
      { new: true }
    )
      .populate('customer', 'name phone email')
      .populate('userAccount', 'name email')
      .populate('items.foodItem')
      .populate('servedBy', 'name');

    res.status(200).json({
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get customer's order history
export const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({ customer: customerId })
      .populate('items.foodItem')
      .populate('servedBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public customer order polling by recognized customer id
export const getPublicCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 10, 20);

    const orders = await Order.find({ customer: customerId })
      .populate('items.foodItem')
      .sort('-createdAt')
      .limit(limit);

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user mood insights: past orders with same mood and similar products
export const getUserMoodInsights = async (req, res) => {
  try {
    const emotion = String(req.query.emotion || 'neutral').toLowerCase();

    const orders = await Order.find({
      userAccount: req.user.id,
      detectedMood: emotion,
    })
      .populate('items.foodItem')
      .sort('-createdAt')
      .limit(30);

    const productFrequency = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.foodItem) continue;
        const foodId = item.foodItem._id.toString();
        productFrequency[foodId] = (productFrequency[foodId] || 0) + item.quantity;
      }
    }

    const topProductIds = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id]) => id);

    let similarProducts = [];
    if (topProductIds.length > 0) {
      const rawProducts = await FoodItem.find({ _id: { $in: topProductIds } });
      const mapById = new Map(rawProducts.map((item) => [item._id.toString(), item]));
      similarProducts = topProductIds.map((id) => mapById.get(id)).filter(Boolean);
    }

    return res.status(200).json({
      emotion,
      orderCount: orders.length,
      pastOrders: orders,
      similarProducts,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete all orders (admin only)
export const deleteAllOrders = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete all orders' });
    }

    const result = await Order.deleteMany({});
    return res.status(200).json({
      message: 'All orders deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete one order (admin/staff)
export const deleteOrderById = async (req, res) => {
  try {
    if (req.user?.role === 'user') {
      return res.status(403).json({ message: 'Users cannot delete orders' });
    }

    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order deleted successfully',
      orderId: id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Fallback endpoint to clear all orders for environments where DELETE /orders is blocked
export const clearAllOrders = async (req, res) => {
  return deleteAllOrders(req, res);
};
