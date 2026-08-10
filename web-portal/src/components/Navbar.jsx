import React, { useState, useEffect } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import ForgeLogo from './ForgeLogo';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Routes', href: '#routes' },
    { name: 'Passes', href: '#passes' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Vehicles', href: '#vehicles' },
    { name: 'Features', href: '#features' }
  ];

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Left: Forge India Connect Logo */}
        <a href="#hero" className={styles.logoWrapper}>
          <ForgeLogo variant="header" />
        </a>

        {/* Center: Navigation Links */}
        <nav className={styles.desktopNav}>
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className={styles.navLink}>
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: Login & CTA Button */}
        <div className={styles.rightActions}>
          <a href="/login" className={styles.loginBtn}>
            Login
          </a>
          <a href="#passes" className="btn btn-yellow">
            <span>Get Your Pass</span>
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className={styles.mobileActions}>
              <a href="/login" className={styles.mobileLoginBtn} onClick={() => setMobileMenuOpen(false)}>
                Login
              </a>
              <a 
                href="#passes" 
                className="btn btn-yellow" 
                style={{ width: '100%', justifyContent: 'center' }} 
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Get Your Pass</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
