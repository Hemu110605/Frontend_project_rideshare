import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { socket } from '../socket';
import 'leaflet/dist/leaflet.css';

// Custom icons
const CarIcon = L.divIcon({
  html: '<div style="font-size:28px;">🚗</div>',
  className: '',
  iconSize: [35, 35],
  iconAnchor: [17, 17],
});

const UserIcon = L.divIcon({
  html: '<div style="font-size:24px;">👤</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const StartIcon = L.divIcon({
  html: '<div style="font-size:24px;">📍</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const EndIcon = L.divIcon({
  html: '<div style="font-size:24px;">🎯</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function ChangeMapView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);

  return null;
}

function LocationMarker({ position, icon, popupText }) {
  return (
    <Marker position={position} icon={icon}>
      <Popup>{popupText}</Popup>
    </Marker>
  );
}

export default function MapComponent({ 
  rideId = null, 
  showRoute = false, 
  source = null, 
  destination = null,
  userLocation = null 
}) {
  const [driverLocation, setDriverLocation] = useState({
    lat: 19.076, // Mumbai coordinates
    lng: 72.8777,
  });
  const [userCurrentLocation, setUserCurrentLocation] = useState(null);
  const [route, setRoute] = useState([]);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Simulate route between source and destination
  useEffect(() => {
    if (showRoute && source && destination) {
      // This would normally call a routing API like OpenRouteService or Google Maps
      // For now, we'll create a simple straight line route
      const routeCoords = [
        [source.lat, source.lng],
        [destination.lat, destination.lng]
      ];
      setRoute(routeCoords);
    }
  }, [showRoute, source, destination]);

  // Socket connection for live tracking
  useEffect(() => {
    if (rideId) {
      socket.emit('join-ride-room', rideId);
      console.log('Joined ride room:', rideId);

      socket.on('receive-driver-location', (data) => {
        console.log('Received driver location:', data);
        setDriverLocation({
          lat: data.lat,
          lng: data.lng,
        });
      });

      return () => {
        socket.off('receive-driver-location');
        socket.emit('leave-ride-room', rideId);
      };
    }
  }, [rideId]);

  // Default center (Mumbai)
  const defaultCenter = [19.076, 72.8777];
  const mapCenter = userCurrentLocation || driverLocation || defaultCenter;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeMapView center={mapCenter} />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driver location */}
        {rideId && (
          <LocationMarker 
            position={[driverLocation.lat, driverLocation.lng]} 
            icon={CarIcon} 
            popupText="Driver Live Location" 
          />
        )}

        {/* User current location */}
        {userCurrentLocation && (
          <LocationMarker 
            position={[userCurrentLocation.lat, userCurrentLocation.lng]} 
            icon={UserIcon} 
            popupText="Your Location" 
          />
        )}

        {/* Source and destination markers */}
        {showRoute && source && (
          <LocationMarker 
            position={[source.lat, source.lng]} 
            icon={StartIcon} 
            popupText="Pickup Location" 
          />
        )}

        {showRoute && destination && (
          <LocationMarker 
            position={[destination.lat, destination.lng]} 
            icon={EndIcon} 
            popupText="Drop-off Location" 
          />
        )}

        {/* Route line */}
        {showRoute && route.length > 0 && (
          <Polyline
            positions={route}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </div>
  );
}