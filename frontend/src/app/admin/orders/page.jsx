"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")

  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setOrders([
        {
          id: 1001,
          customer: "John Doe",
          email: "john@example.com",
          date: "2023-04-15",
          total: 125.99,
          status: "Delivered",
          method: "delivery",
        },
        {
          id: 1002,
          customer: "Jane Smith",
          email: "jane@example.com",
          date: "2023-04-15",
          total: 89.5,
          status: "Processing",
          method: "pickup",
        },
        {
          id: 1003,
          customer: "Robert Johnson",
          email: "robert@example.com",
          date: "2023-04-14",
          total: 245.0,
          status: "Pending",
          method: "delivery",
        },
        {
          id: 1004,
          customer: "Emily Davis",
          email: "emily@example.com",
          date: "2023-04-14",
          total: 65.25,
          status: "Delivered",
          method: "pickup",
        },
        {
          id: 1005,
          customer: "Michael Brown",
          email: "michael@example.com",
          date: "2023-04-13",
          total: 178.5,
          status: "Shipped",
          method: "delivery",
        },
        {
          id: 1006,
          customer: "Sarah Wilson",
          email: "sarah@example.com",
          date: "2023-04-13",
          total: 112.75,
          status: "Cancelled",
          method: "delivery",
        },
        {
          id: 1007,
          customer: "David Lee",
          email: "david@example.com",
          date: "2023-04-12",
          total: 95.2,
          status: "Delivered",
          method: "pickup",
        },
        {
          id: 1008,
          customer: "Lisa Taylor",
          email: "lisa@example.com",
          date: "2023-04-12",
          total: 150.0,
          status: "Processing",
          method: "delivery",
        },
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredOrders = filterStatus ? orders.filter((order) => order.status === filterStatus) : orders

  const updateOrderStatus = (id, newStatus) => {
    // In a real app, you would call your API to update the order status
    setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
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
                      <div>{order.customer}</div>
                      <small className="text-muted">{order.email}</small>
                    </td>
                    <td>{new Date(order.date).toLocaleDateString()}</td>
                    <td>${order.total.toFixed(2)}</td>
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
                          <li>
                            <Link href={`/admin/orders/${order.id}`} className="dropdown-item">
                              View Details
                            </Link>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
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
                              onClick={() => updateOrderStatus(order.id, "Shipped")}
                              disabled={order.status === "Shipped"}
                            >
                              Mark as Shipped
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
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
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
  )
}
