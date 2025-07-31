# Stripe Webhook Debugging Guide

## 🔍 The Problem
Your Vercel serverless function is failing with `FUNCTION_INVOCATION_FAILED` when Stripe tries to send webhooks to `/payments/webhook`.

## ✅ Root Cause & Fix
The main issue was **middleware order** in `server.js`. The raw body parser for Stripe webhooks must come BEFORE the regular JSON parser.

### What Was Fixed:
1. **Middleware Order**: Moved raw body parser before JSON parser
2. **Route Configuration**: Removed duplicate raw body parser from routes
3. **Error Handling**: Added better validation and error messages
4. **Development Mode**: Added test mode for local development

## 🧪 Testing Your Webhook

### 1. Local Testing
```bash
# Start your server
cd Backend
npm start

# In another terminal, test the webhook
node test_webhook.js
```

### 2. Check Vercel Logs
1. Go to https://vercel.com/dashboard
2. Open your project
3. Go to "Functions" tab
4. Find the failing webhook invocation
5. Check the logs for specific error messages

### 3. Test Webhook Endpoint
```bash
# Test if endpoint is accessible
curl -X GET https://your-vercel-app.vercel.app/payments/webhook-test
```

## 🔧 Environment Variables
Make sure these are set in Vercel:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `MONGO_URI`

## 🚨 Common Issues & Solutions

### 1. Signature Verification Failed
**Error**: `Webhook Error: No signatures found matching the expected signature`
**Solution**: 
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook URL in Stripe dashboard matches your Vercel URL
- Verify the webhook secret in Stripe dashboard

### 2. Invalid Request Body
**Error**: `Request body is not a Buffer`
**Solution**: 
- Raw body parser middleware is now correctly configured
- This should be fixed with the middleware order change

### 3. Missing Environment Variables
**Error**: `STRIPE_SECRET_KEY not found`
**Solution**:
- Add environment variables in Vercel dashboard
- Check variable names match exactly

### 4. CORS Issues
**Error**: Origin not allowed
**Solution**:
- CORS is configured to allow Stripe webhooks
- Check `allowedOrigins` in `server.js`

## 🛠️ Development vs Production

### Development Mode
For local testing, you can bypass signature verification:
```javascript
// Add this header to your test requests
'x-test-mode': 'true'
```

### Production Mode
Always use proper signature verification:
```javascript
event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
```

## 📋 Webhook Flow
1. Stripe sends POST to `/payments/webhook`
2. Raw body parser captures the request body as Buffer
3. Signature verification using `STRIPE_WEBHOOK_SECRET`
4. Event processing based on event type
5. Database updates for booking status

## 🔍 Debugging Steps

### Step 1: Check Vercel Logs
```bash
# Look for these log messages:
=== WEBHOOK RECEIVED ===
Webhook signature verified successfully
Event type: payment_intent.succeeded
```

### Step 2: Test Locally
```bash
cd Backend
node test_webhook.js
```

### Step 3: Verify Environment Variables
```bash
# Check if these are set in Vercel:
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGO_URI=mongodb://...
```

### Step 4: Check Stripe Dashboard
1. Go to Stripe Dashboard > Webhooks
2. Verify webhook endpoint URL
3. Check webhook secret
4. Test webhook delivery

## 🚀 Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Webhook URL configured in Stripe dashboard
- [ ] Webhook secret matches between Stripe and Vercel
- [ ] Test webhook delivery in Stripe dashboard
- [ ] Check Vercel function logs for errors

## 📞 Need Help?

If you're still having issues:

1. **Check Vercel Logs**: Look for specific error messages
2. **Test Locally**: Use the test script to verify functionality
3. **Verify Environment**: Ensure all variables are set correctly
4. **Check Stripe Dashboard**: Verify webhook configuration

The main fix was the middleware order - this should resolve the `FUNCTION_INVOCATION_FAILED` error. 