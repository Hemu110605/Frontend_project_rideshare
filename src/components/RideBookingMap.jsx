import { useEffect, useState } from 'react'
import { rideService, bookingService } from '../services/apiService'
import MapComponent from './MapComponent'
import '../styles/rideBookingMap.css'

export default function RideBookingMap() {
    const [rides, setRides] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedRide, setSelectedRide] = useState(null)
    const [seatCount, setSeatCount] = useState(1)
    const [showBookingModal, setShowBookingModal] = useState(false)

    useEffect(() => {
        fetchRides()
    }, [])

    const fetchRides = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await rideService.getRides()
            if (response.success) {
                setRides(response.data || [])
            } else {
                setError(response.message || 'Failed to load rides')
            }
        } catch (err) {
            setError('Failed to load rides')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const openBookingModal = (ride) => {
        if (ride.availableSeats === 0) return
        setSelectedRide(ride)
        setSeatCount(1)
        setShowBookingModal(true)
    }

    const closeBookingModal = () => {
        setSelectedRide(null)
        setSeatCount(1)
        setShowBookingModal(false)
    }

    const handleBooking = async () => {
        if (!selectedRide) return

        if (seatCount > selectedRide.availableSeats) {
            alert('Selected seats are more than available seats')
            return
        }

        try {
            const response = await bookingService.createBooking({
                rideId: selectedRide._id,
                seatsBooked: seatCount
            })

            if (response.success) {
                alert('Booking successful')
                fetchRides() // Refresh rides list
                closeBookingModal()
            } else {
                alert(response.message || 'Booking failed')
            }
        } catch (err) {
            console.error(err)
            alert(err.message || 'Booking failed')
        }
    }

    // Mock coordinates for demonstration (in real app, these would come from the backend)
    const getCoordinates = (location) => {
        const coordinates = {
            'thane': { lat: 19.1914, lng: 72.9645 },
            'powai': { lat: 19.1199, lng: 72.9066 },
            'bandra': { lat: 19.0596, lng: 72.8295 },
            'andheri': { lat: 19.1197, lng: 72.8466 },
            'borivali': { lat: 19.2312, lng: 72.8576 },
            'dadar': { lat: 19.0176, lng: 72.8428 },
            'churchgate': { lat: 18.9317, lng: 72.8264 },
            'virar': { lat: 19.4735, lng: 72.9256 }
        }
        return coordinates[location.toLowerCase()] || { lat: 19.076, lng: 72.8777 }
    }

    if (loading) {
        return <div className="loading-container">Loading rides...</div>
    }

    if (error) {
        return <div className="error-container">{error}</div>
    }

    return (
        <div className="ride-booking-map-container">
            <div className="header">
                <h1>Find Rides with Live Tracking</h1>
                <p>Book rides and track driver location in real-time</p>
            </div>

            <div className="rides-grid">
                {rides.map((ride) => (
                    <div className="ride-card-with-map" key={ride._id}>
                        <div className="ride-info">
                            <div className="route-header">
                                <h3>{ride.source || ride.from} → {ride.destination || ride.to}</h3>
                                <span className={`status-badge ${ride.status || 'active'}`}>
                                    {ride.status || 'Active'}
                                </span>
                            </div>
                            
                            <div className="ride-details">
                                <p><strong>Date:</strong> {new Date(ride.date).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> {ride.time}</p>
                                <p><strong>Fare:</strong> ₹{ride.farePerSeat || ride.fare}</p>
                                <p><strong>Available Seats:</strong> {ride.availableSeats}</p>
                                <p><strong>Driver:</strong> {ride.driver?.firstName || 'Driver'}</p>
                            </div>

                            <div className="seat-status">
                                {ride.availableSeats === 0 ? (
                                    <span className="full-badge">Full</span>
                                ) : (
                                    <span className="available-badge">
                                        {ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''} left
                                    </span>
                                )}
                            </div>

                            <button
                                className="book-btn"
                                disabled={ride.availableSeats === 0}
                                onClick={() => openBookingModal(ride)}
                            >
                                {ride.availableSeats === 0 ? 'Full' : 'Book Now'}
                            </button>
                        </div>

                        <div className="ride-map">
                            <MapComponent
                                rideId={ride._id}
                                showRoute={true}
                                source={getCoordinates(ride.source || ride.from)}
                                destination={getCoordinates(ride.destination || ride.to)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {rides.length === 0 && (
                <div className="no-rides">
                    <p>No rides available at the moment</p>
                </div>
            )}

            {showBookingModal && selectedRide && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal">
                        <div className="modal-header">
                            <h2>Book Ride</h2>
                            <button className="close-btn" onClick={closeBookingModal}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="route-info">
                                <h3>{selectedRide.source || selectedRide.from} → {selectedRide.destination || selectedRide.to}</h3>
                                <p><strong>Date:</strong> {new Date(selectedRide.date).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> {selectedRide.time}</p>
                                <p><strong>Fare per seat:</strong> ₹{selectedRide.farePerSeat || selectedRide.fare}</p>
                                <p><strong>Seats left:</strong> {selectedRide.availableSeats}</p>
                                <p><strong>Driver:</strong> {selectedRide.driver?.firstName || 'Driver'}</p>
                            </div>

                            <div className="booking-form">
                                <label htmlFor="seatCount">Select seats</label>
                                <input
                                    id="seatCount"
                                    type="number"
                                    min="1"
                                    max={selectedRide.availableSeats}
                                    value={seatCount}
                                    onChange={(e) => setSeatCount(Number(e.target.value))}
                                />

                                <p className="total-fare">
                                    Total Fare: ₹{(selectedRide.farePerSeat || selectedRide.fare) * seatCount}
                                </p>
                            </div>

                            <div className="modal-map">
                                <MapComponent
                                    rideId={selectedRide._id}
                                    showRoute={true}
                                    source={getCoordinates(selectedRide.source || selectedRide.from)}
                                    destination={getCoordinates(selectedRide.destination || selectedRide.to)}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="confirm-btn" onClick={handleBooking}>
                                Confirm Booking
                            </button>
                            <button className="cancel-btn" onClick={closeBookingModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
