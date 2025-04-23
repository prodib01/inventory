"use client"

import { useCart } from "./cart-context"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  const handleCheckout = () => {
    if (isAuthenticated) {
      router.push("/checkout")
    } else {
      router.push("/login?redirect=/checkout")
    }
    closeCart()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
        style={{ zIndex: 1040 }}
        onClick={closeCart}
      ></div>

      {/* Offcanvas */}
      <div
        className="offcanvas offcanvas-end show"
        tabIndex="-1"
        style={{ zIndex: 1045, width: "100%", maxWidth: "400px" }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">
            <i className="bi bi-cart me-2"></i>
            Your Cart ({totalItems})
          </h5>
          <button type="button" className="btn-close" onClick={closeCart} aria-label="Close"></button>
        </div>

        <div className="offcanvas-body">
          {items.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart text-muted" style={{ fontSize: "3rem" }}></i>
              <p className="text-muted mt-3">Your cart is empty</p>
              <button className="btn btn-outline-primary mt-3" onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {items.map((item) => (
                <li key={item.id} className="list-group-item py-3 px-0">
                  <div className="row">
                    <div className="col-3">
                      <img
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.name}
                        className="img-fluid rounded"
                        style={{ height: "64px", width: "64px", objectFit: "cover" }}
                      />
                    </div>
                    <div className="col-9">
                      <div className="d-flex justify-content-between">
                        <h6 className="mb-0">{item.name}</h6>
                        <p className="mb-0 fw-bold">${(item.price * item.quantity)}</p>
                      </div>
                      <p className="text-muted small mb-2">${item.price} each</p>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="input-group input-group-sm" style={{ width: "120px" }}>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="input-group-text bg-white text-center" style={{ width: "40px" }}>
                            {item.quantity}
                          </span>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>

                        <button className="btn btn-sm text-danger" onClick={() => removeFromCart(item.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="offcanvas-footer border-top p-3">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>${totalPrice}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="fw-bold">Total</span>
              <span className="fw-bold">${totalPrice}</span>
            </div>
            <button className="btn btn-primary w-100" onClick={handleCheckout}>
              {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
