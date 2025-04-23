"use client"

import Link from "next/link"
import { useCart } from "./cart-context"
import { useAuth } from "./auth-context"

export default function NavBar() {
  const { totalItems, openCart } = useCart()
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container">
        <Link href="/" className="navbar-brand">
          Inventory System
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link href="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/products" className="nav-link">
                Products
              </Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link href="/orders" className="nav-link">
                  My Orders
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center">
            <button className="btn btn-outline-primary position-relative me-3" onClick={openCart}>
              <i className="bi bi-cart"></i>
              {totalItems > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {totalItems}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  {user?.username || "Account"}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link href="/profile" className="dropdown-item">
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="dropdown-item">
                      Orders
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={logout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
