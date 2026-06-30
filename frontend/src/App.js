import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CameraScreen from './pages/CameraScreen';
import Navbar from './components/Navbar';
import LightPillar from './LightPillar';
import Features from './components/Features';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="App" onMouseMove={handleMouseMove}>
      <Navbar />
      <div className="glare-effect" style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y}px`
      }}></div>
      
      <Routes>
        <Route path="/" element={
          <div className="home-container">
            <div className="hero-section">
              <div className="light-pillar-background">
                <LightPillar
                  topColor="#001D4D"
                  bottomColor="#FF2D4A"
                  intensity={1.0}
                  rotationSpeed={0.65}
                  glowAmount={0.008}
                  pillarWidth={4.5}
                  pillarHeight={0.5}
                  noiseIntensity={0.1}
                  pillarRotation={35}
                  interactive={false}
                  mixBlendMode="screen"
                />
              </div>
              
              <div className="hero-content">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <img src="/logo.png" alt="Sign Language App Logo" className="h-32 w-auto" />
                  </div>
                </div>
                <h1 className="hero-title">11BATCH-MEET</h1>
                <h4 className="hero-subtitle">
                  <b>A smart platform that enables differently abled individuals to communicate effortlessly with others in real time, making conversations more inclusive and accessible.</b>
                </h4>
                <div className="hero-buttons">
                  <Link to="/login" className="btn btn-primary">Get Started</Link>
                  <button className="btn btn-secondary">Learn More</button>
                </div>
              </div>
            </div>
            <Features />
            <Footer />
          </div>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/camera" element={<CameraScreen />} />
      </Routes>
    </div>
  );
}

export default App;
