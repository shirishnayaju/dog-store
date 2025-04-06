import { VaccinationBooking } from '../model/VaccinationBooking.model.js';

// Get all vaccination bookings
export const getAllVaccinationBookings = async (req, res) => {
  try {
    const bookings = await VaccinationBooking.find().sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vaccination bookings', error: error.message });
  }
};

// Create a new vaccination booking
export const createVaccinationBooking = async (req, res) => {
  try {
    const { 
      patient, 
      dog, 
      vaccines, 
      userEmail, 
      appointmentDate, 
      appointmentTime, 
      vaccinationCenter,
      totalAmount
    } = req.body;
    
    // Validate email
    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Email is required',
        providedEmail: userEmail
      });
    }
    
    // Detailed validation for missing fields
    const missingFields = [];
    if (!patient) missingFields.push('patient');
    if (!dog) missingFields.push('dog');
    if (!vaccines) missingFields.push('vaccines');
    if (!appointmentDate) missingFields.push('appointmentDate');
    if (!appointmentTime) missingFields.push('appointmentTime');
    if (!vaccinationCenter) missingFields.push('vaccinationCenter');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields: missingFields 
      });
    }
    
    // Validate patient object fields
    const missingPatientFields = [];
    if (!patient.name) missingPatientFields.push('patient.name');
    if (!patient.phoneNumber) missingPatientFields.push('patient.phoneNumber');
    if (!patient.city) missingPatientFields.push('patient.city');
    if (!patient.address) missingPatientFields.push('patient.address');
    
    if (missingPatientFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required patient information',
        missingFields: missingPatientFields
      });
    }
    
    // Validate dog object fields
    const missingDogFields = [];
    if (!dog.name) missingDogFields.push('dog.name');
    if (!dog.breed) missingDogFields.push('dog.breed');
    if (!dog.behaviour) missingDogFields.push('dog.behaviour');
    
    if (missingDogFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required dog information',
        missingFields: missingDogFields
      });
    }
    
    // Validate vaccines array
    if (vaccines && (!Array.isArray(vaccines) || vaccines.length === 0)) {
      return res.status(400).json({
        message: 'Vaccines must be a non-empty array'
      });
    }
    
    // Check for conflicting appointments
    const conflictingBooking = await VaccinationBooking.findOne({
      appointmentDate,
      appointmentTime,
      vaccinationCenter,
      status: 'Scheduled'
    });
    
    if (conflictingBooking) {
      return res.status(400).json({
        message: 'This time slot is already booked. Please select another time.'
      });
    }
    
    // Create a new vaccination booking
    const newBooking = new VaccinationBooking({
      patient,
      dog,
      vaccines,
      userEmail,
      appointmentDate,
      appointmentTime,
      vaccinationCenter,
      totalAmount: totalAmount || 0
    });
    
    // Save the booking to the database
    const savedBooking = await newBooking.save();
    
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Vaccination booking creation error:', error);
    res.status(500).json({ message: 'Error creating vaccination booking', error: error.message });
  }
};

// Get vaccination booking details by ID
export const getVaccinationBookingById = async (req, res) => {
  try {
    const booking = await VaccinationBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Vaccination booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching vaccination booking details', error: error.message });
  }
};

// Update a vaccination booking by ID
export const updateVaccinationBooking = async (req, res) => {
  try {
    const { 
      patient, 
      dog, 
      vaccines, 
      status, 
      appointmentDate, 
      appointmentTime, 
      vaccinationCenter 
    } = req.body;
    
    // If date or time is being updated, check for conflicts
    if (appointmentDate && appointmentTime && vaccinationCenter) {
      const conflictingBooking = await VaccinationBooking.findOne({
        _id: { $ne: req.params.id }, // Exclude current booking
        appointmentDate,
        appointmentTime,
        vaccinationCenter,
        status: 'Scheduled'
      });
      
      if (conflictingBooking) {
        return res.status(400).json({
          message: 'This time slot is already booked. Please select another time.'
        });
      }
    }
    
    // Find the booking by ID and update it
    const updatedBooking = await VaccinationBooking.findByIdAndUpdate(
      req.params.id,
      { 
        patient, 
        dog, 
        vaccines, 
        status, 
        appointmentDate, 
        appointmentTime, 
        vaccinationCenter 
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Vaccination booking not found' });
    }
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating vaccination booking', error: error.message });
  }
};

// Delete a vaccination booking by ID
export const deleteVaccinationBooking = async (req, res) => {
  try {
    const deletedBooking = await VaccinationBooking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: 'Vaccination booking not found' });
    }
    res.status(200).json({ message: 'Vaccination booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting vaccination booking', error: error.message });
  }
};

// Get all vaccination bookings for a specific user by email
export const getVaccinationBookingsByUser = async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    
    if (!userEmail) {
      return res.status(400).json({ 
        message: 'Email is required',
        providedEmail: userEmail
      });
    }
    
    // Find all bookings associated with the user email
    const bookings = await VaccinationBooking.find({ userEmail }).sort({ createdAt: -1 });
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user vaccination bookings', error: error.message });
  }
};

// Cancel a vaccination booking
export const cancelVaccinationBooking = async (req, res) => {
  try {
    // First find the booking to check if it exists
    const booking = await VaccinationBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Vaccination booking not found' });
    }
    
    // Only allow cancellation of scheduled bookings
    if (booking.status !== 'Scheduled' && booking.status !== 'Confirmed') {
      return res.status(400).json({ 
        message: `Cannot cancel a booking that is already ${booking.status}`
      });
    }
    
    const updatedBooking = await VaccinationBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling vaccination booking', error: error.message });
  }
};