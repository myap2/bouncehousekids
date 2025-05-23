import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import BounceHouses from './pages/BounceHouses/BounceHouses';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import BounceHouseDetail from './pages/BounceHouseDetail/BounceHouseDetail';

// Placeholder components - we'll create these next
const Bookings = () => <div>Bookings Page</div>;

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bounce-houses" element={<BounceHouses />} />
            <Route path="/bounce-houses/:id" element={<BounceHouseDetail />} />
            <Route path="/bookings" element={<Bookings />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App; 