"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-context"
import { useAuth } from "@/components/auth-context"

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState("delivery")

  // Delivery details
  const [address, setAddress] = useState("")
  
  // Pickup details
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/login?redirect=/checkout")
    return null
  }

  
  if (items.length === 0 && !success) {
    router.push("/")
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
      const token = localStorage.getItem("token")
    
      if (!token) {
        setError("You must be logged in to place an order")
        return
      }
    
      // Create a single request with all data
      const checkoutData = {
        products: items.map(item => Number(item.id)),
        method: deliveryMethod,
      }

      console.log("data", checkoutData)
      
      // Add delivery or pickup specific fields
      if (deliveryMethod === "delivery") {
        checkoutData.address = address
      } else {
        checkoutData.pickup_date = pickupDate
        checkoutData.pickup_time = pickupTime
      }
    
      const orderResponse = await fetch(`${BASE_URL}/checkout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutData),
      })
    
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        setError(errorData.detail || "Failed to create order. Please try again.")
        return
      }
    
      // If everything is successful, clear the cart and show success message
      clearCart()
      setSuccess(true)
    } catch (err) {
      console.error("Checkout error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow text-center">
              <div className="card-body p-5">
                <div className="mb-4">
                  <span className="badge bg-success p-3 rounded-circle">
                    <i className="bi bi-check-lg fs-4"></i>
                  </span>
                </div>
                <h2 className="card-title mb-3">Order Successful!</h2>
                <p className="card-text">Thank you for your purchase. Your order has been placed successfully.</p>
                <p className="text-muted mb-4">We've sent a confirmation email to your inbox.</p>
                <button className="btn btn-primary" onClick={() => router.push("/")}>
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4">Checkout</h1>

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Order Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                {/* Delivery Method Selection */}
                <div className="mb-4">
                  <h6 className="mb-3">Choose Delivery Method</h6>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="deliveryMethod"
                      id="deliveryOption"
                      value="delivery"
                      checked={deliveryMethod === "delivery"}
                      onChange={() => setDeliveryMethod("delivery")}
                    />
                    <label className="form-check-label" htmlFor="deliveryOption">
                      Delivery
                    </label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="deliveryMethod"
                      id="pickupOption"
                      value="pickup"
                      checked={deliveryMethod === "pickup"}
                      onChange={() => setDeliveryMethod("pickup")}
                    />
                    <label className="form-check-label" htmlFor="pickupOption">
                      Pickup
                    </label>
                  </div>
                </div>

                {/* Conditional Form Fields Based on Delivery Method */}
                {deliveryMethod === "delivery" ? (
                  <div className="delivery-details">
                    <h6 className="mb-3">Delivery Details</h6>
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        id="address"
                        rows="3"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      ></textarea>
                    </div>


                  </div>
                ) : (
                  <div className="pickup-details">
                    <h6 className="mb-3">Pickup Details</h6>
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      Please select your preferred pickup date and time. Our store is open from 9 AM to 6 PM, Monday to
                      Saturday.
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="pickupDate" className="form-label">
                          Pickup Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="pickupDate"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="pickupTime" className="form-label">
                          Pickup Time
                        </label>
                        <select
                          className="form-select"
                          id="pickupTime"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                          required
                        >
                          <option value="">Select a time</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}


                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {items.map((item) => (
                <div key={item.id} className="d-flex justify-content-between mb-3">
                  <div>
                    <h6 className="mb-0">{item.name}</h6>
                    <small className="text-muted">
                      {item.quantity} x ${item.price}
                    </small>
                  </div>
                  <span className="fw-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {deliveryMethod === "delivery" && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee</span>
                  <span>$5.00</span>
                </div>
              )}

              <div className="d-flex justify-content-between">
                <span className="fw-bold">Total</span>
                <span className="fw-bold">${(totalPrice + (deliveryMethod === "delivery" ? 5 : 0)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
