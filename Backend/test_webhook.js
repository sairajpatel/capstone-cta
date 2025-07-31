const axios = require('axios');

// Test configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
const WEBHOOK_URL = `${BASE_URL}/payments/webhook`;

// Test webhook endpoint
async function testWebhook() {
    console.log('🧪 Testing Webhook Endpoint...');
    console.log('URL:', WEBHOOK_URL);
    
    try {
        // Test 1: Basic webhook test (no signature verification in dev mode)
        console.log('\n📝 Test 1: Basic webhook test');
        const testEvent = {
            type: 'payment_intent.succeeded',
            data: {
                object: {
                    id: 'pi_test_' + Date.now(),
                    status: 'succeeded',
                    amount: 2000, // $20.00
                    currency: 'usd',
                    metadata: {
                        bookingId: 'test_booking_id',
                        eventId: 'test_event_id',
                        userId: 'test_user_id'
                    }
                }
            }
        };

        const response = await axios.post(WEBHOOK_URL, testEvent, {
            headers: {
                'Content-Type': 'application/json',
                'x-test-mode': 'true' // Bypass signature verification in dev mode
            }
        });

        console.log('✅ Test 1 passed:', response.status, response.data);

        // Test 2: Checkout session completed
        console.log('\n📝 Test 2: Checkout session completed');
        const checkoutEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_' + Date.now(),
                    payment_intent: 'pi_test_' + Date.now(),
                    metadata: {
                        bookingId: 'test_booking_id_2'
                    }
                }
            }
        };

        const response2 = await axios.post(WEBHOOK_URL, checkoutEvent, {
            headers: {
                'Content-Type': 'application/json',
                'x-test-mode': 'true'
            }
        });

        console.log('✅ Test 2 passed:', response2.status, response2.data);

        // Test 3: Payment failed
        console.log('\n📝 Test 3: Payment failed');
        const failedEvent = {
            type: 'payment_intent.payment_failed',
            data: {
                object: {
                    id: 'pi_test_' + Date.now(),
                    status: 'payment_failed',
                    metadata: {
                        bookingId: 'test_booking_id_3'
                    }
                }
            }
        };

        const response3 = await axios.post(WEBHOOK_URL, failedEvent, {
            headers: {
                'Content-Type': 'application/json',
                'x-test-mode': 'true'
            }
        });

        console.log('✅ Test 3 passed:', response3.status, response3.data);

        console.log('\n🎉 All webhook tests passed!');

    } catch (error) {
        console.error('❌ Webhook test failed:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
    }
}

// Test webhook configuration
async function testWebhookConfig() {
    console.log('\n🔧 Testing Webhook Configuration...');
    
    try {
        const response = await axios.get(`${BASE_URL}/payments/webhook-test`);
        console.log('✅ Webhook config test passed:', response.data);
    } catch (error) {
        console.error('❌ Webhook config test failed:', error.response?.data || error.message);
    }
}

// Test Stripe configuration
async function testStripeConfig() {
    console.log('\n💳 Testing Stripe Configuration...');
    
    try {
        const response = await axios.get(`${BASE_URL}/payments/test-config`);
        console.log('✅ Stripe config test passed:', response.data);
    } catch (error) {
        console.error('❌ Stripe config test failed:', error.response?.data || error.message);
    }
}

// Test health check
async function testHealthCheck() {
    console.log('\n🏥 Testing Health Check...');
    
    try {
        const response = await axios.get(`${BASE_URL}/payments/health`);
        console.log('✅ Health check passed:', response.data);
    } catch (error) {
        console.error('❌ Health check failed:', error.response?.data || error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting Webhook Tests...\n');
    
    await testHealthCheck();
    await testStripeConfig();
    await testWebhookConfig();
    await testWebhook();
    
    console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    testWebhook,
    testWebhookConfig,
    testStripeConfig,
    testHealthCheck,
    runAllTests
}; 