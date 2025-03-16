import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import '../../styles/landingStyles.css';

const ContactSection = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      addToast('Your message has been sent successfully!', 'success');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-container">
        <div className="section-header">
          <h2>Get in Touch</h2>
          <p>Have questions about the electoral data dashboard? Contact us!</p>
        </div>
        
        <div className="contact-container">
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="contact-method">
              <div className="contact-icon">✉️</div>
              <div>
                <h4>Email</h4>
                <p>support@electoraldata.gov.in</p>
              </div>
            </div>
            <div className="contact-method">
              <div className="contact-icon">📞</div>
              <div>
                <h4>Phone</h4>
                <p>+91 11 2345 6789</p>
              </div>
            </div>
            <div className="contact-method">
              <div className="contact-icon">🏢</div>
              <div>
                <h4>Address</h4>
                <p>Election Commission of India, Nirvachan Sadan, Ashoka Road, New Delhi - 110001</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="contact-form-container"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;