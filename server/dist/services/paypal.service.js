import 'dotenv/config';
import fetch from 'node-fetch';
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
// Get PayPal OAuth token
const getAccessToken = async () => {
    try {
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        return data.access_token;
    }
    catch (error) {
        console.error('Error getting PayPal access token:', error);
        throw new Error('Failed to get PayPal access token');
    }
};
// Create a product for subscription
export const createProduct = async (name, description, type = 'SERVICE') => {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                name,
                description,
                type,
                category: 'EDUCATIONAL_AND_TEXTBOOKS'
            })
        });
        return await response.json();
    }
    catch (error) {
        console.error('Error creating product:', error);
        throw new Error('Failed to create PayPal product');
    }
};
// Create a subscription plan
export const createPlan = async (productId, name, description, amount, currency = 'USD', intervalUnit = 'MONTH', intervalCount = 1) => {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                product_id: productId,
                name,
                description,
                status: 'ACTIVE',
                billing_cycles: [
                    {
                        frequency: {
                            interval_unit: intervalUnit,
                            interval_count: intervalCount
                        },
                        tenure_type: 'REGULAR',
                        sequence: 1,
                        total_cycles: 0, // Infinite billing cycles (until cancelled)
                        pricing_scheme: {
                            fixed_price: {
                                value: amount,
                                currency_code: currency
                            }
                        }
                    }
                ],
                payment_preferences: {
                    auto_bill_outstanding: true,
                    setup_fee: {
                        value: '0',
                        currency_code: currency
                    },
                    setup_fee_failure_action: 'CONTINUE',
                    payment_failure_threshold: 3
                }
            })
        });
        return await response.json();
    }
    catch (error) {
        console.error('Error creating plan:', error);
        throw new Error('Failed to create PayPal subscription plan');
    }
};
// Create a subscription
export const createSubscription = async (planId, userEmail) => {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                plan_id: planId,
                subscriber: {
                    email_address: userEmail
                },
                application_context: {
                    brand_name: 'EduCollab',
                    locale: 'en-US',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'SUBSCRIBE_NOW',
                    payment_method: {
                        payer_selected: 'PAYPAL',
                        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                    },
                    return_url: `${process.env.CLIENT_URL}/payment/success`,
                    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`
                }
            })
        });
        return await response.json();
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create PayPal subscription');
    }
};
// Get subscription details
export const getSubscriptionDetails = async (subscriptionId) => {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });
        return await response.json();
    }
    catch (error) {
        console.error('Error getting subscription details:', error);
        throw new Error('Failed to get PayPal subscription details');
    }
};
// Cancel a subscription
export const cancelSubscription = async (subscriptionId, reason) => {
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                reason
            })
        });
        // If successful, response will be empty with 204 status
        return response.status === 204;
    }
    catch (error) {
        console.error('Error cancelling subscription:', error);
        throw new Error('Failed to cancel PayPal subscription');
    }
};
