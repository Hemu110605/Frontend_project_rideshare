import { useState } from 'react'
import { authService } from '../services/apiService'
import '../styles/PassengerLogin.css'

export default function PassengerLogin({ setCurrentPage, handleLogin }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    })

    const [forgotEmail, setForgotEmail] = useState('')
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [resetLinkSent, setResetLinkSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [forgotLoading, setForgotLoading] = useState(false)
    const [error, setError] = useState('')

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002'

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (!formData.email.trim() || !formData.password.trim()) {
                setError('Please enter email and password')
                setLoading(false)
                return
            }

            const credentials = {
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe
            }

            const response = await authService.login(credentials)

            if (response.success) {
                if (handleLogin) {
                    handleLogin('passenger')
                }
                setCurrentPage('passenger-dashboard')
            } else {
                setError(response.message || 'Login failed')
            }
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setError('')
        setResetLinkSent(false)

        if (!forgotEmail.trim()) {
            setError('Please enter your registered email')
            return
        }

        try {
            setForgotLoading(true)

            const response = await authService.forgotPassword(forgotEmail, 'user')

            if (response.success) {
                setResetLinkSent(true)
                setForgotEmail('')
            } else {
                setError(response.message || 'Failed to send reset link')
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
        } finally {
            setForgotLoading(false)
        }
    }

    if (showForgotPassword) {
        return (
            <div className="passenger-login-page">
                <div className="passenger-login-card">
                    <h1>Forgot Password</h1>
                    <p>Enter your registered email. We will send you a password reset link.</p>

                    <form className="passenger-login-form" onSubmit={handleForgotPassword}>
                        <div className="passenger-form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => {
                                    setForgotEmail(e.target.value)
                                    if (error) setError('')
                                    if (resetLinkSent) setResetLinkSent(false)
                                }}
                                placeholder="Enter registered email"
                                required
                            />
                        </div>

                        {resetLinkSent && (
                            <div className="passenger-success">
                                Password reset link sent. Please check your email.
                            </div>
                        )}

                        {error && <div className="passenger-error">{error}</div>}

                        <button
                            type="submit"
                            className="passenger-login-btn"
                            disabled={forgotLoading}
                        >
                            {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <button
                            type="button"
                            className="passenger-back-btn"
                            onClick={() => {
                                setShowForgotPassword(false)
                                setForgotEmail('')
                                setResetLinkSent(false)
                                setError('')
                            }}
                        >
                            Back to Login
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="passenger-login-page">
            <div className="passenger-login-card">
                <h1>Passenger Login</h1>
                <p>Welcome back, continue your journey with RideShare</p>

                <form onSubmit={handleSubmit} className="passenger-login-form">
                    <div className="passenger-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="passenger-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <div className="passenger-login-options">
                        <label className="passenger-remember">
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
                            className="passenger-forgot-btn"
                            onClick={() => {
                                setShowForgotPassword(true)
                                setError('')
                                setResetLinkSent(false)
                            }}
                        >
                            Forgot password?
                        </button>
                    </div>

                    {error && <div className="passenger-error">{error}</div>}

                    <button
                        type="submit"
                        className="passenger-login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="passenger-divider">
                        <span>OR</span>
                    </div>

                    <div className="passenger-social-login">
                        <button
                            type="button"
                            className="passenger-social-btn google-btn"
                            onClick={() => {
                                window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/auth/google`
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

                    <p className="passenger-login-footer">
                        Don&apos;t have an account?{' '}
                        <button
                            type="button"
                            className="passenger-signup-link"
                            onClick={() => setCurrentPage('passenger-signup')}
                        >
                            Sign up
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )
}