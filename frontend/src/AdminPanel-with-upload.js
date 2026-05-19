// Replace your AdminPanel component with this version
// This adds file upload functionality for car images

function AdminPanel() {
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [cars, setCars] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [carForm, setCarForm] = useState({ 
        name: '', price_per_day: '', category: '', 
        transmission: 'Automatic', seats: '5', 
        image_url: '', status: 'available' 
    });
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.token) { navigate('/login'); return; }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes, bookingsRes, carsRes] = await Promise.all([
                axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${auth.token}` } }),
                axios.get(`${API}/admin/bookings`, { headers: { Authorization: `Bearer ${auth.token}` } }),
                axios.get(`${API}/cars`)
            ]);
            setStats(statsRes.data);
            setBookings(bookingsRes.data);
            setCars(carsRes.data);
        } catch (err) { console.error(err); }
    };

    const updateStatus = async (id, status) => {
        await axios.put(`${API}/admin/bookings/${id}/status`, { status }, { headers: { Authorization: `Bearer ${auth.token}` } });
        loadData();
    };

    const deleteCar = async (id, name) => {
        if (window.confirm(`Delete ${name}?`)) {
            await axios.delete(`${API}/admin/cars/${id}`, { headers: { Authorization: `Bearer ${auth.token}` } });
            loadData();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveCar = async () => {
        try {
            let imageUrl = carForm.image_url;
            
            if (selectedFile) {
                // Upload image to server
                const formData = new FormData();
                formData.append('image', selectedFile);
                const uploadRes = await axios.post(`${API}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.imageUrl;
            }
            
            const carData = { ...carForm, image_url: imageUrl };
            
            if (editingCar) {
                await axios.put(`${API}/admin/cars/${editingCar.id}`, carData, { 
                    headers: { Authorization: `Bearer ${auth.token}` } 
                });
            } else {
                await axios.post(`${API}/admin/cars`, carData, { 
                    headers: { Authorization: `Bearer ${auth.token}` } 
                });
            }
            setShowModal(false);
            setSelectedFile(null);
            setImagePreview('');
            loadData();
            alert(editingCar ? 'Car updated!' : 'Car added!');
        } catch (err) {
            console.error(err);
            alert('Error saving car');
        }
    };

    if (!stats) return <div className="loading">Loading...</div>;

    return (
        <div className="admin-page">
            <div className="container">
                <h2>Admin Dashboard</h2>
                <div className="stats-grid">
                    <div className="stat-card"><h3>Users</h3><p>{stats.totalUsers}</p></div>
                    <div className="stat-card"><h3>Cars</h3><p>{stats.totalCars}</p></div>
                    <div className="stat-card"><h3>Bookings</h3><p>{stats.totalBookings}</p></div>
                    <div className="stat-card"><h3>Revenue</h3><p>₨ {stats.totalRevenue}</p></div>
                </div>
                
                <div className="section-header">
                    <h3>Manage Cars</h3>
                    <button onClick={() => { 
                        setEditingCar(null); 
                        setCarForm({ name: '', price_per_day: '', category: '', transmission: 'Automatic', seats: '5', image_url: '', status: 'available' });
                        setSelectedFile(null);
                        setImagePreview('');
                        setShowModal(true); 
                    }} className="add-btn">+ Add Car</button>
                </div>
                
                <table className="cars-table">
                    <thead>
                        <tr><th>Image</th><th>Name</th><th>Price</th><th>Category</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {cars.map(car => (
                            <tr key={car.id}>
                                <td>
                                    <img src={car.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=50'} alt={car.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} />
                                 </td>
                                <td>{car.name}</td>
                                <td>₨ {car.price_per_day}</td>
                                <td>{car.category}</td>
                                <td>
                                    <button onClick={() => { 
                                        setEditingCar(car); 
                                        setCarForm(car);
                                        setSelectedFile(null);
                                        setImagePreview('');
                                        setShowModal(true); 
                                    }} className="edit-btn">Edit</button>
                                    <button onClick={() => deleteCar(car.id, car.name)} className="delete-btn">Delete</button>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>

                <h3>All Bookings</h3>
                <table className="bookings-table">
                    <thead>
                        <tr><th>User</th><th>Car</th><th>Dates</th><th>Total</th><th>Status</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                        {bookings.map(b => (
                            <tr key={b.id}>
                                <td>{b.user_name}</td>
                                <td>{b.car_name}</td>
                                <td>{new Date(b.start_date).toDateString()} - {new Date(b.end_date).toDateString()}</td>
                                <td>₨ {b.total_price}</td>
                                <td>{b.status}</td>
                                <td>
                                    <select onChange={(e) => updateStatus(b.id, e.target.value)} value={b.status}>
                                        <option>pending</option><option>confirmed</option>
                                        <option>completed</option><option>cancelled</option>
                                    </select>
                                 </td>
                             </tr>
                        ))}
                    </tbody>
                </table>

                {showModal && (
                    <div className="modal" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
                            <input placeholder="Car Name" value={carForm.name} onChange={e => setCarForm({...carForm, name: e.target.value})} />
                            <input placeholder="Price Per Day (PKR)" type="number" value={carForm.price_per_day} onChange={e => setCarForm({...carForm, price_per_day: e.target.value})} />
                            <select value={carForm.category} onChange={e => setCarForm({...carForm, category: e.target.value})}>
                                <option value="">Select Category</option>
                                <option value="Economy">Economy</option>
                                <option value="Premium">Premium</option>
                                <option value="Luxury">Luxury</option>
                                <option value="SUV">SUV</option>
                            </select>
                            <div className="form-row">
                                <select value={carForm.transmission} onChange={e => setCarForm({...carForm, transmission: e.target.value})}>
                                    <option>Manual</option><option>Automatic</option>
                                </select>
                                <select value={carForm.seats} onChange={e => setCarForm({...carForm, seats: e.target.value})}>
                                    <option>2</option><option>4</option><option>5</option><option>7</option>
                                </select>
                            </div>
                            
                            {/* Image Upload Section */}
                            <div className="form-group">
                                <label>Car Image</label>
                                <input type="file" accept="image/*" onChange={handleFileChange} />
                                {imagePreview && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
                                    </div>
                                )}
                                {!imagePreview && carForm.image_url && !selectedFile && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img src={carForm.image_url} alt="Current" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
                                        <p style={{ fontSize: '12px', color: '#888' }}>Current image</p>
                                    </div>
                                )}
                            </div>
                            
                            <select value={carForm.status} onChange={e => setCarForm({...carForm, status: e.target.value})}>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                            <div className="modal-buttons">
                                <button onClick={() => setShowModal(false)}>Cancel</button>
                                <button onClick={saveCar}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
