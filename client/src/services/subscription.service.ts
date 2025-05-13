import { api } from './api.service';
import axios, { AxiosError } from 'axios';

// Define proper subscription types
interface Subscription {
  id: number;
  user_id: number;
  subscription_id: string;
  status: string;
  plan_id: string;
  start_date: string;
  next_billing_date: string;
  payment_id?: string;
  payer_id?: string;
  amount: number;
  created_at: string;
  updated_at: string;
}

// Define the PayPal link structure
interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

interface SubscriptionResponse {
  subscriptionId?: string;
  approvalUrl?: string;
  success?: boolean;
  message?: string;
  hasSubscription?: boolean;
  subscription?: Subscription;
  links?: PayPalLink[];
}

export const subscriptionAPI = {
  /**
   * Get all subscriptions (admin only)
   */
  getAllSubscriptions: async (): Promise<Subscription[]> => {
    try {
      const response = await api.get('/subscription/admin/all');
      
      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response format for subscriptions:', response.data);
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all subscriptions:', error);
      throw error;
    }
  },

  /**
   * Create a new subscription with PayPal
   */
  createSubscription: async (userId: number, planId: string): Promise<{ subscriptionId: string; approvalUrl: string }> => {
    try {
      console.log(`Creating subscription for userId=${userId} with planId=${planId}`);
      
      const response = await api.post<SubscriptionResponse>('/subscription/create', {
        userId,
        planId
      });
      
      if (!response.data.subscriptionId || !response.data.approvalUrl) {
        console.error('Invalid subscription response:', response.data);
        throw new Error('Invalid response from subscription service');
      }
      
      console.log('Subscription created successfully:', response.data);
      return {
        subscriptionId: response.data.subscriptionId,
        approvalUrl: response.data.approvalUrl
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  /**
   * Complete a subscription after PayPal approval
   */
  completeSubscription: async (subscriptionId: string, userId: number): Promise<boolean> => {
    try {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }
      if (!userId) {
        throw new Error('User ID is required');
      }

      console.log(`Completing subscription: subscriptionId=${subscriptionId}, userId=${userId}`);
      
      const response = await api.post<SubscriptionResponse>('/subscription/success', {
        subscription_id: subscriptionId,
        userId
      });
      
      console.log('Subscription completion response:', response.data);
      
      if (!response.data.success) {
        console.error('Failed to complete subscription:', response.data);
        throw new Error(response.data.message || 'Failed to complete subscription');
      }
      
      console.log('Subscription completed successfully');
      return true;
    } catch (error) {
      console.error('Error completing subscription:', error);
      
      // Provide more helpful error messages based on the error type
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response?.status === 404) {
          throw new Error('Subscription endpoint not found. Please check server configuration.');
        } else if (axiosError.response?.status === 401) {
          throw new Error('Authentication error. Please login again.');
        } else if (axiosError.response?.status === 500) {
          throw new Error('Server error processing the subscription. Please contact support.');
        }
      }
      
      throw error;
    }
  },

  /**
   * Get a user's subscription status
   */
  getUserSubscription: async (userId: number): Promise<{ hasSubscription: boolean; subscription?: Subscription }> => {
    try {
      const response = await api.get<SubscriptionResponse>(`/subscription/user/${userId}`);
      
      return {
        hasSubscription: response.data.hasSubscription || false,
        subscription: response.data.subscription
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
  },

  /**
   * Cancel a subscription
   */
  cancelSubscription: async (subscriptionId: string, reason?: string): Promise<boolean> => {
    try {
      const response = await api.post<SubscriptionResponse>('/subscription/cancel', {
        subscription_id: subscriptionId,
        reason
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to cancel subscription');
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
};
