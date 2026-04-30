import { api } from '../config/api';

// Auto-logout function for expired tokens
const handleAuthError = (error) => {
  if (error.status === 401) {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirect to login page (without changing UI layout)
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  }
};

// Generic API request function
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      console.error("Invalid JSON response");
    }

    // Handle auth errors for expired tokens
    if (!response.ok && response.status === 401) {
      const error = new Error(data.message || 'Authentication failed');
      error.status = response.status;
      error.data = data;
      handleAuthError(error);
      throw error;
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);

    // Handle network errors that might be auth-related
    if (error.status === 401) {
      handleAuthError(error);
    }

    throw error;
  }
};

// Auth services
export const authService = {
  login: async (credentials) => {
    const data = await apiRequest(api.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    // Handle backend response structure
    if (data.success && data.data) {
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  register: async (userData) => {
    const data = await apiRequest(api.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    // Handle backend response structure
    if (data.success && data.data) {
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    return data;
  },

  logout: async (refreshToken) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await apiRequest(api.auth.logout, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  forgotPassword: async (email, role) => {
    return await apiRequest(api.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  resetPassword: async (token, password) => {
    return await apiRequest(api.auth.resetPassword(token), {
      method: 'PUT',
      body: JSON.stringify({ password }),
    });
  },

  getMe: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.auth.me, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  sendEmailOtp: async (email, firstName = 'User') => {
    return await apiRequest(api.auth.sendEmailOtp, {
      method: 'POST',
      body: JSON.stringify({ email, firstName }),
    });
  },

  verifyEmailOtp: async (email, otp) => {
    return await apiRequest(api.auth.verifyEmailOtp, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }
};

// Ride services
export const rideService = {
  getAll: async () => {
    return await apiRequest(api.rides.getAll);
  },

  create: async (rideData) => {
    return await apiRequest(api.rides.create, {
      method: 'POST',
      body: JSON.stringify(rideData),
    });
  },

  getById: async (id) => {
    return await apiRequest(api.rides.getById(id));
  },

  update: async (id, rideData) => {
    return await apiRequest(api.rides.update(id), {
      method: 'PUT',
      body: JSON.stringify(rideData),
    });
  },

  delete: async (id) => {
    return await apiRequest(api.rides.delete(id), {
      method: 'DELETE',
    });
  },

  accept: async (id) => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.rides.accept(id), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getRides: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${api.rides.getAll}?${queryString}` : api.rides.getAll;
    return await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Admin services
export const adminService = {
  getDashboard: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.admin.dashboard, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getUsers: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${api.admin.users}?${queryString}` : api.admin.users;
    const response = await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Handle response structure - return data array directly
    return {
      ...response,
      data: response.data?.users || response.data || []
    };
  },

  getDrivers: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${api.admin.drivers}?${queryString}` : api.admin.drivers;
    const response = await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Handle response structure - return data array directly
    return {
      ...response,
      data: response.data?.drivers || response.data || []
    };
  },

  getRides: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${api.admin.rides}?${queryString}` : api.admin.rides;
    const response = await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Handle response structure - return data array directly
    return {
      ...response,
      data: response.data?.rides || response.data || []
    };
  },

  getBookings: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${api.admin.bookings}?${queryString}` : api.admin.bookings;
    const response = await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    // Handle response structure - return data array directly
    return {
      ...response,
      data: response.data?.bookings || response.data || []
    };
  },

  getPayments: async (params = {}) => {
    const token = localStorage.getItem('token');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${api.admin.payments}?${queryString}` : api.admin.payments;
    return await apiRequest(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getReviews: async (params = {}) => {
    const token = localStorage.getItem('token');
    // Reviews endpoint not implemented in backend yet, return empty for now
    return {
      success: true,
      data: []
    };
  },

  blockUser: async (userId, isBlocked, reason) => {
    const token = localStorage.getItem('token');
    return await apiRequest(`${api.admin.users}/${userId}/block`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isBlocked, reason }),
    });
  },
};

// Payment services
export const paymentService = {
  createRazorpayOrder: async (bookingId = null, rideId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login again');
    }

    const body = {};
    if (bookingId) body.bookingId = bookingId;
    if (rideId) body.rideId = rideId;

    return await apiRequest(`${import.meta.env.VITE_API_BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },

  verifyRazorpayPayment: async (razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId = null, rideId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Please login again');
    }

    const body = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };
    if (bookingId) body.bookingId = bookingId;
    if (rideId) body.rideId = rideId;

    return await apiRequest(`${import.meta.env.VITE_API_BASE_URL}/api/payments/verify-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  },

  processPayment: async (bookingId, paymentMethod = 'upi') => {
    const token = localStorage.getItem('token');
    return await apiRequest(`${import.meta.env.VITE_API_BASE_URL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ bookingId, paymentMethod }),
    });
  },

  initiateRazorpayPayment: async (bookingId = null, rideId = null, options = {}) => {
    try {
      // Step 1: Create order
      const orderResponse = await paymentService.createRazorpayOrder(bookingId, rideId);

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const { orderId, amount, currency, key } = orderResponse.data;

      // Step 2: Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Step 3: Open Razorpay Checkout
      return new Promise((resolve, reject) => {
        const razorpayOptions = {
          key: key,
          amount: amount,
          currency: currency,
          name: 'RideShare Carpooling',
          description: bookingId ? `Payment for booking ${bookingId}` : `Payment for ride`,
          order_id: orderId,
          handler: async function (response) {
            try {
              // Step 4: Verify payment on backend
              const verifyResponse = await paymentService.verifyRazorpayPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                bookingId,
                rideId
              );

              if (verifyResponse.success) {
                resolve({
                  success: true,
                  paymentId: verifyResponse.data.payment_id,
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id
                });
              } else {
                reject(new Error(verifyResponse.message || 'Payment verification failed'));
              }
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled by user'));
            },
            escape: true,
            backdropclose: false
          },
          prefill: {
            name: options.name || '',
            email: options.email || '',
            contact: options.phone || ''
          },
          theme: {
            color: '#3399cc'
          }
        };

        const rzp = new window.Razorpay(razorpayOptions);
        rzp.open();
      });

    } catch (error) {
      throw error;
    }
  }
};

// Booking services
export const bookingService = {
  create: async (bookingData) => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.bookings.create, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });
  },

  getHistory: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.bookings.history, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getMyBookings: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002'}/api/bookings/my-bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getById: async (id) => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.bookings.getById(id), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  cancel: async (id, reason) => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.bookings.cancel(id), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });
  },

  confirm: async (id) => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.bookings.confirm(id), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  complete: async (id, otp) => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.bookings.complete(id), {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ otp }),
    });
  },
};

// Driver services
export const driverService = {
  getProfile: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.drivers.profile, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getVehicles: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.drivers.vehicles, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getRides: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.drivers.rides, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getDashboard: async () => {
    const token = localStorage.getItem('token');
    return await apiRequest(api.drivers.dashboard, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// User services
export const userService = {
  getProfile: async () => {
    return await apiRequest(api.users.profile);
  },

  updateProfile: async (profileData) => {
    return await apiRequest(api.users.updateProfile, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Vehicle services
export const vehicleService = {
  getVehicles: async () => {
    return apiRequest(api.drivers.vehicles);
  },
  getMyVehicles: async () => {
    return apiRequest(api.drivers.vehicles);
  },
  createVehicle: async (data) => {
    return apiRequest(api.drivers.vehicles, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateVehicle: async (id, data) => {
    return apiRequest(`${api.drivers.vehicles}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteVehicle: async (id) => {
    return apiRequest(`${api.drivers.vehicles}/${id}`, {
      method: 'DELETE',
    });
  },
};