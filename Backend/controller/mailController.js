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
          `<li>${product.name} (${product.quantity} x $${parseFloat(product.price).toFixed(2)})</li>`
        ).join('')
      : '<li>No products found</li>';
    
    // Company logo - assuming you have a URL for your logo
    // If you don't have an actual URL, you would need to host this image somewhere
    const logoHtml = `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://scontent.fktm21-2.fna.fbcdn.net/v/t39.30808-6/299602768_486726786790155_4876935833175453117_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=ytDg_olhTFcQ7kNvwGKXe6y&_nc_oc=Adm6CM1oL1K2Vo39kD-YK0u7zmVnP0qTRio7C8uxESXwveen6xCIiA36-935tTxJd0yw7EAXty_fIgZn4wWzSlFQ&_nc_zt=23&_nc_ht=scontent.fktm21-2.fna&_nc_gid=4xm9OkBeERVxS1S5cgPtMw&oh=00_AfE_noDDL3f8lQHBErPeibuKHRpfp7qWBbFU0IWjT2IjLw&oe=67F9E2DA" alt="GharPaluwa Logo" style="max-width: 150px; height: auto;" />
        <h2 style="color: #3b82f6; text-align: center; margin-top: 10px;">GharPaluwa</h2>
      </div>
    `;
    
    switch(status.toLowerCase()) {
      case 'approved':
        return {
          subject: `Your GharPaluwa Order is Approved - Thank You!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #4CAF50; text-align: center;">Order Approved!</h2>
              <p>Hello ${customerName},</p>
              <p>Great news! Your order has been approved and is being processed.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Order Summary:</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Products:</strong></p>
                <ul style="padding-left: 20px;">
                  ${productList}
                </ul>
                <p><strong>Order Total:</strong> $${orderTotal}</p>
              </div>
              
              <p>We'll notify you once your order ships. Thank you for shopping with GharPaluwa!</p>
              <p>If you have any questions, please don't hesitate to contact our customer service.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
      case 'cancelled':
        return {
          subject: `Your GharPaluwa Order has been Cancelled`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #f44336; text-align: center;">Order Cancelled</h2>
              <p>Hello ${customerName},</p>
              <p>We're sorry to inform you that your order has been cancelled.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Order Summary:</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Products:</strong></p>
                <ul style="padding-left: 20px;">
                  ${productList}
                </ul>
                <p><strong>Order Total:</strong> $${orderTotal}</p>
              </div>
              
              <p>If you have any questions about this cancellation or would like to place a new order, please contact our customer service team.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
            </div>
          `
        };
      default:
        return {
          subject: `Your GharPaluwa Order Status Update`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
              ${logoHtml}
              <h2 style="color: #2196F3; text-align: center;">Order Status Update</h2>
              <p>Hello ${customerName},</p>
              <p>Your order status has been updated to: <strong>${status}</strong></p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h3 style="margin-top: 0; color: #333;">Order Summary:</h3>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Products:</strong></p>
                <ul style="padding-left: 20px;">
                  ${productList}
                </ul>
                <p><strong>Order Total:</strong> $${orderTotal}</p>
              </div>
              
              <p>If you have any questions, please don't hesitate to contact our customer service.</p>
              <p style="margin-top: 30px;">Best regards,<br>The GharPaluwa Team</p>
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