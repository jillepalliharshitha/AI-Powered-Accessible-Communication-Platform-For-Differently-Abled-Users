import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Copyright Section */}
          <div className="footer-section">
            <h3 className="footer-title">11BATCH-MEET</h3>
            <p className="footer-description">
              A smart platform that enables differently abled individuals to communicate 
              effortlessly with others in real time, making conversations more inclusive and accessible.
            </p>
            <div className="copyright">
              <p>&copy; {currentYear} <a href="https://gvignesh.in" target="_blank" rel="noopener noreferrer" className="copyright-link">gvignesh.in</a></p>
              <p className="rights">All rights reserved.</p>
            </div>
          </div>
          
          {/* Team Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Team</h4>
            <ul className="footer-list">
              <li><span className="highlight">Project Lead:</span>ANUSHA</li>
              <li><span className="highlight">AI/ML Engineer:</span> Computer Vision Specialist</li>
              <li><span className="highlight">Frontend Dev:</span> React & UI/UX Expert</li>
              <li><span className="highlight">Backend Dev:</span> API & Database Architect</li>
              <li><span className="highlight">Accessibility:</span> Sign Language Consultant</li>
            </ul>
          </div>
          
          {/* Quick Links Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="/login" className="footer-link">Sign In</a></li>
            </ul>
          </div>
          
          {/* Contact Section */}
          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <div className="social-links">
              <a href="https://gvignesh.in" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Website">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M2 12h20"></path>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </a>
              <a href="mailto:vigneshguthi3212@gmail.com" className="social-link" aria-label="Email">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-10 5L2 7"></path>
                </svg>
              </a>
            </div>
            <p className="contact-info">
              <span className="highlight">Email:</span> vigneshguthi3212@gmail.com
            </p>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-note">
              Built with ❤️ for inclusive communication
            </p>
            <div className="footer-badges">
              <span className="badge">AI Powered</span>
              <span className="badge">Accessible</span>
              <span className="badge">Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
