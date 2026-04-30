import { useState } from 'react'
import { bookingService, paymentService } from '../services/apiService'

export default function BookRideModal({ ride, isOpen, onClose }) {
  const [seatsBooked, setSeatsBooked] = useState(1)
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const bookingData = {
        rideId: ride._id,
        seatsBooked,
        pickupLocation: pickupLocation || ride.source,
        dropLocation: dropLocation || ride.destination,
        pickupTime: pickupTime || ride.date,
        specialRequests
      }

      const response = await bookingService.create(bookingData)

      if (response.success) {
        // Process payment if needed
        if (response.data.booking.finalAmount > 0) {
          await paymentService.initiateRazorpayPayment(
            response.data.booking._id,
            null,
            {
              name: `${response.data.booking.passenger?.firstName} ${response.data.booking.passenger?.surname}`,
              email: response.data.booking.passenger?.email,
              phone: response.data.booking.passenger?.phone
            }
          )
        }
        
        alert('Ride booked successfully!')
        onClose()
      } else {
        setError(response.message || 'Failed to book ride')
      }
    } catch (err) {
      setError(err.message || 'Failed to book ride')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !ride) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Ride</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="ride-summary">
            <h3>{ride.source} → {ride.destination}</h3>
            <p><strong>Driver:</strong> {ride.driver?.firstName} {ride.driver?.surname}</p>
            <p><strong>Vehicle:</strong> {ride.vehicle?.make} {ride.vehicle?.model}</p>
            <p><strong>Date:</strong> {ride.date}</p>
            <p><strong>Time:</strong> {ride.time}</p>
            <p><strong>Price per seat:</strong> ₹{ride.estimatedFare}</p>
            <p><strong>Available seats:</strong> {ride.availableSeats}</p>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label>Number of Seats</label>
              <input
                type="number"
                min="1"
                max={ride.availableSeats}
                value={seatsBooked}
                onChange={(e) => setSeatsBooked(parseInt(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder={ride.source}
                required
              />
            </div>

            <div className="form-group">
              <label>Drop Location</label>
              <input
                type="text"
                value={dropLocation}
                onChange={(e) => setDropLocation(e.target.value)}
                placeholder={ride.destination}
                required
              />
            </div>

            <div className="form-group">
              <label>Pickup Time</label>
              <input
                type="datetime-local"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Special Requests (Optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requirements..."
                rows="3"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Booking...' : `Book Ride - ₹${ride.estimatedFare * seatsBooked}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
