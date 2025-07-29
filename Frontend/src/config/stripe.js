// Stripe Configuration
export const STRIPE_CONFIG = {
  // Replace with your actual Stripe publishable key
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here',
  
  // Test card numbers for development
  testCards: {
    success: '4242424242424242',
    decline: '4000000000000002',
    insufficientFunds: '4000000000009995',
    expiredCard: '4000000000000069',
    incorrectCvc: '4000000000000127',
    processingError: '4000000000000119',
  }
};

// Stripe Elements appearance configuration
export const STRIPE_ELEMENTS_OPTIONS = {
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2B293D',
      colorBackground: '#ffffff',
      colorText: '#424770',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  },
}; 