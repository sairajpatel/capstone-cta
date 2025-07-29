import { loadStripe } from '@stripe/stripe-js';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RnkRnPf0w4NBO8yGmMggkmlwZyu2gIw0G6EN9fPmdrwqjaLrXWhQW0bDbORPH1kLvCPxWnxc1oLozcPIZH65D5N00Xx79ygeY');

export default stripePromise; 