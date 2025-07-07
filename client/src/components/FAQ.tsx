import React from 'react';

const FAQ: React.FC = () => {
  return (
    <div className="faq-page" style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2>Frequently Asked Questions</h2>
      <div style={{ margin: '1.5rem 0' }}>
        <h4>How do I book a bounce house?</h4>
        <p>Simply browse our collection, select your favorite bounce house, and follow the booking process. You'll receive instant confirmation!</p>
      </div>
      <div style={{ margin: '1.5rem 0' }}>
        <h4>What areas do you serve?</h4>
        <p>We serve the greater local area. Contact us if you have questions about your location.</p>
      </div>
      <div style={{ margin: '1.5rem 0' }}>
        <h4>Is setup and takedown included?</h4>
        <p>Yes! Our team handles delivery, setup, and takedown for your convenience and safety.</p>
      </div>
      <div style={{ margin: '1.5rem 0' }}>
        <h4>What if it rains?</h4>
        <p>If bad weather is forecasted, you can reschedule or cancel your booking at no charge.</p>
      </div>
      <div style={{ margin: '1.5rem 0' }}>
        <h4>How do I contact support?</h4>
        <p>Email us at <a href={`mailto:${process.env.REACT_APP_COMPANY_EMAIL}`}>{process.env.REACT_APP_COMPANY_EMAIL}</a> or call <a href={`tel:${process.env.REACT_APP_COMPANY_PHONE}`}>{process.env.REACT_APP_COMPANY_PHONE}</a>.</p>
      </div>
    </div>
  );
};

export default FAQ; 