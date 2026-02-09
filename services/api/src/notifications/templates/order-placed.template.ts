/**
 * Order Placed Email Template
 * Sent when customer successfully places an order
 */

export interface OrderPlacedEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  orderDate: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery: Date;
  trackingUrl: string;
  supportEmail: string;
}

export function renderOrderPlacedHTML(data: OrderPlacedEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) =>
        `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        <strong>${escapeHtml(item.name)}</strong>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
        <strong>$${item.subtotal.toFixed(2)}</strong>
      </td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .order-number {
      font-size: 24px;
      font-weight: bold;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .summary {
      margin-top: 20px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 6px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: bold;
      color: #667eea;
      border-top: 2px solid #ddd;
      padding-top: 10px;
      margin-top: 10px;
    }
    .address-block {
      margin-bottom: 15px;
    }
    .address-label {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      margin-top: 30px;
    }
    .highlight {
      background-color: #fffacd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin-bottom: 20px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Order Confirmed</h1>
      <div class="order-number">Order #${escapeHtml(data.orderNumber)}</div>
    </div>
    
    <div class="content">
      <p>Hi <strong>${escapeHtml(data.customerName)}</strong>,</p>
      
      <p>Thank you for your order! We've received your purchase and are getting it ready to ship.</p>
      
      <div class="highlight">
        <strong>Estimated Delivery:</strong> ${formatDate(data.estimatedDelivery)}
      </div>
      
      <div class="section">
        <div class="section-title">Order Details</div>
        <table>
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>$${data.subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax:</span>
            <span>$${data.tax.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>$${data.shippingCost.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>$${data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Shipping Address</div>
        <div class="address-block">
          <div class="address-label">Delivery To:</div>
          <p style="margin: 0;">
            ${escapeHtml(data.shippingAddress.name)}<br>
            ${escapeHtml(data.shippingAddress.street)}<br>
            ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.state)} ${escapeHtml(data.shippingAddress.zipCode)}<br>
            ${escapeHtml(data.shippingAddress.country)}
          </p>
        </div>
      </div>
      
      <p>
        <a href="${escapeHtml(data.trackingUrl)}" class="button">Track Your Order</a>
      </p>
      
      <div class="footer">
        <p>Questions? Contact us at ${escapeHtml(data.supportEmail)}</p>
        <p>© 2026 Shalkaar. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderOrderPlacedText(data: OrderPlacedEmailData): string {
  const itemsText = data.items
    .map(
      (item) =>
        `${item.name} x${item.quantity} @ $${item.price.toFixed(2)} = $${item.subtotal.toFixed(2)}`
    )
    .join('\n');

  return `
Order Confirmation

Hi ${data.customerName},

Thank you for your order! We've received your purchase and are getting it ready to ship.

Order #${data.orderNumber}
Placed: ${formatDate(data.orderDate)}
Estimated Delivery: ${formatDate(data.estimatedDelivery)}

---

ORDER ITEMS:
${itemsText}

---

ORDER SUMMARY:
Subtotal: $${data.subtotal.toFixed(2)}
Tax: $${data.tax.toFixed(2)}
Shipping: $${data.shippingCost.toFixed(2)}
TOTAL: $${data.total.toFixed(2)}

---

SHIPPING ADDRESS:
${data.shippingAddress.name}
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

---

Track your order: ${data.trackingUrl}

Questions? Contact us at ${data.supportEmail}

© 2026 Shalkaar. All rights reserved.
  `.trim();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
