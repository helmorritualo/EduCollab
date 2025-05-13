import { Hono } from 'hono';
import {
  createSubscription,
  handleSubscriptionSuccess,
  getUserSubscription,
  cancelSubscription,
  getAllSubscriptions
} from './subscription.controller';

// Create router with subscription path prefix
const subscriptionRoutes = new Hono().basePath('/subscription');

// Create a new subscription and redirect to PayPal
subscriptionRoutes.post('/create', createSubscription);

// Handle PayPal subscription success callback
subscriptionRoutes.post('/success', handleSubscriptionSuccess);

// Get user subscription status
subscriptionRoutes.get('/user/:userId', getUserSubscription);

// Cancel a subscription
subscriptionRoutes.post('/cancel', cancelSubscription);

// Admin: Get all subscriptions
subscriptionRoutes.get('/admin/all', getAllSubscriptions);

export default subscriptionRoutes;
