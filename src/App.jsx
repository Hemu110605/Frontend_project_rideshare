import { useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import './styles/global.css';
import RideCard from './components/RideCard'
import PaymentPanel from './components/PaymentPanel'
import Footer from './components/Footer'
import Modal from './components/Modal'
import PassengerLogin from './components/PassengerLogin'
import PassengerSignup from './components/PassengerSignup'
import DriverLogin from './components/DriverLogin'
import DriverSignup from './components/DriverSignup'
import AdminLogin from './components/AdminLogin'
import ResetPassword from './components/ResetPassword'
import PassengerDashboard from './dashboards/PassengerDashboard'
import DriverDashboard from './dashboards/DriverDashboard'
import AdminDashboard from './dashboards/AdminDashboard'
import BookRideModal from './components/BookRideModal'
import { rides as rideData, passengers as passengerData, drivers as driverData } from './data/mockData'
import FAQSection from './components/FAQSection'

export default function App() {
    const [currentPage, setCurrentPage] = useState('home')
    const [rides, setRides] = useState(rideData)
    const [passengers] = useState(passengerData)
    const [drivers, setDrivers] = useState(driverData)
    const [bookings, setBookings] = useState([])
    const [selectedRide, setSelectedRide] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('upi')
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showSignupModal, setShowSignupModal] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [seatCount, setSeatCount] = useState(1)

    useEffect(() => {
        const path = window.location.pathname

        if (path.includes('/reset-password/')) {
            setCurrentPage('reset-password')
            return
        }

        const params = new URLSearchParams(window.location.search)
        const page = params.get('page')
        const token = params.get('token')
        const refreshToken = params.get('refreshToken')

        // Store tokens from Google OAuth redirect with validation
        if (token && refreshToken) {
            // Validate tokens before storing (basic JWT format check)
            const isValidToken = (token) => {
                return token && 
                       typeof token === 'string' && 
                       token.length > 0 && 
                       token !== 'undefined' && 
                       token !== 'null' &&
                       token.split('.').length === 3; // JWT has 3 parts
            };
            
            if (isValidToken(token) && isValidToken(refreshToken)) {
                localStorage.setItem('token', token)
                localStorage.setItem('refreshToken', refreshToken)
                
                // Clean up URL parameters
                const cleanUrl = window.location.pathname
                window.history.replaceState({}, '', cleanUrl)
            } else {
                console.error('Invalid token format received from Google OAuth')
                // Clean up URL parameters even if tokens are invalid
                const cleanUrl = window.location.pathname
                window.history.replaceState({}, '', cleanUrl)
            }
        }

        if (page === 'passenger-dashboard') {
            setCurrentPage('passenger-dashboard')

            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [])

    const filteredRides = useMemo(() => {
        if (!searchText) return rides

        return rides.filter((ride) => {
            const text = `${ride.from} ${ride.to} ${ride.driver} ${ride.car}`.toLowerCase()
            return text.includes(searchText.toLowerCase())
        })
    }, [rides, searchText])

    const handleSearch = (form) => {
        setSearchText(`${form.from} ${form.to}`)
        setCurrentPage('find-rides')
    }

    const handleBookRide = (ride) => {
        setSelectedRide(ride)
        setShowBookingModal(true)
    }

    const handleLegacyPayment = (ride) => {
        setSelectedRide(ride)
        setSeatCount(1)
        setShowPaymentModal(true)
    }

    const handlePayment = () => {
        if (!selectedRide) return

        const availableSeats = selectedRide.availableSeats ?? 1

        if (seatCount < 1) {
            alert('Please select at least 1 seat')
            return
        }

        if (seatCount > availableSeats) {
            alert('Selected seats are more than available seats')
            return
        }

        const updatedRide = {
            ...selectedRide,
            seatsBooked: seatCount,
        }

        setBookings((prev) => [...prev, updatedRide])

        setRides((prevRides) =>
            prevRides.map((ride) =>
                ride.id === selectedRide.id
                    ? {
                        ...ride,
                        availableSeats: Math.max((ride.availableSeats ?? 1) - seatCount, 0),
                    }
                    : ride
            )
        )

        alert(`Payment successful through ${paymentMethod.toUpperCase()}`)
        setShowPaymentModal(false)
        setSelectedRide(null)
        setSeatCount(1)
    }

    const handleDriverCreate = (newDriver) => {
        setDrivers((prev) => [
            ...prev,
            {
                ...newDriver,
                name: newDriver.fullName,
                aadhaar: 'Verified',
                status: 'Under Review',
            },
        ])
    }

    const handleGetStarted = () => {
        setShowSignupModal(true)
    }

    const isDashboardPage =
        currentPage === 'passenger-dashboard' ||
        currentPage === 'driver-dashboard' ||
        currentPage === 'admin-dashboard'

    return (
        <div className="app">
            {!isDashboardPage && (
                <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'home' && (
                <>
                    <Hero onGetStarted={handleGetStarted} handleSearch={handleSearch} />

                    <section className="stats-row">
                        <div className="stat-card">
                            <h2>5+</h2>
                            <p>Active Riders</p>
                        </div>
                        <div className="stat-card">
                            <h2>2+</h2>
                            <p>Drivers</p>
                        </div>
                        <div className="stat-card">
                            <h2>7+</h2>
                            <p>Cities</p>
                        </div>
                    </section>

                    <section className="ride-list-section">
                        <h2>RIDE TYPES</h2>
                        <div className="ride-list">
                            {rides.map((ride) => (
                                <RideCard key={ride.id} ride={ride} onBook={handleBookRide} onLegacyPayment={handleLegacyPayment} />
                            ))}
                        </div>
                    </section>

                    <FAQSection />
                </>
            )}

            {currentPage === 'find-rides' && (
                <section className="ride-list-section">
                    <h2>Available Rides</h2>
                    <div className="ride-list">
                        {filteredRides.map((ride) => (
                            <RideCard key={ride.id} ride={ride} onBook={handleBookRide} onLegacyPayment={handleLegacyPayment} />
                        ))}
                    </div>
                </section>
            )}

            {currentPage === 'passenger-login' && (
                <PassengerLogin setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'passenger-signup' && (
                <PassengerSignup setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'driver-login' && (
                <DriverLogin setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'driver-signup' && (
                <DriverSignup setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'reset-password' && (
                <ResetPassword setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'admin-login' && (
                <AdminLogin setCurrentPage={setCurrentPage} />
            )}

            {currentPage === 'passenger-dashboard' && (
                <PassengerDashboard
                    setCurrentPage={setCurrentPage}
                    bookings={bookings}
                    rides={rides}
                />
            )}

            {currentPage === 'driver-dashboard' && (
                <DriverDashboard
                    setCurrentPage={setCurrentPage}
                    onDriverCreate={handleDriverCreate}
                    drivers={drivers}
                    rides={rides}
                    bookings={bookings}
                />
            )}

            {currentPage === 'admin-dashboard' && (
                <AdminDashboard
                    setCurrentPage={setCurrentPage}
                    passengers={passengers}
                    drivers={drivers}
                    rides={rides}
                    bookings={bookings}
                />
            )}

            <Modal
                isOpen={showPaymentModal}
                title="Complete Booking"
                onClose={() => setShowPaymentModal(false)}
            >
                {selectedRide && (
                    <div className="booking-details">
                        <h3>
                            {selectedRide.from} → {selectedRide.to}
                        </h3>
                        <p>
                            <strong>Driver:</strong> {selectedRide.driver}
                        </p>
                        <p>
                            <strong>Price per seat:</strong> ₹{selectedRide.price}
                        </p>
                        <p>
                            <strong>Seats left:</strong> {selectedRide.availableSeats ?? 1}
                        </p>

                        <div style={{ margin: '15px 0' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                }}
                            >
                                Select number of seats
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={selectedRide.availableSeats ?? 1}
                                value={seatCount}
                                onChange={(e) => setSeatCount(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                }}
                            />
                        </div>

                        <p style={{ fontWeight: '700', marginBottom: '15px' }}>
                            Total Amount: ₹{selectedRide.price * seatCount}
                        </p>

                        {(selectedRide.availableSeats ?? 1) === 0 ? (
                            <button
                                className="primary-btn"
                                disabled
                                style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}
                            >
                                No Seats Available
                            </button>
                        ) : (
                            <PaymentPanel
                                selectedMethod={paymentMethod}
                                setSelectedMethod={setPaymentMethod}
                                amount={selectedRide.price * seatCount}
                                onPay={handlePayment}
                            />
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={showSignupModal}
                title="Sign Up - New Passenger"
                onClose={() => setShowSignupModal(false)}
            >
                <PassengerSignup setCurrentPage={setCurrentPage} />
            </Modal>

            <BookRideModal 
                ride={selectedRide}
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
            />

            {!isDashboardPage && <Footer />}
        </div>
    )
}