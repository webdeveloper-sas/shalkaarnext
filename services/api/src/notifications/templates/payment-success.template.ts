/**
 * Payment Success Email Template
 * Sent when payment is successfully processed
 */

export interface PaymentSuccessEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  paymentAmount: number;
  paymentMethod: string;
  paymentDate: Date;
  transactionId: string;
  orderUrl: string;
  supportEmail: string;
}

export function renderPaymentSuccessHTML(data: PaymentSuccessEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received</title>
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
      background-color: #10b981;
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
    .amount {
      font-size: 32px;
      font-weight: bold;
      margin: 20px 0;
    }
    .section {
      margin-bottom: 25px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 6px;
    }
    .section-title {
      font-weight: bold;
      color: #10b981;
      margin-bottom: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
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
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #666;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Payment Received</h1>
    </div>
    
    <div class="content">
      <p>Hi <strong>${escapeHtml(data.customerName)}</strong>,</p>
      
      <p>We've successfully received your payment. Your order is being processed.</p>
      
      <div class="amount">$${data.paymentAmount.toFixed(2)}</div>
      
      <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="detail-row">
          <span>Order #:</span>
          <strong>${escapeHtml(data.orderNumber)}</strong>
        </div>
        <div class="detail-row">
          <span>Amount:</span>
          <strong>$${data.paymentAmount.toFixed(2)}</strong>
        </div>
        <div class="detail-row">
          <span>Payment Method:</span>
          <strong>${escapeHtml(data.paymentMethod)}</strong>
        </div>
        <div class="detail-row">
          <span>Payment Date:</span>
          <strong>${formatDate(data.paymentDate)}</strong>
        </div>
        <div class="detail-row">
          <span>Transaction ID:</span>
          <span style="font-size: 12px; font-family: monospace;">${escapeHtml(data.transactionId)}</span>
        </div>
      </div>
      
      <p>Your order will be shipped within 1-2 business days. You'll receive a shipping confirmation with tracking details.</p>
      
      <p>
        <a href="${escapeHtml(data.orderUrl)}" class="button">View Your Order</a>
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

export function renderPaymentSuccessText(data: PaymentSuccessEmailData): string {
  return `
Payment Received

Hi ${data.customerName},

We've successfully received your payment. Your order is being processed.

Payment Amount: $${data.paymentAmount.toFixed(2)}

---

PAYMENT DETAILS:
Order #: ${data.orderNumber}
Amount: $${data.paymentAmount.toFixed(2)}
Payment Method: ${data.paymentMethod}
Payment Date: ${formatDate(data.paymentDate)}
Transaction ID: ${data.transactionId}

---

Your order will be shipped within 1-2 business days. You'll receive a shipping confirmation with tracking details.

View your order: ${data.orderUrl}

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
