"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          console.error("Authorization token is missing.")
          return
        }

        const response = await fetch(`${BASE_URL}/products/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,  
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }

        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle delete action
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token")
        
        if (!token) {
          alert("Authorization token missing!")
          return
        }

        const response = await fetch(`${BASE_URL}/products/${id}/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to delete product")
        }

        // Remove the product from the local state
        setProducts(products.filter((product) => product.id !== id))
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  // Handle update (this is just an example for now)
  const handleUpdate = async (id, updatedProductData) => {
    try {
      const token = localStorage.getItem("token")
      
      if (!token) {
        alert("Authorization token missing!")
        return
      }

      const response = await fetch(`${BASE_URL}/products/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProductData),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      // Assuming the response contains the updated product data
      const updatedProduct = await response.json()
      
      // Update the product in the local state
      setProducts(
        products.map((product) => (product.id === id ? updatedProduct : product))
      )
    } catch (error) {
      console.error("Error updating product:", error)
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary">
          <i className="bi bi-plus-lg me-1"></i> Add Product
        </Link>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end">
              <select className="form-select w-auto">
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
              </select>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>${product.price}</td>
                    <td>
                      <span
                        className={`badge ${
                          product.quantity > 20 ? "bg-success" : product.quantity > 10 ? "bg-warning" : "bg-danger"
                        }`}
                      >
                        {product.quantity}
                      </span>
                    </td>
                    <td>{product.category.name}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <Link href={`/admin/products/${product.id}`} className="btn btn-outline-primary">
                          <i className="bi bi-pencil"></i>
                        </Link>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(product.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <p className="mb-0 text-muted">No products found</p>
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
              Showing {filteredProducts.length} of {products.length} products
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
                    3
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
