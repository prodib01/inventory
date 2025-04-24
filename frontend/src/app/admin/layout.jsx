"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import AdminSidebar from "@/components/admin/admin-sidebar"

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user?.role === "admin")) {
      router.push("/login?redirect=/admin")
    }
  }, [isAuthenticated, loading, router, user])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  // If not authenticated or not admin, don't render anything (will redirect)
  if (!isAuthenticated || !user?.role === "admin") {
    return null
  }

  return (
    <div className="d-flex">
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <main
        className={`admin-content p-4 ${sidebarOpen ? "with-sidebar" : "sidebar-collapsed"}`}
        style={{
          flex: "1 1 auto",
          transition: "margin-left 0.3s ease-in-out",
          marginLeft: sidebarOpen ? "250px" : "70px",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button className="btn btn-sm btn-outline-secondary d-md-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`bi bi-${sidebarOpen ? "x" : "list"}`}></i>
          </button>
        </div>

        {children}
      </main>
    </div>
  )
}
