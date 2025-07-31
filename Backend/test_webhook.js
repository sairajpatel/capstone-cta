const axios = require('axios');

// Test webhook locally
async function testWebhook() {
    try {
        const testEvent = {
            id: 'evt_test_' + Date.now(),
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_test_' + Date.now(),
                    status: 'succeeded',
                    metadata: {
                        bookingId: 'test_booking_id',
                        eventId: 'test_event_id',
                        userId: 'test_user_id'
                    }
                }
            }
        };

        console.log('Testing webhook with event:', testEvent);

        const response = await axios.post('http://localhost:5000/payments/webhook', 
            JSON.stringify(testEvent),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Stripe-Signature': 'test_signature',
                    'x-test-mode': 'true' // Enable test mode for development
                }
            }
        );

        console.log('Webhook test successful:', response.status);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Webhook test failed:', error.response?.data || error.message);
    }
}

// Test webhook endpoint accessibility
async function testWebhookEndpoint() {
    try {
        const response = await axios.get('http://localhost:5000/payments/webhook-test');
        console.log('Webhook endpoint test successful:', response.status);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Webhook endpoint test failed:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    console.log('=== WEBHOOK TESTING ===');
    
    console.log('\n1. Testing webhook endpoint accessibility...');
    await testWebhookEndpoint();
    
    console.log('\n2. Testing webhook with simulated event...');
    await testWebhook();
    
    console.log('\n=== TESTING COMPLETE ===');
}

runTests(); 