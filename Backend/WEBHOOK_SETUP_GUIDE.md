# Stripe Webhook Setup Guide

## ✅ Fixed Issues in Your Code

### 1. Raw Body Handling
- ✅ **Fixed**: Added proper Buffer handling for `req.body`
- ✅ **Fixed**: Added fallback for string body conversion
- ✅ **Fixed**: Improved error handling for invalid body formats

### 2. Webhook Event Handling
- ✅ **Added**: Support for `checkout.session.completed` events
- ✅ **Improved**: Better error logging and debugging
- ✅ **Enhanced**: More robust signature verification

## 🔧 Environment Variables Required

Make sure these are set in your Vercel Dashboard under **Project Settings → Environment Variables**:

```bash
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard)
```

## 🧪 Testing Your Webhook

### 1. Local Testing with Stripe CLI

Install Stripe CLI:
```bash
# Windows (using chocolatey)
choco install stripe-cli

# Or download from: https://github.com/stripe/stripe-cli/releases
```

Login to Stripe:
```bash
stripe login
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:5000/payments/webhook
```

Test webhook events:
```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test checkout session completion
stripe trigger checkout.session.completed

# Test payment failure
stripe trigger payment_intent.payment_failed
```

### 2. Test Your Webhook Endpoint

Your webhook endpoint is available at:
- **Local**: `http://localhost:5000/payments/webhook`
- **Production**: `https://your-app.vercel.app/payments/webhook`

### 3. Manual Testing

You can test the webhook manually using curl:

```bash
# Test webhook endpoint (no signature verification in dev mode)
curl -X POST http://localhost:5000/payments/webhook \
  -H "Content-Type: application/json" \
  -H "x-test-mode: true" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_test_123",
        "status": "succeeded",
        "metadata": {
          "bookingId": "your_booking_id_here"
        }
      }
    }
  }'
```

## 🚀 Deploying to Vercel

### 1. Update Vercel Configuration

Make sure your `vercel.json` is configured properly:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### 2. Set Environment Variables in Vercel

Go to your Vercel Dashboard → Project Settings → Environment Variables:

```bash
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe Dashboard)
NODE_ENV=production
```

### 3. Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://your-app.vercel.app/payments/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy the webhook signing secret and add it to your Vercel environment variables

## 🔍 Debugging Webhook Issues

### 1. Check Webhook Logs

Your webhook handler includes extensive logging. Check your Vercel function logs:

```bash
# View Vercel function logs
vercel logs your-app-name
```

### 2. Test Webhook Configuration

Use the test endpoint to verify your setup:

```bash
# Test webhook configuration
curl https://your-app.vercel.app/payments/webhook-test
```

### 3. Common Issues and Solutions

#### Issue: "Webhook Error: No signatures found matching the expected signature"
**Solution**: 
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook URL is exactly as configured in Stripe
- Check that raw body parsing is working

#### Issue: "Request body is not in the expected format"
**Solution**:
- Ensure `express.raw()` middleware is applied before `express.json()`
- Verify the webhook route path matches exactly

#### Issue: "Stripe not initialized"
**Solution**:
- Check `STRIPE_SECRET_KEY` environment variable
- Verify the key is valid and has proper permissions

## 📊 Monitoring Webhook Events

### 1. Stripe Dashboard
- Go to [Webhooks](https://dashboard.stripe.com/webhooks) in Stripe Dashboard
- Click on your webhook endpoint
- View "Events" tab to see delivery attempts

### 2. Vercel Function Logs
- Check Vercel Dashboard → Functions → View Logs
- Look for webhook-related logs

### 3. Database Monitoring
- Check your MongoDB for updated booking records
- Verify booking status changes after webhook events

## 🎯 Best Practices

1. **Always verify webhook signatures** in production
2. **Handle webhook events idempotently** (safe to process multiple times)
3. **Log all webhook events** for debugging
4. **Test with Stripe CLI** before going live
5. **Monitor webhook delivery** in Stripe Dashboard
6. **Have fallback error handling** for failed webhook processing

## 🚨 Security Considerations

1. **Never log sensitive data** (payment details, webhook secrets)
2. **Use HTTPS** for all webhook endpoints
3. **Verify webhook signatures** to prevent replay attacks
4. **Rate limit webhook endpoints** if needed
5. **Monitor for suspicious activity**

## 📞 Support

If you're still having issues:

1. Check the webhook logs in your Vercel function
2. Verify environment variables are set correctly
3. Test with Stripe CLI locally first
4. Check Stripe Dashboard for webhook delivery status
5. Review the extensive logging in your webhook handler

Your webhook handler now includes comprehensive error handling and logging to help debug any issues! 