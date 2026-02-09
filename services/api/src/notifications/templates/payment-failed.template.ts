/**
 * Payment Failed Email Template
 * Sent when payment processing fails
 */

export interface PaymentFailedEmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderNumber: string;
  failureReason: string;
  attemptedAmount: number;
  orderUrl: string;
  retryUrl: string;
  supportEmail: string;
}

export function renderPaymentFailedHTML(data: PaymentFailedEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Failed</title>
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
      background-color: #ef4444;
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
    .alert {
      background-color: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .amount {
      font-size: 28px;
      font-weight: bold;
      margin: 20px 0;
      color: #ef4444;
    }
    .section {
      margin-bottom: 25px;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 6px;
    }
    .section-title {
      font-weight: bold;
      color: #ef4444;
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
      background-color: #ef4444;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
      font-weight: bold;
      margin-right: 10px;
    }
    .button.secondary {
      background-color: #6b7280;
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
      <h1>⚠ Payment Failed</h1>
    </div>
    
    <div class="content">
      <p>Hi <strong>${escapeHtml(data.customerName)}</strong>,</p>
      
      <div class="alert">
        <strong>We couldn't process your payment</strong>
      </div>
      
      <p>Unfortunately, your payment of <strong>$${data.attemptedAmount.toFixed(2)}</strong> for order <strong>#${escapeHtml(data.orderNumber)}</strong> could not be processed.</p>
      
      <div class="section">
        <div class="section-title">Failure Reason</div>
        <p>${escapeHtml(data.failureReason)}</p>
      </div>
      
      <div class="section">
        <div class="section-title">What You Can Do</div>
        <ul>
          <li><strong>Try again:</strong> Update your payment method and retry the payment</li>
          <li><strong>Contact support:</strong> If you continue to experience issues, our team can help</li>
          <li><strong>Use a different card:</strong> Try a different payment method</li>
        </ul>
      </div>
      
      <p>
        <a href="${escapeHtml(data.retryUrl)}" class="button">Retry Payment</a>
        <a href="${escapeHtml(data.orderUrl)}" class="button secondary">View Order</a>
      </p>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        <strong>Note:</strong> Your order is being held for 24 hours. Please complete the payment to ensure your order doesn't get cancelled.
      </p>
      
      <div class="footer">
        <p>Need help? Contact us at ${escapeHtml(data.supportEmail)}</p>
        <p>© 2026 Shalkaar. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function renderPaymentFailedText(data: PaymentFailedEmailData): string {
  return `
Payment Failed

Hi ${data.customerName},

Unfortunately, we couldn't process your payment of $${data.attemptedAmount.toFixed(2)} for order #${data.orderNumber}.

---

FAILURE REASON:
${data.failureReason}

---

WHAT YOU CAN DO:
- Try again: Update your payment method and retry the payment
- Contact support: If you continue to experience issues, our team can help
- Use a different card: Try a different payment method

Retry payment: ${data.retryUrl}
View order: ${data.orderUrl}

NOTE: Your order is being held for 24 hours. Please complete the payment to ensure your order doesn't get cancelled.

---

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
