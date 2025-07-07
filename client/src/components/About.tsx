import React from 'react';

const About: React.FC = () => {
  return (
    <div className="about-page" style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2>About Us</h2>
      <p><strong>{process.env.REACT_APP_COMPANY_NAME}</strong> is dedicated to making your events unforgettable with safe, high-quality bounce house rentals and exceptional customer service.</p>
      <p>Our mission is to bring joy and excitement to families and communities by providing fun, safe, and clean inflatables for every occasion.</p>
      <p>We handle delivery, setup, and takedown, so you can focus on enjoying your event. Our team is fully trained and committed to safety and satisfaction.</p>
      <div style={{ margin: '1.5rem 0' }}>
        <strong>Contact:</strong><br />
        Email: <a href={`mailto:${process.env.REACT_APP_COMPANY_EMAIL}`}>{process.env.REACT_APP_COMPANY_EMAIL}</a><br />
        Phone: <a href={`tel:${process.env.REACT_APP_COMPANY_PHONE}`}>{process.env.REACT_APP_COMPANY_PHONE}</a>
      </div>
    </div>
  );
};

export default About; 