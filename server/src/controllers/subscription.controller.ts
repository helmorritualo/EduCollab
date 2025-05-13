import { Context } from 'hono';
import { StatusCodes } from 'http-status-codes';
import * as PayPalService from '../services/paypal.service.js';
import { getUserById } from '../models/user.js';
import * as SubscriptionModel from '../models/subscription.js';
import { Subscription } from '../types/index.js';

// Initialize subscription plans for student and teacher roles
export const initSubscriptionPlans = async () => {
  try {
    // Create products for student and teacher subscriptions
    const studentProduct = await PayPalService.createProduct(
      'EduCollab Student Subscription',
      'Access to all student features in EduCollab platform',
      'SERVICE'
    );

    const teacherProduct = await PayPalService.createProduct(
      'EduCollab Teacher Subscription',
      'Access to all teacher features in EduCollab platform',
      'SERVICE'
    );

    // Create subscription plans for both products
    // Student plan ($5/month)
    const studentPlan = await PayPalService.createPlan(
      studentProduct.id,
      'Student Monthly Plan',
      'Monthly subscription for students',
      '5.00'
    );

    // Teacher plan ($10/month)
    const teacherPlan = await PayPalService.createPlan(
      teacherProduct.id,
      'Teacher Monthly Plan',
      'Monthly subscription for teachers',
      '10.00'
    );

    return {
      studentPlanId: studentPlan.id,
      teacherPlanId: teacherPlan.id
    };
  } catch (error) {
    console.error('Failed to initialize subscription plans:', error);
    throw error;
  }
};

// Create a PayPal subscription based on user role
export const createSubscription = async (c: Context) => {
  try {
    const { userId, planId } = await c.req.json();

    // Validate inputs
    if (!userId || !planId) {
      return c.json({ error: 'Missing required fields' }, StatusCodes.BAD_REQUEST);
    }

    // Get user details
    const user = await getUserById(Number(userId));
    if (!user) {
      return c.json({ error: 'User not found' }, StatusCodes.NOT_FOUND);
    }

    // Create PayPal subscription
    const subscription = await PayPalService.createSubscription(planId, user.email);

    if (subscription.id) {
      // Return subscription details with approval link
      return c.json({
        subscriptionId: subscription.id,
        approvalUrl: subscription.links.find((link: any) => link.rel === 'approve').href
      });
    } else {
      return c.json({ error: 'Failed to create subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    console.error('Error creating subscription:', error);
    return c.json({ error: 'Failed to create subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Handle PayPal subscription success
export const handleSubscriptionSuccess = async (c: Context) => {
  try {
    const { subscription_id, userId } = await c.req.json();

    // Validate inputs
    if (!subscription_id || !userId) {
      return c.json({ error: 'Missing required fields' }, StatusCodes.BAD_REQUEST);
    }

    // Get subscription details from PayPal
    console.log(`Fetching subscription details from PayPal for ID: ${subscription_id}`);
    const subscriptionDetails = await PayPalService.getSubscriptionDetails(subscription_id);
    console.log('PayPal subscription details:', JSON.stringify(subscriptionDetails, null, 2));
    
    // Check for required fields
    if (!subscriptionDetails || !subscriptionDetails.status) {
      console.error('Invalid subscription details from PayPal', subscriptionDetails);
      return c.json({ error: 'Invalid subscription data from PayPal' }, StatusCodes.BAD_REQUEST);
    }

    // Handle the subscription data safely
    const now = new Date();
    
    // Safe extraction of fields with fallbacks
    const status = subscriptionDetails.status || 'ACTIVE';
    const plan_id = subscriptionDetails.plan_id || '';
    const start_date = subscriptionDetails.start_time ? new Date(subscriptionDetails.start_time) : now;
    
    // Handle the billing_info structure safely
    let next_billing_date = now;
    let amount = 0;
    
    if (subscriptionDetails.billing_info) {
      if (subscriptionDetails.billing_info.next_billing_time) {
        next_billing_date = new Date(subscriptionDetails.billing_info.next_billing_time);
      }
      
      // Check for payment information
      if (subscriptionDetails.billing_info.last_payment && 
          subscriptionDetails.billing_info.last_payment.amount && 
          subscriptionDetails.billing_info.last_payment.amount.value) {
        amount = parseFloat(subscriptionDetails.billing_info.last_payment.amount.value);
      } else if (subscriptionDetails.billing_info.outstanding_balance && 
                subscriptionDetails.billing_info.outstanding_balance.value) {
        // Fallback to outstanding balance if available
        amount = parseFloat(subscriptionDetails.billing_info.outstanding_balance.value);
      }
    }

    // Create base subscription data without optional fields that might be undefined
    const subscriptionData: Subscription = {
      user_id: Number(userId),
      subscription_id: subscription_id,
      status,
      plan_id,
      start_date,
      next_billing_date,
      amount
    };
    
    // Extract PayPal payer information if available
    if (subscriptionDetails.subscriber && subscriptionDetails.subscriber.payer_id) {
      subscriptionData.payer_id = subscriptionDetails.subscriber.payer_id;
    } else {
      // Use empty string instead of null/undefined to avoid SQL error
      subscriptionData.payer_id = "";
    }
    
    // Extract payment information if available
    if (subscriptionDetails.id) {
      // Sometimes PayPal uses the subscription ID as the payment ID in sandbox
      subscriptionData.payment_id = subscriptionDetails.id;
    } else {
      // Use empty string instead of null/undefined to avoid SQL error
      subscriptionData.payment_id = "";
    }

    console.log('Saving subscription to database:', subscriptionData);
    await SubscriptionModel.createSubscription(subscriptionData);
    console.log('Subscription saved successfully');

    return c.json({
      success: true,
      message: 'Subscription activated successfully'
    });
  } catch (error) {
    console.error('Error handling subscription success:', error);
    
    // Provide more detailed error information for debugging
    let errorMessage = 'Failed to process subscription';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error(error.stack);
    }
    
    return c.json({ 
      error: errorMessage,
      success: false
    }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Get user subscription status
export const getUserSubscription = async (c: Context) => {
  try {
    const userId = c.req.param('userId');

    if (!userId) {
      return c.json({ error: 'User ID is required' }, StatusCodes.BAD_REQUEST);
    }

    const subscription = await SubscriptionModel.getSubscriptionByUserId(Number(userId));

    if (!subscription) {
      return c.json({ hasSubscription: false });
    }

    // If subscription exists, check if it's still active with PayPal
    if (subscription.status === 'ACTIVE') {
      try {
        const paypalDetails = await PayPalService.getSubscriptionDetails(subscription.subscription_id);
        
        // Update subscription status if it changed on PayPal's side
        if (paypalDetails.status !== subscription.status) {
          await SubscriptionModel.updateSubscriptionStatus(
            subscription.subscription_id,
            paypalDetails.status
          );
          subscription.status = paypalDetails.status;
        }
      } catch (paypalError) {
        console.error('Error checking subscription with PayPal:', paypalError);
        // Continue with local data if PayPal check fails
      }
    }

    return c.json({
      hasSubscription: subscription.status === 'ACTIVE',
      subscription
    });
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return c.json({ error: 'Failed to get subscription details' }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Cancel a subscription
export const cancelSubscription = async (c: Context) => {
  try {
    const { subscription_id, reason } = await c.req.json();

    if (!subscription_id) {
      return c.json({ error: 'Subscription ID is required' }, StatusCodes.BAD_REQUEST);
    }

    // Cancel subscription with PayPal
    const success = await PayPalService.cancelSubscription(
      subscription_id,
      reason || 'Cancelled by user'
    );

    if (success) {
      // Update subscription status in database
      await SubscriptionModel.updateSubscriptionStatus(subscription_id, 'CANCELLED');

      return c.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } else {
      return c.json({ error: 'Failed to cancel subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return c.json({ error: 'Failed to cancel subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

// Admin: Get all subscriptions
export const getAllSubscriptions = async (c: Context) => {
  try {
    const subscriptions = await SubscriptionModel.getAllSubscriptions();
    return c.json(subscriptions);
  } catch (error) {
    console.error('Error getting all subscriptions:', error);
    return c.json({ error: 'Failed to get subscriptions' }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
