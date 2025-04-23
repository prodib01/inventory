"use client" // This directive ensures that this file is treated as a client-side component

import { useState, useEffect } from "react"
import Link from "next/link"
import { Line } from "react-chartjs-2"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement } from "chart.js"

// Register required Chart.js components
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement)

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockItems: 0,
    totalProducts: 0,
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [salesDistributionData, setSalesDistributionData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  })
  const [salesOverviewData, setSalesOverviewData] = useState({
    labels: [], // Months (formatted as "Month Year")
    datasets: [
      {
        label: "Total Sales",
        data: [], // Aggregated sales for each month
        fill: false,
        borderColor: "#4bc0c0", // Line color
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, ordersRes, salesDistributionRes] = await Promise.all([
          fetch(`${BASE_URL}/auth/stats/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${BASE_URL}/auth/recent-orders/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${BASE_URL}/auth/sales-distribution/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!statsRes.ok || !ordersRes.ok || !salesDistributionRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        const salesDistributionData = await salesDistributionRes.json();

        console.log("Stats Data:", statsData);
        console.log("Orders Data:", ordersData);
        console.log("Sales Distribution Data:", salesDistributionData);

        setStats({
          ...statsData,
        });
        setRecentOrders(ordersData);

        const categories = Object.keys(salesDistributionData);
        const data = categories.map((category) => salesDistributionData[category]);
        const backgroundColor = [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#FF9F40", "#FF9F80", "#FF6347"
        ];

        setSalesDistributionData({
          labels: categories,
          datasets: [{ data, backgroundColor, hoverOffset: 4 }],
        });

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchSalesOverviewData = async () => {
      try {
        const token = localStorage.getItem("token");

        const ordersRes = await fetch(`${BASE_URL}/all-orders/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ordersRes.ok) {
          throw new Error("Failed to fetch order data");
        }

        const ordersData = await ordersRes.json();
        console.log("Orders Data:", ordersData);

        // Process the data to aggregate total sales by month
        const monthlySales = {};

        ordersData.forEach((order) => {
          const orderDate = new Date(order.created_at);
          const yearMonth = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`; // Format as "MM/YYYY"

          if (!monthlySales[yearMonth]) {
            monthlySales[yearMonth] = 0;
          }
          monthlySales[yearMonth] += parseFloat(order.total_price); // Add the sales to the month
        });

        // Format labels (months)
        const labels = Object.keys(monthlySales).sort(); // Sort the months chronologically
        const data = labels.map((month) => monthlySales[month]); // Total sales for each month

        // Set the chart data
        setSalesOverviewData({
          labels,
          datasets: [
            {
              label: "Total Sales",
              data,
              fill: false,
              borderColor: "#4bc0c0", // Line color
              tension: 0.1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching sales overview data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesOverviewData();
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




  return (
    <div>
      <h1 className="h3 mb-4">Dashboard</h1>

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
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Sales Overview</h5>
            </div>
            <div className="card-body">
              {/* Line Chart for Sales Overview */}
              <div className="text-center p-5 bg-light rounded">
                <Line data={salesOverviewData} />
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
              {/* Pie Chart for Sales Distribution */}
              <div className="text-center p-5 bg-light rounded">
                <Pie data={salesDistributionData} />
              </div>
            </div>
          </div>
        </div>
      </div>

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
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.customer}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.total.toFixed(2)}</td>
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
