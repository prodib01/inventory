"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminSettings() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState("")

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
  })

  const [storeForm, setStoreForm] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    storeCity: "",
    storeState: "",
    storeZip: "",
    storeCountry: "",
    storeCurrency: "USD",
    storeTimeZone: "UTC",
  })

  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: true,
    orderUpdates: true,
    marketingEmails: false,
    stockAlerts: true,
  })

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
  })

  const [integrationForm, setIntegrationForm] = useState({
    apiKey: "",
    webhookUrl: "",
    enableShipping: false,
    enablePayment: false,
    enableInventory: false,
  })

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

  useEffect(() => {
    // Safely access localStorage after component mount
    const storedToken = localStorage.getItem("token")
    setToken(storedToken || "")
  }, [])

  useEffect(() => {
    if (!token) return

    const fetchUserSettings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // In a real app, you would fetch actual settings from your API
        const response = await fetch(`${BASE_URL}/user-settings/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const data = await response.json()

        // Populate form states with fetched data
        // This is a placeholder - adjust according to your actual API response
        setProfileForm({
          fullName: data.full_name || "",
          email: data.email || "",
        })

        setStoreForm({
          storeName: data.store?.name || "",
          storeEmail: data.store?.email || "",
          storePhone: data.store?.phone || "",
          storeAddress: data.store?.address || "",
          storeCity: data.store?.city || "",
          storeState: data.store?.state || "",
          storeZip: data.store?.zip || "",
          storeCountry: data.store?.country || "",
          storeCurrency: data.store?.currency || "USD",
          storeTimeZone: data.store?.timezone || "UTC",
        })

        setNotificationForm({
          emailNotifications: data.notifications?.email_enabled ?? true,
          orderUpdates: data.notifications?.order_updates ?? true,
          marketingEmails: data.notifications?.marketing ?? false,
          stockAlerts: data.notifications?.stock_alerts ?? true,
        })

        setIntegrationForm({
          apiKey: data.integrations?.api_key || "",
          webhookUrl: data.integrations?.webhook_url || "",
          enableShipping: data.integrations?.shipping_enabled ?? false,
          enablePayment: data.integrations?.payment_enabled ?? false,
          enableInventory: data.integrations?.inventory_enabled ?? false,
        })
      } catch (err) {
        setError(err.message)
        // For demo purposes, set some default values
        setProfileForm({
          fullName: "John",
          email: "john.doe@example.com",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserSettings()
  }, [token, BASE_URL])

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target

    if (name === "avatar" && files && files[0]) {
      setProfileForm({
        ...profileForm,
        avatar: files[0],
      })
    } else {
      setProfileForm({
        ...profileForm,
        [name]: value,
      })
    }
  }

  const handleStoreChange = (e) => {
    const { name, value } = e.target
    setStoreForm({
      ...storeForm,
      [name]: value,
    })
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationForm({
      ...notificationForm,
      [name]: checked,
    })
  }

  const handleSecurityChange = (e) => {
    const { name, value, checked, type } = e.target
    setSecurityForm({
      ...securityForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleIntegrationChange = (e) => {
    const { name, value, checked, type } = e.target
    setIntegrationForm({
      ...integrationForm,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    setError(null)

    try {
      // Determine which form to save based on active tab
      let formData = {}
      let endpoint = ""

      switch (activeTab) {
        case "profile":
          formData = {
            full_name: profileForm.fullName,
            email: profileForm.email,
          }
          endpoint = "/user-profile/"
          break
        case "store":
          formData = {
            store: {
              name: storeForm.storeName,
              email: storeForm.storeEmail,
              phone: storeForm.storePhone,
              address: storeForm.storeAddress,
              city: storeForm.storeCity,
              state: storeForm.storeState,
              zip: storeForm.storeZip,
              country: storeForm.storeCountry,
              currency: storeForm.storeCurrency,
              timezone: storeForm.storeTimeZone,
            },
          }
          endpoint = "/store-settings/"
          break
        case "notifications":
          formData = {
            notifications: {
              email_enabled: notificationForm.emailNotifications,
              order_updates: notificationForm.orderUpdates,
              marketing: notificationForm.marketingEmails,
              stock_alerts: notificationForm.stockAlerts,
            },
          }
          endpoint = "/notification-settings/"
          break
        case "security":
          // Only include password fields if they're filled
          if (securityForm.currentPassword && securityForm.newPassword) {
            if (securityForm.newPassword !== securityForm.confirmPassword) {
              throw new Error("New passwords do not match")
            }
            formData = {
              current_password: securityForm.currentPassword,
              new_password: securityForm.newPassword,
            }
          }
          formData.two_factor_enabled = securityForm.twoFactorEnabled
          endpoint = "/security-settings/"
          break
        case "integrations":
          formData = {
            integrations: {
              api_key: integrationForm.apiKey,
              webhook_url: integrationForm.webhookUrl,
              shipping_enabled: integrationForm.enableShipping,
              payment_enabled: integrationForm.enablePayment,
              inventory_enabled: integrationForm.enableInventory,
            },
          }
          endpoint = "/integration-settings/"
          break
      }

      // In a real app, you would send this data to your API
      console.log("Saving settings:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For a real implementation, uncomment this:
      /*
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      */

      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
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
        <h1 className="h3 mb-0">Settings</h1>
      </div>

      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="bi bi-person me-2"></i> Profile
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "store" ? "active" : ""}`}
                onClick={() => setActiveTab("store")}
              >
                <i className="bi bi-shop me-2"></i> Store
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="bi bi-bell me-2"></i> Notifications
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "security" ? "active" : ""}`}
                onClick={() => setActiveTab("security")}
              >
                <i className="bi bi-shield-lock me-2"></i> Security
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "integrations" ? "active" : ""}`}
                onClick={() => setActiveTab("integrations")}
              >
                <i className="bi bi-puzzle me-2"></i> Integrations
              </button>
            </div>
            <div className="card-footer bg-white">
              <button className="btn btn-outline-danger btn-sm w-100" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="alert alert-success" role="alert">
              Settings saved successfully!
            </div>
          )}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <form onSubmit={handleSaveSettings}>
                  <h5 className="mb-4">Profile Settings</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="fullName" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        name="fullName"
                        value={profileForm.fullName}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Store Settings */}
              {activeTab === "store" && (
                <form onSubmit={handleSaveSettings}>
                  <h5 className="mb-4">Store Settings</h5>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="storeName" className="form-label">
                        Store Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="storeName"
                        name="storeName"
                        value={storeForm.storeName}
                        onChange={handleStoreChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="storeEmail" className="form-label">
                        Store Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="storeEmail"
                        name="storeEmail"
                        value={storeForm.storeEmail}
                        onChange={handleStoreChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="storePhone" className="form-label">
                        Store Phone
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        id="storePhone"
                        name="storePhone"
                        value={storeForm.storePhone}
                        onChange={handleStoreChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="storeCurrency" className="form-label">
                        Currency
                      </label>
                      <select
                        className="form-select"
                        id="storeCurrency"
                        name="storeCurrency"
                        value={storeForm.storeCurrency}
                        onChange={handleStoreChange}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="storeTimeZone" className="form-label">
                        Time Zone
                      </label>
                      <select
                        className="form-select"
                        id="storeTimeZone"
                        name="storeTimeZone"
                        value={storeForm.storeTimeZone}
                        onChange={handleStoreChange}
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label htmlFor="storeAddress" className="form-label">
                        Address
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="storeAddress"
                        name="storeAddress"
                        value={storeForm.storeAddress}
                        onChange={handleStoreChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="storeCity" className="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="storeCity"
                        name="storeCity"
                        value={storeForm.storeCity}
                        onChange={handleStoreChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label htmlFor="storeState" className="form-label">
                        State/Province
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="storeState"
                        name="storeState"
                        value={storeForm.storeState}
                        onChange={handleStoreChange}
                      />
                    </div>
                    <div className="col-md-2">
                      <label htmlFor="storeZip" className="form-label">
                        Zip/Postal
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="storeZip"
                        name="storeZip"
                        value={storeForm.storeZip}
                        onChange={handleStoreChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="storeCountry" className="form-label">
                        Country
                      </label>
                      <select
                        className="form-select"
                        id="storeCountry"
                        name="storeCountry"
                        value={storeForm.storeCountry}
                        onChange={handleStoreChange}
                      >
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <form onSubmit={handleSaveSettings}>
                  <h5 className="mb-4">Notification Settings</h5>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={notificationForm.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="emailNotifications">
                      Email Notifications
                    </label>
                    <div className="text-muted small">Receive email notifications for important updates</div>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="orderUpdates"
                      name="orderUpdates"
                      checked={notificationForm.orderUpdates}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="orderUpdates">
                      Order Updates
                    </label>
                    <div className="text-muted small">Receive notifications when orders are placed or updated</div>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="marketingEmails"
                      name="marketingEmails"
                      checked={notificationForm.marketingEmails}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="marketingEmails">
                      Marketing Emails
                    </label>
                    <div className="text-muted small">Receive promotional emails and special offers</div>
                  </div>

                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="stockAlerts"
                      name="stockAlerts"
                      checked={notificationForm.stockAlerts}
                      onChange={handleNotificationChange}
                    />
                    <label className="form-check-label" htmlFor="stockAlerts">
                      Stock Alerts
                    </label>
                    <div className="text-muted small">Receive notifications when products are low in stock</div>
                  </div>

                  <div className="mt-4 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <form onSubmit={handleSaveSettings}>
                  <h5 className="mb-4">Security Settings</h5>

                  <div className="mb-4">
                    <h6>Change Password</h6>
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label htmlFor="currentPassword" className="form-label">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="currentPassword"
                          name="currentPassword"
                          value={securityForm.currentPassword}
                          onChange={handleSecurityChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          name="newPassword"
                          value={securityForm.newPassword}
                          onChange={handleSecurityChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={securityForm.confirmPassword}
                          onChange={handleSecurityChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Two-Factor Authentication</h6>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="twoFactorEnabled"
                        name="twoFactorEnabled"
                        checked={securityForm.twoFactorEnabled}
                        onChange={handleSecurityChange}
                      />
                      <label className="form-check-label" htmlFor="twoFactorEnabled">
                        Enable Two-Factor Authentication
                      </label>
                      <div className="text-muted small">Add an extra layer of security to your account</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Session Management</h6>
                    <p className="text-muted small">You're currently logged in on this device.</p>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                      Log Out of All Devices
                    </button>
                  </div>

                  <div className="mt-4 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Integration Settings */}
              {activeTab === "integrations" && (
                <form onSubmit={handleSaveSettings}>
                  <h5 className="mb-4">Integration Settings</h5>

                  <div className="mb-4">
                    <h6>API Access</h6>
                    <div className="row g-3">
                      <div className="col-md-12">
                        <label htmlFor="apiKey" className="form-label">
                          API Key
                        </label>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="apiKey"
                            name="apiKey"
                            value={integrationForm.apiKey}
                            onChange={handleIntegrationChange}
                            readOnly
                          />
                          <button className="btn btn-outline-secondary" type="button">
                            Regenerate
                          </button>
                        </div>
                        <div className="text-muted small mt-1">
                          Keep this key secret. It provides full access to your account.
                        </div>
                      </div>
                      <div className="col-md-12">
                        <label htmlFor="webhookUrl" className="form-label">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          className="form-control"
                          id="webhookUrl"
                          name="webhookUrl"
                          value={integrationForm.webhookUrl}
                          onChange={handleIntegrationChange}
                          placeholder="https://"
                        />
                        <div className="text-muted small mt-1">We'll send order updates to this URL</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6>Third-Party Services</h6>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enableShipping"
                        name="enableShipping"
                        checked={integrationForm.enableShipping}
                        onChange={handleIntegrationChange}
                      />
                      <label className="form-check-label" htmlFor="enableShipping">
                        Enable Shipping Integration
                      </label>
                      <div className="text-muted small">
                        Connect with shipping providers for real-time rates and tracking
                      </div>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enablePayment"
                        name="enablePayment"
                        checked={integrationForm.enablePayment}
                        onChange={handleIntegrationChange}
                      />
                      <label className="form-check-label" htmlFor="enablePayment">
                        Enable Payment Integration
                      </label>
                      <div className="text-muted small">Connect with payment processors for seamless transactions</div>
                    </div>
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enableInventory"
                        name="enableInventory"
                        checked={integrationForm.enableInventory}
                        onChange={handleIntegrationChange}
                      />
                      <label className="form-check-label" htmlFor="enableInventory">
                        Enable Inventory Integration
                      </label>
                      <div className="text-muted small">
                        Connect with inventory management systems for stock synchronization
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
