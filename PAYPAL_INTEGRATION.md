# 💳 PayPal Integration - Complete Guide

## 🎯 Overview

The Sponk Keramik website now supports PayPal checkout for purchasing gift vouchers. After successful payment, vouchers are automatically saved to the user's account and can be viewed in the "My Vouchers" page.

## ✨ Features

- ✅ PayPal Orders API v2 integration
- ✅ Secure payment processing
- ✅ Automatic voucher generation with unique codes
- ✅ Vouchers saved to user account immediately
- ✅ 12-month validity period
- ✅ Real-time status tracking (paid/pending)
- ✅ View purchased vouchers in account

## 🚀 Quick Setup

### 1. Create PayPal App

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Sign in with your PayPal account
3. Navigate to **Apps & Credentials**
4. Click **Create App**
5. Choose **Merchant** as the app type
6. Copy the **Client ID** and **Secret**

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# For Sandbox (Testing):
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# For Production:
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-production-client-id
# PAYPAL_CLIENT_SECRET=your-production-client-secret
# PAYPAL_API_URL=https://api-m.paypal.com
# NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Create Supabase Vouchers Table

Run the SQL from `SUPABASE_VOUCHERS_SCHEMA.md` in your Supabase SQL Editor:

```bash
# See SUPABASE_VOUCHERS_SCHEMA.md for complete SQL
```

### 4. Test the Integration

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Sign in to your account

3. Click on "Buy Gift Card" in the hero section

4. Select a voucher amount (40€, 80€, 120€, 200€)

5. Click "Buy" and complete PayPal checkout

6. After payment, the voucher appears in "My Vouchers"

## 🏗️ Architecture

### API Routes

#### `/api/paypal/create-order`
- Creates a PayPal order
- Returns order ID for PayPal checkout
- Handles authentication

```typescript
POST /api/paypal/create-order
Body: { amount: number }
Response: { orderID: string }
```

#### `/api/paypal/capture-order`
- Captures the PayPal payment
- Generates voucher code
- Saves voucher to database
- Returns voucher details

```typescript
POST /api/paypal/capture-order
Body: { orderID: string, userId?: string }
Response: {
  success: boolean,
  voucherCode: string,
  amount: number,
  orderNumber: string,
  validUntil: string
}
```

### Component Flow

```
HeroSection / VouchersPage
    ↓ (Opens modal)
VoucherPurchaseModal
    ↓ (User selects amount)
PayPal Checkout
    ↓ (Payment approved)
Capture Order API
    ↓ (Save to database)
Confirmation Screen
    ↓ (Voucher visible in account)
My Vouchers Page
```

## 📊 Database Schema

### `vouchers` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | User who purchased the voucher |
| code | TEXT | Unique voucher code (e.g., SPONK-ABC12345) |
| value | DECIMAL | Voucher value in EUR |
| status | TEXT | active, used, or expired |
| paypal_order_id | TEXT | PayPal order ID for tracking |
| valid_until | TIMESTAMP | Expiry date (12 months from purchase) |
| used_at | TIMESTAMP | When the voucher was used |
| created_at | TIMESTAMP | Purchase date |
| updated_at | TIMESTAMP | Last update |

## 🔐 Security

- ✅ PayPal Client Secret stored server-side only
- ✅ Row Level Security (RLS) enabled on vouchers table
- ✅ Users can only view their own vouchers
- ✅ Service role required for voucher creation
- ✅ Payment verification before voucher generation

## 🎨 UI Components

### VoucherPurchaseModal

Two-step modal:

1. **Amount Selection**
   - Four voucher cards (40€, 80€, 120€, 200€)
   - Beautiful gradient design with Sponk logo
   - Benefits section

2. **PayPal Checkout**
   - Integrated PayPal buttons
   - Loading states
   - Error handling

3. **Confirmation Screen**
   - Voucher code display
   - Payment status
   - Validity date
   - Usage instructions

### My Vouchers Page

- Active vouchers tab
- Used vouchers tab
- Copy code to clipboard
- Real-time database loading
- Auto-refresh after purchase

## 🧪 Testing

### Test with PayPal Sandbox

1. Use sandbox credentials in `.env.local`

2. Test accounts:
   - **Buyer**: Use any PayPal sandbox account
   - **Seller**: Your sandbox business account

3. Test cards (no real money):
   - Visa: 4032039319172298
   - Mastercard: 5494036319107115

### Test Flow

1. ✅ Create order (should return orderID)
2. ✅ Complete PayPal checkout
3. ✅ Capture order (should return voucher code)
4. ✅ Check voucher in database
5. ✅ Verify voucher appears in "My Vouchers"
6. ✅ Test code copying
7. ✅ Check expiry date is 12 months ahead

## 📝 Voucher Code Format

```
SPONK-XXXXXXXX
```

- Prefix: `SPONK-`
- 8 random characters (A-Z, 2-9)
- No similar characters (I, O, 1, 0)
- Example: `SPONK-A3B9C7D2`

## 🔄 Workflow

1. **User clicks "Buy Gift Card"**
   - Modal opens
   - Selects amount (40€, 80€, 120€, 200€)

2. **PayPal Checkout**
   - Creates PayPal order
   - User completes payment on PayPal
   - Payment approved

3. **Order Capture**
   - Captures PayPal payment
   - Generates unique voucher code
   - Calculates expiry date (12 months)
   - Saves to `vouchers` table

4. **Confirmation**
   - Shows voucher code
   - Displays payment status
   - Shows validity period
   - Explains how to use

5. **My Vouchers Page**
   - Automatically refreshes
   - New voucher visible immediately
   - Status: "Paid" / "Active"

## 🚨 Error Handling

- Payment failures show user-friendly error messages
- Database errors logged server-side
- Voucher creation failures trigger admin notification (TODO)
- Duplicate order IDs prevented
- Invalid amounts rejected

## 📋 TODO / Future Improvements

- [ ] Send email confirmation with voucher code
- [ ] Admin notification on voucher creation failure
- [ ] Refund handling
- [ ] Gift voucher sending to other emails
- [ ] Printable voucher PDF
- [ ] QR code for voucher redemption
- [ ] Voucher statistics dashboard
- [ ] Automatic expiry checking (cron job)

## 🌐 Production Checklist

Before going live:

- [ ] Switch to production PayPal credentials
- [ ] Update `PAYPAL_API_URL` to production
- [ ] Set correct `NEXT_PUBLIC_BASE_URL`
- [ ] Test with real PayPal account
- [ ] Enable PayPal live mode in dashboard
- [ ] Set up webhook for payment notifications
- [ ] Configure email notifications
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Test refund process
- [ ] Set up backup strategy for vouchers table

## 📚 Resources

- [PayPal Orders API v2 Documentation](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal React SDK](https://paypal.github.io/react-paypal-js/)
- [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
- [PayPal Sandbox Testing](https://developer.paypal.com/tools/sandbox/)

## 🆘 Troubleshooting

### PayPal buttons not showing

- Check `NEXT_PUBLIC_PAYPAL_CLIENT_ID` is set
- Verify PayPal app is active in dashboard
- Check browser console for errors

### Order capture fails

- Verify `PAYPAL_CLIENT_SECRET` is correct
- Check PayPal API URL (sandbox vs production)
- Inspect server logs for detailed error

### Voucher not appearing in account

- Check user is signed in
- Verify vouchers table exists in Supabase
- Check RLS policies allow user to read their vouchers
- Inspect browser network tab for API errors

### "Payment not completed" error

- Ensure PayPal checkout completed successfully
- Check PayPal order status in dashboard
- Verify order capture returned status "COMPLETED"

---

**Last Updated**: November 16, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (after checklist completion)






