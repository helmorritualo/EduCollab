import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const SubscriptionCancelPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any pending subscription data
    sessionStorage.removeItem('pendingSubscription');
    
    // Show message about cancelled subscription
    Swal.fire({
      icon: 'info',
      title: 'Subscription Cancelled',
      text: 'Your subscription process was cancelled. You can try again whenever you\'re ready.'
    }).then(() => {
      // Redirect back to subscription page
      navigate('/subscription');
    });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Subscription Cancelled</h2>
        <p className="text-gray-600 mb-6">Your subscription process was cancelled.</p>
        <button
          onClick={() => navigate('/subscription')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCancelPage;
