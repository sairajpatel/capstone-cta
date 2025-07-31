# Stripe Webhook Setup Guide

## 🔧 **Webhook Configuration Issues & Solutions**

### **Current Issues:**
1. **Webhook URL not configured in Stripe Dashboard**
2. **Webhook Secret not set in environment variables**
3. **HTTPS requirement for production**
4. **Raw body parsing configuration**

### **Step-by-Step Setup:**

#### **1. Get Your Webhook URL**
- **Local Development**: `http://localhost:5000/payments/webhook`
- **Production**: `https://capstone-cta-backend-latest.vercel.app/payments/webhook`

#### **2. Configure Webhook in Stripe Dashboard**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Local**: `http://localhost:5000/payments/webhook`
   - **Production**: `https://capstone-cta-backend-latest.vercel.app/payments/webhook`
4. Select events to listen for:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
5. Click **"Add endpoint"**

#### **3. Get Webhook Secret**
1. After creating the webhook, click on it
2. Click **"Reveal"** next to the signing secret
3. Copy the webhook secret (starts with `whsec_`)

#### **4. Set Environment Variable**
Add to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### **5. Test Webhook Endpoint**
Test if your webhook endpoint is accessible:
- **Local**: `http://localhost:5000/payments/webhook-test`
- **Production**: `https://capstone-cta-backend-latest.vercel.app/payments/webhook-test`

#### **6. Test Webhook Payment Processing**
Test webhook payment processing:
- **Local**: `POST http://localhost:5000/payments/webhook-test-payment`
- **Body**: `{"bookingId": "your_booking_id"}`

#### **7. Verify Webhook in Stripe Dashboard**
1. Go to your webhook in Stripe Dashboard
2. Check the **"Recent deliveries"** section
3. You should see successful deliveries after payments

### **Troubleshooting:**

#### **If webhook deliveries are failing:**
1. **Check URL**: Ensure the webhook URL is correct and accessible
2. **Check HTTPS**: Production webhooks require HTTPS
3. **Check Secret**: Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
4. **Check Logs**: Check your server logs for webhook errors

#### **If webhook is not updating booking status:**
1. **Check Metadata**: Ensure `bookingId` is included in payment intent metadata
2. **Check Database**: Verify the booking exists and belongs to the user
3. **Check Logs**: Look for webhook processing logs

### **Manual Testing:**
You can manually test the webhook by making a test payment and checking:
1. **Stripe Dashboard**: Recent deliveries section
2. **Server Logs**: Webhook processing logs
3. **Database**: Booking status should change to 'confirmed'

### **Production Considerations:**
1. **HTTPS Required**: Stripe webhooks require HTTPS in production
2. **Vercel Configuration**: Ensure your Vercel deployment is accessible
3. **Environment Variables**: Set webhook secret in Vercel environment variables
4. **CORS**: Webhook endpoints should not have CORS restrictions

### **Current Implementation:**
- ✅ **Webhook Endpoint**: `/payments/webhook`
- ✅ **Raw Body Parsing**: Configured for webhook endpoint
- ✅ **Event Handling**: `payment_intent.succeeded` and `payment_intent.payment_failed`
- ✅ **Booking Update**: Automatically updates booking status
- ✅ **Error Handling**: Proper error responses
- ✅ **Test Endpoints**: Available for debugging

### **Next Steps:**
1. Configure webhook in Stripe Dashboard
2. Set webhook secret in environment variables
3. Test with a real payment
4. Monitor webhook deliveries in Stripe Dashboard

### **Quick Test Commands:**

#### **Test Webhook Endpoint:**
```bash
# Local
curl -X GET "http://localhost:5000/payments/webhook-test"

# Production
curl -X GET "https://capstone-cta-backend-latest.vercel.app/payments/webhook-test"
```

#### **Test Webhook Payment Processing:**
```bash
# Local
curl -X POST "http://localhost:5000/payments/webhook-test-payment" \
  -H "Content-Type: application/json" \
  -d '{"bookingId": "your_booking_id"}'
```

### **Webhook URL Summary:**
- **Local Development**: `http://localhost:5000/payments/webhook`
- **Production**: `https://capstone-cta-backend-latest.vercel.app/payments/webhook`
- **Test Endpoint**: `http://localhost:5000/payments/webhook-test`
- **Test Payment**: `http://localhost:5000/payments/webhook-test-payment` 