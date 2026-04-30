import { useEffect, useState } from 'react'
import { bookingService, rideService } from '../services/apiService'
import '../styles/passengerdashboard.css'
import logo from '../assets/logo.png'
import MapComponent from '../components/MapComponent';

export default function PassengerDashboard({ setCurrentPage }) {
  const [activePage, setActivePage] = useState('overview')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem('passengerProfilePhoto') || ''
  })
  const [profileData, setProfileData] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    return {
      fullName: user.name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
    }
  })

  const [passengerSettings, setPassengerSettings] = useState(() => {
    const saved = localStorage.getItem('passengerDashboardSettings')

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {
          pushNotifications: true,
          emailNotifications: true,
          locationServices: true,
          darkMode: false,
        }
      }
    }

    return {
      pushNotifications: true,
      emailNotifications: true,
      locationServices: true,
      darkMode: false,
    }
  })

  const [bookings, setBookings] = useState([])
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch passenger data
  const fetchPassengerData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [bookingsResponse, ridesResponse] = await Promise.all([
        bookingService.getMyBookings(),
        rideService.getRides()
      ])

      if (bookingsResponse.success) {
        setBookings(bookingsResponse.data?.bookings || [])
      }

      if (ridesResponse.success) {
        setRides(ridesResponse.data || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPassengerData()
  }, [])

  useEffect(() => {
    localStorage.setItem('passengerDashboardSettings', JSON.stringify(passengerSettings))
  }, [passengerSettings])

  const toggleSetting = (key) => {
    setPassengerSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    const reader = new FileReader()

    reader.onloadend = () => {
      setProfilePhoto(reader.result)
      localStorage.setItem('passengerProfilePhoto', reader.result)
    }

    reader.readAsDataURL(file)
  }

  const handleProfileSave = () => {
    const oldUser = JSON.parse(localStorage.getItem('user') || '{}')

    const updatedUser = {
      ...oldUser,
      name: profileData.fullName,
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditingProfile(false)
  }

  const stats = [
    { 
      id: 1, 
      title: 'Total Rides', 
      value: bookings.length.toString(), 
      icon: '🚗', 
      page: 'rides' 
    },
    { 
      id: 2, 
      title: 'Money Saved', 
      value: `₹${bookings.reduce((sum, b) => sum + (b.totalFare || 0), 0)}`, 
      icon: '💰', 
      page: 'fare' 
    },
    { 
      id: 3, 
      title: 'Upcoming', 
      value: bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length.toString(), 
      icon: '📅', 
      page: 'rides' 
    },
    { 
      id: 4, 
      title: 'Rating', 
      value: '4.5', 
      icon: '⭐', 
      page: 'profile' 
    },
  ]

  const upcomingRides = bookings.filter(booking => ['pending', 'confirmed'].includes(booking.status))
  const completedRides = bookings.filter(booking => booking.status === 'completed')

  const renderOverview = () => (
    <div className="passenger-page-content">
      <div className="passenger-welcome-card">
        <div>
          <h1>Welcome back</h1>
          <p>Here's your passenger dashboard overview</p>
        </div>
      </div>

      {error && <div className="passenger-error">{error}</div>}
      
      {loading ? (
        <div className="passenger-loading">Loading dashboard data...</div>
      ) : (
        <div className="passenger-stats-grid">
          {stats.map((item) => (
            <div
              className="passenger-stat-card"
              key={item.id}
              onClick={() => setActivePage(item.page)}
            >
              <div className="passenger-stat-icon">{item.icon}</div>
              <h2>{item.value}</h2>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
      )}

      <div className="passenger-section-card">
        <div className="passenger-section-header">
          <h3>Upcoming Rides</h3>
          <button className="passenger-text-btn" onClick={() => setActivePage('rides')}>
            View all
          </button>
        </div>

        {upcomingRides.length === 0 ? (
          <div className="passenger-empty-state">
            <div className="passenger-empty-icon">🛣️</div>
            <h4>No upcoming rides yet</h4>
            <p>Your booked rides will appear here once available.</p>
          </div>
        ) : (
          upcomingRides.map((ride) => (
            <div
              className="passenger-ride-card"
              key={ride.id}
              onClick={() => setSelectedItem(ride)}
            >
              <h3>{ride.route}</h3>
              <p>{ride.date}</p>
            </div>
          ))
        )}
      </div>
      <div className="passenger-section-card">
        <h3>Live Map</h3>
        <MapComponent />
      </div>

      <div className="passenger-action-grid">
        <button
          className="passenger-action-card action-find"
          onClick={() => {
            if (setCurrentPage) {
              setCurrentPage('find-rides')
            } else {
              setActivePage('find')
            }
          }}
        >
          <span className="action-icon">🔎</span>
          <span>Find Rides</span>
        </button>

        <button
          className="passenger-action-card action-fare"
          onClick={() => setActivePage('fare')}
        >
          <span className="action-icon">🧮</span>
          <span>Fare Calculator</span>
        </button>

        <button
          className="passenger-action-card action-negotiate"
          onClick={() => setActivePage('negotiate')}
        >
          <span className="action-icon">💬</span>
          <span>Negotiate Price</span>
        </button>
      </div>
    </div>
  )

  const renderMyRides = () => (
    <div className="passenger-page-content">
      <div className="passenger-page-title">
        <h1>My Rides</h1>
        <p>Manage your upcoming and completed rides</p>
      </div>

      <div className="passenger-section-card">
        <div className="passenger-section-header">
          <h3>Upcoming</h3>
          <span className="passenger-badge">{upcomingRides.length}</span>
        </div>

        {upcomingRides.length === 0 ? (
          <div className="passenger-empty-state">
            <div className="passenger-empty-icon">🚘</div>
            <h4>No upcoming rides</h4>
            <p>Book a ride and it will appear here.</p>
            <button
              className="passenger-primary-btn"
              onClick={() => {
                if (setCurrentPage) {
                  setCurrentPage('find-rides')
                } else {
                  setActivePage('find')
                }
              }}
            >
              Find Rides
            </button>
          </div>
        ) : (
          upcomingRides.map((ride) => (
            <div
              className="passenger-ride-card"
              key={ride.id}
              onClick={() => setSelectedItem(ride)}
            >
              <h3>{ride.route}</h3>
              <p>{ride.date}</p>
            </div>
          ))
        )}
      </div>

      <div className="passenger-section-card">
        <div className="passenger-section-header">
          <h3>Completed</h3>
          <span className="passenger-badge">{completedRides.length}</span>
        </div>

        {completedRides.length === 0 ? (
          <div className="passenger-empty-state">
            <div className="passenger-empty-icon">✅</div>
            <h4>No completed rides</h4>
            <p>Your ride history will show here after trips are completed.</p>
          </div>
        ) : (
          completedRides.map((ride) => (
            <div
              className="passenger-ride-card"
              key={ride.id}
              onClick={() => setSelectedItem(ride)}
            >
              <h3>{ride.route}</h3>
              <p>{ride.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderFareCalculator = () => (
    <div className="passenger-page-content">
      <div className="passenger-page-title">
        <h1>Fare Calculator</h1>
        <p>Estimate your ride cost before booking</p>
      </div>

      <div className="passenger-section-card">
        <form
          className="passenger-form"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Fare calculator will connect with backend/map API later')
          }}
        >
          <input type="text" placeholder="Pickup location" required />
          <input type="text" placeholder="Drop location" required />
          <input type="number" placeholder="Distance in km" min="1" required />
          <button className="passenger-primary-btn" type="submit">
            Calculate Fare
          </button>
        </form>
      </div>
    </div>
  )

  const renderNegotiate = () => (
    <div className="passenger-page-content">
      <div className="passenger-page-title">
        <h1>Negotiate Price</h1>
        <p>Send a custom price request to the driver</p>
      </div>

      <div className="passenger-section-card">
        <form
          className="passenger-form"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Negotiation request submitted')
            e.target.reset()
          }}
        >
          <input type="text" placeholder="Ride ID or Route" required />
          <input type="number" placeholder="Your offered price" min="1" required />
          <textarea placeholder="Message to driver" rows="4"></textarea>
          <button className="passenger-primary-btn" type="submit">
            Send Request
          </button>
        </form>
      </div>
    </div>
  )

  const renderFindRideInside = () => (
    <div className="passenger-page-content">
      <div className="passenger-page-title">
        <h1>Find Rides</h1>
        <p>Search for available rides</p>
      </div>

      <div className="passenger-section-card">
        <form
          className="passenger-form"
          onSubmit={(e) => {
            e.preventDefault()
            alert('Search rides will connect with backend later')
          }}
        >
          <input type="text" placeholder="From" required />
          <input type="text" placeholder="To" required />
          <input type="date" required />
          <button className="passenger-primary-btn" type="submit">
            Search Rides
          </button>
        </form>
      </div>
    </div>
  )

  const renderProfile = () => {
    return (
      <div className="passenger-page-content">
        <div className="passenger-page-title">
          <h1>My Profile</h1>
          <p>View and manage your personal information</p>
        </div>

        <div className="passenger-profile-card">
          <div className="passenger-profile-top">
            <label className="passenger-avatar passenger-avatar-upload">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="passenger-avatar-img" />
              ) : (
                <span>{(profileData.fullName || 'P').charAt(0).toUpperCase()}</span>
              )}

              {isEditingProfile && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  hidden
                />
              )}
            </label>

            <div className="passenger-profile-meta">
              <h2>{profileData.fullName || 'Passenger Name'}</h2>
              <p>Passenger account details</p>
              <span className="passenger-rating">⭐ --</span>
            </div>
          </div>

          <div className="passenger-profile-details">
            <div className="profile-row">
              <span>Full Name</span>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, fullName: e.target.value })
                  }
                />
              ) : (
                <strong>{profileData.fullName || '--'}</strong>
              )}
            </div>

            <div className="profile-row">
              <span>Email</span>
              {isEditingProfile ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              ) : (
                <strong>{profileData.email || '--'}</strong>
              )}
            </div>

            <div className="profile-row">
              <span>Phone</span>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              ) : (
                <strong>{profileData.phone || '--'}</strong>
              )}
            </div>

            <div className="profile-row">
              <span>Location</span>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                />
              ) : (
                <strong>{profileData.location || '--'}</strong>
              )}
            </div>
          </div>

          {isEditingProfile ? (
            <button className="passenger-primary-btn" onClick={handleProfileSave}>
              Save Profile
            </button>
          ) : (
            <button className="passenger-primary-btn" onClick={() => setIsEditingProfile(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderSettings = () => {
    const settings = [
      {
        key: 'pushNotifications',
        title: 'Push Notifications',
        subtitle: 'Ride updates and alerts',
      },
      {
        key: 'emailNotifications',
        title: 'Email Notifications',
        subtitle: 'Booking and account updates',
      },
      {
        key: 'locationServices',
        title: 'Location Services',
        subtitle: 'Required for better pickup matching',
      },
      {
        key: 'darkMode',
        title: 'Dark Mode',
        subtitle: 'Use dark appearance preference',
      },
    ]

    return (
      <div className="passenger-page-content">
        <div className="passenger-page-title">
          <h1>Settings</h1>
          <p>Manage your preferences and app options</p>
        </div>

        <div className="passenger-settings-list">
          {settings.map((item) => (
            <div className="passenger-setting-card" key={item.key}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>

              <button
                type="button"
                className={`passenger-toggle ${passengerSettings[item.key] ? 'active' : ''}`}
                onClick={() => toggleSetting(item.key)}
              >
                <span className="passenger-toggle-circle"></span>
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activePage) {
      case 'rides':
        return renderMyRides()
      case 'fare':
        return renderFareCalculator()
      case 'negotiate':
        return renderNegotiate()
      case 'find':
        return renderFindRideInside()
      case 'profile':
        return renderProfile()
      case 'settings':
        return renderSettings()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="passenger-dashboard">
      <aside className="passenger-sidebar">
        <div className="passenger-logo-wrap">
          <img src={logo} alt="RideShare Logo" className="dashboard-logo" />
          <h2 className="passenger-logo-text">
            Ride<span className="highlight">Share</span>
          </h2>
        </div>

        <div className="passenger-user-box">
          <div className="passenger-user-avatar">P</div>
          <div>
            <h3>Passenger</h3>
            <p>User Panel</p>
          </div>
        </div>

        <nav className="passenger-nav">
          <button
            className={activePage === 'overview' ? 'active' : ''}
            onClick={() => setActivePage('overview')}
          >
            <span>🏠</span>
            Overview
          </button>

          <button
            className={activePage === 'rides' ? 'active' : ''}
            onClick={() => setActivePage('rides')}
          >
            <span>🚗</span>
            My Rides
          </button>

          <button
            className={activePage === 'fare' ? 'active' : ''}
            onClick={() => setActivePage('fare')}
          >
            <span>🧮</span>
            Fare
          </button>

          <button
            className={activePage === 'negotiate' ? 'active' : ''}
            onClick={() => setActivePage('negotiate')}
          >
            <span>💬</span>
            Negotiate
          </button>

          <button
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => setActivePage('profile')}
          >
            <span>👤</span>
            Profile
          </button>

          <button
            className={activePage === 'settings' ? 'active' : ''}
            onClick={() => setActivePage('settings')}
          >
            <span>⚙️</span>
            Settings
          </button>
        </nav>

        <div className="passenger-sidebar-bottom">
          <button
            className="passenger-side-link"
            onClick={() => {
              if (setCurrentPage) {
                setCurrentPage('find-rides')
              } else {
                setActivePage('find')
              }
            }}
          >
            Find Rides
          </button>

          <button
            className="passenger-logout-btn"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              if (setCurrentPage) setCurrentPage('home')
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="passenger-main">{renderContent()}</main>

      {selectedItem && (
        <div className="passenger-modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="passenger-modal" onClick={(e) => e.stopPropagation()}>
            <div className="passenger-modal-header">
              <h2>Ride Details</h2>
              <button onClick={() => setSelectedItem(null)}>×</button>
            </div>

            <div className="passenger-modal-body">
              {Object.entries(selectedItem).map(([key, value]) => (
                <div className="passenger-modal-row" key={key}>
                  <strong>{key}</strong>
                  <span>{String(value ?? '-')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}