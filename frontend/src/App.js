import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './App.css';
/* eslint-disable */
/* eslint-disable no-unused-vars */

// Auto-detect API URL based on environment
const API = process.env.REACT_APP_API_URL ||
    (window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://swiftrides-backend.onrender.com/api');
const AuthContext = createContext();

function App() {
    const [auth, setAuth] = useState({
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user') || 'null')
    });

    const login = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuth({ token, user });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth({ token: null, user: null });
    };

    return (
        <AuthContext.Provider value={{ auth, login, logout }}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={!auth.token ? <Login /> : <Navigate to="/" />} />
                    <Route path="/register" element={!auth.token ? <Register /> : <Navigate to="/" />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/dashboard" element={auth.token ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/my-bookings" element={auth.token ? <MyBookings /> : <Navigate to="/login" />} />
                    <Route path="/admin" element={auth.token && auth.user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

// HomePage Component - Complete with Newsletter
function HomePage() {
    const { auth, logout } = useContext(AuthContext);
    const [cars, setCars] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterMessage, setNewsletterMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API}/cars`).then(res => setCars(res.data));
    }, [API]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/newsletter/subscribe`, { email: newsletterEmail });
            setNewsletterMessage(res.data.message);
            setNewsletterEmail('');
            setTimeout(() => setNewsletterMessage(''), 3000);
        } catch (err) {
            setNewsletterMessage(err.response?.data?.message || 'Subscription failed');
            setTimeout(() => setNewsletterMessage(''), 3000);
        }
    };

    return (
        <>
            <div className="background">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span>
            </div>

            <nav>
                <div className="nav__header">
                    <div className="nav__logo">
                        <a href="/">🚗 SwiftRide</a>
                    </div>
                    <div className="nav__menu__btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <i className={`ri-${isMenuOpen ? 'close' : 'menu-4'}-line`}></i>
                    </div>
                </div>
                <ul className={`nav__links ${isMenuOpen ? 'open' : ''}`}>
                    <li><a href="#home" onClick={() => setIsMenuOpen(false)}>HOME</a></li>
                    <li><a href="#gallery" onClick={() => setIsMenuOpen(false)}>GALLERY</a></li>
                    <li><a href="#about" onClick={() => setIsMenuOpen(false)}>ABOUT US</a></li>
                    {auth.token ? (
                        <>
                            <li><Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>DASHBOARD</Link></li>
                            <li><Link to="/my-bookings" onClick={() => setIsMenuOpen(false)}>MY BOOKINGS</Link></li>
                            {auth.user?.role === 'admin' && <li><Link to="/admin" onClick={() => setIsMenuOpen(false)}>ADMIN</Link></li>}
                            <li><button onClick={() => { logout(); setIsMenuOpen(false); }}>LOGOUT</button></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" onClick={() => setIsMenuOpen(false)}>LOGIN</Link></li>
                            <li><Link to="/register" onClick={() => setIsMenuOpen(false)}>REGISTER</Link></li>
                        </>
                    )}
                </ul>
            </nav>

            <header id="home">
                <div className="section__container header__container">
                    <h1 className="section__header">SwiftRide Rent a Car</h1>
                </div>
            </header>

            <section className="section__container gallery__container" id="gallery">
                <p className="section__subheader">SWIFTRIDE FLEET</p>
                <h2 className="section__header">OUR GALLERY</h2>
                {cars.length > 0 && (
                    <Swiper
                        modules={[EffectCoverflow, Autoplay, Navigation, Pagination]}
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView="auto"
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 2.5,
                            slideShadows: false,
                        }}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        speed={800}
                        navigation={true}
                        pagination={{ clickable: true }}
                        loop={true}
                        className="mySwiper"
                    >
                        {cars.map((car) => (
                            <SwiperSlide key={car.id} className="custom-swiper-slide">
                                <div className="gallery-card">
                                    <img src={car.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'} alt={car.name} />
                                    <div className="gallery-overlay">
                                        <h3>{car.name}</h3>
                                        <p>₨ {car.price_per_day}/day</p>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </section>

            <section className="section__container service__container" id="about">
                <p className="section__subheader">KNOW US BETTER</p>
                <h2 className="section__header">A BRAND NEW AUTOMOTIVE CULTURE IS UNFOLDING</h2>
                <div className="service__content">
                    <div className="service__row">
                        <div className="service__img"><img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600" alt="service" /></div>
                        <div className="service__details"><h4>WIDE RANGE OF CARS</h4><p>From economy to luxury, we have the perfect car for every need.</p></div>
                    </div>
                    <div className="service__row">
                        <div className="service__img"><img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600" alt="service" /></div>
                        <div className="service__details"><h4>BEST PRICE GUARANTEE</h4><p>Competitive rates with no hidden charges.</p></div>
                    </div>
                    <div className="service__row">
                        <div className="service__img"><img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600" alt="service" /></div>
                        <div className="service__details"><h4>24/7 ROADSIDE ASSISTANCE</h4><p>Always here to help you on the road.</p></div>
                    </div>
                    <div className="service__row">
                        <div className="service__img"><img src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600" alt="service" /></div>
                        <div className="service__details"><h4>INSURANCE COVERAGE</h4><p>Comprehensive insurance for peace of mind.</p></div>
                    </div>
                </div>
                <div className="service__btn">
                    <Link to={auth.token ? "/dashboard" : "/register"} className="btn">VIEW ALL SERVICES</Link>
                </div>
            </section>

            <section className="section__container instagram__container">
                <p className="section__subheader">FOLLOW US ON</p>
                <h2 className="section__header">INSTAGRAM</h2>
                <div className="instagram__wrapper">
                    <div className="instagram__images">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <img key={i} src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200" alt="instagram" />)}
                    </div>
                </div>
            </section>

            <section className="banner">
                <div className="section__container banner__container">
                    <p className="section__subheader">AUTOMOTIVE HUB FOR ENTHUSIASTS</p>
                    <h2 className="section__header">PAKISTAN'S PREMIUM CAR RENTAL SERVICE</h2>
                </div>
            </section>

            <footer>
                <div className="section__container footer__container">
                    <div className="footer__col">
                        <a href="/" className="footer__logo">🚗 SwiftRide</a>
                        <p className="section__description">Best car rental service in Islamabad.</p>
                        <ul className="footer__socials">
                            <li><a href="#"><i className="ri-facebook-circle-fill"></i></a></li>
                            <li><a href="#"><i className="ri-instagram-line"></i></a></li>
                            <li><a href="#"><i className="ri-youtube-fill"></i></a></li>
                        </ul>
                    </div>
                    <div className="footer__col">
                        <h4>QUICK LINKS</h4>
                        <ul className="footer__links">
                            <li><a href="#home">HOME</a></li>
                            <li><a href="#gallery">GALLERY</a></li>
                            <li><Link to="/login">LOGIN</Link></li>
                            <li><Link to="/register">REGISTER</Link></li>
                        </ul>
                    </div>
                    <div className="footer__col">
                        <h4>SERVICES</h4>
                        <ul className="footer__links">
                            <li><Link to="/dashboard">CAR RENTAL</Link></li>
                            <li><Link to="/my-bookings">MANAGE BOOKINGS</Link></li>
                            {auth.user?.role === 'admin' && <li><Link to="/admin">ADMIN PANEL</Link></li>}
                        </ul>
                    </div>
                    <div className="footer__col">
                        <h4>NEWSLETTER</h4>
                        <form onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="ENTER EMAIL"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn">
                                <i className="ri-send-plane-2-fill"></i>
                            </button>
                        </form>
                        {newsletterMessage && <div className="newsletter-message">{newsletterMessage}</div>}
                    </div>
                </div>
                <div className="footer__bar">Copyright © 2024 SwiftRide Rent a Car. All rights reserved.</div>
            </footer>
        </>
    );
}

// Login Component
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/login`, { email, password });
            login(res.data.token, res.data.user);
            navigate('/');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                {error && <div className="error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit">Login</button>
                </form>
                <p>New user? <Link to="/register">Register</Link></p>
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>
        </div>
    );
}

// Register Component
function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/register`, form);
            setMessage('Registration successful! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Join SwiftRide</h2>
                {message && <div className={message.includes('successful') ? 'success' : 'error'}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <input type="password" placeholder="Password (8+ chars, A-Z, a-z, 0-9, @#$)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                    <button type="submit">Register</button>
                </form>
                <p>Have an account? <Link to="/login">Login</Link></p>
            </div>
        </div>
    );
}

// ForgotPassword Component
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const requestReset = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/forgot-password`, { email });
            setToken(res.data.resetToken);
            setMessage('Reset token generated! Copy it below.');
            setStep(2);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Email not found');
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/reset-password`, { token, newPassword });
            setMessage('Password reset successful! Redirecting...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Reset failed');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Reset Password</h2>
                {message && <div className="info">{message}</div>}
                {step === 1 ? (
                    <form onSubmit={requestReset}>
                        <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <button type="submit">Send Reset Code</button>
                    </form>
                ) : (
                    <form onSubmit={resetPassword}>
                        <input type="text" placeholder="Reset Token" value={token} readOnly />
                        <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <button type="submit">Reset Password</button>
                    </form>
                )}
                <Link to="/login">Back to Login</Link>
            </div>
        </div>
    );
}

// Dashboard Component
function Dashboard() {
    const [cars, setCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const [dates, setDates] = useState({ start: '', end: '' });
    const [message, setMessage] = useState('');
    const { auth } = useContext(AuthContext);

    useEffect(() => { axios.get(`${API}/cars`).then(res => setCars(res.data)); }, []);

    const handleBooking = async (carId) => {
        if (!dates.start || !dates.end) { setMessage('Select dates'); return; }
        try {
            await axios.post(`${API}/bookings`, { car_id: carId, start_date: dates.start, end_date: dates.end }, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setMessage('Booking successful!');
            setSelectedCar(null);
            setDates({ start: '', end: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) { setMessage('Booking failed'); }
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <h2>Rent Your Dream Car</h2>
                {message && <div className="success">{message}</div>}
                <div className="cars-grid">
                    {cars.map(car => (
                        <div key={car.id} className="car-card">
                            <img src={car.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400'} alt={car.name} />
                            <h3>{car.name}</h3>
                            <p className="car-price">₨ {car.price_per_day}/day</p>
                            {selectedCar === car.id ? (
                                <div>
                                    <input type="date" value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} />
                                    <input type="date" value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} />
                                    <button onClick={() => handleBooking(car.id)} className="confirm-btn">Confirm</button>
                                    <button onClick={() => setSelectedCar(null)} className="cancel-btn">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setSelectedCar(car.id)} className="rent-btn">Book Now</button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// MyBookings Component
function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        axios.get(`${API}/my-bookings`, { headers: { Authorization: `Bearer ${auth.token}` } }).then(res => setBookings(res.data));
    }, []);

    const cancelBooking = async (id) => {
        if (window.confirm('Cancel this booking?')) {
            await axios.put(`${API}/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${auth.token}` } });
            setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
        }
    };

    return (
        <div className="bookings-page">
            <div className="container">
                <h2>My Bookings</h2>
                {bookings.map(b => (
                    <div key={b.id} className="booking-card">
                        <img src={b.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100'} alt={b.car_name} />
                        <div>
                            <h3>{b.car_name}</h3>
                            <p>{new Date(b.start_date).toDateString()} - {new Date(b.end_date).toDateString()}</p>
                            <p>Total: ₨ {b.total_price}</p>
                            <span className={`status ${b.status}`}>{b.status}</span>
                        </div>
                        {b.status === 'pending' && <button onClick={() => cancelBooking(b.id)}>Cancel</button>}
                    </div>
                ))}
            </div>
        </div>
    );
}

// AdminPanel Component
function AdminPanel() {
    const [activeTab, setActiveTab] = useState('stats');
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [cars, setCars] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
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
        fetchSubscribers();
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

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get(`${API}/admin/newsletter`, {
                headers: { Authorization: `Bearer ${auth.token}` }
            });
            setSubscribers(res.data);
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

    const handleFileSelect = (e) => {
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
                const formData = new FormData();
                formData.append('image', selectedFile);
                const uploadRes = await axios.post(`${API}/upload`, formData);
                imageUrl = uploadRes.data.imageUrl;
            }
            const carData = { ...carForm, image_url: imageUrl };
            if (editingCar) {
                await axios.put(`${API}/admin/cars/${editingCar.id}`, carData, { headers: { Authorization: `Bearer ${auth.token}` } });
            } else {
                await axios.post(`${API}/admin/cars`, carData, { headers: { Authorization: `Bearer ${auth.token}` } });
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
                <div className="admin-tabs">
                    <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Stats</button>
                    <button className={activeTab === 'cars' ? 'active' : ''} onClick={() => setActiveTab('cars')}>Manage Cars</button>
                    <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>Bookings</button>
                    <button className={activeTab === 'newsletter' ? 'active' : ''} onClick={() => setActiveTab('newsletter')}>Newsletter</button>
                </div>

                {activeTab === 'stats' && (
                    <div className="stats-grid">
                        <div className="stat-card"><h3>Users</h3><p>{stats.totalUsers}</p></div>
                        <div className="stat-card"><h3>Cars</h3><p>{stats.totalCars}</p></div>
                        <div className="stat-card"><h3>Bookings</h3><p>{stats.totalBookings}</p></div>
                        <div className="stat-card"><h3>Revenue</h3><p>₨ {stats.totalRevenue}</p></div>
                    </div>
                )}

                {activeTab === 'cars' && (
                    <div>
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
                                        <td><img src={car.image_url || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=50'} alt={car.name} className="car-thumbnail" /></td>
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
                    </div>
                )}

                {activeTab === 'bookings' && (
                    <div>
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
                                                <option>pending</option>
                                                <option>confirmed</option>
                                                <option>completed</option>
                                                <option>cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'newsletter' && (
                    <div>
                        <h3>Newsletter Subscribers ({subscribers.length})</h3>
                        <table className="bookings-table">
                            <thead>
                                <tr><th>ID</th><th>Email</th><th>Subscribed Date</th></tr>
                            </thead>
                            <tbody>
                                {subscribers.map(sub => (
                                    <tr key={sub.id}>
                                        <td>{sub.id}</td>
                                        <td>{sub.email}</td>
                                        <td>{new Date(sub.subscribed_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {subscribers.length === 0 && (
                                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No subscribers yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && (
                    <div className="modal" onClick={() => setShowModal(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <h3>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
                            <input placeholder="Car Name" value={carForm.name} onChange={e => setCarForm({ ...carForm, name: e.target.value })} />
                            <input placeholder="Price Per Day (PKR)" type="number" value={carForm.price_per_day} onChange={e => setCarForm({ ...carForm, price_per_day: e.target.value })} />
                            <select value={carForm.category} onChange={e => setCarForm({ ...carForm, category: e.target.value })}>
                                <option value="">Select Category</option>
                                <option value="Economy">Economy</option>
                                <option value="Premium">Premium</option>
                                <option value="Luxury">Luxury</option>
                                <option value="SUV">SUV</option>
                            </select>
                            <div className="form-row">
                                <select value={carForm.transmission} onChange={e => setCarForm({ ...carForm, transmission: e.target.value })}>
                                    <option>Manual</option>
                                    <option>Automatic</option>
                                </select>
                                <select value={carForm.seats} onChange={e => setCarForm({ ...carForm, seats: e.target.value })}>
                                    <option>2</option><option>4</option><option>5</option><option>7</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>📸 Car Image (Upload from Device)</label>
                                <input type="file" accept="image/*" onChange={handleFileSelect} />
                                {imagePreview && <div className="image-preview"><img src={imagePreview} alt="Preview" /></div>}
                                {!imagePreview && carForm.image_url && !selectedFile && (
                                    <div className="image-preview">
                                        <img src={carForm.image_url} alt="Current" />
                                        <p style={{ fontSize: '12px', color: '#888' }}>Current image</p>
                                    </div>
                                )}
                            </div>
                            <select value={carForm.status} onChange={e => setCarForm({ ...carForm, status: e.target.value })}>
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

export default App;
