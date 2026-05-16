import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const emailFrom = process.env.EMAIL_FROM || 'LuxeShop <noreply@luxeshop.com>';

export const sendOrderConfirmation = async ({ to, order, items }) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a2a;">
        ${item.product.name} ${item.variantSnapshot?.name ? `(${item.variantSnapshot.name})` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; text-align: right;">$${(item.priceAtPurchase * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: emailFrom,
    to,
    subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="background: #0f0f0f; color: #f5f0e8; font-family: 'DM Sans', Arial, sans-serif; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 40px 0;">
            <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; color: #d4a853; margin: 0;">LuxeShop</h1>
          </div>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #2a2a2a;">
            <h2 style="font-size: 1.5rem; margin: 0 0 8px;">Order Confirmed ✓</h2>
            <p style="color: #a8a29e; margin: 0 0 24px;">Order #${order.id.slice(0, 8).toUpperCase()}</p>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #2a2a2a;">
                  <th style="padding: 12px; text-align: left; color: #a8a29e; font-weight: 500;">Item</th>
                  <th style="padding: 12px; text-align: center; color: #a8a29e; font-weight: 500;">Qty</th>
                  <th style="padding: 12px; text-align: right; color: #a8a29e; font-weight: 500;">Price</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; color: #a8a29e;">Subtotal</td>
                  <td style="padding: 12px; text-align: right;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; color: #a8a29e;">Shipping</td>
                  <td style="padding: 12px; text-align: right;">$${order.shipping.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; color: #a8a29e;">Tax</td>
                  <td style="padding: 12px; text-align: right;">$${order.tax.toFixed(2)}</td>
                </tr>
                <tr style="border-top: 2px solid #d4a853;">
                  <td colspan="2" style="padding: 12px; text-align: right; font-weight: 600; color: #d4a853;">Total</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600; color: #d4a853;">$${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p style="text-align: center; color: #78716c; margin-top: 24px; font-size: 0.875rem;">
            Thank you for shopping with LuxeShop.
          </p>
        </div>
      </body>
      </html>
    `,
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  await transporter.sendMail({
    from: emailFrom,
    to,
    subject: 'Welcome to LuxeShop',
    html: `
      <body style="background: #0f0f0f; color: #f5f0e8; font-family: Arial, sans-serif; padding: 40px;">
        <h1 style="color: #d4a853;">Welcome, ${name}!</h1>
        <p>Thank you for joining LuxeShop. Your account is ready.</p>
      </body>
    `,
  });
};

export default transporter;
