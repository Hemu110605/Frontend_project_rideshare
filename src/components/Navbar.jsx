import { useState } from 'react'
import logo from '../assets/logo.png'

export default function Navbar({ currentPage, setCurrentPage }) {
    const [showDropdown, setShowDropdown] = useState(null)

    const links = [
        { key: 'home', label: 'Home' },
        { key: 'find-rides', label: 'Find Rides' }
    ]

    const toggleDropdown = (menu) => {
        setShowDropdown(showDropdown === menu ? null : menu)
    }
    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('role')

        setCurrentPage('home')
    }

    return (
        <header className="navbar">
            <div className="logo" onClick={() => setCurrentPage('home')}>
                <img src={logo} alt="RideShare Logo" />
                <h1 className="logo-text">
                    Ride<span className="highlight">Share</span>
                </h1>
            </div>

            <nav>
                {links.map((link) => (
                    <button
                        key={link.key}
                        className={currentPage === link.key ? 'nav-btn active' : 'nav-btn'}
                        onClick={() => setCurrentPage(link.key)}
                    >
                        {link.label}
                    </button>
                ))}

                <div className="nav-dropdown">
                    <button
                        className="nav-btn"
                        onClick={() => toggleDropdown('passenger')}
                    >
                        PASSENGER ▼
                    </button>
                    {showDropdown === 'passenger' && (
                        <div className="dropdown-menu">
                            <button onClick={() => setCurrentPage('passenger-login')}>
                                Login
                            </button>
                            <button onClick={() => setCurrentPage('passenger-signup')}>
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                <div className="nav-dropdown">
                    <button
                        className="nav-btn"
                        onClick={() => toggleDropdown('driver')}
                    >
                        DRIVER ▼
                    </button>
                    {showDropdown === 'driver' && (
                        <div className="dropdown-menu">
                            <button onClick={() => setCurrentPage('driver-login')}>
                                Login
                            </button>
                            <button onClick={() => setCurrentPage('driver-signup')}>
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>

                <div className="nav-dropdown">
                    <button
                        className="nav-btn"
                        onClick={() => toggleDropdown('admin')}
                    >
                        ADMIN ▼
                    </button>
                    {showDropdown === 'admin' && (
                        <div className="dropdown-menu">
                            <button onClick={() => setCurrentPage('admin-login')}>
                                Login
                            </button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    )
}