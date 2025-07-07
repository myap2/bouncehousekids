import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">{process.env.REACT_APP_APP_NAME}</Link>
        </div>
        <div className="nav-links">
          <Link to="/bounce-houses">Bounce Houses</Link>
          {token && <Link to="/bookings">My Bookings</Link>}
          {token && user?.role === 'admin' && <Link to="/admin">Admin</Link>}
          {token ? (
            <div className="user-menu">
              <span className="user-name">Welcome, {user?.firstName || 'User'}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: {process.env.REACT_APP_COMPANY_EMAIL}</p>
            <p>Phone: {process.env.REACT_APP_COMPANY_PHONE}</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/about">About Us</Link>
            <Link to="/waiver">Waiver</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
