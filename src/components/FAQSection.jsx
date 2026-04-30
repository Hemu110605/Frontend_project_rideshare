import { useState } from 'react'

export default function FAQSection() {
    const faqs = [
        {
            question: 'How does RideShare carpooling work?',
            answer: 'RideShare helps passengers find rides on the same route and share the fare with others. Drivers can post rides and passengers can book available seats.'
        },
        {
            question: 'Can I book more than one seat?',
            answer: 'Yes, passengers can book multiple seats depending on how many seats are left in that ride.'
        },
        {
            question: 'How do I know if seats are available?',
            answer: 'When you click Book Ride, the booking popup shows the number of seats left before confirming the booking.'
        },
        {
            question: 'Can drivers post their own rides?',
            answer: 'Yes, drivers can sign up, log in, and post rides with route details, fare, date, time, and available seats.'
        },
        {
            question: 'Is RideShare safe to use?',
            answer: 'RideShare includes passenger, driver, and admin modules. Drivers and passengers can be managed through the admin panel for a safer ride-sharing experience.'
        }
    ]

    const [openIndex, setOpenIndex] = useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="faq-section">
            <div className="faq-container">
                <h2 className="faq-title">Frequently asked questions</h2>

                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div className="faq-item" key={index}>
                            <button
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span>{faq.question}</span>
                                <span className="faq-icon">
                                    {openIndex === index ? '−' : '⌄'}
                                </span>
                            </button>

                            {openIndex === index && (
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}