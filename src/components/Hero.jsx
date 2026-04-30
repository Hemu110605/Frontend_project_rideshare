export default function Hero({ onGetStarted }) {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>
                    Your Ultimate
                    <br />
                    Rideshare Solution
                </h1>

                <p>
                    Book your ride with ease and convenience. Experience safe and comfortable 
                    journeys with our trusted drivers. Join thousands of happy passengers 
                    who travel smarter every day.
                </p>

                <button className="primary-btn get-started-btn" onClick={onGetStarted}>
                    Get Started
                </button>
            </div>
        </section>
    )
}