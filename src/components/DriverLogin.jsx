import { useState } from 'react';
import { authService } from '../services/apiService';
import '../styles/driverlogin.css';

export default function DriverLogin({ setCurrentPage, handleLogin }) {
    const [formData, setFormData] = useState({
        mobile: '',
        password: '',
        rememberMe: false,
    });

    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetLinkSent, setResetLinkSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://frontend-rideshare-h2ypku9ky-hemu110605s-projects.vercel.app';

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.mobile.trim() || !formData.password.trim()) {
                setError('Please fill all fields');
                setLoading(false);
                return;
            }

            const credentials = {
                email: formData.mobile.trim(), // Backend likely expects email field
                password: formData.password,
                rememberMe: formData.rememberMe
            };

            console.log('Driver login request:', { email: credentials.email, password: '***' });
            const response = await authService.login(credentials);
            console.log('Driver login response:', response.success ? 'SUCCESS' : response.message);

            if (response.success) {
                // ✅ SAVE TOKEN HERE
                localStorage.setItem('token', response.data.accessToken);

                if (handleLogin) {
                    handleLogin('driver');
                }

                setCurrentPage('driver-dashboard');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setResetLinkSent(false);

        if (!forgotEmail.trim()) {
            setError('Please enter your registered email');
            return;
        }

        try {
            setForgotLoading(true);

            const response = await authService.forgotPassword(forgotEmail, 'driver');

            if (response.success) {
                setResetLinkSent(true);
                setForgotEmail('');
            } else {
                setError(response.message || 'Failed to send reset link');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setForgotLoading(false);
        }
    };

    if (showForgotPassword) {
        return (
            <div className="auth-container driver-login-page">
                <div className="auth-card driver-login-card">
                    <h1>Forgot Password</h1>
                    <p>Enter your registered driver email. We will send you a password reset link.</p>

                    <form className="auth-form driver-login-form" onSubmit={handleForgotPassword}>
                        <div className="form-group driver-form-group">
                            <label htmlFor="driver-forgot-email">Email</label>
                            <input
                                id="driver-forgot-email"
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => {
                                    setForgotEmail(e.target.value);
                                    if (error) setError('');
                                    if (resetLinkSent) setResetLinkSent(false);
                                }}
                                placeholder="Enter registered email"
                                required
                            />
                        </div>

                        {resetLinkSent && (
                            <div className="driver-success">
                                Password reset link sent. Please check your email.
                            </div>
                        )}

                        {error && (
                            <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" className="driver-login-btn" disabled={forgotLoading}>
                            {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <button
                            type="button"
                            className="driver-forgot-btn"
                            onClick={() => {
                                setShowForgotPassword(false);
                                setForgotEmail('');
                                setResetLinkSent(false);
                                setError('');
                            }}
                        >
                            Back to Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container driver-login-page">
            <div className="auth-card driver-login-card">
                <h1>Driver Login</h1>

                <form className="auth-form driver-login-form" onSubmit={handleSubmit}>
                    <div className="form-group driver-form-group">
                        <label htmlFor="driver-mobile">Mobile Number</label>
                        <input
                            id="driver-mobile"
                            name="mobile"
                            type="text"
                            placeholder="Enter your registered mobile number"
                            value={formData.mobile}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group driver-form-group">
                        <label htmlFor="driver-password">Password</label>
                        <input
                            id="driver-password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                    </div>

                    {error && (
                        <div className="error-message" style={{ color: '#ff6b6b', marginBottom: '16px', textAlign: 'center', fontSize: '14px' }}>
                            {error}
                        </div>
                    )}

                    <div className="driver-login-options">
                        <label className="driver-remember">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleInputChange}
                            />
                            <span>Remember me</span>
                        </label>

                        <button
                            type="button"
                            className="driver-forgot-btn"
                            onClick={() => {
                                setShowForgotPassword(true);
                                setError('');
                                setResetLinkSent(false);
                            }}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button type="submit" className="driver-login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="driver-login-divider"></div>
                    <div className="passenger-social-login">
                        <button
                            type="button"
                            className="passenger-social-btn google-btn"
                            onClick={() => {
                                window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
                            }}
                        >
                            <span className="social-icon">
                                <svg viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9-1 .7-2.2 1.1-3.5 1.1-2.7 0-5-2.2-5-5s2.3-5 5-5c1.5 0 2.8.5 3.8 1.4l2.8-2.8C16.9 5.2 14.6 4.2 12 4.2 7.6 4.2 4 7.8 4 12.2s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.7 0-.5 0-.9-.1-1.3H12z" />
                                    <path fill="#34A853" d="M12 22c2.2 0 4.1-.7 5.5-1.9l-2.7-2.2c-.8.5-1.7.8-2.8.8-2.1 0-3.9-1.4-4.6-3.3H4.6v2.1C6 20 8.8 22 12 22z" />
                                    <path fill="#FBBC05" d="M7.4 14.4c-.2-.5-.3-1-.3-1.6s.1-1.1.3-1.6V9.1H4.6C4.2 10 4 11 4 12s.2 2 .6 2.9l2.8-2.5z" />
                                    <path fill="#4285F4" d="M12 7.2c1.2 0 2.3.4 3.2 1.2l2.4-2.4C16.1 4.6 14.2 4 12 4 8.8 4 6 6 4.6 9.1l2.8 2.1C8.1 8.6 9.9 7.2 12 7.2z" />
                                </svg>
                            </span>
                            <span className="social-text">Continue with Google</span>
                        </button>
                    </div>

                    <p className="driver-login-footer">
                        Don&apos;t have an account?{' '}
                        <button
                            type="button"
                            className="driver-signup-link"
                            onClick={() => setCurrentPage('driver-signup')}
                        >
                            Sign up
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}