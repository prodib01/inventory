"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Script from "next/script"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [error, setError] = useState(null)
  const [token, setToken] = useState("")
  const [shop, setShop] = useState("")
  const [activeDropdown, setActiveDropdown] = useState(null)

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token")
      setToken(storedToken || "")
    } catch (err) {
      console.error("Error accessing localStorage:", err)
    }
  }, [])

  useEffect(() => {
    if (!token) return

    const fetchOrders = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${BASE_URL}/orders/`, {
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
        console.error("Error fetching orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchShop = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/user-shop/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }
        const data = await response.json()
        setShop(data)
      } catch (err) {
        console.error("Error fetching shop:", err)
      }
    }

    fetchShop()
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

      // Update orders state with the new status
      setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
      
      // Close dropdown after selection
      setActiveDropdown(null)
    } catch (err) {
      setError(err.message)
      console.error("Error updating order status:", err)
    }
  }

  // Toggle dropdown visibility
  const toggleDropdown = (orderId) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Include Bootstrap JavaScript */}
      <Script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p"
        crossOrigin="anonymous"
      />
      
      <div className="container-fluid p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <h1 className="h3 mb-3 mb-md-0">Orders Management</h1>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center">
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
                    <th>Total({shop.currency})</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="fw-bold">
                            {typeof order.customer === "object" && order.customer !== null
                              ? order.customer.full_name ||
                                `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() ||
                                "Unknown"
                              : order.customer || "Unknown"}
                          </div>
                          <small className="text-muted">
                            {typeof order.customer === "object" && order.customer !== null && order.customer.email
                              ? order.customer.email
                              : order.email || "No email"}
                          </small>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td><td>{new Intl.NumberFormat().format(Math.floor(order.total_price))}</td>
                        </td>
                        <td>
                          <span className={`badge ${order.method === "delivery" ? "bg-info" : "bg-secondary"}`}>
                            {order.method === "delivery" ? "Delivery" : "Pickup"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.status === "Delivered"
                                ? "bg-success"
                                : order.status === "Processing"
                                  ? "bg-primary"
                                  : "bg-warning"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(order.id);
                              }}
                              aria-expanded={activeDropdown === order.id}
                            >
                              Actions
                            </button>
                            <ul 
                              className={`dropdown-menu${activeDropdown === order.id ? ' show' : ''}`}
                              style={{ position: 'absolute', inset: '0px auto auto 0px', margin: '0px', transform: 'translate(0px, 40px)' }}
                            >
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => updateOrderStatus(order.id, "Processing")}
                                  disabled={order.status === "Processing"}
                                >
                                  Mark as Processing
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => updateOrderStatus(order.id, "Delivered")}
                                  disabled={order.status === "Delivered"}
                                >
                                  Mark as Delivered
                                </button>
                              </li>
                              <li>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="py-4">
                          <i className="bi bi-inbox text-muted" style={{ fontSize: '2rem' }}></i>
                          <p className="mt-2 mb-0 text-muted">No orders found</p>
                          <small className="text-muted">Try changing your filter or check back later</small>
                        </div>
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
                  <li className="page-item disabled">
                    <a className="page-link" href="#" tabIndex="-1">
                      Previous
                    </a>
                  </li>
                  <li className="page-item active">
                    <a className="page-link" href="#">
                      1
                    </a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      2
                    </a>
                  </li>
                  <li className="page-item">
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
    </>
  )
}