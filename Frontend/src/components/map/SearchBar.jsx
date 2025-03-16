import React from 'react';
import { motion } from 'framer-motion';
import '../../styles/mapStyles.css';

const SearchBar = ({ onSearch, loading, error }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(event.target.city.value);
  };

  return (
    <motion.form
      className="search-form"
      onSubmit={handleSubmit}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <input
        className="search-input"
        type="text"
        name="city"
        placeholder="Search for a location in India"
        disabled={loading}
      />
      <motion.button
        className="search-button"
        type="submit"
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? 'Searching...' : 'Search'}
      </motion.button>
      {error && (
        <motion.div 
          className="error-message" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}
    </motion.form>
  );
};

export default SearchBar;