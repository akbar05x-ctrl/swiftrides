import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaUpload, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../App';

const API = 'http://localhost:5000/api';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [carForm, setCarForm] = useState({
    name: '',
    price_per_day: '',
    category: '',
    transmission: 'Automatic',
    seats: '5',
    image_url: '',
    status: 'available'
  });
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    fetchStats();
    fetchBookings();
    fetchCars();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/admin/stats`, { 
        headers: { Authorization: `Bearer ${auth.token}` } 
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API}/admin/bookings`, { 
        headers: { Authorization: `Bearer ${auth.token}` } 
      });
      setBookings(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API}/cars`);
      setCars(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.put(`${API}/admin/bookings/${id}/status`, { status }, { 
        headers: { Authorization: `Bearer ${auth.token}` } 
      });
      fetchBookings();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setCarForm({
      name: '',
      price_per_day: '',
      category: '',
      transmission: 'Automatic',
      seats: '5',
      image_url: '',
      status: 'available'
    });
    setSelectedFile(null);
    setImagePreview('');
    setShowCarModal(true);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setCarForm({
      name: car.name,
      price_per_day: car.price_per_day,
      category: car.category,
      transmission: car.transmission,
      seats: car.seats,
      image_url: car.image_url,
      status: car.status
    });
    setSelectedFile(null);
    setImagePreview('');
    setShowCarModal(true);
  };

  const handleDeleteCar = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await axios.delete(`${API}/admin/cars/${id}`, { 
          headers: { Authorization: `Bearer ${auth.token}` } 
        });
        alert('Car deleted successfully!');
        fetchCars();
      } catch (err) {
        alert(err.response?.data?.message || 'Cannot delete car with existing bookings');
      }
    }
  };

  const handleSaveCar = async () => {
    if (!carForm.name || !carForm.price_per_day || !carForm.category) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', carForm.name);
      formData.append('price_per_day', carForm.price_per_day);
      formData.append('category', carForm.category);
      formData.append('transmission', carForm.transmission);
      formData.append('seats', carForm.seats);
      formData.append('status', carForm.status);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (carForm.image_url) {
        formData.append('image_url', carForm.image_url);
      }

      if (editingCar) {
        formData.append('existing_image', carForm.image_url);
        await axios.put(`${API}/admin/cars/${editingCar.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Car updated successfully!');
      } else {
        await axios.post(`${API}/admin/cars`, formData, {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Car added successfully!');
      }
      
      setShowCarModal(false);
      fetchCars();
    } catch (err) {
      console.error('Error:', err);
      alert('Error saving car');
    }
  };

  if (!stats) return <div className="loading">Loading Admin Dashboard...</div>;

  return (
    <div className="admin-page">
      <div className="container">
        <h2>Admin Dashboard</h2>
        
        {/* Admin Tabs */}
        <div className="admin-tabs">
          <button className={activeTab === 'stats' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('stats')}>
            📊 Dashboard
          </button>
          <button className={activeTab === 'cars' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('cars')}>
            🚗 Manage Cars
          </button>
          <button className={activeTab === 'bookings' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('bookings')}>
            📅 All Bookings
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Cars</h3>
              <p>{stats.totalCars}</p>
            </div>
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p>{stats.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>₨ {stats.totalRevenue}</p>
            </div>
          </div>
        )}

        {/* Cars Management Tab */}
        {activeTab === 'cars' && (
          <div className="admin-section">
            <div className="section-header">
              <h3>Car Fleet Management</h3>
              <button onClick={handleAddCar} className="add-btn">
                <FaPlus /> Add New Car
              </button>
            </div>
            
            <div className="cars-table-container">
              <table className="cars-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price/Day</th>
                    <th>Category</th>
                    <th>Transmission</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car.id}>
                      <td>
                        <img 
                          src={car.image_url || 'https://via.placeholder.com/50x50?text=Car'} 
                          alt={car.name} 
                          className="car-thumbnail"
                        />
                      </td>
                      <td><strong>{car.name}</strong></td>
                      <td>₨ {car.price_per_day}</td>
                      <td>{car.category}</td>
                      <td>{car.transmission}</td>
                      <td>{car.seats}</td>
                      <td>
                        <span className={`status ${car.status}`}>{car.status}</span>
                      </td>
                      <td className="action-buttons">
                        <button onClick={() => handleEditCar(car)} className="btn-edit">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDeleteCar(car.id, car.name)} className="btn-delete">
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="admin-section">
            <h3>All Customer Bookings</h3>
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Car</th>
                    <th>Pickup Date</th>
                    <th>Dropoff Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user_name}</td>
                      <td>{booking.car_name}</td>
                      <td>{new Date(booking.start_date).toDateString()}</td>
                      <td>{new Date(booking.end_date).toDateString()}</td>
                      <td>₨ {booking.total_price}</td>
                      <td>
                        <span className={`status ${booking.status}`}>{booking.status}</span>
                      </td>
                      <td>
                        <select 
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)} 
                          value={booking.status}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Car Modal */}
        {showCarModal && (
          <div className="modal-overlay" onClick={() => setShowCarModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
                <button className="modal-close" onClick={() => setShowCarModal(false)}>
                  <FaTimes />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Car Name *</label>
                  <input 
                    type="text" 
                    value={carForm.name} 
                    onChange={e => setCarForm({...carForm, name: e.target.value})} 
                    placeholder="e.g., Toyota Corolla"
                  />
                </div>
                
                <div className="form-group">
                  <label>Price Per Day (PKR) *</label>
                  <input 
                    type="number" 
                    value={carForm.price_per_day} 
                    onChange={e => setCarForm({...carForm, price_per_day: e.target.value})} 
                    placeholder="e.g., 5500"
                  />
                </div>
                
                <div className="form-group">
                  <label>Category *</label>
                  <select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})}>
                    <option value="">Select Category</option>
                    <option value="Economy">Economy</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Transmission</label>
                    <select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})}>
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Seats</label>
                    <select value={carForm.seats} onChange={e => setCarForm({...carForm, seats: e.target.value})}>
                      <option value="2">2 Seats</option>
                      <option value="4">4 Seats</option>
                      <option value="5">5 Seats</option>
                      <option value="7">7 Seats</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Car Image</label>
                  <div className="file-upload-area">
                    <input 
                      type="file" 
                      id="carImage" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => setImagePreview(reader.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="carImage" className="file-upload-label">
                      <FaUpload /> Choose Image from Device
                    </label>
                    <p className="file-hint">Supported: JPG, PNG, GIF (Max 5MB)</p>
                  </div>
                  
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button onClick={() => { setSelectedFile(null); setImagePreview(''); }} className="remove-preview">
                        Remove
                      </button>
                    </div>
                  )}
                  
                  {!imagePreview && carForm.image_url && !selectedFile && (
                    <div className="current-image">
                      <img src={carForm.image_url} alt="Current" />
                      <p>Current picture</p>
                    </div>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select value={carForm.status} onChange={e => setCarForm({...carForm, status: e.target.value})}>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel-modal" onClick={() => setShowCarModal(false)}>
                  Cancel
                </button>
                <button className="btn-save-modal" onClick={handleSaveCar}>
                  {editingCar ? 'Update Car' : 'Add Car'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
