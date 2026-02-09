/**
 * Order Delivered Email Template
 * Sent when order is successfully delivered
 */

export interface OrderDeliveredEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  deliveryDate: Date;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  reviewUrl: string;
  supportEmail: string;
}

export function renderOrderDeliveredHTML(data: OrderDeliveredEmailData): string {
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
  <title>Your Order Delivered</title>
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    .checkmark {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 12px;
      color: #10b981;
      border-bottom: 2px solid #10b981;
      padding-bottom: 8px;
    }
    .info-box {
      background-color: #f0fdf4;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
      font-size: 14px;
      border-left: 4px solid #10b981;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #10b981;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
      margin-right: 10px;
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
      <div class="checkmark">✓</div>
      <h1>Your Order Has Been Delivered!</h1>
    </div>
    
    <div class="content">
      <p>Hi <strong>${escapeHtml(data.customerName)}</strong>,</p>
      
      <p>Excellent! Your order has been successfully delivered on <strong>${formatDate(data.deliveryDate)}</strong>.</p>
      
      <div class="info-box">
        <strong>Order #:</strong> ${escapeHtml(data.orderNumber)}
      </div>
      
      <div class="section">
        <div class="section-title">Items Delivered</div>
        <ul>
          ${itemsHTML}
        </ul>
      </div>
      
      <div class="section">
        <div class="section-title">We'd Love Your Feedback</div>
        <p>How was your experience? Please share your feedback and help us improve.</p>
        <p>
          <a href="${escapeHtml(data.reviewUrl)}" class="button">Leave a Review</a>
        </p>
      </div>
      
      <div class="info-box">
        <strong>What's Next?</strong><br>
        Check out similar products you might like, or explore our new arrivals. Thank you for shopping with us!
      </div>
      
      <div class="footer">
        <p>Questions about your order? Contact us at ${escapeHtml(data.supportEmail)}</p>
        <p>© 2026 Shalkaar. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderOrderDeliveredText(data: OrderDeliveredEmailData): string {
  const itemsText = data.items
    .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
    .join('\n');

  return `
Your Order Has Been Delivered!

Hi ${data.customerName},

Excellent! Your order has been successfully delivered on ${formatDate(data.deliveryDate)}.

---

ORDER #: ${data.orderNumber}

---

ITEMS DELIVERED:
${itemsText}

---

WE'D LOVE YOUR FEEDBACK:
How was your experience? Please share your feedback and help us improve.

Leave a Review: ${data.reviewUrl}

---

Thank you for shopping with us!

Questions about your order? Contact us at ${data.supportEmail}

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
