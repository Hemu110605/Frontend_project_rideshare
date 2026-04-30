import { useState } from 'react';
import '../styles/driverForgotPassword.css';

export default function DriverForgotPassword({ setCurrentPage }) {
    const [identifier, setIdentifier] = useState('');

    const handleSendOTP = (e) => {
        e.preventDefault();

        if (!identifier.trim()) {
            alert('Please enter your email or phone number');
            return;
        }

        setCurrentPage('driver-reset-password');
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">
                <h1>Forgot Password</h1>

                <form onSubmit={handleSendOTP}>
                    <label htmlFor="driver-identifier">Email or Phone Number</label>
                    <input
                        id="driver-identifier"
                        type="text"
                        placeholder="Enter your email or phone number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />

                    <button type="submit" className="otp-btn">
                        Send OTP
                    </button>

                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => setCurrentPage('driver-login')}
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}