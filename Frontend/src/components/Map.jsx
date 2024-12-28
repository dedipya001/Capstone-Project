import React, { useState } from 'react';
import Map, { Source, Layer, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Access Mapbox token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MyMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 16.5062,  // Vijayawada's coordinates
    longitude: 80.6480,
    zoom: 12,
    pitch: 45,
    bearing: -17.6,
  });

  const [cityBoundary, setCityBoundary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch city boundaries using Mapbox Geocoding API
  const fetchCityBoundaries = async (cityName) => {
    setLoading(true);
    try {
      // Get city coordinates and bounding box
      const geocodingResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${cityName}.json?country=IN&types=place&access_token=${MAPBOX_TOKEN}`
      );
      const geocodingData = await geocodingResponse.json();

      if (!geocodingData.features || geocodingData.features.length === 0) {
        throw new Error('City not found');
      }

      const feature = geocodingData.features[0];
      const [minLng, minLat, maxLng, maxLat] = feature.bbox || [
        feature.center[0] - 0.1,
        feature.center[1] - 0.1,
        feature.center[0] + 0.1,
        feature.center[1] + 0.1
      ];

      // Create a GeoJSON boundary from the bounding box
      const boundaryGeoJSON = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {
            name: feature.place_name,
            type: 'city-boundary'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [minLng, minLat],
              [maxLng, minLat],
              [maxLng, maxLat],
              [minLng, maxLat],
              [minLng, minLat]
            ]]
          }
        }]
      };

      return boundaryGeoJSON;
    } catch (error) {
      console.error('Error fetching city boundaries:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const cityName = event.target.city.value;
    setError(null);

    try {
      const boundaryData = await fetchCityBoundaries(cityName);
      setCityBoundary(boundaryData);

      // Center the map on the city
      const center = boundaryData.features[0].geometry.coordinates[0][0];
      setViewport({
        latitude: center[1],
        longitude: center[0],
        zoom: 11,
        pitch: 45,
        bearing: -17.6,
      });
    } catch (error) {
      setError('Error fetching city data. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Search form */}
      <form 
        onSubmit={handleSearch} 
        style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          zIndex: 1,
          background: 'rgba(0,0,0,0.7)',
          padding: '15px',
          borderRadius: '5px',
          border: '2px solid #00ff00'
        }}
      >
        <input
          type="text"
          name="city"
          placeholder="Search for an Indian city"
          style={{ 
            padding: '10px', 
            fontSize: '16px', 
            width: '300px',
            background: '#222',
            color: '#00ff00',
            border: '1px solid #00ff00',
            borderRadius: '3px'
          }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            marginLeft: '10px',
            background: loading ? '#004400' : '#00ff00',
            color: loading ? '#00ff00' : '#000',
            border: 'none',
            borderRadius: '3px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Search'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </form>

      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* City boundary layer */}
        {cityBoundary && (
          <Source
            id="city-boundary"
            type="geojson"
            data={cityBoundary}
          >
            {/* Boundary fill */}
            <Layer
              id="boundary-fill"
              type="fill"
              paint={{
                'fill-color': '#00ff00',
                'fill-opacity': 0.1
              }}
            />

            {/* Boundary line */}
            <Layer
              id="boundary-line"
              type="line"
              paint={{
                'line-color': '#00ff00',
                'line-width': 2,
                'line-opacity': 0.8,
                'line-dasharray': [2, 2]
              }}
            />

            {/* City name label */}
            <Layer
              id="city-label"
              type="symbol"
              layout={{
                'text-field': ['get', 'name'],
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 24,
                'text-transform': 'uppercase',
                'text-anchor': 'center',
                'text-justify': 'center'
              }}
              paint={{
                'text-color': '#00ff00',
                'text-halo-color': '#000',
                'text-halo-width': 2
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};

export default MyMap;
