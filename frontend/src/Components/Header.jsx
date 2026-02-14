import "./Header.css";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="main-header">
      <Link to="/" className="logo">
        <span className="home-icon">🏠</span>
        <span className="company-name">Hiran Fabric Textile</span>
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/login">Login</Link>
        <Link to="/login" className="get-started">Get Started</Link>
      </nav>
    </header>
  );
}
