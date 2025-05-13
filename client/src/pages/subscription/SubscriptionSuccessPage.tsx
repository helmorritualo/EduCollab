import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscriptionAPI } from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Check if we've already processed this subscription to prevent duplicate processing
    const subscriptionProcessed = sessionStorage.getItem('subscriptionProcessed');
    
    const completeSubscription = async () => {
      try {
        // Get subscription_id from URL parameters
        const subscriptionId = searchParams.get('subscription_id');
        console.log('Subscription ID from URL:', subscriptionId);
        
        // Prevent duplicate processing of the same subscription
        if (subscriptionProcessed === subscriptionId) {
          console.log('This subscription has already been processed, skipping');
          setProcessing(false);
          return;
        }

        // Get pending subscription details from session storage
        const pendingSubscriptionData = sessionStorage.getItem('pendingSubscription');
        console.log('Pending subscription data from session:', pendingSubscriptionData);

        if (!subscriptionId) {
          console.error('Missing subscription ID in URL parameters');
          throw new Error('Missing subscription ID. Please try again.');
        }

        if (!pendingSubscriptionData) {
          console.error('Missing pending subscription data in session storage');
          throw new Error('Subscription session data not found. Please try again.');
        }
        
        let userId;
        try {
          const data = JSON.parse(pendingSubscriptionData);
          userId = data.userId;
          console.log('Parsed user ID from session storage:', userId);
          
          if (!userId) {
            throw new Error('User ID not found in session data');
          }
        } catch (parseError) {
          console.error('Error parsing pending subscription data:', parseError);
          throw new Error('Invalid subscription data format. Please try again.');
        }
        
        console.log('Calling completeSubscription API with:', { subscriptionId, userId });
        
        try {
          // Call the API to complete the subscription process
          const result = await subscriptionAPI.completeSubscription(subscriptionId, userId);
          console.log('Subscription completion API result:', result);
          
          // Mark this subscription as processed to prevent duplicate processing
          sessionStorage.setItem('subscriptionProcessed', subscriptionId);
          
          // Clear the pending subscription from session storage
          sessionStorage.removeItem('pendingSubscription');
          console.log('Cleared pending subscription from session storage');
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Subscription Activated',
            text: 'Your subscription has been successfully activated!'
          }).then(() => {
            // Redirect to dashboard
            console.log('Redirecting to dashboard after successful subscription');
            navigate('/dashboard');
          });
        } catch (error) {
          const apiError = error as Error;
          // Check for duplicate entry error
          if (apiError.message && apiError.message.includes('Duplicate entry')) {
            console.log('Subscription was already processed. Treating as success.');
            // Mark as processed to prevent future attempts
            sessionStorage.setItem('subscriptionProcessed', subscriptionId);
            
            // Show success message for already-processed subscriptions
            Swal.fire({
              icon: 'success',
              title: 'Subscription Active',
              text: 'Your subscription is already active!'
            }).then(() => {
              console.log('Redirecting to dashboard for already-active subscription');
              navigate('/dashboard');
            });
          } else {
            // Re-throw other errors to be caught by the outer catch block
            throw apiError;
          }
        }
      } catch (error) {
        console.error('Error completing subscription:', error);
        Swal.fire({
          icon: 'error',
          title: 'Subscription Error',
          text: error instanceof Error ? error.message : 'Failed to process subscription'
        }).then(() => {
          // Redirect to subscription page on error
          console.log('Redirecting to subscription page after error');
          navigate('/subscription');
        });
      } finally {
        setProcessing(false);
      }
    };

    // Execute only if user is logged in
    if (user?.user_id) {
      completeSubscription();
    } else {
      // If user isn't logged in, redirect to login
      Swal.fire({
        icon: 'error',
        title: 'Authentication Required',
        text: 'Please log in to complete your subscription.'
      }).then(() => {
        navigate('/login');
      });
    }
  }, [searchParams, navigate, user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        {processing ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Processing Your Subscription</h2>
            <p className="text-gray-600 mb-6">Please wait while we activate your subscription...</p>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Subscription Complete</h2>
            <p className="text-gray-600 mb-6">Your subscription has been processed successfully.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
