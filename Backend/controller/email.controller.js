import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send vaccination booking status notification email
export const sendVaccinationStatusEmail = async (req, res) => {
  const { email, bookingDetails, status } = req.body;
  
  if (!email || !bookingDetails) {
    return res.status(400).json({ message: "Missing required information" });
  }

  // Use the status from request or fallback to the booking status
  const currentStatus = status || bookingDetails.status;

  // Email templates based on vaccination booking status
  const getEmailContent = (status, bookingDetails) => {
    const bookingId = bookingDetails._id.substring(0, 8);
    const totalAmount = parseFloat(bookingDetails.totalAmount || 0).toFixed(2);
    const customerName = bookingDetails.patient?.name || "Pet Owner";
    const petName = bookingDetails.dog?.name || "Pet";
    const appointmentDate = new Date(bookingDetails.appointmentDate).toLocaleDateString();
    const appointmentTime = bookingDetails.appointmentTime;
    const vaccinationCenter = bookingDetails.vaccinationCenter;
    
    // Get list of vaccines
    const vaccineList = bookingDetails.vaccines && bookingDetails.vaccines.length > 0
      ? bookingDetails.vaccines.map(vaccine => 
          `<li>${vaccine.name} (Dose #${vaccine.doseNumber})</li>`
        ).join('')
      : '<li>No vaccines listed</li>';
    
    // Company logo - using the same logo as in your orders email
    const logoHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://scontent.fktm21-2.fna.fbcdn.net/v/t39.30808-6/299602768_486726786790155_4876935833175453117_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ytDg_olhTFcQ7kNvwGKXe6y&_nc_oc=Adm6CM1oL1K2Vo39kD-YK0u7zmVnP0qTRio7C8uxESXwveen6xCIiA36-935tTxJd0yw7EAXty_fIgZn4wWzSlFQ&_nc_zt=23&_nc_ht=scontent.fktm21-2.fna&_nc_gid=4xm9OkBeERVxS1S5cgPtMw&oh=00_AfE_noDDL3f8lQHBErPeibuKHRpfp7qWBbFU0IWjT2IjLw&oe=67F9E2DA" alt="GharPaluwa Logo" style="max-width: 150px; height: auto;" />
        <h2 style="color: #3b82f6; text-align: center; margin-top: 10px;">GharPaluwa</h2>
      </div>
    `;
    
    switch(status.toLowerCase()) {
      case 'confirmed':
        return {
          subject: `Your GharPaluwa Vaccination Appointment is Confirmed!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #4CAF50; text-align: center;">Appointment Confirmed!</h2>
              <p>Hello ${customerName},</p>
              <p>We're pleased to confirm your upcoming vaccination appointment for ${petName}.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Pet Name:</strong> ${petName}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                <p><strong>Location:</strong> ${vaccinationCenter}</p>
                <p><strong>Vaccines:</strong></p>
                <ul style="padding-left: 20px;">
                  ${vaccineList}
                </ul>
                <p><strong>Total Amount:</strong> $${totalAmount}</p>
              </div>
              
              <p>Please arrive 10 minutes before your scheduled appointment time. If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
              <p>If you have any questions, please don't hesitate to contact our customer service.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
      case 'cancelled':
        return {
          subject: `Your GharPaluwa Vaccination Appointment has been Cancelled`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #f44336; text-align: center;">Appointment Cancelled</h2>
              <p>Hello ${customerName},</p>
              <p>We're sorry to inform you that your vaccination appointment for ${petName} has been cancelled.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Pet Name:</strong> ${petName}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                <p><strong>Location:</strong> ${vaccinationCenter}</p>
              </div>
              
              <p>If you would like to reschedule, please visit our website or contact our customer service team.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
      case 'completed':
        return {
          subject: `Your GharPaluwa Vaccination Appointment is Complete`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #4CAF50; text-align: center;">Vaccination Complete!</h2>
              <p>Hello ${customerName},</p>
              <p>We're pleased to inform you that ${petName}'s vaccination appointment has been completed successfully.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Pet Name:</strong> ${petName}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Vaccines Administered:</strong></p>
                <ul style="padding-left: 20px;">
                  ${vaccineList}
                </ul>
              </div>
              
              <p>Thank you for choosing GharPaluwa for your pet's healthcare needs. We recommend following up with regular check-ups to ensure your pet's continued health.</p>
              <p>If you have any questions or concerns, please don't hesitate to contact our customer service.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
      case 'no-show':
        return {
          subject: `Missed GharPaluwa Vaccination Appointment`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #ff9800; text-align: center;">Missed Appointment</h2>
              <p>Hello ${customerName},</p>
              <p>We noticed that you missed your scheduled vaccination appointment for ${petName} at our ${vaccinationCenter} location.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Missed Appointment Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Pet Name:</strong> ${petName}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
              </div>
              
              <p>Regular vaccinations are important for your pet's health. Please contact us to reschedule your appointment as soon as possible.</p>
              <p>If you have any questions, please don't hesitate to contact our customer service.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
      default:
        return {
          subject: `Your GharPaluwa Vaccination Appointment Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #2196F3; text-align: center;">Appointment Status Update</h2>
              <p>Hello ${customerName},</p>
              <p>Your vaccination appointment status has been updated to: <strong>${status}</strong></p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Appointment Details:</h3>
                <p><strong>Booking ID:</strong> ${bookingId}</p>
                <p><strong>Pet Name:</strong> ${petName}</p>
                <p><strong>Date:</strong> ${appointmentDate}</p>
                <p><strong>Time:</strong> ${appointmentTime}</p>
                <p><strong>Location:</strong> ${vaccinationCenter}</p>
                <p><strong>Vaccines:</strong></p>
                <ul style="padding-left: 20px;">
                  ${vaccineList}
                </ul>
              </div>
              
              <p>If you have any questions, please don't hesitate to contact our customer service.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
    }
  };

  const emailContent = getEmailContent(currentStatus, bookingDetails);
  
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Vaccination email notification sent successfully" });
  } catch (error) {
    console.error("Error sending vaccination email:", error);
    return res.status(500).json({ message: "Failed to send vaccination email notification", error: error.message });
  }
};