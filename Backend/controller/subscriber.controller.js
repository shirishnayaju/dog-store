import Subscriber from '../model/subscriber.model.js';

// Add a new subscriber
export const subscribe = async (req, res) => {
  try {
    const { email, name, preferences } = req.body;

    // Check if the email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    
    if (existingSubscriber) {
      // If subscriber exists but is inactive, reactivate them
      if (!existingSubscriber.isActive) {
        existingSubscriber.isActive = true;
        existingSubscriber.subscriptionDate = Date.now();
        if (preferences) existingSubscriber.preferences = preferences;
        if (name) existingSubscriber.name = name;
        
        await existingSubscriber.save();
        return res.status(200).json({
          success: true,
          message: "Welcome back! Your subscription has been reactivated.",
          data: {
            email: existingSubscriber.email,
            subscriptionDate: existingSubscriber.subscriptionDate,
            preferences: existingSubscriber.preferences
          }
        });
      }
      
      // If already active, return message
      return res.status(200).json({
        success: true,
        message: "You're already subscribed to our newsletter!",
        data: {
          email: existingSubscriber.email,
          subscriptionDate: existingSubscriber.subscriptionDate,
          preferences: existingSubscriber.preferences
        }
      });
    }

    // Create a new subscriber
    const newSubscriber = new Subscriber({
      email,
      name,
      preferences: preferences || ['general']
    });

    await newSubscriber.save();

    res.status(201).json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
      data: {
        email: newSubscriber.email,
        subscriptionDate: newSubscriber.subscriptionDate,
        preferences: newSubscriber.preferences
      }
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process your subscription at this time.",
      error: error.message
    });
  }
};

// Unsubscribe using email and token
export const unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.params;
    
    const subscriber = await Subscriber.findOne({ email, unsubscribeToken: token });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Invalid unsubscribe request or subscriber not found."
      });
    }
    
    subscriber.isActive = false;
    await subscriber.save();
    
    res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from our newsletter."
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process your unsubscribe request at this time.",
      error: error.message
    });
  }
};

// Get all subscribers (for admin use)
export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .select('-unsubscribeToken -__v')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error("Get subscribers error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to retrieve subscribers at this time.",
      error: error.message
    });
  }
};

// Delete a subscriber (admin function)
export const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriber = await Subscriber.findById(id);
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found."
      });
    }
    
    await Subscriber.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: "Subscriber has been deleted successfully."
    });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to delete subscriber at this time.",
      error: error.message
    });
  }
};

// Update subscriber preferences
export const updatePreferences = async (req, res) => {
  try {
    const { email } = req.params;
    const { preferences } = req.body;
    
    const subscriber = await Subscriber.findOne({ email });
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found."
      });
    }
    
    subscriber.preferences = preferences;
    await subscriber.save();
    
    res.status(200).json({
      success: true,
      message: "Subscription preferences updated successfully.",
      data: {
        email: subscriber.email,
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update preferences at this time.",
      error: error.message
    });
  }
};