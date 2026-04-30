import { useEffect, useState } from 'react'
import { rideService, bookingService } from '../services/apiService'
import MapComponent from './MapComponent'
import '../styles/findRides.css'

export default function FindRides() {
    const [rides, setRides] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedRide, setSelectedRide] = useState(null)
    const [seatCount, setSeatCount] = useState(1)

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

    const openBookingBox = (ride) => {
        if (ride.availableSeats === 0) return
        setSelectedRide(ride)
        setSeatCount(1)
    }

    const closeBookingBox = () => {
        setSelectedRide(null)
        setSeatCount(1)
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

                // update seats instantly on frontend
                const updatedRides = rides.map((ride) =>
                    ride._id === selectedRide._id
                        ? {
                            ...ride,
                            availableSeats: ride.availableSeats - seatCount
                        }
                        : ride
                )

                setRides(updatedRides)
                closeBookingBox()
            } else {
                alert(response.message || 'Booking failed')
            }
        } catch (err) {
            console.error(err)
            alert(err.message || 'Booking failed')
        }
    }

    return (
        <div className="find-rides-page">
            <h1 className="find-rides-title">Find Rides</h1>

            {loading && <p className="status-text">Loading rides...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && rides.length === 0 && (
                <p className="status-text">No rides available</p>
            )}

            <div className="rides-grid">
                {rides.map((ride) => (
                    <div className="ride-card" key={ride._id}>
                        <h3>{ride.from} → {ride.to}</h3>
                        <p><strong>Date:</strong> {ride.date}</p>
                        <p><strong>Time:</strong> {ride.time}</p>
                        <p><strong>Fare:</strong> ₹{ride.fare}</p>

                        <p className="seat-text">
                            <strong>Available Seats:</strong> {ride.availableSeats}
                        </p>

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
                            onClick={() => openBookingBox(ride)}
                        >
                            {ride.availableSeats === 0 ? 'Full' : 'Book Now'}
                        </button>
                    </div>
                ))}
            </div>

            {selectedRide && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal">
                        <h2>Book Ride</h2>
                        <p><strong>Route:</strong> {selectedRide.from} → {selectedRide.to}</p>
                        <p><strong>Fare per seat:</strong> ₹{selectedRide.fare}</p>
                        <p><strong>Seats left:</strong> {selectedRide.availableSeats}</p>

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
                            Total Fare: ₹{selectedRide.fare * seatCount}
                        </p>

                        <div className="modal-buttons">
                            <button className="confirm-btn" onClick={handleBooking}>
                                Confirm Booking
                            </button>
                            <button className="cancel-btn" onClick={closeBookingBox}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}