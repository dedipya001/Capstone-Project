import React from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import '../../styles/landingStyles.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🗺️',
      title: 'Interactive Maps',
      description: 'Explore detailed electoral boundaries with interactive parliamentary constituency maps.'
    },
    {
      icon: '📊',
      title: 'Data Visualization',
      description: 'Visualize electoral data with intuitive charts, graphs, and color-coded maps.'
    },
    {
      icon: '🔍',
      title: 'Search & Filter',
      description: 'Quickly find specific constituencies, states, or regions with powerful search tools.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access the dashboard on any device with a fully responsive design.'
    },
    {
      icon: '📤',
      title: 'Export Options',
      description: 'Export data and maps in multiple formats for reports and presentations.'
    },
    {
      icon: '🔒',
      title: 'Secure Access',
      description: 'Role-based access control ensures data security and integrity.'
    }
  ];

  return (
    <section className="features-section" id="features">
      <div className="section-container">
        <div className="section-header">
          <h2>Key Features</h2>
          <p>Explore the powerful tools and capabilities of our garbage monitoring data dashboard</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;