import React, { useState } from 'react';
import RazorpayCheckout from './RazorpayCheckout';

export default function PaymentPanel({ selectedMethod, setSelectedMethod, amount, onPay, bookingId }) {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const handlePaymentSuccess = (paymentData) => {
        setPaymentSuccess(true);
        setPaymentError('');
        onPay && onPay('razorpay', paymentData);
    };

    const handlePaymentFailure = (error) => {
        setPaymentError(error.message || 'Payment failed');
        setPaymentSuccess(false);
    };

    return (
        <div className="payment-panel">
            <div className="payment-top">
                <p>Total Amount</p>
                <h1>₹{amount}</h1>
                <span>Booking #{bookingId || 'B9F3A2'}</span>
            </div>

            {paymentSuccess && (
                <div style={{
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    ✅ Payment Successful!
                </div>
            )}

            {paymentError && (
                <div style={{
                    backgroundColor: '#ef4444',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center'
                }}>
                    ❌ {paymentError}
                </div>
            )}

            <h3>Select Payment Method</h3>

            <button
                className={selectedMethod === 'razorpay' ? 'pay-option active' : 'pay-option'}
                onClick={() => setSelectedMethod('razorpay')}
            >
                <div>
                    <strong>Credit/Debit Card</strong>
                    <p>Visa, Mastercard, Rupay</p>
                </div>
            </button>

            <button
                className={selectedMethod === 'upi' ? 'pay-option active' : 'pay-option'}
                onClick={() => setSelectedMethod('upi')}
            >
                <div>
                    <strong>UPI / QR Code</strong>
                    <p>GPay, PhonePe, Paytm</p>
                </div>
            </button>

            <button
                className={selectedMethod === 'wallet' ? 'pay-option active' : 'pay-option'}
                onClick={() => setSelectedMethod('wallet')}
            >
                <div>
                    <strong>RideShare Wallet</strong>
                    <p>Balance: ₹0</p>
                </div>
            </button>

            <button
                className={selectedMethod === 'cash' ? 'pay-option active' : 'pay-option'}
                onClick={() => setSelectedMethod('cash')}
            >
                <div>
                    <strong>Pay in Cash</strong>
                    <p>Pay driver directly</p>
                </div>
            </button>

            {selectedMethod === 'upi' && (
                <div className="qr-box">
                    {import.meta.env.VITE_UPI_ID ? (
                        <>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${import.meta.env.VITE_UPI_ID}&pn=RideShare&am=${amount}&cu=INR`}
                                alt="UPI QR Code"
                                style={{ width: '180px', height: '180px', border: '1px solid #ddd', borderRadius: '8px' }}
                            />
                            <p>Scan with any UPI app</p>
                        </>
                    ) : (
                        <div style={{ 
                            width: '180px', 
                            height: '180px', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            flexDirection: 'column',
                            textAlign: 'center',
                            padding: '10px'
                        }}>
                            <p style={{ margin: '0', fontSize: '14px', color: '#ef4444' }}>
                                UPI ID not configured
                            </p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                                Please contact admin
                            </p>
                        </div>
                    )}
                </div>
            )}

            {selectedMethod === 'razorpay' && (
                <div style={{ marginTop: '16px' }}>
                    <RazorpayCheckout
                        amount={amount}
                        bookingId={bookingId}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentFailure={handlePaymentFailure}
                        buttonText={`Pay ₹${amount} with Card`}
                    />
                </div>
            )}

            {selectedMethod !== 'razorpay' && (
                <button className="primary-btn full-btn" onClick={() => onPay(selectedMethod)}>
                    Confirm Payment
                </button>
            )}
        </div>
    )
}