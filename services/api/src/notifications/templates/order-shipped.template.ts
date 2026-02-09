/**
 * Order Shipped Email Template
 * Sent when order is shipped
 */

export interface OrderShippedEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  shippedDate: Date;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: Date;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  supportEmail: string;
}

export function renderOrderShippedHTML(data: OrderShippedEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} (Qty: ${item.quantity})</li>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped</title>
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
    .tracking-card {
      background-color: #f0f9ff;
      border: 2px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .tracking-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .tracking-number {
      font-size: 24px;
      font-family: monospace;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 15px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 8px;
    }
    .address-block {
      margin-bottom: 15px;
    }
    .address-label {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
      font-size: 13px;
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
    .info-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      margin-top: 30px;
    }
    ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Your Order Has Shipped!</h1>
    </div>
    
    <div class="content">
      <p>Hi <strong>${escapeHtml(data.customerName)}</strong>,</p>
      
      <p>Great news! Your order is on its way. Check the tracking information below to follow your package.</p>
      
      <div class="tracking-card">
        <div class="tracking-label">Tracking Number</div>
        <div class="tracking-number">${escapeHtml(data.trackingNumber)}</div>
        <div class="tracking-label">Carrier</div>
        <p style="margin: 0; font-size: 16px;">${escapeHtml(data.carrier)}</p>
      </div>
      
      <div class="section">
        <div class="section-title">Shipment Details</div>
        <div class="info-box">
          <strong>Order #:</strong> ${escapeHtml(data.orderNumber)}<br>
          <strong>Shipped:</strong> ${formatDate(data.shippedDate)}<br>
          <strong>Estimated Delivery:</strong> ${formatDate(data.estimatedDelivery)}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Items in This Shipment</div>
        <ul>
          ${itemsHTML}
        </ul>
      </div>
      
      <div class="section">
        <div class="section-title">Delivery Address</div>
        <div class="address-block">
          <div class="address-label">Shipping To:</div>
          <p style="margin: 0;">
            ${escapeHtml(data.shippingAddress.name)}<br>
            ${escapeHtml(data.shippingAddress.street)}<br>
            ${escapeHtml(data.shippingAddress.city)}, ${escapeHtml(data.shippingAddress.state)} ${escapeHtml(data.shippingAddress.zipCode)}<br>
            ${escapeHtml(data.shippingAddress.country)}
          </p>
        </div>
      </div>
      
      <p>
        <a href="${escapeHtml(data.trackingUrl)}" class="button">Track Your Package</a>
      </p>
      
      <div class="info-box">
        <strong>Tracking Info:</strong> Use the tracking number above to monitor your package's delivery status. Updates are typically available within 24 hours of shipment.
      </div>
      
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

export function renderOrderShippedText(data: OrderShippedEmailData): string {
  const itemsText = data.items
    .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
    .join('\n');

  return `
Your Order Has Shipped!

Hi ${data.customerName},

Great news! Your order is on its way. Check the tracking information below to follow your package.

---

TRACKING INFORMATION:
Tracking Number: ${data.trackingNumber}
Carrier: ${data.carrier}
View: ${data.trackingUrl}

---

SHIPMENT DETAILS:
Order #: ${data.orderNumber}
Shipped: ${formatDate(data.shippedDate)}
Estimated Delivery: ${formatDate(data.estimatedDelivery)}

---

ITEMS IN THIS SHIPMENT:
${itemsText}

---

DELIVERY ADDRESS:
${data.shippingAddress.name}
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

---

Use the tracking number above to monitor your package's delivery status. Updates are typically available within 24 hours of shipment.

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
