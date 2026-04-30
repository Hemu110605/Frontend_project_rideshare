import { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import RideBookingMap from './RideBookingMap';
import LiveTrackingDashboard from './LiveTrackingDashboard';
import DriverLocationTracker from './DriverLocationTracker';
import '../styles/mapDemoPage.css';

export default function MapDemoPage() {
  const [activeDemo, setActiveDemo] = useState('booking');
  const [userRole, setUserRole] = useState('passenger');
  const [mockRide, setMockRide] = useState(null);

  useEffect(() => {
    // Create a mock ride for demonstration
    setMockRide({
      _id: 'demo-ride-123',
      source: 'Thane',
      destination: 'Powai',
      date: new Date().toISOString(),
      time: '10:00 AM',
      farePerSeat: 150,
      availableSeats: 3,
      driver: {
        firstName: 'Demo',
        lastName: 'Driver'
      },
      status: 'active'
    });
  }, []);

  const renderDemoContent = () => {
    switch (activeDemo) {
      case 'booking':
        return (
          <div className="demo-section">
            <h2>Ride Booking with Maps</h2>
            <p>Book rides and see routes on interactive maps with live tracking capabilities.</p>
            <RideBookingMap />
          </div>
        );
      
      case 'tracking':
        return (
          <div className="demo-section">
            <h2>Driver Location Tracking</h2>
            <p>Drivers can share their live location with passengers in real-time.</p>
            <DriverLocationTracker 
              rideId={mockRide?._id}
              driverId="demo-driver-123"
            />
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="demo-section">
            <h2>Live Tracking Dashboard</h2>
            <p>Comprehensive dashboard for monitoring rides, passengers, and real-time updates.</p>
            <LiveTrackingDashboard 
              userRole={userRole}
              userId="demo-user-123"
              activeRide={mockRide}
            />
          </div>
        );
      
      case 'basic':
        return (
          <div className="demo-section">
            <h2>Basic Map Component</h2>
            <p>Interactive map with custom markers and route visualization.</p>
            <div className="map-demo-container">
              <MapComponent
                rideId="demo-ride-123"
                showRoute={true}
                source={{ lat: 19.1914, lng: 72.9645 }} // Thane
                destination={{ lat: 19.1199, lng: 72.9066 }} // Powai
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="map-demo-page">
      <div className="demo-header">
        <h1>🗺️ RideShare Map & Live Tracking Demo</h1>
        <p>Explore the complete map functionality and real-time location tracking features</p>
      </div>

      <div className="demo-controls">
        <div className="demo-tabs">
          <button 
            className={`demo-tab ${activeDemo === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveDemo('booking')}
          >
            🚗 Ride Booking
          </button>
          
          <button 
            className={`demo-tab ${activeDemo === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveDemo('tracking')}
          >
            📡 Location Tracking
          </button>
          
          <button 
            className={`demo-tab ${activeDemo === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveDemo('dashboard')}
          >
            📊 Live Dashboard
          </button>
          
          <button 
            className={`demo-tab ${activeDemo === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveDemo('basic')}
          >
            🗺️ Basic Map
          </button>
        </div>

        {activeDemo === 'dashboard' && (
          <div className="role-switcher">
            <label>User Role:</label>
            <select 
              value={userRole} 
              onChange={(e) => setUserRole(e.target.value)}
              className="role-select"
            >
              <option value="passenger">Passenger</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}
      </div>

      <div className="demo-content">
        {renderDemoContent()}
      </div>

      <div className="demo-features">
        <h3>🚀 Features Demonstrated</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🗺️ Interactive Maps</h4>
            <ul>
              <li>OpenStreetMap integration</li>
              <li>Custom markers and icons</li>
              <li>Route visualization</li>
              <li>Real-time location updates</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <h4>📡 Live Location Tracking</h4>
            <ul>
              <li>Driver location sharing</li>
              <li>Passenger pickup tracking</li>
              <li>Real-time ETA updates</li>
              <li>Socket.io integration</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <h4>🚗 Ride Booking</h4>
            <ul>
              <li>Map-based ride search</li>
              <li>Visual route display</li>
              <li>Interactive booking interface</li>
              <li>Seat selection</li>
            </ul>
          </div>
          
          <div className="feature-card">
            <h4>📊 Dashboard Features</h4>
            <ul>
              <li>Multi-tab interface</li>
              <li>Passenger management</li>
              <li>Emergency alerts</li>
              <li>Notification system</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="demo-info">
        <h3>💡 Technical Implementation</h3>
        <div className="tech-grid">
          <div className="tech-item">
            <strong>Frontend:</strong>
            <p>React, Leaflet, Socket.io-client</p>
          </div>
          <div className="tech-item">
            <strong>Backend:</strong>
            <p>Node.js, Express, Socket.io</p>
          </div>
          <div className="tech-item">
            <strong>Maps:</strong>
            <p>OpenStreetMap, React-Leaflet</p>
          </div>
          <div className="tech-item">
            <strong>Real-time:</strong>
            <p>WebSocket, Geolocation API</p>
          </div>
        </div>
      </div>
    </div>
  );
}
