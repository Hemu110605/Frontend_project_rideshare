const API_BASE_URL = import.meta.env.VITE_API_URL || "https://backend-rideshare-1.onrender.com"; // Must be set in environment

export const api = {
  // Auth endpoints
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: (token) => `${API_BASE_URL}/api/auth/reset-password/${token}`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    me: `${API_BASE_URL}/api/auth/me`,

    // ✅ ADD THESE
    sendEmailOtp: `${API_BASE_URL}/api/auth/send-email-otp`,
    verifyEmailOtp: `${API_BASE_URL}/api/auth/verify-email-otp`,
  },

  // User endpoints
  users: {
    profile: `${API_BASE_URL}/api/users/profile`,
    updateProfile: `${API_BASE_URL}/api/users/profile`,
  },

  // Driver endpoints
  drivers: {
    profile: `${API_BASE_URL}/api/drivers/profile`,
    vehicles: `${API_BASE_URL}/api/drivers/vehicles`,
    rides: `${API_BASE_URL}/api/drivers/rides`,
    dashboard: `${API_BASE_URL}/api/drivers/dashboard`,
  },

  // Ride endpoints
  rides: {
    getAll: `${API_BASE_URL}/api/rides`,
    getById: (id) => `${API_BASE_URL}/api/rides/${id}`,
    create: `${API_BASE_URL}/api/rides`,
    update: (id) => `${API_BASE_URL}/api/rides/${id}`,
    delete: (id) => `${API_BASE_URL}/api/rides/${id}`,
    accept: (id) => `${API_BASE_URL}/api/rides/${id}/accept`,
    start: (id) => `${API_BASE_URL}/api/rides/${id}/start`,
    complete: (id) => `${API_BASE_URL}/api/rides/${id}/complete`,
    cancel: (id) => `${API_BASE_URL}/api/rides/${id}/cancel`,
    search: `${API_BASE_URL}/api/rides/search`,
  },

  // Booking endpoints
  bookings: {
    create: `${API_BASE_URL}/api/bookings`,
    history: `${API_BASE_URL}/api/bookings/history`,
    getById: (id) => `${API_BASE_URL}/api/bookings/${id}`,
    cancel: (id) => `${API_BASE_URL}/api/bookings/${id}/cancel`,
    confirm: (id) => `${API_BASE_URL}/api/bookings/${id}/confirm`,
    complete: (id) => `${API_BASE_URL}/api/bookings/${id}/complete`,
  },

  // Admin endpoints
  admin: {
    dashboard: `${API_BASE_URL}/api/admin/dashboard`,
    users: `${API_BASE_URL}/api/admin/users`,
    drivers: `${API_BASE_URL}/api/admin/drivers`,
    rides: `${API_BASE_URL}/api/admin/rides`,
    bookings: `${API_BASE_URL}/api/admin/bookings`,
    payments: `${API_BASE_URL}/api/admin/payments/stats`,
  }
};