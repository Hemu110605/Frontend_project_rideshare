import { useState } from 'react'
import '../styles/AdminLogin.css'

export default function AdminLogin({ setCurrentPage, handleLogin }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))

        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            if (!formData.email || !formData.password) {
                setError('Please enter valid credentials')
                setLoading(false)
                return
            }

            // Temporary local admin login
            // Replace this block later with real backend API login
            const adminUser = {
                name: 'Admin',
                email: formData.email,
                role: 'admin',
            }

            localStorage.setItem('user', JSON.stringify(adminUser))
            localStorage.setItem('token', 'admin-demo-token')

            if (handleLogin) {
                handleLogin('admin')
            }

            setCurrentPage('admin-dashboard')
        } catch (err) {
            setError('Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <h1>Admin Login</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your admin email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your admin password"
                            required
                        />
                    </div>

                    {error && (
                        <div
                            className="error-message"
                            style={{
                                color: '#ff6b6b',
                                marginBottom: '16px',
                                textAlign: 'center',
                                fontSize: '14px',
                            }}
                        >
                            {error}
                        </div>
                    )}

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
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    )
}