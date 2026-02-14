import "./Home.css";
import { Link } from "react-router-dom";
import coverImage from "../assets/Fabrics/cover.png";
import coverFabric from "../assets/Fabrics/cover-fabric.png";
import inventory01 from "../assets/Fabrics/inventory01.png";
import inventory02 from "../assets/Fabrics/inventory02.png";
import inventory03 from "../assets/Fabrics/inventory03.png";

// Navbar Component
const Navbar = () => {
  return (
    <header className="navbar">
      <div className="logo">
        <span className="logo-icon">🏠</span>
        <span className="company-name">Hiran Fabric Textile</span>
      </div>
      <nav>
        <a href="#home">Home</a>
        <a href="#about">About Us</a>
        <Link to="/login" className="nav-link">Login</Link>
      </nav>
    </header>
  );
};

// Hero Component
const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1>Welcome to Hiran Fabric Textile</h1>
        <p className="hero-subtitle">Quality Fabrics for Every Creation</p>
        <Link to="/register">
          <button className="btn-get-started">Get Started</button>
        </Link>
      </div>
      <div className="hero-image-container">
        <img src={coverImage} alt="Colorful Fabric Rolls" className="hero-image" />
      </div>
    </section>
  );
};

// Main Content Component (About + Features side by side)
function MainContent() {
  return (
    <section className="main-content">
      {/* Left - About Us */}
      <div className="about-section">
        <h2>About Us</h2>
        <p>
          Hiran Fabric Textile is a premier textile business based in Nittambuwa, Sri Lanka,
          dedicated to providing high-quality fabrics for every creative need. Our commitment
          to excellence and customer satisfaction sets us apart in the textile industry.
        </p>
        <p>
          We offer a wide selection of premium fabrics suitable for various applications,
          from fashion design to home decor. Our expert team ensures that each customer
          receives personalized service and expert advice, whether purchasing wholesale or
          retail. We leverage modern technology to maintain an efficient inventory and deliver
          exceptional products that meet the highest standards of quality and durability.
        </p>
      </div>

      {/* Right - Features */}
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image">
              <img src={coverFabric} alt="Premium Quality" />
            </div>
            <h3>Premium Quality</h3>
            <p>We source only the finest materials to ensure our fabrics meet the highest quality and durability</p>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img src={inventory01} alt="Expert Service" />
            </div>
            <h3>Expert Service</h3>
            <p>Our knowledgeable staff provides personalized assistance and expert advice to help you find the perfect fabric for your project</p>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img src={inventory02} alt="Wholesale & Retail" />
            </div>
            <h3>Wholesale & Retail</h3>
            <p>Flexible purchasing options, catering to both large-scale wholesale orders and individual retail customer</p>
          </div>

          <div className="feature-card">
            <div className="feature-image">
              <img src={inventory03} alt="Modern Technology" />
            </div>
            <h3>Modern Technology</h3>
            <p>Advanced inventory management systems ensure efficient operations and timely delivery</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Contact Component
const Contact = () => {
  return (
    <section className="contact-section" id="contact">
      <h2>Contact</h2>
      <div className="contact-info">
        <p><strong>Address:</strong> No 72, New Shopping Complex, Nittambuwa</p>
        <p><strong>Mobile:</strong> +94 77 112 4088</p>
        <p><strong>Email:</strong> hiranfabrictextile@gmail.com</p>
        <p><strong>Business Hours:</strong> Monday - Saturday, 9:00 AM - 6:00 PM</p>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} Hiran Fabric Textile. All rights reserved.</p>
    </footer>
  );
};

// Main Home Component
export default function Home() {
  return (
    <div className="home-page">
      <Navbar />
      <Hero />
      <MainContent />
      <Contact />
      <Footer />
    </div>
  );
}