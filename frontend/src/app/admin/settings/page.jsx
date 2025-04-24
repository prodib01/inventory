"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
  });

  const [storeForm, setStoreForm] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    storeCurrency: "USD",
    logo: null,
  });

  const BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken || "");
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchUserSettings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${BASE_URL}/auth/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setProfileForm({
          fullName: data.user.full_name || "",
          email: data.user.email || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStoreSettings = async () => {
      const token = localStorage.getItem("token");

      try {
        const resp = await fetch(`${BASE_URL}/auth/user-shop/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resp.ok) {
          throw new Error(`Error: ${resp.statusText}`);
        }
        const data = await resp.json();
        console.log("Store data:", data);
        setStoreForm({
          storeName: data.name || "",
          storeEmail: data.email || "",
          storePhone: data.contact || "",
          storeAddress: data.address || "",
          storeCurrency: data.currency || "USD",
          logo: `${BASE_URL}/${data.logo}` || "",
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStoreSettings();

    fetchUserSettings();
  }, [token, BASE_URL]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  const handleStoreChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo" && files && files[0]) {
      setStoreForm({
        ...storeForm,
        logo: files[0],
      });
    } else {
      setStoreForm({
        ...storeForm,
        [name]: value,
      });
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      let formData = new FormData();
      let endpoint = "";

      switch (activeTab) {
        case "profile":
          formData.append("full_name", profileForm.fullName);
          formData.append("email", profileForm.email);
          endpoint = "/auth/profile/";
          break;
        case "store":
          formData.append("store_name", storeForm.storeName);
          formData.append("store_email", storeForm.storeEmail);
          formData.append("store_phone", storeForm.storePhone);
          formData.append("store_address", storeForm.storeAddress);
          formData.append("store_currency", storeForm.storeCurrency);

          if (storeForm.logoFile) {
            // Note: we use the 'logoFile' property instead of 'logo'
            formData.append("logo", storeForm.logoFile);
          }
          endpoint = "/auth/user-shop/";
          break;
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
      

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
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
                className={`list-group-item list-group-item-action ${
                  activeTab === "profile" ? "active" : ""
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="bi bi-person me-2"></i> Profile
              </button>
              <button
                className={`list-group-item list-group-item-action ${
                  activeTab === "store" ? "active" : ""
                }`}
                onClick={() => setActiveTab("store")}
              >
                <i className="bi bi-shop me-2"></i> Store
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
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
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
                  <div className="d-flex flex-column align-items-center mb-4">
                    <label htmlFor="storeLogo" style={{ cursor: "pointer" }}>
                      <div
                        className="rounded-circle bg-light d-flex justify-content-center align-items-center overflow-hidden"
                        style={{
                          width: "100px",
                          height: "100px",
                          border: "2px dashed #ccc",
                        }}
                      >
                        {storeForm.logo ? (
                          <img
                            src={storeForm.logo}
                            alt="Store Logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span className="text-muted">Upload Logo</span>
                        )}
                      </div>
                    </label>
                    <input
                      type="file"
                      id="storeLogo"
                      name="storeLogo"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageUrl = URL.createObjectURL(file);
                          setStoreForm((prev) => ({
                            ...prev,
                            logo: imageUrl,
                            logoFile: file,
                          }));
                        }
                      }}
                    />
                  </div>

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
                  </div>

                  <div className="mt-4 d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSaving}
                    >
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
  );
}
