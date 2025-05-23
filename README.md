# Bounce House Rental System

A modern web application for managing bounce house rentals, built with React and Node.js.

## Features

- Online reservation system
- Real-time availability calendar
- Secure payment processing
- User account management
- Admin dashboard
- Product catalog with detailed specifications
- Customer reviews and ratings
- Automated booking confirmations
- Delivery scheduling system
- Business analytics and reporting

## Tech Stack

- Frontend: React, TypeScript, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT
- Payment Processing: Stripe
- Email Service: SendGrid

## Project Structure

```
bouncehousekidsv2/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── shared/                 # Shared types and utilities
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   - Create `.env` files in both client and server directories
   - Add necessary environment variables (see .env.example files)

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 