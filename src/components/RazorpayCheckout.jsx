import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/apiService';

const RazorpayCheckout = ({ amount, bookingId, onPaymentSuccess, onPaymentFailure, buttonText = "Pay Now" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create order amount in paise (₹1 = 100 paise)
      const amountInPaise = Math.round(amount * 100);
      
      // Create Razorpay order
      const orderResponse = await paymentService.createRazorpayOrder(amountInPaise, bookingId);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const { order_id, amount: orderAmount, currency } = orderResponse.data;

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: currency,
        name: 'RideShare Carpooling',
        description: bookingId ? `Payment for booking #${bookingId}` : 'Payment',
        order_id: order_id,
        handler: async function (response) {
          try {
            // Verify payment with backend
            const verifyResponse = await paymentService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingId
            });

            if (verifyResponse.success) {
              onPaymentSuccess && onPaymentSuccess(verifyResponse.data);
            } else {
              throw new Error(verifyResponse.message || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            setError('Payment verification failed. Please contact support.');
            onPaymentFailure && onPaymentFailure(verifyError);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            onPaymentFailure && onPaymentFailure(new Error('Payment cancelled by user'));
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
      };

      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(response.error.description || 'Payment failed');
        onPaymentFailure && onPaymentFailure(new Error(response.error.description));
        setLoading(false);
      });

      // Open payment modal
      rzp.open();

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      onPaymentFailure && onPaymentFailure(err);
      setLoading(false);
    }
  };

  return (
    <div className="razorpay-checkout">
      {error && (
        <div className="error-message" style={{ 
          color: '#ef4444', 
          fontSize: '14px', 
          marginBottom: '10px',
          padding: '8px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          transition: 'background-color 0.2s'
        }}
      >
        {loading ? 'Processing...' : buttonText}
      </button>
    </div>
  );
};

export default RazorpayCheckout;
