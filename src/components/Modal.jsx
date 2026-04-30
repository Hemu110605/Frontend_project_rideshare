export default function Modal({ isOpen, title, children, onClose }) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>{title}</h2>
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    )
}