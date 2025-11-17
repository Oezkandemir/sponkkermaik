# PayPal Checkout Integration Guide

## Overview
This document describes the PayPal checkout integration for the Sponk Keramik voucher purchase system using the PayPal Orders v2 API.

## Setup Instructions

### 1. Get PayPal API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Create or select your application
3. Copy your **Client ID** and **Secret**
4. Note: Use **Sandbox** credentials for testing, **Live** credentials for production

### 2. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id-here
PAYPAL_CLIENT_SECRET=your-paypal-client-secret-here
PAYPAL_ENVIRONMENT=sandbox

# For production, use:
# PAYPAL_ENVIRONMENT=live
```

**Important Notes:**
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is prefixed with `NEXT_PUBLIC_` because it's used in client-side code
- `PAYPAL_CLIENT_SECRET` should NEVER be exposed to the client
- Use `PAYPAL_ENVIRONMENT=sandbox` for testing
- Use `PAYPAL_ENVIRONMENT=live` for production

### 3. Test the Integration

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to the vouchers page or homepage
3. Click "Buy Gift Card" or "Jetzt Gutschein kaufen"
4. Select a voucher amount (40€, 80€, 120€, or 200€)
5. Click "Pay with PayPal" to test the checkout flow

## Architecture

### File Structure

```
lib/paypal/
├── client.ts       # PayPal SDK configuration and client initialization
└── types.ts        # TypeScript interfaces for PayPal data

app/api/paypal/
├── create-order/
│   └── route.ts    # API endpoint to create PayPal orders
└── capture-order/
    └── route.ts    # API endpoint to capture completed payments

components/
└── VoucherPurchaseModal.tsx  # UI component with PayPal integration
```

### API Endpoints

#### POST `/api/paypal/create-order`
Creates a new PayPal order for voucher purchase.

**Request Body:**
```json
{
  "amount": 80,
  "currency": "EUR",
  "description": "Sponk Keramik Gift Voucher - 80€"
}
```

**Response:**
```json
{
  "id": "ORDER_ID",
  "status": "CREATED",
  "links": [
    {
      "href": "https://www.paypal.com/checkoutnow?token=ORDER_ID",
      "rel": "approve",
      "method": "GET"
    }
  ]
}
```

#### POST `/api/paypal/capture-order`
Captures a completed PayPal order.

**Request Body:**
```json
{
  "orderID": "ORDER_ID"
}
```

**Response:**
```json
{
  "id": "ORDER_ID",
  "status": "COMPLETED",
  "purchase_units": [...]
}
```

## Payment Flow

1. **User selects voucher amount** → VoucherPurchaseModal shows amount selection
2. **User clicks "Pay with PayPal"** → Frontend calls `/api/paypal/create-order`
3. **Order created** → PayPal returns order ID and approval URL
4. **User redirected to PayPal** → User completes payment on PayPal website
5. **Payment approved** → Frontend calls `/api/paypal/capture-order`
6. **Order captured** → Payment completed, voucher code generated
7. **Confirmation shown** → User sees order details and voucher code

## Features

### Current Implementation
- ✅ PayPal SDK integration with latest `@paypal/paypal-server-sdk`
- ✅ Secure server-side order creation
- ✅ Secure server-side payment capture
- ✅ Multi-language support (German/English)
- ✅ Beautiful modal UI with voucher selection
- ✅ Real-time payment processing status
- ✅ Error handling and user feedback
- ✅ Voucher code generation

### TODO - Future Enhancements
- ⏳ PayPal callback handler for return/cancel URLs
- ⏳ Database integration to store voucher orders
- ⏳ Email confirmation with voucher PDF
- ⏳ Admin panel for voucher management
- ⏳ Voucher redemption system
- ⏳ Refund handling

## Security Considerations

1. **Client Secret Protection**: Never expose `PAYPAL_CLIENT_SECRET` to the client
2. **Server-Side Processing**: All PayPal API calls are made from server-side API routes
3. **Order Verification**: Always verify order status before granting access
4. **Environment Separation**: Use sandbox for development, live for production
5. **HTTPS Required**: PayPal requires HTTPS for production

## Testing with PayPal Sandbox

### Sandbox Test Accounts

PayPal provides test accounts for sandbox testing:
- **Buyer Account**: Use to simulate customer purchases
- **Seller Account**: Your business account for receiving payments

### Test Credit Cards

PayPal Sandbox provides test credit cards:
- Visa: 4111 1111 1111 1111
- Mastercard: 5555 5555 5555 4444
- Amex: 3782 822463 10005

**Note**: These only work in sandbox mode!

## Troubleshooting

### Common Issues

**Error: "PayPal credentials are not configured"**
- Solution: Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` to `.env.local`

**Error: "Failed to create order"**
- Check that your PayPal credentials are valid
- Verify you're using the correct environment (sandbox vs live)
- Check the server console for detailed error messages

**Payment window doesn't open**
- Check that pop-ups are enabled in your browser
- Verify the approval URL is being returned correctly
- Check browser console for JavaScript errors

### Debug Mode

To enable detailed logging, the PayPal client is configured with logging:
```typescript
logging: {
  logLevel: 'info',
  logRequest: { logBody: true },
  logResponse: { logHeaders: true },
}
```

Check your server console for detailed request/response logs.

## Production Checklist

Before going live:
- [ ] Switch `PAYPAL_ENVIRONMENT` to `live`
- [ ] Update credentials to live PayPal credentials
- [ ] Set up proper callback URLs
- [ ] Implement database voucher storage
- [ ] Set up email confirmation system
- [ ] Test thoroughly with real PayPal account
- [ ] Verify webhook handling (if implemented)
- [ ] Enable HTTPS on your domain
- [ ] Review PayPal's compliance requirements

## Resources

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Orders v2 API](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Server SDK (Node.js)](https://github.com/paypal/PayPal-node-SDK)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)

## Support

For issues with the integration:
1. Check the troubleshooting section above
2. Review the PayPal API logs in the server console
3. Consult the PayPal Developer Documentation
4. Contact PayPal Developer Support

---

**Last Updated**: November 16, 2025
**Integration Version**: 2.0.0 (using @paypal/paypal-server-sdk)


