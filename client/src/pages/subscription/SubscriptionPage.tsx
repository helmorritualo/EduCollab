import { useEffect, useState } from 'react';
import { subscriptionAPI } from '@/services/api.service';
import { useAuth } from '@/contexts/AuthContext';
import Swal from 'sweetalert2';

// Define plan IDs - these should match what's created on the server
const STUDENT_PLAN_ID = import.meta.env.VITE_STUDENT_PLAN_ID || 'P-123456789';
const TEACHER_PLAN_ID = import.meta.env.VITE_TEACHER_PLAN_ID || 'P-987654321';

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user already has an active subscription
    const checkSubscription = async () => {
      if (!user?.user_id) return;
      
      try {
        setLoading(true);
        const response = await subscriptionAPI.getUserSubscription(user.user_id);
        setHasSubscription(response.hasSubscription);
      } catch (error) {
        console.error('Error checking subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  const handleSubscribe = async (planType: 'student' | 'teacher') => {
    if (!user?.user_id) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'You must be logged in to subscribe.'
      });
      return;
    }

    try {
      setLoading(true);
      const planId = planType === 'student' ? STUDENT_PLAN_ID : TEACHER_PLAN_ID;
      
      console.log(`Initiating ${planType} subscription for user ${user.user_id} with plan ID ${planId}`);
      
      // First clear any existing pending subscription data
      sessionStorage.removeItem('pendingSubscription');
      
      const response = await subscriptionAPI.createSubscription(user.user_id, planId);
      console.log('Subscription creation response:', response);
      
      // Redirect user to PayPal for payment
      if (response.approvalUrl) {
        // Save necessary subscription data to sessionStorage
        const token = localStorage.getItem('token');
        const subscriptionData = {
          userId: user.user_id,
          planId: planId,
          subscriptionId: response.subscriptionId,
          timestamp: new Date().toISOString(),
          // Store the auth token to restore it after PayPal redirect
          authToken: token
        };
        
        console.log('Storing subscription data in session:', subscriptionData);
        sessionStorage.setItem('pendingSubscription', JSON.stringify(subscriptionData));
        
        console.log('Redirecting to PayPal approval URL:', response.approvalUrl);
        window.location.href = response.approvalUrl;
      } else {
        console.error('Missing approval URL in response:', response);
        throw new Error('Failed to get PayPal approval URL');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Subscription Error',
        text: error instanceof Error ? error.message : 'Failed to process subscription'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (hasSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Active Subscription</h2>
          <div className="mb-6 text-center">
            <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Active
            </div>
          </div>
          <p className="text-center text-gray-700 mb-6">
            You already have an active subscription. Enjoy all the features of EduCollab!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">EduCollab Subscription</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Student Subscription Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white p-4 text-center">
              <h2 className="text-xl font-bold">Student Plan</h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">$5</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Join unlimited groups
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Submit assignments
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Access all learning materials
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  One-time payment
                </li>
              </ul>
              <button 
                onClick={() => handleSubscribe('student')}
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
          
          {/* Teacher Subscription Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-purple-500 text-white p-4 text-center">
              <h2 className="text-xl font-bold">Teacher Plan</h2>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <span className="text-3xl font-bold">$10</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Create unlimited groups
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Create and manage assignments
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Track student progress
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  One-time payment
                </li>
              </ul>
              <button 
                onClick={() => handleSubscribe('teacher')}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            All subscriptions are one-time payments that grant lifetime access to EduCollab features.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
