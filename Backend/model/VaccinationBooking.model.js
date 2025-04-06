import mongoose from 'mongoose';

const vaccinationBookingSchema = new mongoose.Schema({
  patient: {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    specialInstructions: { type: String }
  },
  dog: {
    name: { type: String, required: true },
    breed: { type: String, required: true },
    behaviour: { 
      type: String, 
      enum: ['Friendly', 'Playful', 'Aggressive'], 
      required: true 
    }
  },
  vaccines: [{
    name: { type: String, required: true },
    doseNumber: { type: Number, required: true },
  }],
  userEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-show'],
    default: 'Scheduled'
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  appointmentDate: { type: Date, required: true },
  appointmentTime: { type: String, required: true },
  vaccinationCenter: { type: String, required: true }
}, { timestamps: true });

export const VaccinationBooking = mongoose.model('VaccinationBooking', vaccinationBookingSchema);