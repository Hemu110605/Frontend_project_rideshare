console.log("NEW DRIVER SIGNUP VERSION")
import React, { useState } from 'react';
import { authService } from '../services/apiService';
import '../styles/DriverSignup.css';

export default function DriverSignup({ setCurrentPage }) {
    const [formData, setFormData] = useState({
        fullName: '',
        aadhaarNumber: '',
        mobileNumber: '',
        carModel: '',
        vehicleNumber: '',
        rcNumber: '',
        insuranceNumber: '',
        licenseNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showEmailOtp, setShowEmailOtp] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'email') {
            setShowEmailOtp(false);
            setEmailOtp('');
            setIsEmailVerified(false);
        }
    };

    const handleSendEmailOtp = async () => {
        if (!formData.email.trim()) {
            alert('Please enter your email first');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await authService.sendEmailOtp(formData.email);

            if (response.success) {
                setShowEmailOtp(true);
                setSuccess('OTP sent to your email');
            } else {
                setError(response.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyEmailOtp = async () => {
        if (!emailOtp.trim()) {
            alert('Please enter OTP first');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await authService.verifyEmailOtp(formData.email, emailOtp);

            if (response.success) {
                setIsEmailVerified(true);
                setSuccess('Email verified successfully');
            } else {
                setError(response.message || 'Invalid OTP');
            }
        } catch (err) {
            setError(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (
            !formData.fullName.trim() ||
            !formData.email.trim() ||
            !formData.mobileNumber.trim() ||
            !formData.password.trim() ||
            !formData.confirmPassword.trim()
        ) {
            setError('Please fill all required fields');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!isEmailVerified) {
            setError('Please verify email first');
            setLoading(false);
            return;
        }

        try {
            const userData = {
                firstName: formData.fullName.split(' ')[0],
                surname: formData.fullName.split(' ').slice(1).join(' ') || 'Driver',
                email: formData.email,
                phone: formData.mobileNumber,
                password: formData.password,
                role: 'driver'
            };

            const response = await authService.register(userData);

            if (response.success) {
                setSuccess('Driver account created successfully! Redirecting to dashboard...');
                setTimeout(() => {
                    setCurrentPage('driver-dashboard');
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
        <div className="driver-signup-page">
            <div className="driver-signup-card">
                <h1>Driver Sign Up</h1>
                <p>Join RideShare and start offering rides smarter every day</p>

                <form className="driver-signup-form" onSubmit={handleSubmit}>
                    <div className="driver-signup-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            type="text"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="driver-otp-row">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="driver-otp-btn"
                                onClick={handleSendEmailOtp}
                                disabled={loading}
                            >
                                Send OTP
                            </button>
                        </div>

                        {showEmailOtp && (
                            <div className="driver-verify-row">
                                <input
                                    type="text"
                                    className="driver-otp-input"
                                    placeholder="Enter 6-digit OTP"
                                    value={emailOtp}
                                    onChange={(e) => setEmailOtp(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="driver-verify-btn"
                                    onClick={handleVerifyEmailOtp}
                                    disabled={loading}
                                >
                                    Verify
                                </button>
                            </div>
                        )}

                        {isEmailVerified && (
                            <p className="driver-verified-text">
                                Email verified successfully
                            </p>
                        )}
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="aadhaarNumber">Aadhaar Card Number</label>
                        <input
                            id="aadhaarNumber"
                            type="text"
                            name="aadhaarNumber"
                            placeholder="Enter your 12-digit Aadhaar number"
                            value={formData.aadhaarNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="mobileNumber">Registered Mobile Number</label>
                        <input
                            id="mobileNumber"
                            type="text"
                            name="mobileNumber"
                            placeholder="Enter your mobile number"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="carModel">Car Model</label>
                        <input
                            id="carModel"
                            type="text"
                            name="carModel"
                            placeholder="Enter your car model"
                            value={formData.carModel}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="vehicleNumber">Vehicle Number</label>
                        <input
                            id="vehicleNumber"
                            type="text"
                            name="vehicleNumber"
                            placeholder="Enter vehicle number"
                            value={formData.vehicleNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="rcNumber">RC Number</label>
                        <input
                            id="rcNumber"
                            type="text"
                            name="rcNumber"
                            placeholder="Enter RC number"
                            value={formData.rcNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="insuranceNumber">Insurance Number</label>
                        <input
                            id="insuranceNumber"
                            type="text"
                            name="insuranceNumber"
                            placeholder="Enter insurance number"
                            value={formData.insuranceNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="driver-signup-group">
                        <label htmlFor="licenseNumber">Driving License Number</label>
                        <input
                            id="licenseNumber"
                            type="text"
                            name="licenseNumber"
                            placeholder="Enter driving license number"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <div className="driver-error">{error}</div>}
                    {success && <div className="driver-success">{success}</div>}

                    <button type="submit" className="driver-signup-btn" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Driver Account'}
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
                            "https://backend-rideshare-hmlq.onrender.com/api/auth/google";
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