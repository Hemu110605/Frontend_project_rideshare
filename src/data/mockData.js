export const rides = [
    { id: 1, driver: 'Rahul S.', from: 'Thane', to: 'Powai', date: '20/04/2026', seats: 3, price: 350, car: 'Hyundai i20', rating: 4.9 },
    { id: 2, driver: 'Priya M.', from: 'Pune', to: 'Mumbai', date: '21/04/2026', seats: 2, price: 420, car: 'Baleno', rating: 4.8 },
    { id: 3, driver: 'Amit K.', from: 'Dadar', to: 'Vashi', date: '22/04/2026', seats: 4, price: 180, car: 'Tata Punch', rating: 4.7 },
    { id: 4, driver: 'Mahesh R.', from: 'Mumbai', to: 'Pune', date: '23/04/2026', seats: 40, price: 150, car: 'Volvo Bus', rating: 4.6 },
    { id: 5, driver: 'Sanjay K.', from: 'Thane', to: 'Mumbai', date: '24/04/2026', seats: 4, price: 800, car: 'Mercedes E-Class', rating: 4.9 },
    { id: 6, driver: 'Vikram S.', from: 'Navi Mumbai', to: 'Pune', date: '25/04/2026', seats: 5, price: 250, car: 'Maruti Suzuki Swift', rating: 4.5 }
]

export const passengers = [
    { id: 1, name: 'Hemangi Bendre', email: 'hemangi@gmail.com', phone: '9876543210', rides: 12, status: 'Active' },
    { id: 2, name: 'Neha Sharma', email: 'neha@gmail.com', phone: '9898989898', rides: 8, status: 'Active' }
]

export const drivers = [
    {
        id: 1,
        name: 'Rahul S.',
        phone: '9822222222',
        aadhaar: 'Verified',
        vehicleNo: 'MH04AB1234',
        carModel: 'Hyundai i20',
        rcStatus: 'Uploaded',
        insuranceStatus: 'Uploaded',
        licenseStatus: 'Uploaded',
        status: 'Approved'
    },
    {
        id: 2,
        name: 'Priya M.',
        phone: '9833333333',
        aadhaar: 'Pending',
        vehicleNo: 'MH12CD5678',
        carModel: 'Baleno',
        rcStatus: 'Uploaded',
        insuranceStatus: 'Pending',
        licenseStatus: 'Uploaded',
        status: 'Under Review'
    }
]