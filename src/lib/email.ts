import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "2525"),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || "no-reply@silkroute.in",
        to,
        subject,
        html,
      });
      console.log(`[SMTP Email Sent] Message ID: ${info.messageId} to ${to}`);
      return true;
    } catch (error) {
      console.error("[SMTP Email Error]", error);
    }
  }

  // Fallback to beautiful server logs
  console.log("\n========================================================");
  console.log(`📧  SIMULATED EMAIL TO: ${to}`);
  console.log(`📧  SUBJECT: ${subject}`);
  console.log("--------------------------------------------------------");
  // Clean HTML labels for terminal legibility
  const plainText = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  console.log(plainText.substring(0, 300) + (plainText.length > 300 ? "..." : ""));
  console.log("========================================================\n");
  return true;
}

export function getWelcomeTemplate(name: string, otp: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h2 style="color: #5E0D82; text-align: center;">Welcome to SilkRoute!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with SilkRoute — the premium ethnic wear destination. Please use the verification code below to activate your account:</p>
      <div style="background-color: #F3E8FF; text-align: center; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #5E0D82; border-radius: 6px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code expires in 10 minutes. If you did not register for an account, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">Built with ❤️ for Indian Artisans. SilkRoute © 2026</p>
    </div>
  `;
}

export function getOrderPlacedTemplate(orderId: string, items: any[], totalAmount: number) {
  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h2 style="color: #5E0D82;">Order Placed! 🛍️</h2>
      <p>Thank you for shopping at SilkRoute. Your order <strong>${orderId}</strong> has been successfully placed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #F3E8FF;">
            <th style="padding: 8px; text-align: left; color: #5E0D82;">Item</th>
            <th style="padding: 8px; text-align: center; color: #5E0D82;">Qty</th>
            <th style="padding: 8px; text-align: right; color: #5E0D82;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 8px; font-weight: bold; text-align: right;">Total Amount:</td>
            <td style="padding: 8px; font-weight: bold; text-align: right; color: #E8A020;">₹${totalAmount}</td>
          </tr>
        </tfoot>
      </table>
      <p>We are preparing your package. You will receive another notification once your items ship.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">SilkRoute © 2026 — All Rights Reserved</p>
    </div>
  `;
}

export function getOrderStatusUpdateTemplate(orderId: string, status: string, trackingNumber?: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
      <h2 style="color: #5E0D82;">Order Update: ${status} 📦</h2>
      <p>Your order <strong>${orderId}</strong> has been updated to: <strong>${status}</strong>.</p>
      ${
        trackingNumber
          ? `<div style="background-color: #FAFAFA; border: 1px dashed #ddd; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Tracking Number:</strong> ${trackingNumber}<br/>
              <strong>Courier Partner:</strong> Delhivery (Simulated)<br/>
              <a href="#" style="color: #5E0D82; text-decoration: underline; display: inline-block; margin-top: 5px;">Track Shipment</a>
             </div>`
          : ""
      }
      <p>Thank you for choosing SilkRoute!</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">SilkRoute © 2026 — All Rights Reserved</p>
    </div>
  `;
}

export function getLowStockAlertTemplate(productName: string, sku: string, stock: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #DC2626; border-radius: 8px; padding: 20px;">
      <h2 style="color: #DC2626;">⚠️ Low Stock Alert</h2>
      <p>Hello Admin,</p>
      <p>The following product inventory has dropped below the threshold value (5 units):</p>
      <div style="background-color: #FAFAFA; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0;">
        <strong>Product:</strong> ${productName}<br/>
        <strong>SKU:</strong> ${sku}<br/>
        <strong>Current Stock:</strong> <span style="color: #DC2626; font-weight: bold;">${stock}</span>
      </div>
      <p>Please restock this item soon or disable sales if inventory is exhausted.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777; text-align: center;">SilkRoute Automated Admin System</p>
    </div>
  `;
}
