import express from 'express';
import {   
  getAllVaccinationBookings,   
  createVaccinationBooking,   
  getVaccinationBookingById,   
  updateVaccinationBooking,   
  deleteVaccinationBooking,   
  getVaccinationBookingsByUser,   
  cancelVaccinationBooking 
} from '../controller/VaccinationBooking.controller.js';  

const router = express.Router();  

// Get all vaccination bookings
router.get('/vaccinations', getAllVaccinationBookings);  

// Create a new vaccination booking
router.post('/vaccinations', createVaccinationBooking);  

// Get vaccination booking details by ID
router.get('/vaccinations/:id', getVaccinationBookingById);  

// Update a vaccination booking by ID
router.put('/vaccinations/:id', updateVaccinationBooking);  

// Delete a vaccination booking by ID
router.delete('/vaccinations/:id', deleteVaccinationBooking);  

// Get all vaccination bookings for a specific user by email
router.get('/users/:userEmail/vaccinations', getVaccinationBookingsByUser);  

// Cancel a vaccination booking
router.patch('/vaccinations/:id/cancel', cancelVaccinationBooking);  

export default router;