import { useEffect, useState } from 'react';
import { subscriptionAPI } from '@/services/api.service';
import { Subscription } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        const response = await subscriptionAPI.getAllSubscriptions();
        setSubscriptions(response);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load subscription data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [isAdmin, navigate]);

  const handleCancelSubscription = async (subscriptionId: string, _userId: number, userName: string) => {
    try {
      // Ask for confirmation
      const result = await Swal.fire({
        icon: 'warning',
        title: 'Cancel Subscription',
        text: `Are you sure you want to cancel the subscription for ${userName}?`,
        showCancelButton: true,
        confirmButtonText: 'Yes, cancel it',
        cancelButtonText: 'No, keep it'
      });

      if (result.isConfirmed) {
        await subscriptionAPI.cancelSubscription(subscriptionId, 'Cancelled by admin');
        
        // Update the state after successful cancellation
        setSubscriptions(prevSubscriptions => {
          return prevSubscriptions.map(sub => {
            if (sub.subscription_id === subscriptionId) {
              return { ...sub, status: 'CANCELLED' };
            }
            return sub;
          });
        });

        Swal.fire({
          icon: 'success',
          title: 'Subscription Cancelled',
          text: `Successfully cancelled the subscription for ${userName}`
        });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to cancel subscription'
      });
    }
  };

  // Format date string to local date and time
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Get the appropriate status badge color
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No subscriptions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Billing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.subscription_id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{subscription.full_name}</div>
                          <div className="text-sm text-gray-500">{subscription.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.role || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${subscription.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(subscription.next_billing_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {subscription.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleCancelSubscription(
                            subscription.subscription_id,
                            subscription.user_id,
                            subscription.full_name || 'this user'
                          )}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
