import { useEffect, useState } from 'react'
import { rideService, vehicleService, driverService } from '../services/apiService'
import '../styles/driverdashboard.css'
import { socket } from '../socket';

export default function DriverDashboard({ onDriverCreate, setCurrentPage }) {

    const [creatingRide, setCreatingRide] = useState(false)

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const data = {
                    rideId: 'ride-123',
                    driverId: 'driver-1', // 🔥 ADD THIS
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };

                console.log("SENDING DRIVER LOCATION:", data); // 🔥 ADD THIS

                socket.emit('driver-location-update', data);
            },
            (err) => console.error("GPS ERROR:", err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedItem, setSelectedItem] = useState(null)

    const [driverSettings, setDriverSettings] = useState(() => {
        const saved = localStorage.getItem('driverDashboardSettings')

        if (saved) {
            try {
                return JSON.parse(saved)
            } catch {
                return {
                    rideNotifications: true,
                    autoAccept: false,
                    locationSharing: true,
                    smsAlerts: false,
                    emailUpdates: true,
                }
            }
        }

        return {
            rideNotifications: true,
            autoAccept: false,
            locationSharing: true,
            smsAlerts: false,
            emailUpdates: true,
        }
    })

    useEffect(() => {
        localStorage.setItem('driverDashboardSettings', JSON.stringify(driverSettings))
    }, [driverSettings])

    const toggleSetting = (key) => {
        setDriverSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }))
    }

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        if (setCurrentPage) {
            setCurrentPage('home')
        }
    }

    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        totalRides: 0,
        earnings: 0,
    })

    const [pendingRequests, setPendingRequests] = useState([])
    const [activeRides, setActiveRides] = useState([])
    const [bookings, setBookings] = useState([])
    const [transactions, setTransactions] = useState([])
    const [loadingRides, setLoadingRides] = useState(false)

    useEffect(() => {
        const fetchDriverData = async () => {
            try {
                setLoadingRides(true)
                
                const [ridesResponse, dashboardResponse] = await Promise.all([
                    rideService.getRides(),
                    driverService.getDashboard()
                ])

                if (ridesResponse.success) {
                    const rides = ridesResponse.data || []
                    setActiveRides(rides)
                    setStats(prev => ({
                        ...prev,
                        totalRides: rides.length
                    }))
                }

                if (dashboardResponse.success) {
                    const dashboardData = dashboardResponse.data || {}
                    setStats(prev => ({
                        ...prev,
                        today: dashboardData.todayRides || 0,
                        week: dashboardData.weeklyRides || 0,
                        month: dashboardData.monthlyRides || 0,
                        earnings: dashboardData.totalEarnings || 0
                    }))
                }
            } catch (error) {
                console.error('Error fetching driver data:', error)
            } finally {
                setLoadingRides(false)
            }
        }

        fetchDriverData()
    }, [])

    const renderOverview = () => (
        <>
            <div className="driver-stats-grid">
                <div className="driver-stat-card" onClick={() => setActiveTab('earnings')}>
                    <div className="driver-icon teal">₹</div>
                    <h2>{stats.today}</h2>
                    <p>Today Rides</p>
                </div>

                <div className="driver-stat-card" onClick={() => setActiveTab('earnings')}>
                    <div className="driver-icon blue">↗</div>
                    <h2>{stats.week}</h2>
                    <p>This Week</p>
                </div>

                <div className="driver-stat-card" onClick={() => setActiveTab('earnings')}>
                    <div className="driver-icon purple">₹</div>
                    <h2>₹{stats.earnings}</h2>
                    <p>Total Earnings</p>
                </div>

                <div className="driver-stat-card" onClick={() => setActiveTab('rides')}>
                    <div className="driver-icon orange">🚘</div>
                    <h2>{stats.totalRides}</h2>
                    <p>Total Rides</p>
                </div>
            </div>

            <div className="driver-panel">
                <div className="panel-header">
                    <h2>Pending Requests</h2>
                    <span>{pendingRequests.length} pending</span>
                </div>

                <div className="request-list">
                    {pendingRequests.length === 0 ? (
                        <p className="empty-text">No pending requests</p>
                    ) : (
                        pendingRequests.map((request) => (
                            <div className="request-card" key={request.id}>
                                <div className="request-left">
                                    <div className="request-avatar">
                                        {request.passenger?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3>{request.passenger}</h3>
                                        <p>{request.route}</p>
                                        <small>{request.time}</small>
                                    </div>
                                </div>

                                <div className="request-right">
                                    <strong>₹{request.amount}</strong>
                                    <div className="request-actions">
                                        <button className="accept-btn">Accept</button>
                                        <button className="decline-btn">Decline</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="driver-panel">
                <div className="panel-header">
                    <h2>Active Rides</h2>
                    <span>Live rides</span>
                </div>

                <div className="ride-list-driver">
                    {loadingRides ? (
                        <p className="empty-text">Loading rides...</p>
                    ) : activeRides.length === 0 ? (
                        <p className="empty-text">No rides posted yet</p>
                    ) : (
                        activeRides.map((ride) => (
                            <div
                                className="driver-ride-card"
                                key={ride._id}
                                onClick={() => setSelectedItem(ride)}
                            >
                                <div>
                                    <h3>{ride.source} → {ride.destination}</h3>
                                    <p>{new Date(ride.date).toLocaleDateString()} at {ride.time}</p>
                                    <p>{ride.availableSeats} seats left</p>
                                    <span className={`status-badge ${ride.status}`}>
                                        {ride.status}
                                    </span>
                                </div>
                                <div className="ride-fare">₹{ride.estimatedFare}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )

    const handleCreateRide = async (e) => {
        e.preventDefault()
        setCreatingRide(true)

        try {
            const formData = new FormData(e.target)
            
            // Get coordinates for locations (mock for now, should use geocoding API)
            const getCoordinates = (location) => {
                const coords = {
                    'thane': { lat: 19.1914, lng: 72.9645 },
                    'powai': { lat: 19.1199, lng: 72.9066 },
                    'bandra': { lat: 19.0596, lng: 72.8295 },
                    'andheri': { lat: 19.1197, lng: 72.8466 },
                    'borivali': { lat: 19.2312, lng: 72.8576 },
                    'dadar': { lat: 19.0176, lng: 72.8428 }
                }
                return coords[location.toLowerCase()] || { lat: 19.076, lng: 72.8777 }
            }

            const fromLocation = formData.get('from')
            const toLocation = formData.get('to')
            const fromCoords = getCoordinates(fromLocation)
            const toCoords = getCoordinates(toLocation)

            // Calculate distance and duration (mock calculation)
            const distance = Math.round(Math.sqrt(
                Math.pow(toCoords.lat - fromCoords.lat, 2) + 
                Math.pow(toCoords.lng - fromCoords.lng, 2)
            ) * 111) // Approximate km
            const duration = Math.max(distance * 2, 5) // At least 5 minutes

            const rideData = {
                source: fromLocation,
                destination: toLocation,
                pickupCoordinates: {
                    type: 'Point',
                    coordinates: [fromCoords.lng, fromCoords.lat] // GeoJSON format [lng, lat]
                },
                dropCoordinates: {
                    type: 'Point',
                    coordinates: [toCoords.lng, toCoords.lat]
                },
                date: formData.get('date'),
                time: formData.get('time'),
                distance: distance,
                duration: duration,
                pricePerKm: parseInt(formData.get('fare')),
                totalSeats: parseInt(formData.get('seats')),
                availableSeats: parseInt(formData.get('seats')),
                vehicle: 'default-vehicle-id', // This should come from user's vehicles
                estimatedFare: distance * parseInt(formData.get('fare'))
            }

            const response = await rideService.createRide(rideData)
            
            if (response.success) {
                alert('Ride created successfully!')
                e.target.reset()
                setActiveTab('rides')
            } else {
                alert(response.message || 'Failed to create ride')
            }
        } catch (error) {
            console.error('Ride creation error:', error)
            alert(error.message || 'Failed to create ride')
        } finally {
            setCreatingRide(false)
        }
    }

    const renderPostRide = () => (
        <div className="driver-panel">
            <div className="panel-header">
                <h2>Post a New Ride</h2>
            </div>

            <form className="post-ride-form" onSubmit={handleCreateRide}>
                <input name="from" type="text" placeholder="From Location (e.g., Thane)" required />
                <input name="to" type="text" placeholder="To Location (e.g., Powai)" required />
                <input name="date" type="date" required />
                <input name="time" type="time" required />
                <input name="seats" type="number" placeholder="Available Seats" min="1" max="7" required />
                <input name="fare" type="number" placeholder="Fare Per Seat (₹)" min="1" required />

                <button type="submit" className="submit-ride-btn" disabled={creatingRide}>
                    {creatingRide ? 'Creating Ride...' : 'Create Ride'}
                </button>
            </form>
        </div>
    )

    const renderBookings = () => (
        <div className="driver-panel">
            <div className="panel-header">
                <h2>Manage Bookings</h2>
                <span>{bookings.length} bookings</span>
            </div>

            <div className="booking-list">
                {bookings.length === 0 ? (
                    <p className="empty-text">No bookings yet</p>
                ) : (
                    bookings.map((booking) => (
                        <div className="request-card" key={booking.id}>
                            <div>
                                <h3>{booking.passenger}</h3>
                                <p>{booking.route}</p>
                            </div>
                            <strong>₹{booking.amount}</strong>
                        </div>
                    ))
                )}
            </div>
        </div>
    )

    const handleAcceptRide = async (rideId) => {
        try {
            const response = await rideService.accept(rideId)
            if (response.success) {
                alert('Ride accepted successfully!')
                // Refresh rides list
                const ridesResponse = await rideService.getRides()
                if (ridesResponse.success) {
                    setActiveRides(ridesResponse.data.rides || [])
                }
            } else {
                alert(response.message || 'Failed to accept ride')
            }
        } catch (error) {
            console.error('Accept ride error:', error)
            alert(error.message || 'Failed to accept ride')
        }
    }

    const renderRides = () => (
        <div className="driver-panel">
            <div className="panel-header">
                <h2>My Rides</h2>
                <span>{activeRides.length} rides</span>
            </div>

            <div className="ride-list-driver">
                {loadingRides ? (
                    <p className="empty-text">Loading rides...</p>
                ) : activeRides.length === 0 ? (
                    <p className="empty-text">No rides posted yet</p>
                ) : (
                    activeRides.map((ride) => (
                        <div
                            className="driver-ride-card"
                            key={ride._id}
                            onClick={() => setSelectedItem(ride)}
                        >
                            <div>
                                <h3>{ride.source} → {ride.destination}</h3>
                                <p>{new Date(ride.date).toLocaleDateString()} at {ride.time}</p>
                                <p>{ride.availableSeats} seats left</p>
                                <span className={`status-badge ${ride.status}`}>
                                    {ride.status}
                                </span>
                            </div>
                            <div className="ride-actions">
                                <div className="ride-fare">₹{ride.estimatedFare}</div>
                                {ride.status === 'active' && (
                                    <button 
                                        className="accept-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAcceptRide(ride._id)
                                        }}
                                    >
                                        Accept Ride
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button className="submit-ride-btn" onClick={() => setActiveTab('post')}>
                Post New Ride
            </button>
        </div>
    )

    const renderVehicle = () => (
        <div className="vehicle-page">
            <div className="panel-header vehicle-header">
                <div>
                    <h2>My Vehicle</h2>
                    <p className="vehicle-subtitle">
                        View and manage your vehicle details
                    </p>
                </div>
            </div>

            <div className="vehicle-main-card">
                <p className="empty-text">No vehicle data available</p>
            </div>

            <button className="vehicle-update-btn" onClick={() => setActiveTab('post')}>
                Update Vehicle Details
            </button>
        </div>
    )

    const renderEarnings = () => (
        <div className="driver-earnings-page">
            <div className="panel-header">
                <h2>Earnings Overview</h2>
            </div>

            <div className="earnings-summary-grid">
                <div className="earnings-summary-card">
                    <p>Today</p>
                    <h3>₹{stats.today}</h3>
                </div>

                <div className="earnings-summary-card">
                    <p>This Week</p>
                    <h3>₹{stats.week}</h3>
                </div>

                <div className="earnings-summary-card">
                    <p>This Month</p>
                    <h3>₹{stats.month}</h3>
                </div>

                <div className="earnings-summary-card">
                    <p>All Time</p>
                    <h3>₹{stats.totalRides}</h3>
                </div>
            </div>

            <div className="driver-panel">
                <div className="panel-header">
                    <h2>Recent Transactions</h2>
                </div>

                <div className="transaction-list">
                    {transactions.length === 0 ? (
                        <p className="empty-text">No transactions yet</p>
                    ) : (
                        transactions.map((transaction) => (
                            <div className="request-card" key={transaction.id}>
                                <div>
                                    <h3>{transaction.title}</h3>
                                    <p>{transaction.date}</p>
                                </div>
                                <strong>₹{transaction.amount}</strong>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )

    const renderSettings = () => {
        const settingList = [
            {
                key: 'rideNotifications',
                title: 'Ride Notifications',
                subtitle: 'Get notified when passengers book your ride',
            },
            {
                key: 'autoAccept',
                title: 'Auto Accept Requests',
                subtitle: 'Automatically accept passenger requests',
            },
            {
                key: 'locationSharing',
                title: 'Location Sharing',
                subtitle: 'Share live location during active rides',
            },
            {
                key: 'smsAlerts',
                title: 'SMS Alerts',
                subtitle: 'Receive important updates by SMS',
            },
            {
                key: 'emailUpdates',
                title: 'Email Updates',
                subtitle: 'Receive ride and earning updates by email',
            },
        ]

        return (
            <div className="driver-panel">
                <div className="panel-header">
                    <div>
                        <h2>Driver Settings</h2>
                        <p className="vehicle-subtitle">Your preferences are saved automatically</p>
                    </div>
                </div>

                <div className="settings-list">
                    {settingList.map((item) => (
                        <div className="setting-card" key={item.key}>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.subtitle}</p>
                            </div>

                            <button
                                type="button"
                                className={`toggle-switch ${driverSettings[item.key] ? 'active' : ''}`}
                                onClick={() => toggleSetting(item.key)}
                            >
                                <span className="toggle-knob" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'post':
                return renderPostRide()
            case 'bookings':
                return renderBookings()
            case 'rides':
                return renderRides()
            case 'vehicle':
                return renderVehicle()
            case 'earnings':
                return renderEarnings()
            case 'settings':
                return renderSettings()
            default:
                return renderOverview()
        }
    }

    return (
        <div className="driver-dashboard">
            <div className="driver-top-tabs">
                <button className={activeTab === 'overview' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('overview')}>Overview</button>
                <button className={activeTab === 'post' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('post')}>Post Ride</button>
                <button className={activeTab === 'rides' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('rides')}>My Rides</button>
                <button className={activeTab === 'bookings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('bookings')}>Bookings</button>
                <button className={activeTab === 'vehicle' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('vehicle')}>Vehicle</button>
                <button className={activeTab === 'earnings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('earnings')}>Earnings</button>
                <button className={activeTab === 'settings' ? 'tab-btn active' : 'tab-btn'} onClick={() => setActiveTab('settings')}>Settings</button>

                <button className="tab-btn logout-tab-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <div className="driver-header">
                <h1>Driver Dashboard</h1>
                <p>Welcome back! Ready to hit the road?</p>
            </div>

            {renderActiveTab()}

            {selectedItem && (
                <div className="driver-modal-backdrop" onClick={() => setSelectedItem(null)}>
                    <div className="driver-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="driver-modal-header">
                            <h2>Details</h2>
                            <button onClick={() => setSelectedItem(null)}>×</button>
                        </div>

                        <div className="driver-modal-body">
                            {Object.entries(selectedItem).map(([key, value]) => (
                                <div className="driver-modal-row" key={key}>
                                    <strong>{key}</strong>
                                    <span>
                                        {typeof value === 'object' && value !== null
                                            ? JSON.stringify(value)
                                            : String(value ?? '-')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}