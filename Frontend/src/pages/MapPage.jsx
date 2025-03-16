import React, { useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ElectoralMap from '../components/map/ElectoralMap';
import AuthGuard from '../components/common/AuthGuard';
import '../styles/mapStyles.css';

const MapPage = () => {
  // Use a ref to track if the initial toasts have been shown
  const toastsShown = useRef(false);
  
  useEffect(() => {
    // Only show toasts on the first render
    if (!toastsShown.current) {
      // Show the tip toast
      toast.info('Tip: Click on a state to see its parliamentary constituencies', {
        position: "top-right",
        autoClose: 8000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      
      // Queue the success toast to show after a delay
      const successTimer = setTimeout(() => {
        toast.success('Map data successfully loaded', {
          position: "top-right",
          autoClose: 5000
        });
      }, 3000);
      
      // Mark toasts as shown
      toastsShown.current = true;
      
      // Clean up the timer on component unmount
      return () => clearTimeout(successTimer);
    }
  }, []); // Empty dependency array ensures this runs only once

  return (
    <AuthGuard>
      <div className="dashboard-layout">
        <Header />
        <div className="dashboard-main">
          <Sidebar />
          <div className="dashboard-content map-container">
            <ElectoralMap />
          </div>
        </div>
      </div>
      <ToastContainer />
    </AuthGuard>
  );
};

export default MapPage;