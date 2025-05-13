import { StatusCodes } from 'http-status-codes';
import * as PayPalService from '../services/paypal.service';
import { getUserById } from '../models/user';
import * as SubscriptionModel from '../models/subscription';
// Initialize subscription plans for student and teacher roles
export const initSubscriptionPlans = async () => {
    try {
        // Create products for student and teacher subscriptions
        const studentProduct = await PayPalService.createProduct('EduCollab Student Subscription', 'Access to all student features in EduCollab platform', 'SERVICE');
        const teacherProduct = await PayPalService.createProduct('EduCollab Teacher Subscription', 'Access to all teacher features in EduCollab platform', 'SERVICE');
        // Create subscription plans for both products
        // Student plan ($5/month)
        const studentPlan = await PayPalService.createPlan(studentProduct.id, 'Student Monthly Plan', 'Monthly subscription for students', '5.00');
        // Teacher plan ($10/month)
        const teacherPlan = await PayPalService.createPlan(teacherProduct.id, 'Teacher Monthly Plan', 'Monthly subscription for teachers', '10.00');
        return {
            studentPlanId: studentPlan.id,
            teacherPlanId: teacherPlan.id
        };
    }
    catch (error) {
        console.error('Failed to initialize subscription plans:', error);
        throw error;
    }
};
// Create a PayPal subscription based on user role
export const createSubscription = async (c) => {
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
                approvalUrl: subscription.links.find((link) => link.rel === 'approve').href
            });
        }
        else {
            return c.json({ error: 'Failed to create subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        return c.json({ error: 'Failed to create subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
// Handle PayPal subscription success
export const handleSubscriptionSuccess = async (c) => {
    try {
        const { subscription_id, userId } = await c.req.json();
        // Validate inputs
        if (!subscription_id || !userId) {
            return c.json({ error: 'Missing required fields' }, StatusCodes.BAD_REQUEST);
        }
        // Get subscription details from PayPal
        const subscriptionDetails = await PayPalService.getSubscriptionDetails(subscription_id);
        // Save subscription to database
        const subscriptionData = {
            user_id: Number(userId),
            subscription_id: subscription_id,
            status: subscriptionDetails.status,
            plan_id: subscriptionDetails.plan_id,
            start_date: new Date(subscriptionDetails.start_time),
            next_billing_date: new Date(subscriptionDetails.billing_info.next_billing_time),
            amount: parseFloat(subscriptionDetails.billing_info.last_payment.amount.value)
        };
        await SubscriptionModel.createSubscription(subscriptionData);
        return c.json({
            success: true,
            message: 'Subscription activated successfully'
        });
    }
    catch (error) {
        console.error('Error handling subscription success:', error);
        return c.json({ error: 'Failed to process subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
// Get user subscription status
export const getUserSubscription = async (c) => {
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
                    await SubscriptionModel.updateSubscriptionStatus(subscription.subscription_id, paypalDetails.status);
                    subscription.status = paypalDetails.status;
                }
            }
            catch (paypalError) {
                console.error('Error checking subscription with PayPal:', paypalError);
                // Continue with local data if PayPal check fails
            }
        }
        return c.json({
            hasSubscription: subscription.status === 'ACTIVE',
            subscription
        });
    }
    catch (error) {
        console.error('Error getting user subscription:', error);
        return c.json({ error: 'Failed to get subscription details' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
// Cancel a subscription
export const cancelSubscription = async (c) => {
    try {
        const { subscription_id, reason } = await c.req.json();
        if (!subscription_id) {
            return c.json({ error: 'Subscription ID is required' }, StatusCodes.BAD_REQUEST);
        }
        // Cancel subscription with PayPal
        const success = await PayPalService.cancelSubscription(subscription_id, reason || 'Cancelled by user');
        if (success) {
            // Update subscription status in database
            await SubscriptionModel.updateSubscriptionStatus(subscription_id, 'CANCELLED');
            return c.json({
                success: true,
                message: 'Subscription cancelled successfully'
            });
        }
        else {
            return c.json({ error: 'Failed to cancel subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    catch (error) {
        console.error('Error cancelling subscription:', error);
        return c.json({ error: 'Failed to cancel subscription' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
// Admin: Get all subscriptions
export const getAllSubscriptions = async (c) => {
    try {
        const subscriptions = await SubscriptionModel.getAllSubscriptions();
        return c.json(subscriptions);
    }
    catch (error) {
        console.error('Error getting all subscriptions:', error);
        return c.json({ error: 'Failed to get subscriptions' }, StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
