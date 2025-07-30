import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// In Vite, environment variables must be prefixed with VITE_
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here');

export default stripePromise; 