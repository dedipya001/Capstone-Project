import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/common/Header';
import ElectoralMap from '../components/map/ElectoralMap';
import AuthGuard from '../components/common/AuthGuard';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/mapStyles.css';

const MapPage = () => {
  // Use a ref to track if toasts have been shown
  const toastsShown = useRef(false);
  
  useEffect(() => {
    // Only show toasts on initial render
    if (!toastsShown.current) {
      toast.info('Tip: Click on a state to see its parliamentary constituencies', {
        position: "top-right",
        autoClose: 8000
      });
      
      const timer = setTimeout(() => {
        toast.success('Map data successfully loaded', {
          position: "top-right",
          autoClose: 5000
        });
      }, 3000);
      
      toastsShown.current = true;
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AuthGuard>
      <div className="map-layout">
        {/* Custom header with back button */}
        <div className="map-header">
          <Link to="/dashboard" className="back-to-dashboard">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <div className="map-title">
            Electoral Map
          </div>
          <div className="map-header-right">
            {/* Optional: Add controls like fullscreen, help, etc. */}
          </div>
        </div>
        
        {/* Full-width/height map container */}
        <div className="map-fullscreen-container">
          <ElectoralMap />
        </div>
      </div>
    </AuthGuard>
  );
};

export default MapPage;