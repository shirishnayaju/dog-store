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

// Send order status notification email
export const sendOrderStatusEmail = async (req, res) => {
  const { email, orderDetails, status } = req.body;
  
  if (!email || !orderDetails || !status) {
    return res.status(400).json({ message: "Missing required information" });
  }

  // Email templates based on order status
  const getEmailContent = (status, orderDetails) => {
    const orderId = orderDetails._id.substring(0, 8);
    const orderTotal = parseFloat(orderDetails.total || 0).toFixed(2);
    const customerName = orderDetails.customer?.name || "Customer";
    
    // Get list of product names
    const productList = orderDetails.products && orderDetails.products.length > 0
      ? orderDetails.products.map(product => 
          `<li style="margin-bottom: 8px;">${product.name} <span style="color: #666;">(${product.quantity} × $${parseFloat(product.price).toFixed(2)})</span></li>`
        ).join('')
      : '<li>No products found</li>';
    
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
        <p style="margin-bottom: 10px;">If you need assistance, please contact our support team at <a href="mailto:shirishnayaju@gmail.com" style="color: #3b82f6; text-decoration: none;">shirishnayaju@gmail.com</a></p>
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
      case 'approved':
        return {
          subject: `Your GharPaluwa Order #${orderId} is Approved`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #4CAF50; text-align: center; margin-bottom: 25px; font-weight: 600;">Order Approved</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">Great news! Your order <strong>#${orderId}</strong> has been approved and is now being processed. We're working quickly to prepare your items for shipping.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Order Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Order ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">#${orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">Products:</td>
                      <td style="padding: 8px 0;">
                        <ul style="padding-left: 20px; margin: 0;">
                          ${productList}
                        </ul>
                      </td>
                    </tr>
                    <tr style="border-top: 1px solid #e5e7eb;">
                      <td style="padding: 12px 0; color: #4b5563; font-weight: 600;">Order Total:</td>
                      <td style="padding: 12px 0; font-weight: 700; color: #1f2937;">$${orderTotal}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">We'll notify you once your order ships with tracking information. Thank you for shopping with GharPaluwa!</p>
                <p style="margin-bottom: 0; line-height: 1.5;">We hope your pet enjoys our premium products.</p>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
      case 'cancelled':
        return {
          subject: `Your GharPaluwa Order #${orderId} has been Cancelled`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #ef4444; text-align: center; margin-bottom: 25px; font-weight: 600;">Order Cancelled</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">We're sorry to inform you that your order <strong>#${orderId}</strong> has been cancelled.</p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #ef4444;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Order Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Order ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">#${orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">Products:</td>
                      <td style="padding: 8px 0;">
                        <ul style="padding-left: 20px; margin: 0;">
                          ${productList}
                        </ul>
                      </td>
                    </tr>
                    <tr style="border-top: 1px solid #e5e7eb;">
                      <td style="padding: 12px 0; color: #4b5563; font-weight: 600;">Order Total:</td>
                      <td style="padding: 12px 0; font-weight: 700; color: #1f2937;">$${orderTotal}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">If you have any questions about this cancellation or would like to place a new order, please contact our customer service team.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/shop" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">Continue Shopping</a>
                </div>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
      default:
        return {
          subject: `Your GharPaluwa Order #${orderId} Status Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
              ${logoHtml}
              <div style="padding: 20px 30px;">
                <h2 style="color: #3b82f6; text-align: center; margin-bottom: 25px; font-weight: 600;">Order Status Update</h2>
                <p style="margin-bottom: 15px;">Hello ${customerName},</p>
                <p style="margin-bottom: 20px; line-height: 1.5;">Your order <strong>#${orderId}</strong> status has been updated to: <strong style="color: #3b82f6;">${status.charAt(0).toUpperCase() + status.slice(1)}</strong></p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #3b82f6;">
                  <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">Order Summary</h3>
                  <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; width: 40%;">Order ID:</td>
                      <td style="padding: 8px 0; font-weight: 600;">#${orderId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #4b5563; vertical-align: top;">Products:</td>
                      <td style="padding: 8px 0;">
                        <ul style="padding-left: 20px; margin: 0;">
                          ${productList}
                        </ul>
                      </td>
                    </tr>
                    <tr style="border-top: 1px solid #e5e7eb;">
                      <td style="padding: 12px 0; color: #4b5563; font-weight: 600;">Order Total:</td>
                      <td style="padding: 12px 0; font-weight: 700; color: #1f2937;">$${orderTotal}</td>
                    </tr>
                  </table>
                </div>
                
                <p style="margin-bottom: 15px; line-height: 1.5;">If you have any questions about your order, please don't hesitate to contact our customer service team.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="https://gharpaluwa.com/my-orders/${orderId}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 500;">View Order Details</a>
                </div>
                
                ${footerHtml}
              </div>
            </div>
          `
        };
    }
  };

  const emailContent = getEmailContent(status, orderDetails);
  
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email notification sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ message: "Failed to send email notification" });
  }
};