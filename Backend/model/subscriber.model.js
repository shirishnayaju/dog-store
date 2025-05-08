import mongoose from 'mongoose';

// Schema for newsletter subscribers
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  subscriptionDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    type: [String],
    default: ['general'] // Could include categories like 'promotions', 'pet-care-tips', etc.
  },
  lastEmailSent: {
    type: Date
  },
  unsubscribeToken: {
    type: String
  }
}, { timestamps: true });

// Pre-save hook to generate unsubscribe token if not present
subscriberSchema.pre('save', function(next) {
  if (!this.unsubscribeToken) {
    // Generate a random token for unsubscribe links
    this.unsubscribeToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
  }
  next();
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

export default Subscriber;