'use client';

import { useEffect, useRef } from 'react';
import styles from '../styles/sidebar.css';

export default function SidebarLayout({ children }) {
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleToggle = () => {
      sidebarRef.current.classList.toggle(styles.active);
      contentRef.current.classList.toggle(styles.active);
    };

    const handleClickOutside = (event) => {
      if (
        window.innerWidth < 768 &&
        !sidebarRef.current.contains(event.target) &&
        !toggleRef.current.contains(event.target)
      ) {
        sidebarRef.current.classList.remove(styles.active);
        contentRef.current.classList.remove(styles.active);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        sidebarRef.current.classList.remove(styles.active);
        contentRef.current.classList.remove(styles.active);
      }
    };

    toggleRef.current.addEventListener('click', handleToggle);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      toggleRef.current.removeEventListener('click', handleToggle);
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <button ref={toggleRef} className="btn btn-primary d-md-none position-fixed top-0 start-0 m-2 z-3">
        <i className="bi bi-list"></i>
      </button>

      <div className={`${styles.sidebar} bg-light`} ref={sidebarRef}>
        <div className="d-flex align-items-center mb-3">
          <i className="bi bi-box-seam fs-4 me-2"></i>
          <span className="fs-4">Inventory System</span>
        </div>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <a href="#" className="nav-link active"><i className="bi bi-house me-2"></i> Home</a>
          </li>
          <li><a href="#" className="nav-link link-dark"><i className="bi bi-box me-2"></i> Products</a></li>
          <li><a href="#" className="nav-link link-dark"><i className="bi bi-bag me-2"></i> My Orders</a></li>
          <li>
            <a href="#" className="nav-link link-dark">
              <i className="bi bi-cart me-2"></i> Cart <span className="badge bg-danger rounded-pill ms-2">3</span>
            </a>
          </li>
        </ul>
        <hr />
        <div className="dropdown">
          <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle"
             id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="https://github.com/mdo.png" alt="user" width="32" height="32" className="rounded-circle me-2" />
            <strong>Username</strong>
          </a>
          <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser">
            <li><a className="dropdown-item" href="#">Profile</a></li>
            <li><a className="dropdown-item" href="#">Orders</a></li>
            <li><hr className="dropdown-divider" /></li>
            <li><a className="dropdown-item" href="#">Sign out</a></li>
          </ul>
        </div>
      </div>

      <div className={`${styles.content}`} ref={contentRef}>
        {children}
      </div>
    </>
  );
}
