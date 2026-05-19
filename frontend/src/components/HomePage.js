import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Navigation, Pagination } from 'swiper/modules';
import ScrollReveal from 'scrollreveal';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HomePage.css';

function HomePage({ cars }) {
  useEffect(() => {
    // Initialize ScrollReveal animations
    ScrollReveal().reveal('.reveal-header', {
      distance: '50px',
      origin: 'bottom',
      duration: 1000,
      reset: false
    });
    
    ScrollReveal().reveal('.reveal-left', {
      distance: '50px',
      origin: 'left',
      duration: 1000,
      reset: false
    });
    
    ScrollReveal().reveal('.reveal-right', {
      distance: '50px',
      origin: 'right',
      duration: 1000,
      reset: false
    });
    
    ScrollReveal().reveal('.reveal-up', {
      distance: '30px',
      origin: 'bottom',
      duration: 800,
      interval: 200,
      reset: false
    });
  }, []);

  return (
    <>
      {/* Hero Section */}
      <header className="hero-header" id="home">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="reveal-header">SwiftRide Rent a Car</h1>
            <p className="reveal-header">Find Your Perfect Ride Today. Premium Cars at Best Rates.</p>
            <Link to="/register" className="hero-btn reveal-header">Get Started →</Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <p className="section-subheader reveal-up">WHY CHOOSE US</p>
          <h2 className="section-header reveal-up">Premium Car Rental Services</h2>
          <div className="features-grid">
            <div className="feature-card reveal-up">
              <div className="feature-icon">🚗</div>
              <h3>Wide Range of Cars</h3>
              <p>From economy to luxury, we have the perfect car for every need and budget.</p>
            </div>
            <div className="feature-card reveal-up">
              <div className="feature-icon">💰</div>
              <h3>Best Price Guarantee</h3>
              <p>Competitive rates with no hidden charges. Best value for your money.</p>
            </div>
            <div className="feature-card reveal-up">
              <div className="feature-icon">🛡️</div>
              <h3>Safe & Reliable</h3>
              <p>Well-maintained cars with comprehensive insurance coverage.</p>
            </div>
            <div className="feature-card reveal-up">
              <div className="feature-icon">⭐</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for your peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery/Car Fleet Section with Swiper - FIXED AUTOPLAY */}
      <section className="gallery-section" id="gallery">
        <div className="container">
          <p className="section-subheader reveal-up">OUR FLEET</p>
          <h2 className="section-header reveal-up">Featured Cars</h2>
          <div className="swiper-container reveal-up">
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
                stopOnLastSlide: false,
              }}
              speed={800}
              navigation={true}
              pagination={{ clickable: true }}
              loop={true}
              className="car-swiper"
            >
              {cars.map((car) => (
                <SwiperSlide key={car.id} className="car-slide">
                  <div className="car-card-slide">
                    <img src={car.image_url || 'https://via.placeholder.com/400x300?text=Car'} alt={car.name} />
                    <div className="car-info-slide">
                      <h3>{car.name}</h3>
                      <p className="car-price">₨ {car.price_per_day}/day</p>
                      <div className="car-specs">
                        <span>{car.category}</span>
                        <span>{car.seats} Seats</span>
                        <span>{car.transmission}</span>
                      </div>
                      <Link to="/dashboard" className="rent-btn-slide">Rent Now →</Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="steps-section">
        <div className="container">
          <p className="section-subheader reveal-up">SIMPLE PROCESS</p>
          <h2 className="section-header reveal-up">How to Rent a Car in 4 Steps</h2>
          <div className="steps-grid">
            <div className="step-card reveal-up">
              <div className="step-number">01</div>
              <div className="step-icon">📍</div>
              <h3>Choose Location & Date</h3>
              <p>Select your pickup location and rental dates</p>
            </div>
            <div className="step-card reveal-up">
              <div className="step-number">02</div>
              <div className="step-icon">🚗</div>
              <h3>Select Your Car</h3>
              <p>Browse our fleet and pick your perfect vehicle</p>
            </div>
            <div className="step-card reveal-up">
              <div className="step-number">03</div>
              <div className="step-icon">📝</div>
              <h3>Make a Booking</h3>
              <p>Enter your details and confirm your reservation</p>
            </div>
            <div className="step-card reveal-up">
              <div className="step-number">04</div>
              <div className="step-icon">😊</div>
              <h3>Enjoy Your Ride</h3>
              <p>Pick up your car and enjoy your journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Section - Premium Services */}
      <section className="service-section" id="services">
        <div className="container">
          <p className="section-subheader reveal-up">PREMIUM SERVICES</p>
          <h2 className="section-header reveal-up">A Brand New Automotive Culture</h2>
          <div className="service-content">
            <div className="service-row reveal-left">
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500" alt="service" />
              </div>
              <div className="service-details">
                <h4>PREMIUM CAR FLEET</h4>
                <p>Experience luxury with our premium car collection. From sports cars to SUVs, we have the best vehicles for your needs.</p>
              </div>
            </div>
            <div className="service-row reveal-right">
              <div className="service-details">
                <h4>24/7 ROADSIDE ASSISTANCE</h4>
                <p>Drive with confidence knowing we're always here to help. Round-the-clock support for all our customers.</p>
              </div>
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500" alt="service" />
              </div>
            </div>
            <div className="service-row reveal-left">
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500" alt="service" />
              </div>
              <div className="service-details">
                <h4>FLEXIBLE RENTAL OPTIONS</h4>
                <p>Daily, weekly, or monthly rentals. Choose what works best for you with our flexible plans.</p>
              </div>
            </div>
            <div className="service-row reveal-right">
              <div className="service-details">
                <h4>INSURANCE COVERAGE</h4>
                <p>All our rentals come with comprehensive insurance for your peace of mind.</p>
              </div>
              <div className="service-img">
                <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500" alt="service" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Banner Section */}
      <section className="stats-banner">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item reveal-up">
              <div className="stat-number">500+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-item reveal-up">
              <div className="stat-number">50+</div>
              <div className="stat-label">Luxury Cars</div>
            </div>
            <div className="stat-item reveal-up">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
            <div className="stat-item reveal-up">
              <div className="stat-number">100%</div>
              <div className="stat-label">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content reveal-up">
            <h2>Ready to Hit the Road?</h2>
            <p>Book your dream car today and experience the freedom of the open road!</p>
            <Link to="/register" className="cta-btn">Join SwiftRide Today →</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
