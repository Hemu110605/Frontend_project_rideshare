import { useEffect, useState } from 'react';
import MapComponent from './MapComponent';
import { socket } from '../socket';
import '../styles/driverLocationTracker.css';

export default function DriverLocationTracker({ rideId, driverId }) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    // Get initial location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLocationError('');
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser');
    }

    return () => {
      // Clean up location tracking
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    if (!rideId) {
      setLocationError('No active ride to track');
      return;
    }

    setIsTracking(true);
    setLocationError('');

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setCurrentLocation(newLocation);
        
        // Emit location to socket
        socket.emit('driver-location-update', {
          rideId: rideId,
          driverId: driverId,
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        });
        
        console.log('Location updated:', newLocation);
      },
      (error) => {
        setLocationError('Error tracking location. Please check your location settings.');
        console.error('Location tracking error:', error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setIsTracking(false);
    
    // Notify passengers that tracking has stopped
    if (rideId) {
      socket.emit('driver-location-update', {
        rideId: rideId,
        driverId: driverId,
        tracking: false,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="driver-location-tracker">
      <div className="tracker-header">
        <h2>Live Location Tracking</h2>
        <div className="tracking-controls">
          {!isTracking ? (
            <button 
              className="start-tracking-btn" 
              onClick={startTracking}
              disabled={!rideId || !currentLocation}
            >
              Start Sharing Location
            </button>
          ) : (
            <button 
              className="stop-tracking-btn" 
              onClick={stopTracking}
            >
              Stop Sharing Location
            </button>
          )}
        </div>
      </div>

      {locationError && (
        <div className="error-message">
          {locationError}
        </div>
      )}

      <div className="tracking-status">
        <span className={`status-indicator ${isTracking ? 'active' : 'inactive'}`}>
          {isTracking ? '🟢 Live Tracking Active' : '🔴 Tracking Inactive'}
        </span>
        {currentLocation && (
          <span className="location-info">
            Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
          </span>
        )}
      </div>

      <div className="map-container">
        <MapComponent
          rideId={rideId}
          userLocation={currentLocation}
        />
      </div>

      <div className="tracking-info">
        {isTracking && (
          <div className="active-tracking-info">
            <h3>Tracking Information</h3>
            <ul>
              <li>Your location is being shared with passengers in real-time</li>
              <li>Location updates every 5 seconds</li>
              <li>High accuracy mode is enabled</li>
              <li>Passengers can see your live location on their map</li>
            </ul>
          </div>
        )}
        
        {!isTracking && currentLocation && (
          <div className="inactive-tracking-info">
            <h3>Ready to Share Location</h3>
            <p>Click "Start Sharing Location" to begin sharing your live location with passengers.</p>
          </div>
        )}
        
        {!currentLocation && !locationError && (
          <div className="loading-location">
            <p>Getting your current location...</p>
          </div>
        )}
      </div>
    </div>
  );
}
