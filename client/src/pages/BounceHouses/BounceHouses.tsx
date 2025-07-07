import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { bounceHouseAPI, companyAPI } from '../../services/api';
import './BounceHouses.css';

interface BounceHouse {
  _id: string;
  name: string;
  description: string;
  theme: string;
  dimensions: { length: number; width: number; height: number };
  capacity: { minAge: number; maxAge: number; maxWeight: number; maxOccupants: number };
  price: { daily: number; weekly: number; weekend: number };
  images: string[];
  company: string;
}

function BounceHouses() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [companies, setCompanies] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [bounceHouses, setBounceHouses] = useState<BounceHouse[]>([]);
  const [newBounceHouse, setNewBounceHouse] = useState({
    name: '',
    description: '',
    theme: '',
    dimensions: { length: '', width: '', height: '' },
    capacity: { minAge: '', maxAge: '', maxWeight: '', maxOccupants: '' },
    price: '',
    imageFiles: [] as File[],
    images: [] as string[],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBounceHouses();
  }, []);

  const fetchBounceHouses = async () => {
    try {
      const res = await bounceHouseAPI.getAll();
      setBounceHouses(Array.isArray(res.data.bounceHouses) ? res.data.bounceHouses : []);
    } catch (err) {
      setBounceHouses([]);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      companyAPI.getAll().then(res => {
        setCompanies(res.data);
        if (res.data.length > 0) setSelectedCompany(res.data[0]._id);
      });
    } else if (user?.role === 'company-admin' && user.company) {
      setSelectedCompany(typeof user.company === 'string' ? user.company : user.company._id);
    }
  }, [user]);

  const themes = ['All', 'Princess', 'Superhero', 'Sports', 'Jungle', 'Space'];

  const filteredHouses = bounceHouses.filter(house => {
    const matchesSearch = house.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = selectedTheme === 'All' || selectedTheme === '' || house.theme === selectedTheme;
    return matchesSearch && matchesTheme;
  });

  const handleAddBounceHouse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUploading(true);
    let imageUrls: string[] = [];
    if (newBounceHouse.imageFiles.length > 0) {
      try {
        for (const file of newBounceHouse.imageFiles) {
          const formData = new FormData();
          formData.append('image', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadRes.json();
          imageUrls.push(uploadData.url);
        }
      } catch (err) {
        setError('Failed to upload image(s).');
        setIsUploading(false);
        return;
      }
    }
    try {
      await bounceHouseAPI.create({
        name: newBounceHouse.name,
        description: newBounceHouse.description,
        theme: newBounceHouse.theme,
        dimensions: {
          length: Number(newBounceHouse.dimensions.length),
          width: Number(newBounceHouse.dimensions.width),
          height: Number(newBounceHouse.dimensions.height),
        },
        capacity: {
          minAge: Number(newBounceHouse.capacity.minAge),
          maxAge: Number(newBounceHouse.capacity.maxAge),
          maxWeight: Number(newBounceHouse.capacity.maxWeight),
          maxOccupants: Number(newBounceHouse.capacity.maxOccupants),
        },
        price: { daily: Number(newBounceHouse.price), weekly: 0, weekend: 0 },
        images: imageUrls,
        company: selectedCompany,
      });
      alert('Bounce house created!');
      setShowAddModal(false);
      setNewBounceHouse({
        name: '', description: '', theme: '',
        dimensions: { length: '', width: '', height: '' },
        capacity: { minAge: '', maxAge: '', maxWeight: '', maxOccupants: '' },
        price: '', imageFiles: [], images: []
      });
      fetchBounceHouses();
    } catch (err: any) {
      setError('Failed to create bounce house: ' + (err.response?.data?.message || err.message));
    }
    setIsUploading(false);
  };

  const handleDeleteBounceHouse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    try {
      await bounceHouseAPI.delete(id);
      fetchBounceHouses();
      alert('Bounce house deleted.');
    } catch (err: any) {
      alert('Failed to delete bounce house: ' + (err.response?.data?.message || err.message));
    }
  };

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
        {/* Admin-only: Add Bounce House button */}
        {user && (user.role === 'admin' || user.role === 'company-admin') && (
          <button className="add-bounce-house-btn" onClick={() => setShowAddModal(true)}>
            + Add Bounce House
          </button>
        )}
      </div>

      {/* Add Bounce House Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Bounce House</h2>
            <form onSubmit={handleAddBounceHouse}>
              {/* Company selector for super admin */}
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Company *</label>
                  <select
                    value={selectedCompany}
                    onChange={e => setSelectedCompany(e.target.value)}
                    required
                  >
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Hidden company field for company admin */}
              {user?.role === 'company-admin' && (
                <input type="hidden" value={selectedCompany} />
              )}
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newBounceHouse.name}
                  onChange={e => setNewBounceHouse(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={newBounceHouse.description}
                  onChange={e => setNewBounceHouse(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Theme *</label>
                <input
                  type="text"
                  value={newBounceHouse.theme}
                  onChange={e => setNewBounceHouse(prev => ({ ...prev, theme: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Dimensions (ft) *</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    placeholder="Length"
                    value={newBounceHouse.dimensions.length}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, dimensions: { ...prev.dimensions, length: e.target.value } }))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={newBounceHouse.dimensions.width}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, dimensions: { ...prev.dimensions, width: e.target.value } }))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={newBounceHouse.dimensions.height}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, dimensions: { ...prev.dimensions, height: e.target.value } }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="number"
                    placeholder="Min Age"
                    value={newBounceHouse.capacity.minAge}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, capacity: { ...prev.capacity, minAge: e.target.value } }))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Max Age"
                    value={newBounceHouse.capacity.maxAge}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, capacity: { ...prev.capacity, maxAge: e.target.value } }))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Max Weight (lbs)"
                    value={newBounceHouse.capacity.maxWeight}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, capacity: { ...prev.capacity, maxWeight: e.target.value } }))}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Max Occupants"
                    value={newBounceHouse.capacity.maxOccupants}
                    onChange={e => setNewBounceHouse(prev => ({ ...prev, capacity: { ...prev.capacity, maxOccupants: e.target.value } }))}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Price (per day) *</label>
                <input
                  type="number"
                  value={newBounceHouse.price}
                  onChange={e => setNewBounceHouse(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Images *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setNewBounceHouse(prev => ({ ...prev, imageFiles: Array.from(e.target.files || []) }))}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddModal(false)} disabled={isUploading}>
                  Cancel
                </button>
                <button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bounce-houses-grid">
        {filteredHouses.map(house => (
          <div key={house._id} className="bounce-house-card">
            <Link to={`/bounce-houses/${house._id}`} style={{ display: 'block' }}>
              <div className="bounce-house-image">
                <img src={house.images[0]} alt={house.name} />
              </div>
              <div className="bounce-house-info">
                <h3>{house.name}</h3>
                <p className="theme">{house.theme}</p>
                <p className="capacity">{house.capacity.maxOccupants} kids</p>
                <p className="price">${house.price.daily}/day</p>
              </div>
            </Link>
            {/* Admin-only: Delete button */}
            {user && (user.role === 'admin' || user.role === 'company-admin') && (
              <button
                className="delete-bounce-house-btn"
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteBounceHouse(house._id, house.name);
                }}
                style={{ margin: '0.5rem', color: 'white', background: '#dc3545', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BounceHouses; 