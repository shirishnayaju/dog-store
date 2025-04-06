import { Order } from '../model/order.model.js';

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // Sort by latest first
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { customer, products, total, userEmail } = req.body;
    
    // Validate email
    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Email is required',
        providedEmail: userEmail
      });
    }
    
    // Detailed validation for missing fields
    const missingFields = [];
    if (!customer) missingFields.push('customer');
    if (!products) missingFields.push('products');
    if (!total) missingFields.push('total');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields: missingFields 
      });
    }
    
    // Validate customer object fields if customer exists
    if (customer) {
      const missingCustomerFields = [];
      if (!customer.name) missingCustomerFields.push('customer.name');
      if (!customer.phoneNumber) missingCustomerFields.push('customer.phoneNumber');
      if (!customer.city) missingCustomerFields.push('customer.city');
      if (!customer.colony) missingCustomerFields.push('customer.colony');
      
      if (missingCustomerFields.length > 0) {
        return res.status(400).json({
          message: 'Missing required customer information',
          missingFields: missingCustomerFields
        });
      }
    }
    
    // Validate products array if it exists
    if (products && (!Array.isArray(products) || products.length === 0)) {
      return res.status(400).json({
        message: 'Products must be a non-empty array'
      });
    }
    
    // Create a new order using email instead of userId
    const newOrder = new Order({
      customer,
      products,
      total,
      userEmail,
    });
    
    // Save the order to the database
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Get order details by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
};

// Update an order by ID
export const updateOrder = async (req, res) => {
  try {
    const { customer, products, total, status } = req.body;
    
    // Find the order by ID and update it
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { customer, products, total, status },
      { new: true } // Return the updated document
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Delete an order by ID
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

// Get all orders for a specific user by email
export const getOrdersByUser = async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    
    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Email is required',
        providedEmail: userEmail
      });
    }
    
    // Find all orders associated with the user email
    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user orders', error: error.message });
  }
};