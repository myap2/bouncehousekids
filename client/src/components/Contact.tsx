import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="contact-page" style={{ maxWidth: 500, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2>Contact Us</h2>
      <p>If you have any questions or need assistance, please reach out to us:</p>
      <div style={{ margin: '1rem 0' }}>
        <strong>Email:</strong> <a href={`mailto:${process.env.REACT_APP_COMPANY_EMAIL}`}>{process.env.REACT_APP_COMPANY_EMAIL}</a>
      </div>
      <div style={{ margin: '1rem 0' }}>
        <strong>Phone:</strong> <a href={`tel:${process.env.REACT_APP_COMPANY_PHONE}`}>{process.env.REACT_APP_COMPANY_PHONE}</a>
      </div>
    </div>
  );
};

export default Contact; 