import { useState, useEffect } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import coverImage from "../assets/Fabrics/cover.png";
import coverFabric from "../assets/Fabrics/cover-fabric.png";
import inventory01 from "../assets/Fabrics/inventory01.png";
import inventory02 from "../assets/Fabrics/inventory02.png";
import inventory03 from "../assets/Fabrics/inventory03.png";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Navbar Component
const Navbar = ({ companyName }) => {
  return (
    <header className="navbar">
      <div className="logo">
        <span className="logo-icon">🏠</span>
        <span className="company-name">{companyName || "Hiran Fabric Textile"}</span>
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
const Hero = ({ title, subtitle, buttonText, imageUrl }) => {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <h1>{title || "Welcome to Hiran Fabric Textile"}</h1>
        <p className="hero-subtitle">{subtitle || "Quality Fabrics for Every Creation"}</p>
        <Link to="/register">
          <button className="btn-get-started">{buttonText || "Get Started"}</button>
        </Link>
      </div>
      <div className="hero-image-container">
        <img 
          src={imageUrl ? `${BASE}${imageUrl}` : coverImage} 
          alt="Colorful Fabric Rolls" 
          className="hero-image" 
        />
      </div>
    </section>
  );
};

// Main Content Component (About + Features side by side)
function MainContent({ aboutTitle, aboutContent, features }) {
  const featureIcons = [coverFabric, inventory01, inventory02, inventory03];
  
  return (
    <section className="main-content">
      {/* Left - About Us */}
      <div className="about-section" id="about">
        <h2>{aboutTitle || "About Us"}</h2>
        <div className="about-text-container">
            {(aboutContent || "Hiran Fabric Textile is a premier textile business based in Nittambuwa, Sri Lanka, dedicated to providing high-quality fabrics for every creative need.").split('\n').map((para, i) => (
                <p key={i}>{para}</p>
            ))}
        </div>
      </div>

      {/* Right - Features */}
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          {(features || []).length > 0 ? features.map((f, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-image">
                <img 
                  src={f.icon_url ? `${BASE}${f.icon_url}` : featureIcons[idx % featureIcons.length]} 
                  alt={f.title} 
                />
              </div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          )) : (
            <p>Loading features...</p>
          )}
        </div>
      </div>
    </section>
  );
}

// Contact Component
const Contact = ({ address, phone, email, hours }) => {
  return (
    <section className="contact-section" id="contact">
      <h2>Contact</h2>
      <div className="contact-info">
        <p><strong>Address:</strong> {address || "No 72, New Shopping Complex, Nittambuwa"}</p>
        <p><strong>Mobile:</strong> {phone || "+94 77 112 4088"}</p>
        <p><strong>Email:</strong> {email || "hiranfabrictextile@gmail.com"}</p>
        <p><strong>Business Hours:</strong> {hours || "Monday - Saturday, 9:00 AM - 6:00 PM"}</p>
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
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${BASE}/api/home-page`)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Home fetch error:", err));
  }, []);

  return (
    <div className="home-page">
      <Navbar companyName={settings?.company_name} />
      <Hero 
        title={settings?.hero_title} 
        subtitle={settings?.hero_subtitle} 
        buttonText={settings?.hero_button_text} 
        imageUrl={settings?.hero_image_url}
      />
      <MainContent 
        aboutTitle={settings?.about_title} 
        aboutContent={settings?.about_content} 
        features={settings?.features}
      />
      <Contact 
        address={settings?.contact_address}
        phone={settings?.contact_phone}
        email={settings?.contact_email}
        hours={settings?.contact_hours}
      />
      <Footer />
    </div>
  );
}
