"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalProducts: 0,
    totalCustomers: 0,
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setStats({
        totalSales: 12580.75,
        totalOrders: 156,
        pendingOrders: 23,
        lowStockItems: 8,
        totalProducts: 64,
        totalCustomers: 128,
      })

      setRecentOrders([
        { id: 1001, customer: "John Doe", date: "2023-04-15", total: 125.99, status: "Delivered" },
        { id: 1002, customer: "Jane Smith", date: "2023-04-15", total: 89.5, status: "Processing" },
        { id: 1003, customer: "Robert Johnson", date: "2023-04-14", total: 245.0, status: "Pending" },
        { id: 1004, customer: "Emily Davis", date: "2023-04-14", total: 65.25, status: "Delivered" },
        { id: 1005, customer: "Michael Brown", date: "2023-04-13", total: 178.5, status: "Shipped" },
      ])

      setTopProducts([
        { id: 101, name: "Wireless Headphones", sold: 45, revenue: 2250.0 },
        { id: 102, name: "Smart Watch", sold: 32, revenue: 3840.0 },
        { id: 103, name: "Bluetooth Speaker", sold: 28, revenue: 1400.0 },
        { id: 104, name: "Laptop Backpack", sold: 25, revenue: 1250.0 },
        { id: 105, name: "USB-C Hub", sold: 22, revenue: 880.0 },
      ])

      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="h3 mb-4">Dashboard</h1>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Sales</h6>
              <h3 className="mb-0">${stats.totalSales.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Orders</h6>
              <h3 className="mb-0">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Pending Orders</h6>
              <h3 className="mb-0">{stats.pendingOrders}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Low Stock Items</h6>
              <h3 className="mb-0">{stats.lowStockItems}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Products</h6>
              <h3 className="mb-0">{stats.totalProducts}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 col-lg-2">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-muted">Total Customers</h6>
              <h3 className="mb-0">{stats.totalCustomers}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sales Overview</h5>
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  This Month
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <a className="dropdown-item" href="#">
                      This Week
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      This Month
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      This Year
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="card-body">
              {/* In a real app, you would use a chart library like Chart.js */}
              <div className="text-center p-5 bg-light rounded">
                <p className="text-muted mb-0">Sales Chart Placeholder</p>
                <p className="text-muted small">In a real app, this would be a line chart showing sales over time</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Sales Distribution</h5>
            </div>
            <div className="card-body">
              {/* In a real app, you would use a chart library like Chart.js */}
              <div className="text-center p-5 bg-light rounded">
                <p className="text-muted mb-0">Pie Chart Placeholder</p>
                <p className="text-muted small">In a real app, this would be a pie chart showing sales by category</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Orders</h5>
              <Link href="/admin/orders" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
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
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === "Delivered"
                                ? "bg-success"
                                : order.status === "Shipped"
                                  ? "bg-info"
                                  : order.status === "Processing"
                                    ? "bg-primary"
                                    : "bg-warning"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Top Selling Products</h5>
              <Link href="/admin/products" className="btn btn-sm btn-primary">
                View All
              </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.sold}</td>
                        <td>${product.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
