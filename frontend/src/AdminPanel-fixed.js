// Replace your existing AdminPanel function with this one
function AdminPanel() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [cars, setCars] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [carForm, setCarForm] = useState({
        name: '', price_per_day: '', category: '', 
        transmission: 'Automatic', seats: '5', 
        image_url: '', status: 'available'
    });
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    // Check if token exists and is valid
    useEffect(() => {
        if (!auth.token) {
            navigate('/login');
            return;
        }
        fetchStats();
        fetchBookings();
        fetchCars();
    }, [auth.token]);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API}/admin/stats`, { 
                headers: { Authorization: `Bearer ${auth.token}` } 
            });
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
    };
    
    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${API}/admin/bookings`, { 
                headers: { Authorization: `Bearer ${auth.token}` } 
            });
            setBookings(res.data);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        }
    };
    
    const fetchCars = async () => {
        try {
            const res = await axios.get(`${API}/cars`);
            setCars(res.data);
        } catch (err) {
            console.error('Error fetching cars:', err);
        }
    };
    
    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API}/admin/bookings/${id}/status`, { status }, { 
                headers: { Authorization: `Bearer ${auth.token}` } 
            });
            fetchBookings();
            alert('Status updated successfully!');
        } catch (err) {
            alert('Failed to update status');
        }
    };
    
    const openAddModal = () => {
        setEditingCar(null);
        setCarForm({ name: '', price_per_day: '', category: '', transmission: 'Automatic', seats: '5', image_url: '', status: 'available' });
        setShowModal(true);
    };
    
    const openEditModal = (car) => {
        setEditingCar(car);
        setCarForm(car);
        setShowModal(true);
    };
    
    const deleteCar = async (id, name) => {
        if (window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
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
    
    const saveCar = async () => {
        if (!carForm.name || !carForm.price_per_day || !carForm.category) {
            alert('Please fill all required fields');
            return;
        }
        try {
            if (editingCar) {
                await axios.put(`${API}/admin/cars/${editingCar.id}`, carForm, { 
                    headers: { Authorization: `Bearer ${auth.token}` } 
                });
                alert('Car updated successfully!');
            } else {
                await axios.post(`${API}/admin/cars`, carForm, { 
                    headers: { Authorization: `Bearer ${auth.token}` } 
                });
                alert('Car added successfully!');
            }
            setShowModal(false);
            fetchCars();
        } catch (err) {
            console.error('Error saving car:', err);
            alert('Error saving car. Please check console for details.');
        }
    };

    if (!stats) return <div className="loading">Loading Admin Dashboard...</div>;

    return (
        <div className="admin-page">
            <div className="container">
                <h2>Admin Dashboard</h2>
                <div className="admin-tabs">
                    <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>📊 Stats</button>
                    <button className={activeTab === 'cars' ? 'active' : ''} onClick={() => setActiveTab('cars')}>🚗 Manage Cars</button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>📅 Bookings</button>
                </div>

                {activeTab === 'stats' && (
                    <div className="stats-grid">
                        <div className="stat-card"><h3>Total Users</h3><p>{stats.totalUsers}</p></div>
                        <div className="stat-card"><h3>Total Cars</h3><p>{stats.totalCars}</p></div>
                        <div className="stat-card"><h3>Total Bookings</h3><p>{stats.totalBookings}</p></div>
                        <div className="stat-card"><h3>Total Revenue</h3><p>₨ {stats.totalRevenue}</p></div>
                    </div>
                )}

                {activeTab === 'cars' && (
                    <div>
                        <div className="section-header">
                            <h3>Car Fleet Management</h3>
                            <button onClick={openAddModal} className="add-btn">+ Add New Car</button>
                        </div>
                        <div className="cars-table-container">
                            <table className="cars-table">
                                <thead>
                                    <tr><th>Image</th><th>Name</th><th>Price/Day</th><th>Category</th><th>Transmission</th><th>Seats</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {cars.map(car => (
                                        <tr key={car.id}>
                                            <td><img src={car.image_url || 'https://via.placeholder.com/50'} alt={car.name} className="car-thumbnail" /></td>
                                            <td><strong>{car.name}</strong></td>
                                            <td>₨ {car.price_per_day}</td>
                                            <td>{car.category}</td>
                                            <td>{car.transmission}</td>
                                            <td>{car.seats}</td>
                                            <td><span className={`status ${car.status}`}>{car.status}</span></td>
                                            <td>
                                                <button onClick={() => openEditModal(car)} className="edit-btn">✏️ Edit</button>
                                                <button onClick={() => deleteCar(car.id, car.name)} className="delete-btn">🗑️ Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div>
                        <h3>All Customer Bookings</h3>
                        <div className="bookings-table-container">
                            <table className="bookings-table">
                                <thead>
                                    <tr><th>ID</th><th>Customer</th><th>Car</th><th>Pickup Date</th><th>Dropoff Date</th><th>Total</th><th>Status</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {bookings.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.id}</td>
                                            <td>{b.user_name}</td>
                                            <td>{b.car_name}</td>
                                            <td>{new Date(b.start_date).toDateString()}</td>
                                            <td>{new Date(b.end_date).toDateString()}</td>
                                            <td>₨ {b.total_price}</td>
                                            <td><span className={`status ${b.status}`}>{b.status}</span></td>
                                            <td>
                                                <select onChange={(e) => updateStatus(b.id, e.target.value)} value={b.status}>
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

                {showModal && (
                    <div className="modal" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
                            <input type="text" placeholder="Car Name" value={carForm.name} onChange={e => setCarForm({...carForm, name: e.target.value})} />
                            <input type="number" placeholder="Price Per Day (PKR)" value={carForm.price_per_day} onChange={e => setCarForm({...carForm, price_per_day: e.target.value})} />
                            <select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})}>
                                <option value="">Select Category</option>
                                <option value="Economy">Economy</option>
                                <option value="Premium">Premium</option>
                                <option value="Luxury">Luxury</option>
                                <option value="SUV">SUV</option>
                            </select>
                            <div className="form-row">
                                <select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})}>
                                    <option value="Manual">Manual</option>
                                    <option value="Automatic">Automatic</option>
                                </select>
                                <select value={carForm.seats} onChange={e => setCarForm({...carForm, seats: e.target.value})}>
                                    <option value="2">2 Seats</option>
                                    <option value="4">4 Seats</option>
                                    <option value="5">5 Seats</option>
                                    <option value="7">7 Seats</option>
                                </select>
                            </div>
                            <input type="text" placeholder="Image URL (optional)" value={carForm.image_url} onChange={e => setCarForm({...carForm, image_url: e.target.value})} />
                            <select value={carForm.status} onChange={e => setCarForm({...carForm, status: e.target.value})}>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                            <div className="modal-buttons">
                                <button onClick={() => setShowModal(false)}>Cancel</button>
                                <button onClick={saveCar}>{editingCar ? 'Update' : 'Add'} Car</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
