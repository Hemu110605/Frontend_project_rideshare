export default function Footer() {
    return (
        <footer className="rideshare-footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <h2>RideShare</h2>
                    <p>Your smart carpooling platform</p>
                </div>
            </div>

            <div className="footer-links-grid">
                <div className="footer-column">
                    <h3>Company</h3>
                    <a href="#">About Us</a>
                    <a href="#">Our Services</a>
                    <a href="#">Newsroom</a>
                    <a href="#">Careers</a>
                    <a href="#">Contact Us</a>
                </div>

                <div className="footer-column">
                    <h3>Ride Services</h3>
                    <a href="#">Find Rides</a>
                    <a href="#">Post a Ride</a>
                    <a href="#">Driver Dashboard</a>
                    <a href="#">Passenger Dashboard</a>
                    <a href="#">Payments</a>
                </div>

                <div className="footer-column">
                    <h3>Safety & Support</h3>
                    <a href="#">Safety</a>
                    <a href="#">Aadhaar Verification</a>
                    <a href="#">Driver Documents</a>
                    <a href="#">Help Center</a>
                    <a href="#">Terms & Conditions</a>
                </div>

                <div className="footer-column">
                    <h3>Travel</h3>
                    <a href="#">Cities</a>
                    <a href="#">Airport Rides</a>
                    <a href="#">Daily Commute</a>
                    <a href="#">Outstation Travel</a>
                </div>
            </div>

            <div className="footer-social-row">
                <div className="footer-social-icons">
                    <a href="#" aria-label="LinkedIn">in</a>
                    <a href="#" aria-label="YouTube">▶</a>
                    <a href="#" aria-label="Instagram">◎</a>
                    <a href="#" aria-label="Twitter">𝕏</a>
                </div>

                <div className="footer-location-row">
                    <span>English</span>
                    <span>Mumbai, India</span>
                </div>
            </div>

           <div className="footer-app-row">
  <button
    className="store-btn"
    onClick={() => alert('Coming soon')}
  >
    Get it on Google Play
  </button>

  <button
    className="store-btn"
    onClick={() => alert('Coming soon')}
  >
    Download on the App Store
  </button>
</div>
            <div className="footer-bottom">
                <p>© 2026 RideShare. All rights reserved.</p>

                <div className="footer-bottom-links">
                    <a href="#">Privacy</a>
                    <a href="#">Accessibility</a>
                    <a href="#">Terms</a>
                </div>
            </div>
        </footer>
    )
}