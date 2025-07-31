# Stripe Configuration Debug Guide

## Error: "Neither apiKey nor"

This error occurs when Stripe cannot find a valid API key. Here's how to fix it:

### 1. Check Vercel Environment Variables

Go to your Vercel dashboard:
1. Navigate to your project
2. Go to Settings → Environment Variables
3. Check if `STRIPE_SECRET_KEY` is set

### 2. Verify the API Key Format

Your `STRIPE_SECRET_KEY` should:
- Start with `sk_` (for live) or `sk_test_` (for test)
- Be the complete key from your Stripe dashboard
- Not have any extra spaces or characters

### 3. Test Your Configuration

Visit these endpoints to check your configuration:

**Basic health check:**
```
GET https://your-vercel-domain.vercel.app/payments/health
```

**Detailed configuration test:**
```
GET https://your-vercel-domain.vercel.app/payments/test-config
```

These will show you:
- Whether Stripe is initialized
- Environment variable status
- Key format validation
- Specific recommendations
- Webhook accessibility status

### 4. Common Issues

#### Issue: Vercel Authentication Blocking Webhooks
**Solution**: 
1. Go to Vercel dashboard → Settings → Authentication
2. Disable authentication for API routes or configure public access
3. Update vercel.json to allow webhook endpoints

#### Issue: Key not set
**Solution**: Add `STRIPE_SECRET_KEY` to Vercel environment variables

#### Issue: Key is empty
**Solution**: Make sure the key value is not empty in Vercel

#### Issue: Wrong key format
**Solution**: Ensure the key starts with `sk_` and is copied correctly from Stripe

#### Issue: Extra whitespace
**Solution**: Remove any leading/trailing spaces from the key

### 5. Environment Variables Checklist

Make sure these are set in Vercel:
- `STRIPE_SECRET_KEY` (starts with sk_)
- `STRIPE_WEBHOOK_SECRET` (for webhooks)
- `Publishable_Key` (starts with pk_)

### 6. Testing Steps

1. Deploy the updated code
2. Visit `/payments/test-config` endpoint
3. Check the response for specific issues
4. Fix any issues found
5. Test the webhook again

### 7. Webhook Testing

After fixing the configuration:
1. Test webhook endpoint: `/payments/webhook-test`
2. Check if Stripe can reach your webhook
3. Monitor logs for any remaining issues

### 8. Logs to Check

Look for these log messages:
- "Stripe initialized successfully" ✅
- "STRIPE_SECRET_KEY not found" ❌
- "STRIPE_SECRET_KEY format is invalid" ❌
- "STRIPE_SECRET_KEY is empty" ❌ 