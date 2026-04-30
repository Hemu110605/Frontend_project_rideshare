import { useEffect, useState } from 'react';
import MapComponent from './MapComponent';
import DriverLocationTracker from './DriverLocationTracker';
import { socket } from '../socket';
import '../styles/liveTrackingDashboard.css';

export default function LiveTrackingDashboard({ userRole, userId, activeRide = null }) {
  const [activeTab, setActiveTab] = useState('map');
  const [rideStatus, setRideStatus] = useState('active');
  const [eta, setEta] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (activeRide) {
      // Join ride room for real-time updates
      socket.emit('join-ride-room', {
        rideId: activeRide._id,
        userId: userId,
        userType: userRole
      });

      // Listen for various events
      socket.on('receive-ride-status', (data) => {
        setRideStatus(data.status);
        addNotification(`Ride status updated: ${data.status}`, 'info');
      });

      socket.on('receive-driver-location', (data) => {
        // Update driver location on map
        console.log('Driver location updated:', data);
      });

      socket.on('receive-passenger-location', (data) => {
        // Update passenger location on map
        console.log('Passenger location updated:', data);
      });

      socket.on('user-joined-ride', (data) => {
        addNotification(`${data.userType} joined the ride`, 'success');
        if (data.userType === 'passenger') {
          setPassengers(prev => [...prev, data.userId]);
        }
      });

      socket.on('user-left-ride', (data) => {
        addNotification(`${data.userType} left the ride`, 'warning');
        if (data.userType === 'passenger') {
          setPassengers(prev => prev.filter(id => id !== data.userId));
        }
      });

      socket.on('receive-emergency-alert', (data) => {
        setEmergencyMode(true);
        addNotification('EMERGENCY ALERT!', 'emergency');
      });

      // Request ETA
      socket.emit('eta-request', { rideId: activeRide._id });
      socket.on('eta-response', (data) => {
        setEta(data.eta);
      });

      return () => {
        socket.off('receive-ride-status');
        socket.off('receive-driver-location');
        socket.off('receive-passenger-location');
        socket.off('user-joined-ride');
        socket.off('user-left-ride');
        socket.off('receive-emergency-alert');
        socket.off('eta-response');
        socket.emit('leave-ride-room', activeRide._id);
      };
    }
  }, [activeRide, userId, userRole]);

  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    }, ...prev].slice(0, 5)); // Keep only last 5 notifications
  };

  const sendEmergencyAlert = () => {
    if (activeRide) {
      socket.emit('emergency-alert', {
        rideId: activeRide._id,
        userId: userId,
        userType: userRole,
        message: 'Emergency assistance needed',
        location: 'current location'
      });
    }
  };

  const updateRideStatus = (newStatus) => {
    if (activeRide) {
      socket.emit('ride-status-update', {
        rideId: activeRide._id,
        status: newStatus,
        updatedBy: userId
      });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  if (!activeRide) {
    return (
      <div className="live-tracking-dashboard">
        <div className="no-active-ride">
          <h2>No Active Ride</h2>
          <p>Start a ride or book a ride to use live tracking features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-tracking-dashboard">
      <div className="dashboard-header">
        <div className="ride-info">
          <h2>Live Tracking Dashboard</h2>
          <div className="route-info">
            <span className="route">{activeRide.source || activeRide.from} → {activeRide.destination || activeRide.to}</span>
            <span className={`status-badge ${rideStatus}`}>{rideStatus}</span>
          </div>
        </div>
        
        <div className="quick-actions">
          {eta && (
            <div className="eta-info">
              <span className="eta-label">ETA:</span>
              <span className="eta-value">{eta} min</span>
            </div>
          )}
          
          {userRole === 'driver' && (
            <div className="driver-actions">
              <select 
                value={rideStatus} 
                onChange={(e) => updateRideStatus(e.target.value)}
                className="status-select"
              >
                <option value="active">Active</option>
                <option value="pickup">Pickup</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <button 
                className={`emergency-btn ${emergencyMode ? 'active' : ''}`}
                onClick={sendEmergencyAlert}
              >
                🚨 Emergency
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Live Map
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          📍 Location Tracking
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'passengers' ? 'active' : ''}`}
          onClick={() => setActiveTab('passengers')}
        >
          👥 Passengers ({passengers.length})
        </button>
        
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications ({notifications.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'map' && (
          <div className="map-tab">
            <div className="map-container">
              <MapComponent
                rideId={activeRide._id}
                showRoute={true}
                source={activeRide.source ? { lat: 19.1914, lng: 72.9645 } : null}
                destination={activeRide.destination ? { lat: 19.1199, lng: 72.9066 } : null}
              />
            </div>
            
            <div className="map-legend">
              <div className="legend-item">
                <span className="legend-icon">🚗</span>
                <span>Driver Location</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon">👤</span>
                <span>Your Location</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon">📍</span>
                <span>Pickup Point</span>
              </div>
              <div className="legend-item">
                <span className="legend-icon">🎯</span>
                <span>Destination</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="tracking-tab">
            {userRole === 'driver' ? (
              <DriverLocationTracker 
                rideId={activeRide._id}
                driverId={userId}
              />
            ) : (
              <div className="passenger-tracking">
                <h3>Passenger Tracking</h3>
                <p>Your location is shared with the driver for pickup coordination.</p>
                
                <div className="tracking-status">
                  <span className="status-indicator active">🟢 Location Sharing Active</span>
                  <span className="update-info">Location updates every 5 seconds</span>
                </div>
                
                <div className="map-container">
                  <MapComponent
                    rideId={activeRide._id}
                    userLocation={{ lat: 19.1914, lng: 72.9645 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'passengers' && (
          <div className="passengers-tab">
            <h3>Passengers ({passengers.length})</h3>
            
            {passengers.length === 0 ? (
              <div className="no-passengers">
                <p>No passengers have joined this ride yet.</p>
              </div>
            ) : (
              <div className="passengers-list">
                {passengers.map((passengerId, index) => (
                  <div key={passengerId} className="passenger-card">
                    <div className="passenger-avatar">
                      👤
                    </div>
                    <div className="passenger-info">
                      <h4>Passenger {index + 1}</h4>
                      <p>ID: {passengerId}</p>
                      <span className="passenger-status">On Board</span>
                    </div>
                    <div className="passenger-actions">
                      <button className="contact-btn">📞 Contact</button>
                      <button className="message-btn">💬 Message</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="notifications-header">
              <h3>Notifications</h3>
              <button className="clear-btn" onClick={clearNotifications}>
                Clear All
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No new notifications.</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.type}`}
                  >
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {notification.type === 'emergency' && (
                      <div className="emergency-indicator">🚨</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {emergencyMode && (
        <div className="emergency-overlay">
          <div className="emergency-alert">
            <h2>🚨 EMERGENCY MODE</h2>
            <p>Emergency alert has been sent to all passengers and admin.</p>
            <button onClick={() => setEmergencyMode(false)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
