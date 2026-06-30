import React from 'react';

const Features = () => {
  const features = [
    {
      icon: '🤟',
      title: 'Real-Time Sign Language Translation',
      points: [
        'Detects hand gestures using computer vision',
        'Converts sign language into text and speech instantly',
        'Helps deaf and mute users communicate with others smoothly'
      ]
    },
    {
      icon: '🔊',
      title: 'Speech-to-Text Conversion',
      points: [
        'Converts spoken language into readable text',
        'Enables deaf users to understand conversations in real time'
      ]
    },
    {
      icon: '📢',
      title: 'Text-to-Speech Output',
      points: [
        'Converts text messages into natural-sounding voice',
        'Assists visually impaired users and supports hands-free interaction'
      ]
    },
    {
      icon: '👥',
      title: 'Multi-User Communication Platform',
      points: [
        'Allows differently abled and non-disabled users to communicate together',
        'Works in real-time during meetings or conversations'
      ]
    },
    {
      icon: '🎨',
      title: 'Accessible & User-Friendly Interface',
      points: [
        'Simple UI with clear buttons and readable fonts',
        'Designed considering accessibility standards'
      ]
    },
    {
      icon: '🌐',
      title: 'Multi-Language Support',
      points: [
        'Supports translation between multiple languages',
        'Helps users from different regions communicate easily'
      ]
    },
    {
      icon: '🤖',
      title: 'AI-Powered Processing',
      points: [
        'Uses Machine Learning, NLP, and Computer Vision',
        'Ensures accurate and fast translation across communication modes'
      ]
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-header">
          <h2 className="section-title">🌟 Features</h2>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <span className="feature-icon">{feature.icon}</span>
                <h3 className="feature-title">{feature.title}</h3>
              </div>
              <ul className="feature-points">
                {feature.points.map((point, i) => (
                  <li key={i} className="feature-point">
                    <span className="bullet-point">•</span>
                    <span className="point-text">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
