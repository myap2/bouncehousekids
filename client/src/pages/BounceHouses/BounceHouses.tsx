import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './BounceHouses.css';

interface BounceHouse {
  id: number;
  name: string;
  theme: string;
  capacity: string;
  price: number;
  image: string;
}

// Mock data - replace with API call
const bounceHouses: BounceHouse[] = [
  {
    id: 1,
    name: 'Princess Castle',
    theme: 'Princess',
    capacity: '10-15 kids',
    price: 299,
    image: 'https://example.com/princess-castle.jpg'
  },
  {
    id: 2,
    name: 'Superhero Arena',
    theme: 'Superhero',
    capacity: '12-18 kids',
    price: 349,
    image: 'https://example.com/superhero-arena.jpg'
  },
  // Add more bounce houses...
];

function BounceHouses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  const themes = ['All', 'Princess', 'Superhero', 'Sports', 'Jungle', 'Space'];

  const filteredHouses = bounceHouses.filter(house => {
    const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = selectedTheme === 'All' || selectedTheme === '' || house.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  return (
    <div className="bounce-houses">
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search bounce houses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="theme-filters">
          {themes.map(theme => (
            <button
              key={theme}
              className={`theme-button ${selectedTheme === theme ? 'active' : ''}`}
              onClick={() => setSelectedTheme(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div className="bounce-houses-grid">
        {filteredHouses.map(house => (
          <Link to={`/bounce-houses/${house.id}`} key={house.id} className="bounce-house-card">
            <div className="bounce-house-image">
              <img src={house.image} alt={house.name} />
            </div>
            <div className="bounce-house-info">
              <h3>{house.name}</h3>
              <p className="theme">{house.theme}</p>
              <p className="capacity">{house.capacity}</p>
              <p className="price">${house.price}/day</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BounceHouses; 