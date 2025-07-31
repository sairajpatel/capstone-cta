# 🔧 Webhook Fix Guide - Authentication Issue

## 🚨 **Root Cause Identified**

The webhook is not receiving events because your **Vercel deployment is protected by authentication**. When Stripe tries to send webhook events, it gets redirected to a login page instead of reaching your webhook endpoint.

## ✅ **Immediate Fixes Applied**

### **1. Updated Vercel Configuration**
- ✅ **Fixed CORS**: Changed `Access-Control-Allow-Origin` to `*` to allow Stripe
- ✅ **Added Stripe Headers**: Added `Stripe-Signature` to allowed headers
- ✅ **Increased Timeout**: Set `maxDuration: 30` for webhook processing

### **2. Enhanced Webhook Handler**
- ✅ **Better Logging**: Added comprehensive logging for debugging
- ✅ **Error Handling**: Improved error handling for webhook processing
- ✅ **Signature Verification**: Enhanced signature verification

## 🚀 **Next Steps to Fix**

### **Step 1: Deploy Updated Backend**
```bash
# Deploy the updated backend to Vercel
vercel --prod
```

### **Step 2: Test Webhook Accessibility**
After deployment, test if the webhook endpoint is accessible:

```bash
# Test webhook endpoint
curl -X GET https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/webhook-test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook endpoint is accessible",
  "timestamp": "2025-07-29T...",
  "stripeInitialized": true,
  "webhookSecretConfigured": true
}
```

### **Step 3: Add Webhook Secret to Environment Variables**

**In Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_qQNCL688C6YqwxxzN97nirzPt11vovag`
   - **Environment**: Production

### **Step 4: Test Payment Flow**
1. Create a test booking
2. Make a test payment
3. Check Stripe Dashboard for webhook events
4. Check your server logs

## 🔍 **Verification Steps**

### **Check 1: Webhook Endpoint Accessibility**
```bash
curl -X GET https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/webhook-test
```

### **Check 2: Stripe Configuration**
```bash
curl -X GET https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/test-config
```

### **Check 3: Manual Webhook Test**
```bash
curl -X POST https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/webhook-test-payment \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "YOUR_BOOKING_ID"}'
```

## 📊 **Monitoring After Fix**

### **In Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Click on your webhook endpoint
3. View "Events" tab - should show incoming events
4. Check "Performance" - should show successful deliveries

### **In Your Server Logs:**
Look for these messages:
```
=== WEBHOOK RECEIVED ===
Webhook signature verified successfully
Event type: payment_intent.succeeded
Booking updated successfully: YES
```

## 🚨 **If Still Not Working**

### **Option 1: Check Vercel Authentication**
1. Go to Vercel Dashboard
2. Check if your deployment has authentication enabled
3. If yes, disable it temporarily for testing

### **Option 2: Use ngrok for Testing**
```bash
# Install ngrok
npm install -g ngrok

# Start your local server
npm start

# Create tunnel
ngrok http 5000

# Update webhook URL in Stripe Dashboard with ngrok URL
```

### **Option 3: Check Vercel Function Limits**
- Ensure your function timeout is sufficient
- Check Vercel logs for any errors

## ✅ **Success Indicators**

After the fix, you should see:
- ✅ **Stripe Dashboard**: Events showing in webhook endpoint
- ✅ **Server Logs**: Webhook processing messages
- ✅ **Booking Status**: Automatically updating from "pending" to "confirmed"
- ✅ **Payment Flow**: Complete payment process working

## 🎯 **Expected Timeline**

1. **Deploy updated backend** (5 minutes)
2. **Add webhook secret** (2 minutes)
3. **Test webhook accessibility** (1 minute)
4. **Make test payment** (2 minutes)
5. **Verify webhook events** (1 minute)

**Total time: ~10 minutes**

The webhook should start working immediately after these steps! 🎫✨ 