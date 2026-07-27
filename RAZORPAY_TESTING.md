# Razorpay Integration Guide

This guide explains how to test and deploy the one-time Razorpay Premium Payment for NotePilot.

## 1. Setup Razorpay Test Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Create an account if you haven't already.
3. Ensure you are in **Test Mode** (toggle at the top menu).

## 2. Environment Variables
Get your test keys from the Razorpay Dashboard (Settings -> API Keys) and add them to your Vercel project and local `.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_PREMIUM_AMOUNT_INR=99
NEXT_PUBLIC_APP_URL=http://localhost:3000 # change to https://notepilot.vercel.app in production
```

*(Note: Razorpay order amount is sent in paise internally, so ₹99 becomes 9900 paise. Set this variable simply to 99.)*

## 3. Webhook Setup
The webhook acts as a secure backup to activate premium in case the user closes their browser before the client-side verification completes.
1. In Razorpay Dashboard, go to **Account & Settings -> Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL**: `https://your-domain.vercel.app/api/razorpay/webhook` (or use Ngrok for local testing).
4. **Secret**: Enter a secure random string (this is your `RAZORPAY_WEBHOOK_SECRET`).
5. **Active Events**: Check `payment.captured` and `order.paid`.
6. Save.

## 4. Test Payment Flow
1. Login to your local NotePilot instance.
2. Go to `/pricing`.
3. Click "Upgrade to Premium — ₹99".
4. The Razorpay checkout modal will open.
5. Enter a test phone number (e.g., `9999999999`) and email.
6. Select any payment method.
7. **To simulate a success**: Choose "Success" from the Razorpay test bank/UPI interface.
8. Wait for the modal to close and the "Premium activated successfully" alert.
9. You should see "✓ Current Plan: Premium" on the pricing page.

## 5. Going Live
1. Toggle Razorpay to **Live Mode**.
2. Generate Live API Keys.
3. Update Vercel Environment Variables:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_live_...`
   - `RAZORPAY_KEY_SECRET` = `live_secret...`
4. Set up a Live Webhook in Razorpay pointing to your Vercel domain.
5. Set `RAZORPAY_WEBHOOK_SECRET` in Vercel to match the live webhook secret.
6. Redeploy Vercel.
