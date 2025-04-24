"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [error, setError] = useState(null)
  const [token, setToken] = useState("")

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
        console.log("Order data:", data) // Log the data to see its structure
        setOrders(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [token, BASE_URL])

  const filteredOrders = filterStatus ? orders.filter((order) => order.status === filterStatus) : orders

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
    } catch (err) {
      setError(err.message)
    }
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
        <h1 className="h3 mb-0">Orders</h1>
        <div className="d-flex gap-2">
          <select
            className="form-select form-select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button className="btn btn-sm btn-outline-secondary">
            <i className="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div>
                        {/* Check if customer is an object and display appropriately */}
                        {typeof order.customer === "object" && order.customer !== null
                          ? order.customer.full_name ||
                          `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() ||
                          "Unknown"
                          : order.customer || "Unknown"}
                      </div>
                      <small className="text-muted">
                        {/* Check if email is directly on order or in customer object */}
                        {typeof order.customer === "object" && order.customer !== null && order.customer.email
                          ? order.customer.email
                          : order.email || "No email"}
                      </small>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>${order.total_price}</td>
                    <td>
                      <span className={`badge ${order.method === "delivery" ? "bg-info" : "bg-secondary"}`}>
                        {order.method === "delivery" ? "Delivery" : "Pickup"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${order.status === "Delivered"
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
                    <td>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-outline-secondary dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          Actions
                        </button>
                        <ul className="dropdown-menu">
                          <li key={`divider-${order.id}`}>
                            <hr className="dropdown-divider" />
                          </li>
                          <li key={`processing-${order.id}`}>
                            <button
                              className="dropdown-item"
                              onClick={() => updateOrderStatus(order.id, "Processing")}
                              disabled={order.status === "Processing"}
                            >
                              Mark as Processing
                            </button>
                          </li>
                          <li key={`shipped-${order.id}`}>
                            <button
                              className="dropdown-item"
                              onClick={() => updateOrderStatus(order.id, "Shipped")}
                              disabled={order.status === "Shipped"}
                            >
                              Mark as Shipped
                            </button>
                          </li>
                          <li key={`delivered-${order.id}`}>
                            <button
                              className="dropdown-item"
                              onClick={() => updateOrderStatus(order.id, "Delivered")}
                              disabled={order.status === "Delivered"}
                            >
                              Mark as Delivered
                            </button>
                          </li>
                          <li key={`cancelled-${order.id}`}>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => updateOrderStatus(order.id, "Cancelled")}
                              disabled={order.status === "Cancelled"}
                            >
                              Cancel Order
                            </button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr key="no-orders">
                    <td colSpan="7" className="text-center py-4">
                      <p className="mb-0 text-muted">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0 text-muted">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled" key="pagination-prev">
                  <a className="page-link" href="#" tabIndex="-1">
                    Previous
                  </a>
                </li>
                <li className="page-item active" key="pagination-1">
                  <a className="page-link" href="#">
                    1
                  </a>
                </li>
                <li className="page-item" key="pagination-2">
                  <a className="page-link" href="#">
                    2
                  </a>
                </li>
                <li className="page-item" key="pagination-next">
                  <a className="page-link" href="#">
                    Next
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
