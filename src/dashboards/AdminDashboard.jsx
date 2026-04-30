import React, { useEffect, useMemo, useState } from 'react'
import { adminService } from '../services/apiService'
import '../styles/adminDashboard.css'
import {
  Users,
  Car,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Settings,
  LogOut,
  BarChart3,
  UserCog,
  CarFront,
  ShieldCheck,
  Eye,
  X,
  Check,
  Bell,
  Menu,
} from 'lucide-react'

const sidebarItems = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp },
  { key: 'users', label: 'Manage Users', icon: UserCog },
  { key: 'rides', label: 'Manage Rides', icon: CarFront },
  { key: 'approvals', label: 'Approvals', icon: ShieldCheck },
  { key: 'settings', label: 'Settings', icon: Settings },
]

const chartColors = ['#16e0a3', '#6c63ff', '#f59e0b', '#ff5d73', '#38bdf8']

const defaultAdminSettings = {
  maintenanceMode: false,
  autoApproveDrivers: false,
  surgePricing: false,
  emailAlerts: true,
  smsNotifications: false,
}

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

const formatCompactCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 1,
  }).format(Number(value))
}

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0'
  return new Intl.NumberFormat('en-IN').format(Number(value))
}

const getInitials = (name = '') => {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'A'
  )
}

function StatCard({ icon, title, value, badge, iconClass = '', onClick }) {
  return (
    <div
      className={`admin-stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="admin-stat-top">
        <div className={`admin-stat-icon ${iconClass}`}>{icon}</div>
        {badge ? <span className="admin-badge-pill">{badge}</span> : null}
      </div>
      <h3 className="admin-stat-value">{value}</h3>
      <p className="admin-stat-title">{title}</p>
    </div>
  )
}

function EmptyState({ text = 'No data available' }) {
  return <div className="admin-empty-state">{text}</div>
}

export default function AdminDashboard({
  overview = {},
  analytics = {},
  users = [],
  rides = [],
  approvals = [],
  settings = {},
  onLogout = () => { },
  onUserView = () => { },
  onUserSuspend = () => { },
  onUserActivate = () => { },
  onRideView = () => { },
  onRideApprove = () => { },
  onRideReject = () => { },
  onApprovalApprove = () => { },
  onApprovalReject = () => { },
  onSettingToggle = () => { },
}) {
  const [activePage, setActivePage] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState({})
  const [usersData, setUsersData] = useState([])
  const [driversData, setDriversData] = useState([])
  const [ridesData, setRidesData] = useState([])
  const [bookingsData, setBookingsData] = useState([])
  const [paymentsData, setPaymentsData] = useState([])
  const [reviewsData, setReviewsData] = useState([])
  const [error, setError] = useState('')

  const [adminSettings, setAdminSettings] = useState(() => {
    const savedSettings = localStorage.getItem('adminDashboardSettings')

    if (savedSettings) {
      try {
        return {
          ...defaultAdminSettings,
          ...JSON.parse(savedSettings),
        }
      } catch {
        return {
          ...defaultAdminSettings,
          ...settings,
        }
      }
    }

    return {
      ...defaultAdminSettings,
      ...settings,
    }
  })

  const [selectedModal, setSelectedModal] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        setCurrentUser(JSON.parse(user))
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('adminDashboardSettings', JSON.stringify(adminSettings))
  }, [adminSettings])

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminService.getDashboard()
      if (response.success) {
        setDashboardData(response.data)
      } else {
        setError(response.message || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch users data
  const fetchUsersData = async () => {
    try {
      const response = await adminService.getUsers()
      if (response.success) {
        setUsersData(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  // Fetch drivers data
  const fetchDriversData = async () => {
    try {
      const response = await adminService.getDrivers()
      if (response.success) {
        setDriversData(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch drivers:', err)
    }
  }

  // Fetch rides data
  const fetchRidesData = async () => {
    try {
      const response = await adminService.getRides()
      if (response.success) {
        setRidesData(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch rides:', err)
    }
  }

  // Fetch bookings data safely if backend route exists
  const fetchBookingsData = async () => {
    try {
      if (typeof adminService.getBookings !== 'function') return
      const response = await adminService.getBookings()
      if (response.success) {
        setBookingsData(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    }
  }

  // Fetch payments data safely if backend route exists
  const fetchPaymentsData = async () => {
    try {
      if (typeof adminService.getPayments !== 'function') return
      const response = await adminService.getPayments()
      if (response.success) {
        setPaymentsData(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err)
    }
  }

  // Fetch reviews data safely if backend route exists
  const fetchReviewsData = async () => {
    try {
      if (typeof adminService.getReviews !== 'function') return
      const response = await adminService.getReviews()
      if (response.success) {
        setReviewsData(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    }
  }

  // Fetch all data on component mount and when page changes
  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchDashboardData()
      fetchUsersData()
      fetchDriversData()
      fetchRidesData()
      fetchBookingsData()
      fetchPaymentsData()
      fetchReviewsData()
    }
  }, [currentUser])

  const handleSettingToggle = (key) => {
    setAdminSettings((prev) => {
      const updated = {
        ...prev,
        [key]: !prev[key],
      }

      onSettingToggle(key, updated[key])
      return updated
    })
  }

  const handleUserView = (user) => {
    onUserView(user)
    setSelectedModal({
      title: 'User Details',
      data: user,
    })
  }

  const handleRideView = (ride) => {
    onRideView(ride)
    setSelectedModal({
      title: 'Ride Details',
      data: ride,
    })
  }

  const handleUserBlock = async (user) => {
    try {
      const response = await adminService.blockUser(user._id, !user.isBlocked, user.isBlocked ? 'Unblocked by admin' : 'Blocked by admin')
      if (response.success) {
        // Refresh users data
        fetchUsersData()
        fetchDriversData()
      } else {
        setError(response.message || 'Failed to update user status')
      }
    } catch (err) {
      setError(err.message || 'Failed to update user status')
    }
  }

  const handleRefreshData = async () => {
    try {
      setLoading(true)
      setError('')
      await Promise.all([
        fetchDashboardData(),
        fetchUsersData(),
        fetchDriversData(),
        fetchRidesData(),
        fetchBookingsData(),
        fetchPaymentsData(),
        fetchReviewsData()
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
      setError('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshUsers = async () => {
    try {
      await fetchUsersData()
      await fetchDriversData()
    } catch (error) {
      console.error('Error refreshing users:', error)
    }
  }

  const handleRefreshRides = async () => {
    try {
      await fetchRidesData()
    } catch (error) {
      console.error('Error refreshing rides:', error)
    }
  }

  const adminProfile = {
    brand: 'RideShare Admin',
    name: currentUser?.name || currentUser?.fullName || 'Super Admin',
    email: currentUser?.email || 'admin@rideshare.com',
    role: currentUser?.role || 'admin',
  }

  const safeOverview = {
    totalUsers: dashboardData.overview?.totalUsers ?? overview.totalUsers ?? usersData.length ?? 0,
    totalDrivers: dashboardData.overview?.totalDrivers ?? overview.totalDrivers ?? driversData.length ?? 0,
    totalRides: dashboardData.overview?.totalRides ?? overview.totalRides ?? ridesData.length ?? 0,
    totalRevenue: dashboardData.overview?.totalRevenue ?? overview.totalRevenue ?? 0,
    activeNow: dashboardData.overview?.activeRides ?? overview.activeNow ?? 0,
    pendingApprovals: dashboardData.overview?.pendingBookings ?? overview.pendingApprovals ?? bookingsData.length ?? 0,
    todayRides: dashboardData.overview?.todayRides ?? overview.todayRides ?? 0,
    todayRevenue: dashboardData.overview?.todayRevenue ?? overview.todayRevenue ?? 0,
    activeRides: dashboardData.overview?.activeRides ?? overview.activeRides ?? 0,
    pendingRides: dashboardData.overview?.pendingBookings ?? overview.pendingRides ?? 0,
    completedToday: dashboardData.overview?.completedToday ?? overview.completedToday ?? 0,
    cancelledToday: dashboardData.overview?.cancelledToday ?? overview.cancelledToday ?? 0,
    growth: dashboardData.growth ?? overview.growth ?? {},
    topCities: Array.isArray(dashboardData.topCities) ? dashboardData.topCities : Array.isArray(overview.topCities) ? overview.topCities : [],
  }

  const safeAnalytics = {
    monthlyTrend: Array.isArray(dashboardData.analytics?.monthlyTrend) ? dashboardData.analytics.monthlyTrend : Array.isArray(analytics.monthlyTrend) ? analytics.monthlyTrend : [],
    rideVolume: Array.isArray(dashboardData.analytics?.rideVolume) ? dashboardData.analytics.rideVolume : Array.isArray(analytics.rideVolume) ? analytics.rideVolume : [],
    vehicleTypes: Array.isArray(dashboardData.analytics?.vehicleTypes) ? dashboardData.analytics.vehicleTypes : Array.isArray(analytics.vehicleTypes) ? analytics.vehicleTypes : [],
  }

  const vehicleChartData = useMemo(() => {
    return safeAnalytics.vehicleTypes.map((item, index) => ({
      ...item,
      color: chartColors[index % chartColors.length],
    }))
  }, [safeAnalytics.vehicleTypes])

  const totalMonthlyRides = safeAnalytics.monthlyTrend.reduce(
    (sum, item) => sum + Number(item.rides || 0),
    0
  )

  const totalMonthlyRevenue = safeAnalytics.monthlyTrend.reduce(
    (sum, item) => sum + Number(item.revenue || 0),
    0
  )

  const peakRideMonth =
    safeAnalytics.rideVolume.length > 0
      ? safeAnalytics.rideVolume.reduce((max, item) =>
        Number(item.rides || 0) > Number(max.rides || 0) ? item : max
      )
      : null

  const topVehicleType =
    vehicleChartData.length > 0
      ? vehicleChartData.reduce((max, item) =>
        Number(item.value || 0) > Number(max.value || 0) ? item : max
      )
      : null

  const displayRides = ridesData.length > 0 ? ridesData : rides

  const pendingApprovalsList = useMemo(() => {
    if (Array.isArray(approvals) && approvals.length > 0) return approvals

    const pendingBookings = bookingsData
      .filter((booking) => ['pending', 'requested', 'waiting'].includes(String(booking.status || '').toLowerCase()))
      .map((booking) => ({
        ...booking,
        label: 'Booking',
        name: booking.userName || booking.passengerName || booking.user?.name || 'Pending booking',
        subtitle: booking.route || `${booking.pickup || booking.from || '-'} → ${booking.dropoff || booking.to || '-'}`,
        submittedAt: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : '-',
      }))

    const pendingDrivers = driversData
      .filter((driver) => ['pending', 'requested', 'waiting'].includes(String(driver.approvalStatus || driver.status || '').toLowerCase()))
      .map((driver) => ({
        ...driver,
        label: 'Driver',
        name: driver.name || `${driver.firstName || ''} ${driver.surname || ''}`.trim() || driver.email || 'Pending driver',
        subtitle: driver.vehicle || driver.vehicleType || driver.email || '-',
        submittedAt: driver.createdAt ? new Date(driver.createdAt).toLocaleDateString() : '-',
      }))

    return [...pendingDrivers, ...pendingBookings]
  }, [approvals, bookingsData, driversData])

  const approvalCount = pendingApprovalsList.length

  const renderOverview = () => (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Platform overview and key metrics</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          icon={<Users size={20} />}
          title="Total Users"
          value={formatNumber(safeOverview.totalUsers)}
          badge={safeOverview.growth.users ? `${safeOverview.growth.users}` : null}
          iconClass="blue"
          onClick={() => setActivePage('users')}
        />
        <StatCard
          icon={<Car size={20} />}
          title="Total Drivers"
          value={formatNumber(safeOverview.totalDrivers)}
          badge={safeOverview.growth.drivers ? `${safeOverview.growth.drivers}` : null}
          iconClass="purple"
          onClick={() => setActivePage('users')}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Total Rides"
          value={formatNumber(safeOverview.totalRides)}
          badge={safeOverview.growth.rides ? `${safeOverview.growth.rides}` : null}
          iconClass="green"
          onClick={() => setActivePage('rides')}
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          title="Revenue"
          value={formatCompactCurrency(safeOverview.totalRevenue)}
          badge={safeOverview.growth.revenue ? `${safeOverview.growth.revenue}` : null}
          iconClass="orange"
          onClick={() => setActivePage('analytics')}
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          title="Active Now"
          value={formatNumber(safeOverview.activeNow)}
          badge="Live"
          iconClass="mint"
          onClick={() => setActivePage('users')}
        />
        <StatCard
          icon={<AlertCircle size={20} />}
          title="Pending"
          value={formatNumber(safeOverview.pendingApprovals)}
          badge="Urgent"
          iconClass="red"
          onClick={() => setActivePage('approvals')}
        />
        <StatCard
          icon={<CarFront size={20} />}
          title="Today Rides"
          value={formatNumber(safeOverview.todayRides)}
          badge={safeOverview.growth.todayRides ? `${safeOverview.growth.todayRides}` : null}
          iconClass="sky"
          onClick={() => setActivePage('rides')}
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          title="Today Revenue"
          value={formatCompactCurrency(safeOverview.todayRevenue)}
          badge={safeOverview.growth.todayRevenue ? `${safeOverview.growth.todayRevenue}` : null}
          iconClass="pink"
          onClick={() => setActivePage('analytics')}
        />
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>Top Cities by Rides</h2>
        </div>

        {safeOverview.topCities.length === 0 ? (
          <EmptyState text="No city ride data available" />
        ) : (
          <div className="city-rides-list">
            {safeOverview.topCities.map((city, index) => {
              const maxValue = Math.max(...safeOverview.topCities.map((item) => item.rides || 0), 1)
              const width = ((city.rides || 0) / maxValue) * 100

              return (
                <div className="city-ride-item" key={`${city.name}-${index}`}>
                  <div className="city-ride-row">
                    <div className="city-left">
                      <span className="city-rank">{index + 1}</span>
                      <span className="city-name">{city.name}</span>
                    </div>
                    <div className="city-right">
                      {city.growth ? <span className="city-growth">{city.growth}</span> : null}
                      <span className="city-rides">{formatNumber(city.rides)} rides</span>
                    </div>
                  </div>
                  <div className="city-bar-track">
                    <div className="city-bar-fill" style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Analytics</h1>
          <p>Performance summary without charts</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          icon={<TrendingUp size={20} />}
          title="Monthly Rides"
          value={formatNumber(totalMonthlyRides)}
          badge={safeAnalytics.monthlyTrend.length ? `${safeAnalytics.monthlyTrend.length} months` : null}
          iconClass="green"
        />
        <StatCard
          icon={<IndianRupee size={20} />}
          title="Monthly Revenue"
          value={formatCompactCurrency(totalMonthlyRevenue)}
          iconClass="purple"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          title="Peak Ride Month"
          value={peakRideMonth?.month || 'N/A'}
          badge={peakRideMonth ? `${formatNumber(peakRideMonth.rides)} rides` : null}
          iconClass="sky"
        />
        <StatCard
          icon={<CarFront size={20} />}
          title="Top Vehicle Type"
          value={topVehicleType?.name || 'N/A'}
          badge={topVehicleType ? `${topVehicleType.value}%` : null}
          iconClass="orange"
        />
      </div>

      <div className="admin-grid-2">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Monthly Rides & Revenue</h2>
          </div>

          {safeAnalytics.monthlyTrend.length === 0 ? (
            <EmptyState text="No monthly trend data available" />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Rides</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {safeAnalytics.monthlyTrend.map((item, index) => (
                    <tr key={`${item.month}-${index}`}>
                      <td>{item.month || '-'}</td>
                      <td>{formatNumber(item.rides || 0)}</td>
                      <td>{formatCurrency(item.revenue || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Monthly Ride Volume</h2>
          </div>

          {safeAnalytics.rideVolume.length === 0 ? (
            <EmptyState text="No ride volume data available" />
          ) : (
            <div className="city-rides-list">
              {safeAnalytics.rideVolume.map((item, index) => {
                const maxValue = Math.max(...safeAnalytics.rideVolume.map((entry) => entry.rides || 0), 1)
                const width = ((item.rides || 0) / maxValue) * 100

                return (
                  <div className="city-ride-item" key={`${item.month}-${index}`}>
                    <div className="city-ride-row">
                      <div className="city-left">
                        <span className="city-rank">{index + 1}</span>
                        <span className="city-name">{item.month}</span>
                      </div>
                      <div className="city-right">
                        <span className="city-rides">{formatNumber(item.rides)} rides</span>
                      </div>
                    </div>
                    <div className="city-bar-track">
                      <div className="city-bar-fill" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <h2>Vehicle Type Distribution</h2>
        </div>

        {vehicleChartData.length === 0 ? (
          <EmptyState text="No vehicle distribution data available" />
        ) : (
          <div className="vehicle-legend">
            {vehicleChartData.map((item, index) => (
              <div className="vehicle-legend-item" key={`${item.name}-${index}`}>
                <div className="vehicle-legend-left">
                  <span className="vehicle-dot" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderUsers = () => {
    const allUsers = [...usersData, ...driversData]
    const uniqueUsers = allUsers.filter((user, index, arr) =>
      arr.findIndex(u => u._id === user._id) === index
    )

    return (
      <div className="admin-page-content">
        <div className="admin-page-header spaced">
          <div>
            <h1>Manage Users</h1>
          </div>
          <p>{uniqueUsers.length} total users</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-panel table-panel">
          {uniqueUsers.length === 0 ? (
            <EmptyState text="No users found" />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueUsers.map((user) => (
                    <tr key={user._id || user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">
                            {getInitials(user.firstName && user.surname ? `${user.firstName} ${user.surname}` : user.name || user.email)}
                          </div>
                          <span className="user-name">
                            {user.firstName && user.surname ? `${user.firstName} ${user.surname}` : user.name || user.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-cell">
                          <span>{user.email}</span>
                          {user.phone ? <small>{user.phone}</small> : null}
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${user.role || ''}`}>
                          {user.role === 'driver' ? 'Driver' : user.role === 'admin' ? 'Admin' : 'Passenger'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-group">
                          <button className="action-btn view" onClick={() => handleUserView(user)}>
                            <Eye size={14} />
                          </button>

                          {user.isBlocked ? (
                            <button className="action-btn approve" onClick={() => handleUserBlock(user)}>
                              <CheckCircle2 size={14} />
                            </button>
                          ) : (
                            <button className="action-btn reject" onClick={() => handleUserBlock(user)}>
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRides = () => (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Manage Rides</h1>
        </div>
      </div>

      <div className="admin-mini-stats">
        <div className="mini-stat-card">
          <h3>{formatNumber(safeOverview.activeRides)}</h3>
          <p>Active</p>
        </div>
        <div className="mini-stat-card">
          <h3>{formatNumber(safeOverview.pendingRides)}</h3>
          <p>Pending</p>
        </div>
        <div className="mini-stat-card">
          <h3>{formatNumber(safeOverview.completedToday)}</h3>
          <p>Completed Today</p>
        </div>
        <div className="mini-stat-card">
          <h3>{formatNumber(safeOverview.cancelledToday)}</h3>
          <p>Cancelled Today</p>
        </div>
      </div>

      <div className="admin-panel table-panel">
        {displayRides.length === 0 ? (
          <EmptyState text="No rides found" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ride ID</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Passengers</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayRides.map((ride) => (
                  <tr key={ride._id || ride.id}>
                    <td>{ride.rideId || ride._id || ride.id}</td>
                    <td>{ride.driverName || ride.driver?.name || '-'}</td>
                    <td>{ride.route || `${ride.from || '-'} → ${ride.to || '-'}`}</td>
                    <td>{ride.date || ride.createdAt || '-'}</td>
                    <td>{ride.passengers ?? ride.passengerCount ?? 0}</td>
                    <td className="amount-text">{formatCurrency(ride.amount || ride.fare || 0)}</td>
                    <td>
                      <span className={`status-badge ${ride.status || ''}`}>
                        {ride.status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <div className="action-group rides-actions">
                        <button className="text-btn blue" onClick={() => handleRideView(ride)}>
                          View
                        </button>

                        {String(ride.status).toLowerCase() === 'pending' && (
                          <>
                            <button className="text-btn green" onClick={() => onRideApprove(ride)}>
                              Approve
                            </button>
                            <button className="text-btn red" onClick={() => onRideReject(ride)}>
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  const renderApprovals = () => (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <div>
          <h1>Pending Approvals</h1>
        </div>
      </div>

      <div className="approval-list">
        {pendingApprovalsList.length === 0 ? (
          <div className="admin-panel">
            <EmptyState text="No pending approvals" />
          </div>
        ) : (
          pendingApprovalsList.map((item) => (
            <div className="approval-card" key={item._id || item.id}>
              <div className="approval-left">
                <div className="approval-tags">
                  {item.label ? <span className="approval-tag yellow">{item.label}</span> : null}
                  {item.docStatus ? (
                    <span
                      className={`approval-tag ${String(item.docStatus).toLowerCase().includes('pending') ? 'red' : 'green'
                        }`}
                    >
                      {item.docStatus}
                    </span>
                  ) : null}
                </div>

                <h3>{item.name}</h3>
                <p>{item.subtitle || item.vehicle || item.details || '-'}</p>
                <small>Submitted: {item.submittedAt || item.date || '-'}</small>
              </div>

              <div className="approval-actions">
                <button className="approval-btn approve" onClick={() => onApprovalApprove(item)}>
                  <Check size={16} />
                  Approve
                </button>
                <button className="approval-btn reject" onClick={() => onApprovalReject(item)}>
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderSettings = () => {
    const settingList = [
      {
        key: 'maintenanceMode',
        title: 'Maintenance Mode',
        subtitle: 'Temporarily disable the platform',
      },
      {
        key: 'autoApproveDrivers',
        title: 'Auto-Approve Drivers',
        subtitle: 'Skip manual verification',
      },
      {
        key: 'surgePricing',
        title: 'Surge Pricing',
        subtitle: 'Enable dynamic surge pricing',
      },
      {
        key: 'emailAlerts',
        title: 'Email Alerts',
        subtitle: 'Receive admin email notifications',
      },
      {
        key: 'smsNotifications',
        title: 'SMS Notifications',
        subtitle: 'Send SMS to users on bookings',
      },
    ]

    return (
      <div className="admin-page-content">
        <div className="admin-page-header">
          <div>
            <h1>Platform Settings</h1>
            <p>Your preferences are saved automatically</p>
          </div>
        </div>

        <div className="settings-list">
          {settingList.map((item) => (
            <div className="setting-card" key={item.key}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>

              <button
                type="button"
                className={`toggle-switch ${adminSettings[item.key] ? 'active' : ''}`}
                onClick={() => handleSettingToggle(item.key)}
                aria-label={item.title}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'analytics':
        return renderAnalytics()
      case 'users':
        return renderUsers()
      case 'rides':
        return renderRides()
      case 'approvals':
        return renderApprovals()
      case 'settings':
        return renderSettings()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="admin-dashboard-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-top">
          <div className="admin-brand">
            <div className="admin-brand-icon">{getInitials(adminProfile.brand).charAt(0)}</div>
            <div>
              <h2>{adminProfile.brand}</h2>
            </div>
          </div>

          <div className="admin-profile-card">
            <div className="admin-profile-avatar">{getInitials(adminProfile.name)}</div>
            <div>
              <h3>{adminProfile.name}</h3>
              <p>{adminProfile.email}</p>
            </div>
          </div>

          <nav className="admin-nav">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.key

              return (
                <button
                  key={item.key}
                  className={`admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActivePage(item.key)
                    setSidebarOpen(false)
                  }}
                >
                  <span className="admin-nav-left">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </span>

                  {item.key === 'approvals' && approvalCount > 0 ? (
                    <span className="admin-count-badge">{approvalCount}</span>
                  ) : null}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="admin-sidebar-bottom">
          <button
            className="admin-logout-btn"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/'; // 👈 goes to homepage
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-mobile-topbar">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
          <h2>{adminProfile.brand}</h2>
          <Bell size={18} />
        </div>

        {renderPage()}
      </main>

      {selectedModal && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>{selectedModal.title}</h2>
              <button onClick={() => setSelectedModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {Object.entries(selectedModal.data || {}).map(([key, value]) => (
                <div className="admin-modal-row" key={key}>
                  <strong>{key}</strong>
                  <span>
                    {typeof value === 'object' && value !== null
                      ? JSON.stringify(value)
                      : String(value ?? '-')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}