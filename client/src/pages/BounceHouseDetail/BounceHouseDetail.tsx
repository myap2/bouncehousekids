import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import 'react-calendar/dist/Calendar.css';
import BookingForm from '../../components/BookingForm/BookingForm';
import './BounceHouseDetail.css';

interface BounceHouse {
  id: string;
  name: string;
  theme: string;
  capacity: number;
  price: number;
  dimensions: string;
  ageRange: string;
  description: string;
  features: string[];
  images: string[];
  reviews: Review[];
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

// Mock data - will be replaced with API call
const mockBounceHouse: BounceHouse = {
  id: '1',
  name: 'Princess Castle',
  theme: 'Princess',
  capacity: 8,
  price: 299,
  dimensions: '15x15x12',
  ageRange: '3-12',
  description: 'A magical princess castle bounce house perfect for your little princess\'s special day. Features towers, slides, and plenty of space for royal fun!',
  features: [
    'Twin slides',
    'Ball pit',
    'Climbing wall',
    'Mesh windows for supervision',
    'Blower included',
    'Setup and takedown service'
  ],
  images: [
    'https://placehold.co/600x400/007bff/ffffff?text=Princess+Castle+1',
    'https://placehold.co/600x400/007bff/ffffff?text=Princess+Castle+2',
    'https://placehold.co/600x400/007bff/ffffff?text=Princess+Castle+3',
    'https://placehold.co/600x400/007bff/ffffff?text=Princess+Castle+4'
  ],
  reviews: [
    {
      id: '1',
      userName: 'Sarah M.',
      rating: 5,
      comment: 'Perfect for my daughter\'s birthday party! The kids had a blast.',
      date: '2024-02-15'
    },
    {
      id: '2',
      userName: 'John D.',
      rating: 4,
      comment: 'Great quality and easy setup. Would rent again!',
      date: '2024-02-10'
    }
  ]
};

const BounceHouseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Mock unavailable dates - will be replaced with API call
  const unavailableDates = [
    new Date(2024, 2, 15),
    new Date(2024, 2, 16),
    new Date(2024, 2, 20)
  ];

  const handleDateSelect = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingSubmit = async (bookingData: any) => {
    // TODO: Implement API call to submit booking
    console.log('Booking data:', bookingData);
    // For now, just close the modal
    setIsBookingModalOpen(false);
  };

  const tileDisabled = ({ date }: { date: Date }) => {
    return unavailableDates.some(
      unavailableDate =>
        date.getDate() === unavailableDate.getDate() &&
        date.getMonth() === unavailableDate.getMonth() &&
        date.getFullYear() === unavailableDate.getFullYear()
    );
  };

  return (
    <div className="bounce-house-detail">
      <div className="image-gallery">
        <div className="main-image">
          <img src={mockBounceHouse.images[selectedImage]} alt={mockBounceHouse.name} />
        </div>
        <div className="thumbnail-list">
          {mockBounceHouse.images.map((image, index) => (
            <div
              key={index}
              className={`thumbnail ${selectedImage === index ? 'selected' : ''}`}
              onClick={() => setSelectedImage(index)}
            >
              <img src={image} alt={`${mockBounceHouse.name} ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="details-section">
        <h1>{mockBounceHouse.name}</h1>
        <div className="price-tag">${mockBounceHouse.price}/day</div>
        
        <div className="key-details">
          <div className="detail-item">
            <span className="label">Theme:</span>
            <span className="value">{mockBounceHouse.theme}</span>
          </div>
          <div className="detail-item">
            <span className="label">Capacity:</span>
            <span className="value">{mockBounceHouse.capacity} kids</span>
          </div>
          <div className="detail-item">
            <span className="label">Dimensions:</span>
            <span className="value">{mockBounceHouse.dimensions}</span>
          </div>
          <div className="detail-item">
            <span className="label">Age Range:</span>
            <span className="value">{mockBounceHouse.ageRange} years</span>
          </div>
        </div>

        <div className="description">
          <h2>Description</h2>
          <p>{mockBounceHouse.description}</p>
        </div>

        <div className="features">
          <h2>Features</h2>
          <ul>
            {mockBounceHouse.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="booking-section">
          <h2>Check Availability</h2>
          <Calendar
            onChange={handleDateSelect}
            value={selectedDate}
            tileDisabled={tileDisabled}
            minDate={new Date()}
            className="booking-calendar"
          />
        </div>

        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-list">
            {mockBounceHouse.reviews.map(review => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="reviewer-name">{review.userName}</span>
                  <div className="rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-date">{review.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isBookingModalOpen && selectedDate && (
        <div className="booking-modal">
          <div className="modal-content">
            <BookingForm
              bounceHouseName={mockBounceHouse.name}
              price={mockBounceHouse.price}
              selectedDate={selectedDate}
              onCancel={() => setIsBookingModalOpen(false)}
              onSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BounceHouseDetail; 