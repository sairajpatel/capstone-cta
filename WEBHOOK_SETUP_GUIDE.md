# Stripe Webhook Setup Guide

## 🎯 **Current Webhook Configuration**

Your Stripe webhook is configured with:
- **Webhook URL**: `https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/webhook`
- **Webhook Secret**: `whsec_qQ**oyqg`
- **Status**: ✅ Enabled
- **Events**: All events enabled (212 events)

## 🔧 **Environment Variables Setup**

You need to add the webhook secret to your backend environment variables:

### **For Local Development (.env file):**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_qQ**oyqg
```

### **For Vercel Production:**
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables"
4. Add:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_qQ**oyqg`
   - **Environment**: Production

## 🧪 **Testing the Webhook**

### **1. Test Webhook Endpoint Accessibility:**
```bash
curl -X GET https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/webhook-test
```

### **2. Test Stripe Configuration:**
```bash
curl -X GET https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/test-stripe-config
```

### **3. Test Payment Confirmation:**
```bash
curl -X POST https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/test-confirm-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"paymentIntentId": "pi_test_123", "bookingId": "YOUR_BOOKING_ID"}'
```

## 🔍 **Webhook Verification Steps**

### **Step 1: Check Environment Variables**
Make sure your backend has the correct webhook secret:
```javascript
console.log('Webhook secret:', process.env.STRIPE_WEBHOOK_SECRET);
```

### **Step 2: Verify Webhook URL**
The webhook URL should be accessible and return a 200 status.

### **Step 3: Test Payment Flow**
1. Create a test booking
2. Make a test payment
3. Check Stripe Dashboard for webhook events
4. Check your server logs for webhook processing

## 📊 **Monitoring Webhook Events**

### **In Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Click on your webhook endpoint
3. View "Events" tab to see incoming events

### **In Your Server Logs:**
Look for these log messages:
```
=== WEBHOOK RECEIVED ===
Webhook signature verified successfully
Event type: payment_intent.succeeded
Booking updated successfully: YES
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Webhook Not Receiving Events**
- **Solution**: Check if your Vercel deployment is public and accessible
- **Solution**: Verify the webhook URL is correct in Stripe Dashboard

### **Issue 2: Signature Verification Failed**
- **Solution**: Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
- **Solution**: Check that the webhook secret matches exactly

### **Issue 3: Booking Status Not Updating**
- **Solution**: Check MongoDB connection
- **Solution**: Verify booking ID in payment metadata
- **Solution**: Check server logs for errors

## ✅ **Verification Checklist**

- [ ] Webhook secret added to environment variables
- [ ] Webhook URL is accessible (returns 200)
- [ ] Stripe configuration test passes
- [ ] Test payment creates webhook event
- [ ] Booking status updates after payment
- [ ] Server logs show webhook processing

## 🔄 **Manual Webhook Test**

If webhooks aren't working, you can manually trigger a payment confirmation:

```bash
curl -X POST https://capstone-cta-backend-latest-34wykljo5-sairajs-projects-0ce2375b.vercel.app/payments/webhook-test-payment \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "YOUR_BOOKING_ID"}'
```

## 📞 **Next Steps**

1. **Add the webhook secret to your environment variables**
2. **Deploy the updated backend to Vercel**
3. **Test a payment to verify webhook functionality**
4. **Check both Stripe Dashboard and server logs**

The webhook should now work properly once you add the `STRIPE_WEBHOOK_SECRET` to your environment variables! 🎫✨ 