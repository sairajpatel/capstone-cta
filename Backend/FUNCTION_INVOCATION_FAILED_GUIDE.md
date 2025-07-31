# FUNCTION_INVOCATION_FAILED Troubleshooting Guide

## Error: FUNCTION_INVOCATION_FAILED

This error occurs when your Vercel serverless function fails to start or execute properly.

## Common Causes and Solutions

### 1. Invalid vercel.json Configuration

**Problem**: Invalid properties in vercel.json
**Solution**: 
- Remove invalid properties like `"public": true`
- Use only valid Vercel configuration options

### 2. Missing Environment Variables

**Problem**: Required environment variables not set
**Solution**:
1. Go to Vercel dashboard → Settings → Environment Variables
2. Ensure these are set:
   - `MONGO_URI`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `Publishable_Key`

### 3. MongoDB Connection Issues

**Problem**: MongoDB connection failing in serverless environment
**Solution**:
- Check if `MONGO_URI` is correct
- Ensure MongoDB Atlas allows connections from Vercel IPs
- Add your Vercel deployment IP to MongoDB Atlas whitelist

### 4. Function Timeout

**Problem**: Function taking too long to start
**Solution**:
- Check the `maxDuration` setting in vercel.json
- Optimize database connections
- Use connection pooling

### 5. Memory Issues

**Problem**: Function running out of memory
**Solution**:
- Check package.json for memory-intensive dependencies
- Optimize imports and reduce bundle size

## Testing Steps

### Step 1: Test Basic Deployment
```
GET https://your-vercel-domain.vercel.app/test
```

### Step 2: Test Health Check
```
GET https://your-vercel-domain.vercel.app/api/health
```

### Step 3: Test Payment Endpoints
```
GET https://your-vercel-domain.vercel.app/payments/health
GET https://your-vercel-domain.vercel.app/payments/test-config
```

## Debugging Commands

### Check Vercel Logs
```bash
vercel logs your-project-name
```

### Check Function Status
```bash
vercel ls
```

### Redeploy with Debug Info
```bash
vercel --debug
```

## Environment Variables Checklist

Make sure these are set in Vercel:
- [ ] `MONGO_URI` (MongoDB connection string)
- [ ] `STRIPE_SECRET_KEY` (Stripe secret key)
- [ ] `STRIPE_WEBHOOK_SECRET` (Stripe webhook secret)
- [ ] `Publishable_Key` (Stripe publishable key)
- [ ] `NODE_ENV` (set to "production")

## Quick Fixes

### 1. Simplify vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/server.js" }
  ]
}
```

### 2. Add Error Handling
Make sure your server.js doesn't exit on errors in production:
```javascript
if (process.env.NODE_ENV !== 'production') {
  process.exit(1);
}
```

### 3. Test Locally
```bash
npm install
npm start
```

## Common Error Messages

- `FUNCTION_INVOCATION_FAILED` - Function failed to start
- `TIMEOUT` - Function took too long
- `OUT_OF_MEMORY` - Function ran out of memory
- `MODULE_NOT_FOUND` - Missing dependencies

## Next Steps

1. Deploy the updated code
2. Test the basic endpoints
3. Check Vercel logs for specific errors
4. Fix any issues found
5. Test webhook functionality 