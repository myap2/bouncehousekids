import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home">
      <section className="hero" style={{ background: 'linear-gradient(45deg, #007bff, #00bcd4)' }}>
        <div className="hero-content">
          <h1>Welcome to Bounce House Kids</h1>
          <p>Make your next event unforgettable with our premium bounce house rentals!</p>
          <Link to="/bounce-houses" className="hero-button">
            Browse Our Collection
          </Link>
        </div>
      </section>

      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Premium Quality</h3>
            <p>
              Our bounce houses are made with the highest quality materials and regularly
              maintained.
            </p>
          </div>
          <div className="feature-card">
            <h3>Easy Booking</h3>
            <p>Simple online booking process with instant confirmation.</p>
          </div>
          <div className="feature-card">
            <h3>Delivery & Setup</h3>
            <p>We handle delivery, setup, and takedown for your convenience.</p>
          </div>
          <div className="feature-card">
            <h3>Safety First</h3>
            <p>All our equipment meets safety standards and is regularly inspected.</p>
          </div>
        </div>
      </section>

      <section className="featured-bounce-houses">
        <h2>Featured Bounce Houses</h2>
        <div className="bounce-houses-grid">
          {/* This will be populated with actual data later */}
          <div className="bounce-house-card">
            <div className="bounce-house-image placeholder"></div>
            <h3>Princess Castle</h3>
            <p>Perfect for princess-themed parties</p>
            <Link to="/bounce-houses/princess-castle" className="view-details">
              View Details
            </Link>
          </div>
          <div className="bounce-house-card">
            <div className="bounce-house-image placeholder"></div>
            <h3>Superhero Arena</h3>
            <p>Action-packed fun for superhero parties</p>
            <Link to="/bounce-houses/superhero-arena" className="view-details">
              View Details
            </Link>
          </div>
          <div className="bounce-house-card">
            <div className="bounce-house-image placeholder"></div>
            <h3>Jungle Adventure</h3>
            <p>Wild fun for animal-themed parties</p>
            <Link to="/bounce-houses/jungle-adventure" className="view-details">
              View Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
