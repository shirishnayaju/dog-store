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
          `<li style="margin-bottom: 8px;">${vaccine.name} <span style="color: #6b7280;">(Dose #${vaccine.doseNumber})</span></li>`
        ).join('')
      : '<li>No vaccines listed</li>';
    
    // Company logo and brand header
    const logoHtml = `
      <div style="text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 5px 5px 0 0;">
   <img src="https://th.bing.com/th/id/OIP.MzeiYaPtRAUpb7-SabBPZQHaHa?cb=iwp2&rs=1&pid=ImgDetMain" alt="GharPaluwa Logo" style="max-width: 60px; height:60px;" />
        <h2 style="color: #3b82f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin-top: 15px; margin-bottom: 0;">GharPaluwa</h2>
        <p style="color: #6b7280; margin-top: 5px; font-style: italic;">Premium Pet Care Services</p>
      </div>
    `;

    // Footer for all emails
    const footerHtml = `
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eaeaea; color: #6b7280; font-size: 14px;">
        <p style="margin-bottom: 10px;">If you need assistance, please contact our veterinary team at <a href="mailto:shirishnayaju@gmail.com" style="color: #3b82f6; text-decoration: none;">shirishnayaju@gmail.com</a></p>
        <div style="margin-top: 20px; text-align: center;">
          <p style="margin-bottom: 5px;">© 2025 GharPaluwa. All rights reserved.</p>
          <p style="margin-bottom: 5px; font-size: 12px;">
            <a href="https://gharpaluwa.com/privacy" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
            <a href="https://gharpaluwa.com/terms" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Terms of Service</a>
          </p>
        </div>
      </div>
    `;
    
    switch(status.toLowerCase()) {
      case 'confirmed':
        return {
          subject: `Your GharPaluwa Vaccination Appointment is Confirmed!`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #4CAF50; text-align: center; margin-bottom: 25px; font-weight: 600;">Appointment Confirmed!</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">We're pleased to confirm your upcoming vaccination appointment for ${petName}. Your pet's health is our priority, and we're looking forward to providing the best care possible.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #4CAF50;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Appointment Details</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Booking ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${bookingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Pet Name:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${petName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Date:</td>
                      <td style="padding: 8px 0;">${appointmentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Time:</td>
                      <td style="padding: 8px 0;">${appointmentTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Location:</td>
                      <td style="padding: 8px 0;">${vaccinationCenter}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">Vaccines:</td>
                      <td style="padding: 8px 0;">
                        <ul style="padding-left: 20px; margin: 0;">
                          ${vaccineList}
                        </ul>
                      </td>
                    </tr>
                    <tr style="border-top: 1px solid #e5e7eb;">
                      <td style="padding: 12px 0; color: #4b5563; font-weight: 600;">Total Amount:</td>
                      <td style="padding: 12px 0; font-weight: 700; color: #1f2937;">$${totalAmount}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #edf7ed; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                  <h4 style="margin-top: 0; color: #1f2937; font-size: 16px; font-weight: 600;">Preparation Tips</h4>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                    <li style="margin-bottom: 5px;">Please arrive 10 minutes before your scheduled appointment time.</li>
                    <li style="margin-bottom: 5px;">Bring your pet's previous vaccination records if available.</li>
                    <li style="margin-bottom: 5px;">Ensure your pet is well-rested and calm before the appointment.</li>
                    <li style="margin-bottom: 0;">If you need to cancel or reschedule, please contact us at least 24 hours in advance.</li>
                  </ul>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">If you have any questions before your appointment, please don't hesitate to contact our veterinary team.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/my-bookings/${bookingId}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Manage Your Appointment</a>
                </div>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
      case 'cancelled':
        return {
          subject: `Your GharPaluwa Vaccination Appointment has been Cancelled`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #ef4444; text-align: center; margin-bottom: 25px; font-weight: 600;">Appointment Cancelled</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">We're sorry to inform you that your vaccination appointment for ${petName} has been cancelled.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #ef4444;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Cancelled Appointment Details</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Booking ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${bookingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Pet Name:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${petName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Date:</td>
                      <td style="padding: 8px 0;">${appointmentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Time:</td>
                      <td style="padding: 8px 0;">${appointmentTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Location:</td>
                      <td style="padding: 8px 0;">${vaccinationCenter}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">If you would like to reschedule, you can do so through our website or by contacting our customer service team.</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">We understand that plans change, and we're here to accommodate your needs. Regular vaccination is important for your pet's health, so we encourage you to reschedule at your earliest convenience.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/schedule-vaccination" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Reschedule Appointment</a>
                </div>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
      case 'completed':
        return {
          subject: `Your GharPaluwa Vaccination Appointment is Complete`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #4CAF50; text-align: center; margin-bottom: 25px; font-weight: 600;">Vaccination Complete!</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">We're pleased to inform you that ${petName}'s vaccination appointment has been completed successfully. Thank you for taking this important step in your pet's healthcare journey.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #4CAF50;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Appointment Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Booking ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${bookingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Pet Name:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${petName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Date:</td>
                      <td style="padding: 8px 0;">${appointmentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">Vaccines Administered:</td>
                      <td style="padding: 8px 0;">
                        <ul style="padding-left: 20px; margin: 0;">
                          ${vaccineList}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #edf7ed; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50;">
                  <h4 style="margin-top: 0; color: #1f2937; font-size: 16px; font-weight: 600;">Post-Vaccination Care</h4>
                  <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                    <li style="margin-bottom: 5px;">Monitor your pet for the next 24-48 hours for any unusual behavior or reactions.</li>
                    <li style="margin-bottom: 5px;">Ensure your pet has access to fresh water and a comfortable resting area.</li>
                    <li style="margin-bottom: 5px;">Avoid bathing your pet for at least 48 hours.</li>
                    <li style="margin-bottom: 0;">Contact us immediately if you notice any concerning symptoms like persistent vomiting, difficulty breathing, or unusual lethargy.</li>
                  </ul>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">Thank you for choosing GharPaluwa for your pet's healthcare needs. We recommend following up with regular check-ups to ensure your pet's continued health.</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">Your pet's next vaccination is recommended in <strong>6 months</strong>. We'll send you a reminder when it's time to schedule their next appointment.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/vaccination-history/${bookingId}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">View Vaccination Record</a>
                </div>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
      case 'no-show':
        return {
          subject: `Missed GharPaluwa Vaccination Appointment`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #f59e0b; text-align: center; margin-bottom: 25px; font-weight: 600;">Missed Appointment</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">We noticed that you missed your scheduled vaccination appointment for ${petName} at our ${vaccinationCenter} location. We understand that life can get busy, but we want to make sure your pet receives their important vaccinations.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #f59e0b;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Missed Appointment Details</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Booking ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${bookingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Pet Name:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${petName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Date:</td>
                      <td style="padding: 8px 0;">${appointmentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Time:</td>
                      <td style="padding: 8px 0;">${appointmentTime}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">Regular vaccinations are essential for protecting your pet against preventable diseases. We encourage you to reschedule your appointment as soon as possible.</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">To make it easier for you, we've provided a direct link below to reschedule your appointment. You can also call our clinic if you need assistance.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/schedule-vaccination" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Reschedule Now</a>
                </div>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
      default:
        return {
          subject: `Your GharPaluwa Vaccination Appointment Update`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #3b82f6; text-align: center; margin-bottom: 25px; font-weight: 600;">Appointment Status Update</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">Your vaccination appointment status for ${petName} has been updated to: <strong style="color: #3b82f6;">${status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Appointment Details</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Booking ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${bookingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Pet Name:</td>
                      <td style="padding: 8px 0; font-weight: 600;">${petName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Date:</td>
                      <td style="padding: 8px 0;">${appointmentDate}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Time:</td>
                      <td style="padding: 8px 0;">${appointmentTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563;">Location:</td>
                      <td style="padding: 8px 0;">${vaccinationCenter}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">Vaccines:</td>
                      <td style="padding: 8px 0;">
                        <ul style="padding-left: 20px; margin: 0;">
                          ${vaccineList}
                        </ul>
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin-bottom: 20px; line-height: 1.5;">If you have any questions about this update or need further assistance, please don't hesitate to contact our veterinary team.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/my-bookings/${bookingId}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">View Appointment Details</a>
                </div>
                
                ${footerHtml}
              </div>
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