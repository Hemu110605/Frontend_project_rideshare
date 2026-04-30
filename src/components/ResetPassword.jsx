import { useState, useEffect } from 'react'
import { authService } from '../services/apiService'
import '../styles/PassengerLogin.css' // reuse same styles

export default function ResetPassword({ setCurrentPage }) {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const [token, setToken] = useState('')

    useEffect(() => {
        // Get token from URL
        const path = window.location.pathname
        const tokenFromUrl = path.split('/').pop()
        setToken(tokenFromUrl)
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!password || !confirmPassword) {
            return setError('Please fill all fields')
        }

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        try {
            setLoading(true)

            const res = await authService.resetPassword(token, password)

            if (res.success) {
                setSuccess(true)

                setTimeout(() => {
                    setCurrentPage('passenger-login') // or driver-login
                }, 2000)
            } else {
                setError(res.message || 'Failed to reset password')
            }
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="passenger-login-page">
            <div className="passenger-login-card">
                <h1>Reset Password</h1>

                {success ? (
                    <div className="passenger-success">
                        Password updated successfully. Redirecting...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="passenger-login-form">
                        <div className="passenger-form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                required
                            />
                        </div>

                        <div className="passenger-form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                required
                            />
                        </div>

                        {error && <div className="passenger-error">{error}</div>}

                        <button
                            type="submit"
                            className="passenger-login-btn"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}