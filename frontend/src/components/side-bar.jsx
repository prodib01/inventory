"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";
import { useCart } from "./cart-context"

export function SideBar({ children }) {
  const { totalItems, openCart } = useCart()
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const toggleRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${BASE_URL}/auth/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("User data:", data);
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    const handleToggle = () => {
      sidebarRef.current.classList.toggle(styles.active);
      contentRef.current.classList.toggle(styles.active);
    };

    const handleClickOutside = (event) => {
      if (
        isMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        sidebarRef.current.classList.remove(styles.active);
        contentRef.current.classList.remove(styles.active);
      }
    };

    const handleResize = () => {
      checkMobile();
      if (window.innerWidth >= 768) {
        if (sidebarRef.current)
          sidebarRef.current.classList.remove(styles.active);
        if (contentRef.current)
          contentRef.current.classList.remove(styles.active);
      }
    };

    if (toggleRef.current) {
      toggleRef.current.addEventListener("click", handleToggle);
    }

    document.addEventListener("click", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      if (toggleRef.current) {
        toggleRef.current.removeEventListener("click", handleToggle);
      }
      document.removeEventListener("click", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  return (
    <div className="d-flex">
      <button
        ref={toggleRef}
        className="btn btn-primary d-md-none position-fixed top-0 start-0 m-2 z-3"
        aria-label="Toggle sidebar"
      >
        <i className="bi bi-list"></i>
      </button>

      <div className={`${styles.sidebar} bg-light`} ref={sidebarRef}>
        <div className="d-flex flex-column h-100">
          {/* Header */}
          <div className="sidebar-header p-3">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-box-seam fs-4 me-1 text-primary"></i>
              <span className="fs-5 fw-semibold">Inventory</span>
            </div>
            <hr className="my-2" />
          </div>

          <div className="flex-grow-1 overflow-auto">
            <ul className="nav nav-pills flex-column mb-auto px-1">
              <li className="nav-item mb-1">
                <Link
                  href="/"
                  className="nav-link active d-flex align-items-center"
                >
                  <i className="bi bi-house me-1"></i> Home
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  href="/shops"
                  className="nav-link link-dark d-flex align-items-center"
                >
                  <i className="bi bi-shop me-1"></i> Shops
                </Link>
              </li>
              <li className="nav-item mb-1">
                <Link
                  href="/orders"
                  className="nav-link link-dark d-flex align-items-center"
                >
                  <i className="bi bi-bag me-1"></i> Orders
                </Link>
              </li>
              <li className="nav-item mb-1 d-flex justify-content-between align-items-center px-2">

                <button
                  className="btn btn-outline-primary position-relative"
                  onClick={openCart}
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
                >
                  <i className="bi bi-cart"></i>
                  {totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {totalItems}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

          <div className="sidebar-footer border-top p-2 mt-auto">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-circle fs-4 me-2 text-secondary"></i>
                <strong className="me-2">
                  {user?.user.full_name || "User"}
                </strong>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-link text-dark p-0 m-0"
                title="Logout"
              >
                <i className="bi bi-box-arrow-right fs-5"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.content}`} ref={contentRef}>
        {children}
      </div>
    </div>
  );
}

// Also export a SidebarLayout component for easier usage
export function SidebarLayout({ children }) {
  return <SideBar>{children}</SideBar>;
}

export default SideBar;
