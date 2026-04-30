export default function RideCard({ ride, onBook, onLegacyPayment }) {
    const tags = {
        1: 'Most Popular',
        2: 'Best for Groups',
        3: 'Cheapest',
        4: 'Long Distance',
        5: 'Luxury Travel',
        6: 'Economy Plus'
    }

    const titles = {
        1: '4-Seater Sedan',
        2: '7-Seater SUV',
        3: 'Budget Hatchback',
        4: 'AC Bus',
        5: 'Premium Sedan',
        6: '5-Seater Economy'
    }

    return (
        <div className="ride-card">
            <div>
                <p>{tags[ride.id] || 'Popular'}</p>
                <h3>{titles[ride.id] || ride.car}</h3>
                <p>{ride.driver}</p>
                <p>{ride.from} → {ride.to}</p>
            </div>

            <div className="ride-right">
                <h2>₹{ride.price}</h2>
                <div className="ride-actions">
                    <button className="primary-btn" onClick={() => onBook(ride)}>
                        Book Now
                    </button>
                    {onLegacyPayment && (
                        <button className="secondary-btn" onClick={() => onLegacyPayment(ride)}>
                            Quick Pay
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}