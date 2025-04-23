"use client"

import { useState } from "react"
import { useCart } from "./cart-context"

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 1500)
  }

  return (
    <div className="card h-100">
      <img
        src={product.image_url || `/placeholder.svg?height=200&width=300`}
        className="card-img-top"
        alt={product.name}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p
          className="card-text text-muted small"
          style={{
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.description}
        </p>
        <div className="mt-auto">
          <p className="fs-5 fw-bold mb-1">${product.price || "0.00"}</p>
          {product.stock > 0 ? (
            <p className="small text-success mb-2">{product.stock} in stock</p>
          ) : (
            <p className="small text-danger mb-2">Out of stock</p>
          )}
          <button
            className={`btn ${isAdded ? "btn-success" : "btn-primary"} w-100`}
            onClick={handleAddToCart}
            disabled={product.stock <= 0 || isAdded}
          >
            {isAdded ? (
              <>
                <i className="bi bi-check me-2"></i>
                Added
              </>
            ) : (
              <>
                <i className="bi bi-cart-plus me-2"></i>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
