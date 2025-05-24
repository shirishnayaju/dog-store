import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../model/user.model.js";
import Subscriber from "../model/subscriber.model.js";

dotenv.config();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send product notification to all users and subscribers
export const sendProductNotification = async (req, res) => {
  try {
    const { productData } = req.body;
    
    if (!productData) {
      return res.status(400).json({ message: "Product data is required" });
    }

    // Prepare email content
    const emailContent = createProductNotificationEmail(productData);

    // Get all users
    const users = await User.find({}, 'email name');
    
    // Get all active subscribers
    const subscribers = await Subscriber.find({ isActive: true }, 'email name');
    
    // Combine user and subscriber emails (avoid duplicates)
    const emailSet = new Set();
    const emailList = [];
    
    // Process users
    users.forEach(user => {
      if (user.email && !emailSet.has(user.email)) {
        emailSet.add(user.email);
        emailList.push({
          email: user.email,
          name: user.name || 'Valued Customer'
        });
      }
    });
    
    // Process subscribers
    subscribers.forEach(subscriber => {
      if (subscriber.email && !emailSet.has(subscriber.email)) {
        emailSet.add(subscriber.email);
        emailList.push({
          email: subscriber.email,
          name: subscriber.name || 'Valued Subscriber'
        });
      }
    });
    
    // Send emails
    const sentCount = await sendEmails(emailList, emailContent, productData.name);
    
    res.status(200).json({
      success: true,
      message: `Product notification sent successfully to ${sentCount} recipients`,
      recipients: sentCount
    });
  } catch (error) {
    console.error("Error sending product notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send product notification",
      error: error.message
    });
  }
};

// Create email content
const createProductNotificationEmail = (productData) => {
  const productName = productData.name;
  const productPrice = parseFloat(productData.price).toFixed(2);
  const productDescription = productData.description;
  const productImage = productData.image;
  const productCategory = productData.category;
  
  // Company logo and brand header
  const logoHtml = `
    <div style="text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 5px 5px 0 0;">
   <img src="https://th.bing.com/th/id/OIP.MzeiYaPtRAUpb7-SabBPZQHaHa?cb=iwp2&rs=1&pid=ImgDetMain" alt="GharPaluwa Logo" style="max-width: 60px; height:60px;" />
      <h2 style="color: #3b82f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin-top: 15px; margin-bottom: 0;">GharPaluwa</h2>
      <p style="color: #6b7280; margin-top: 5px; font-style: italic;">Premium Pet Care Products</p>
    </div>
  `;

  // Footer for all emails
  const footerHtml = `
    <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #eaeaea; color: #6b7280; font-size: 14px;">
      <p style="margin-bottom: 10px;">If you have any questions, please contact our support team at <a href="mailto:shirishnayaju@gmail.com" style="color: #3b82f6; text-decoration: none;">shirishnayaju@gmail.com</a></p>
      <div style="margin-top: 20px; text-align: center;">
        <p style="margin-bottom: 5px;">© 2025 GharPaluwa. All rights reserved.</p>
        <p style="margin-bottom: 5px; font-size: 12px;">
          <a href="https://gharpaluwa.com/privacy" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
          <a href="https://gharpaluwa.com/terms" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Terms of Service</a> |
          <a href="https://gharpaluwa.com/unsubscribe" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `;
  
  // Product details section
  const productDetailsHtml = `
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 5px; margin: 25px 0; border-left: 4px solid #3b82f6;">
      <div style="display: flex; align-items: start;">
        <div style="flex: 0 0 120px; margin-right: 20px;">
          <img src="${productImage}" alt="${productName}" style="width: 120px; height: auto; border-radius: 4px; object-fit: cover;" />
        </div>
        <div>
          <h3 style="margin-top: 0; margin-bottom: 8px; color: #1f2937; font-size: 18px; font-weight: 600;">${productName}</h3>
          <p style="margin-top: 0; margin-bottom: 8px; font-size: 16px; color: #4b5563;">${productCategory}</p>
          <p style="margin-top: 0; margin-bottom: 12px; font-weight: 600; color: #3b82f6; font-size: 18px;">Rs. ${productPrice}</p>
          <p style="margin-top: 0; margin-bottom: 0; color: #6b7280; line-height: 1.5;">${productDescription}</p>
        </div>
      </div>
    </div>
  `;

  // Build the complete email
  return {
    subject: `New Product Alert: ${productName} is now available at GharPaluwa!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e5e7eb; border-radius: 5px; color: #374151;">
        ${logoHtml}
        <div style="padding: 20px 30px;">
          <h2 style="color: #3b82f6; text-align: center; margin-bottom: 25px; font-weight: 600;">New Pet Product Alert!</h2>
          <p style="margin-bottom: 15px;">Hello {{name}},</p>
          <p style="margin-bottom: 20px; line-height: 1.5;">We're excited to introduce our newest product to our pet care collection! Check out the details below:</p>
          
          ${productDetailsHtml}
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/product/${productData._id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: 500; display: inline-block;">View Product</a>
          </div>
          
          <p style="margin-top: 30px; margin-bottom: 0; line-height: 1.5;">Thank you for being a valued customer. We hope your pet enjoys our premium products!</p>
          
          ${footerHtml}
        </div>
      </div>
    `
  };
};

// Function to send emails to all recipients
const sendEmails = async (emailList, emailContent, productName) => {
  let successCount = 0;
  
  for (const recipient of emailList) {
    try {
      // Personalize the email with recipient's name
      const personalizedHtml = emailContent.html.replace('{{name}}', recipient.name);
      
      // Send the email
      await transporter.sendMail({
        from: `"GharPaluwa Pet Care" <${process.env.EMAIL_USERNAME}>`,
        to: recipient.email,
        subject: emailContent.subject,
        html: personalizedHtml,
      });
      
      successCount++;
      console.log(`Notification email sent successfully to ${recipient.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      // Continue to next recipient even if current one fails
    }
  }
  
  return successCount;
};
