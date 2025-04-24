"use client"

import { useState, useEffect } from "react"
import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminReports() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [token, setToken] = useState("")
  const [dateRange, setDateRange] = useState("week") // week, month, year
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    // Safely access localStorage after component mount
    const storedToken = localStorage.getItem("token")
    setToken(storedToken || "")
  }, [])

  useEffect(() => {
    if (!token) return

    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // You might want to add date range parameters to this API call
        const response = await fetch(`${BASE_URL}/all-orders/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [token, BASE_URL, dateRange, startDate, endDate])

  // Calculate summary metrics
  const calculateMetrics = () => {
    if (!orders.length) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0, pendingOrders: 0 }

    const totalOrders = orders.length
    const totalSales = orders.reduce((sum, order) => sum + Number.parseFloat(order.total_price || 0), 0)
    const avgOrderValue = totalSales / totalOrders
    const pendingOrders = orders.filter((order) => order.status === "Pending").length

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      pendingOrders,
    }
  }

  const metrics = calculateMetrics()

  // Prepare data for charts
  const prepareChartData = () => {
    // Group orders by date
    const ordersByDate = {}
    const statusCounts = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    }

    orders.forEach((order) => {
      // For sales by date chart
      const date = new Date(order.date).toLocaleDateString()
      if (!ordersByDate[date]) {
        ordersByDate[date] = {
          count: 0,
          sales: 0,
        }
      }
      ordersByDate[date].count += 1
      ordersByDate[date].sales += Number.parseFloat(order.total_price || 0)

      // For status distribution chart
      if (order.status && statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status] += 1
      }
    })

    // Sort dates
    const sortedDates = Object.keys(ordersByDate).sort((a, b) => new Date(a) - new Date(b))

    return {
      salesByDate: {
        labels: sortedDates,
        datasets: [
          {
            label: "Sales ($)",
            data: sortedDates.map((date) => ordersByDate[date].sales),
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.5)",
          },
        ],
      },
      ordersByDate: {
        labels: sortedDates,
        datasets: [
          {
            label: "Orders",
            data: sortedDates.map((date) => ordersByDate[date].count),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      },
      statusDistribution: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: "Order Status",
            data: Object.values(statusCounts),
            backgroundColor: [
              "rgba(255, 206, 86, 0.5)", // Pending
              "rgba(54, 162, 235, 0.5)", // Processing
              "rgba(75, 192, 192, 0.5)", // Shipped
              "rgba(153, 102, 255, 0.5)", // Delivered
              "rgba(255, 99, 132, 0.5)", // Cancelled
            ],
            borderWidth: 1,
          },
        ],
      },
    }
  }

  const chartData = orders.length ? prepareChartData() : null

  // Handle date range changes
  const handleDateRangeChange = (range) => {
    setDateRange(range)

    const today = new Date()
    const start = new Date()

    if (range === "week") {
      start.setDate(today.getDate() - 7)
    } else if (range === "month") {
      start.setMonth(today.getMonth() - 1)
    } else if (range === "year") {
      start.setFullYear(today.getFullYear() - 1)
    }

    setStartDate(start.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
  }

  // Handle custom date range
  const handleCustomDateChange = (e) => {
    const { name, value } = e.target
    if (name === "startDate") {
      setStartDate(value)
    } else if (name === "endDate") {
      setEndDate(value)
    }
    setDateRange("custom")
  }

  // Export report as CSV
  const exportCSV = () => {
    if (!orders.length) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Headers
    csvContent += "Order ID,Customer,Date,Total,Method,Status\n"

    // Data rows
    orders.forEach((order) => {
      const customerName =
        typeof order.customer === "object"
          ? order.customer.full_name || `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim()
          : order.customer

      const row = [
        order.id,
        `"${customerName}"`,
        new Date(order.date).toLocaleDateString(),
        order.total_price,
        order.method,
        order.status,
      ]

      csvContent += row.join(",") + "\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `orders-report-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-5">
        <p className="text-danger">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Sales Reports</h1>
        <div className="d-flex gap-2">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${dateRange === "week" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleDateRangeChange("week")}
            >
              Week
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dateRange === "month" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleDateRangeChange("month")}
            >
              Month
            </button>
            <button
              type="button"
              className={`btn btn-sm ${dateRange === "year" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleDateRangeChange("year")}
            >
              Year
            </button>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV}>
            <i className="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>

      {/* Custom date range */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-5">
              <label htmlFor="startDate" className="form-label">
                Start Date
              </label>
              <input
                type="date"
                className="form-control"
                id="startDate"
                name="startDate"
                value={startDate}
                onChange={handleCustomDateChange}
              />
            </div>
            <div className="col-md-5">
              <label htmlFor="endDate" className="form-label">
                End Date
              </label>
              <input
                type="date"
                className="form-control"
                id="endDate"
                name="endDate"
                value={endDate}
                onChange={handleCustomDateChange}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                disabled={!startDate || !endDate}
                onClick={() => setDateRange("custom")}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Sales</h6>
              <h3 className="mb-0">${metrics.totalSales.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Total Orders</h6>
              <h3 className="mb-0">{metrics.totalOrders}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Average Order Value</h6>
              <h3 className="mb-0">${metrics.avgOrderValue.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted mb-1">Pending Orders</h6>
              <h3 className="mb-0">{metrics.pendingOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {chartData && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="card-title mb-0">Sales Trend</h5>
                </div>
                <div className="card-body">
                  <Line
                    data={chartData.salesByDate}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="card-title mb-0">Order Status</h5>
                </div>
                <div className="card-body">
                  <Pie
                    data={chartData.statusDistribution}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">Orders by Date</h5>
            </div>
            <div className="card-body">
              <Bar
                data={chartData.ordersByDate}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
                height={300}
              />
            </div>
          </div>
        </>
      )}

      {/* Recent orders table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Recent Orders</h5>
          <a href="/admin/orders" className="btn btn-sm btn-link">
            View All
          </a>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div>
                        {typeof order.customer === "object" && order.customer !== null
                          ? order.customer.full_name ||
                            `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() ||
                            "Unknown"
                          : order.customer || "Unknown"}
                      </div>
                    </td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.total_price}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "Delivered"
                            ? "bg-success"
                            : order.status === "Shipped"
                              ? "bg-info"
                              : order.status === "Processing"
                                ? "bg-primary"
                                : order.status === "Pending"
                                  ? "bg-warning"
                                  : "bg-danger"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr key="no-orders">
                    <td colSpan="5" className="text-center py-4">
                      <p className="mb-0 text-muted">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
