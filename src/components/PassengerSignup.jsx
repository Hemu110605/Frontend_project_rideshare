import React, { useState } from 'react';
import { authService } from '../services/apiService';
import '../styles/PassengerSignup.css';

export default function PassengerSignup({ setCurrentPage }) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agree: false,
    });

    const [showEmailOtp, setShowEmailOtp] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    const [loading, setLoading] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (name === 'email') {
            setIsEmailVerified(false);
            setShowEmailOtp(false);
            setEmailOtp('');
        }
    };

    const handleSendEmailOtp = async () => {
        if (!formData.email.trim()) {
            setError('Please enter email first');
            return;
        }

        try {
            setOtpLoading(true);
            setError('');
            setSuccess('');

            const response = await authService.sendEmailOtp(
                formData.email,
                formData.firstName || 'User'
            );

            if (response.success) {
                setShowEmailOtp(true);
                setSuccess('6 digit OTP sent to your email');
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp.trim()) {
            setError('Enter OTP first');
            return;
        }

        if (!/^\d{6}$/.test(emailOtp)) {
            setError('OTP must be a 6-digit number');
            return;
        }

        try {
            setOtpLoading(true);
            setError('');
            setSuccess('');

            const response = await authService.verifyEmailOtp(
                formData.email,
                emailOtp
            );

            if (response.success) {
                setIsEmailVerified(true);
                setSuccess('Email verified successfully');
            } else {
                setError(response.message || 'OTP verification failed');
            }
        } catch (err) {
            setError(err.message || 'OTP verification failed');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError('Please fill all fields');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!formData.agree) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            setLoading(false);
            return;
        }

        if (!isEmailVerified) {
            setError('Please verify your email first');
            setLoading(false);
            return;
        }

        try {
            const userData = {
                firstName: formData.firstName,
                surname: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: 'user'
            };

            const response = await authService.register(userData);

            if (response.success) {
                setSuccess('Account created successfully! Redirecting...');
                setTimeout(() => {
                    setCurrentPage('passenger-dashboard');
                }, 1500);
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="passenger-signup-page">
            <div className="passenger-signup-card">
                <h1>Create Account</h1>
                <p className="passenger-signup-subtitle">
                    Join thousands of passengers traveling smarter every day
                </p>

                <form className="passenger-signup-form" onSubmit={handleSubmit}>

                    <div className="passenger-signup-row">
                        <div className="passenger-signup-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Enter your first name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="passenger-signup-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Enter your last name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="passenger-signup-group">
                        <label>Email</label>

                        <div className="passenger-phone-row">
                            <input
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <button
                                type="button"
                                className="passenger-send-code-btn"
                                onClick={handleSendEmailOtp}
                                disabled={otpLoading || isEmailVerified}
                            >
                                {otpLoading ? 'Sending...' : isEmailVerified ? 'Verified' : 'Send Code'}
                            </button>
                        </div>

                        {showEmailOtp && !isEmailVerified && (
                            <div className="passenger-otp-row">
                                <input
                                    type="text"
                                    className="passenger-otp-input"
                                    placeholder="Enter OTP"
                                    value={emailOtp}
                                    maxLength="6"
                                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                                />
                                <button
                                    type="button"
                                    className="passenger-verify-btn"
                                    onClick={handleVerifyEmailOtp}
                                >
                                    Verify
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="passenger-signup-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="passenger-signup-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="passenger-signup-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <label className="passenger-signup-options">
                        <input
                            type="checkbox"
                            name="agree"
                            checked={formData.agree}
                            onChange={handleChange}
                        />
                        <span>I agree to Terms & Privacy</span>
                    </label>

                    {error && <div className="passenger-error">{error}</div>}
                    {success && <div className="passenger-success">{success}</div>}

                    <button type="submit" className="passenger-signup-btn">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button
                    type="button"
                    className="google-auth-btn"
                    onClick={() => {
                        window.location.href =
                            `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`;
                    }}
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        className="google-icon"
                    />
                    Continue with Google
                </button>
                <div className="driver-signup-footer">
                    Already have an account?
                    <button
                        type="button"
                        className="driver-login-link"
                        onClick={() => setCurrentPage('driver-login')}
                    >
                        Login
                    </button>
                </div>

            </div>
        </div>
    );
}