"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const pathname = usePathname();

  const sidebarStyle = {
    width: isOpen ? "250px" : "70px",
    minHeight: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    transition: "width 0.3s ease-in-out",
    backgroundColor: "#212529",
    color: "white",
    overflowX: "hidden",
  };

  const linkTextStyle = {
    display: isOpen ? "inline" : "none",
    transition: "opacity 0.3s",
    whiteSpace: "nowrap",
  };

  const iconStyle = {
    width: "24px",
    textAlign: "center",
    marginRight: isOpen ? "10px" : "0",
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    { path: "/admin", icon: "bi-speedometer2", text: "Dashboard" },
    { path: "/admin/products", icon: "bi-box-seam", text: "Products" },
    { path: "/admin/orders", icon: "bi-cart3", text: "Orders" },
    { path: "/admin/settings", icon: "bi-gear", text: "Settings" },
  ];

  const [shop, setShop] = useState(null);
  const [user, setUser] = useState(null);
  const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchShop = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${BASE_URL}/auth/user-shop/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch shop");
        const data = await res.json();
        console.log("shop", data);
        setShop(data);
      } catch (error) {
        console.error("Error fetching shop:", error);
      }
    };

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${BASE_URL}/auth/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        console.log("user", data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
    fetchShop();
  }, [BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`position-fixed top-0 start-0 h-100 w-100 bg-dark bg-opacity-50 d-md-none ${
          isOpen ? "d-block" : "d-none"
        }`}
        style={{ zIndex: 99 }}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <div style={sidebarStyle} className="d-flex flex-column">
        <div className="d-flex align-items-center p-3 border-bottom border-secondary">
          {shop && (
            <img
              src={`${BASE_URL}/${shop.logo}`}
              alt={shop.name}
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
          )}
          <h5 className="mb-0" style={linkTextStyle}>
            {shop?.name}
          </h5>
          <button
            className="btn btn-sm btn-link text-white ms-auto d-md-none"
            onClick={toggleSidebar}
          >
            <i className="bi bi-x fs-5"></i>
          </button>
        </div>

        <div className="d-flex justify-content-center d-none d-md-flex p-2">
          <button
            className="btn btn-sm btn-outline-light border-0"
            onClick={toggleSidebar}
            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <i className={`bi bi-chevron-${isOpen ? "left" : "right"}`}></i>
          </button>
        </div>

        <ul className="nav flex-column mt-2">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link
                href={item.path}
                className={`nav-link py-3 px-3 d-flex align-items-center ${
                  isActive(item.path)
                    ? "active bg-primary bg-opacity-75"
                    : "text-white-50"
                }`}
              >
                <span style={iconStyle}>
                  <i className={item.icon}></i>
                </span>
                <span style={linkTextStyle}>{item.text}</span>
                {!isOpen && (
                  <span
                    className="position-absolute d-md-none"
                    style={{
                      left: "70px",
                      backgroundColor: "#343a40",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      display: "none",
                    }}
                  >
                    {item.text}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="mt-auto p-3 border-top border-secondary"
          style={{ opacity: isOpen ? 1 : 0 }}
        >
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center" style={linkTextStyle}>
              <div className="bg-secondary rounded-circle p-2 me-2">
                <i className="bi bi-person text-white"></i>
              </div>
              <div>
                <small className="d-block text-white-50">Logged in as</small>
                <span className="text-white">{user?.user?.full_name}</span>
              </div>
            </div>

            {isOpen && (
              <button
                onClick={handleLogout}
                className="btn btn-link text-white ms-2"
                title="Logout"
              >
                <i className="bi bi-box-arrow-right fs-5"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
