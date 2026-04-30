import { useState } from 'react'

export default function RideSearch({ onSearch }) {
    const [form, setForm] = useState({
        from: 'thane',
        to: 'powai',
        seats: '2',
        date: '20/04/2026'
    })

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch(form)
    }

    return (
        <form className="search-box" onSubmit={handleSubmit}>
            <input
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="From"
            />

            <input
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder="To"
            />

            <input
                name="seats"
                value={form.seats}
                onChange={handleChange}
                placeholder="Passengers"
            />

            <input
                name="date"
                value={form.date}
                onChange={handleChange}
                placeholder="Date"
            />

            <button type="submit" className="primary-btn search-btn">
                Search Available Rides →
            </button>
        </form>
    )
}