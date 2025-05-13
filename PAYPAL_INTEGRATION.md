# PayPal Subscription Integration for EduCollab

This document provides instructions for setting up and testing the PayPal subscription integration in EduCollab.

## Overview

The PayPal integration allows users (students and teachers) to subscribe to the platform with a one-time payment. The subscription system includes:

- Subscription page for users to select and purchase plans
- PayPal Sandbox integration for payment processing
- Admin dashboard to view and manage subscriptions
- Database storage of subscription information

## Setup Instructions

### 1. PayPal Developer Account Setup

1. Create a PayPal Developer account at [developer.paypal.com](https://developer.paypal.com/)
2. Navigate to the Developer Dashboard
3. Create a Sandbox Application:
   - Go to "My Apps & Credentials"
   - Select "Create App" under the Sandbox section
   - Name your app (e.g., "EduCollab")
   - Select "Merchant" as the account type
   - Click "Create App"

4. Get Your Credentials:
   - Once created, you'll see your Client ID and Secret
   - Copy these values as you'll need them for your .env file

5. Create Sandbox Accounts:
   - Go to the "Accounts" section in the Sandbox
   - Create at least one Business (Merchant) account and one Personal (Buyer) account
   - Note the email and password for the Personal account as you'll use these to test payments

### 2. Database Configuration

1. Run the SQL script to create the subscriptions table:
```bash
mysql -u [username] -p [database_name] < server/database/subscriptions.sql
```

### 3. Server Configuration

1. Copy the `.env.example` file to `.env` in the server directory:
```bash
cp server/.env.example server/.env
```

2. Update the `.env` file with your PayPal credentials:
```
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_secret_here
CLIENT_URL=http://localhost:5173
```

3. Install additional dependencies:
```bash
cd server
npm install node-fetch @types/node-fetch
```

### 4. Initialize Subscription Plans

1. Create a script to run the initialization function once to create your plans in PayPal:

```typescript
// server/src/scripts/init-subscription-plans.ts
import { initSubscriptionPlans } from '../controllers/subscription.controller';

async function main() {
  try {
    console.log('Initializing subscription plans...');
    const plans = await initSubscriptionPlans();
    console.log('Plans created successfully:', plans);
    console.log('Add these values to your .env file as STUDENT_PLAN_ID and TEACHER_PLAN_ID');
  } catch (error) {
    console.error('Failed to initialize plans:', error);
  }
}

main();
```

2. Run the script:
```bash
npx tsx server/src/scripts/init-subscription-plans.ts
```

3. Update your `.env` file with the generated plan IDs:
```
STUDENT_PLAN_ID=P-xxxx
TEACHER_PLAN_ID=P-yyyy
```

## Testing the Integration

1. Start your server and client applications:
```bash
# In server directory
npm start

# In client directory
npm run dev
```

2. Testing Flow:
   - Log in as a student or teacher user
   - Navigate to the Subscription page at `/subscription`
   - Choose a subscription plan and click "Subscribe Now"
   - You will be redirected to the PayPal sandbox payment page
   - Log in with your sandbox personal account credentials
   - Complete the payment process
   - You should be redirected back to the success page
   - Check the admin dashboard to verify the subscription was recorded

## Troubleshooting

### Common Issues

1. **PayPal Sandbox Error: "This transaction cannot be processed"**
   - Make sure your sandbox accounts are properly set up and have sufficient funds
   - Verify your Client ID and Secret are correct

2. **Redirect Issues**
   - Verify your CLIENT_URL is set correctly in the .env file
   - Make sure your success and cancel URLs are correct

3. **Subscription Not Recorded**
   - Check server logs for any errors
   - Verify database connection is working correctly
   - Ensure webhook endpoints are correctly configured

## Admin Subscription Management

Admins can manage subscriptions by:

1. Logging in as an admin user
2. Navigating to `/admin/subscriptions`
3. Viewing all subscriptions in the system
4. Cancelling subscriptions if needed

## Customization

### Changing Subscription Prices

To change the subscription prices:

1. Update the price in the `createPlan` function call in `subscription.controller.ts`
2. Update the displayed price in `SubscriptionPage.tsx`
3. Reinitialize the plans by running the script again

### Adding More Subscription Tiers

To add more subscription tiers:

1. Add additional product and plan creation in the `initSubscriptionPlans` function
2. Add new constants for the plan IDs in the .env file
3. Update the UI to display the new tier options

## Production Considerations

Before moving to production:

1. Change the PayPal API base URL from sandbox to production
2. Create a live PayPal application and update credentials
3. Implement proper error handling and logging
4. Set up webhooks for subscription lifecycle events (payment failures, cancellations, etc.)
5. Implement additional security measures for payment processing
