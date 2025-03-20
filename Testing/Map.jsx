import React, { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styled from 'styled-components';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as turf from '@turf/turf';
import indiaGeoData from '../Frontend/src/assets/india_geo.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Styled components
const StyledContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #000;
`;

const SearchForm = styled(motion.form)`
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  width: 90%;
  max-width: 500px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 12px;
  font-size: 16px;
  background: #222;
  color: #00ff00;
  border: 1px solid #00ff00;
  border-radius: 5px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }
`;

const SearchButton = styled(motion.button)`
  padding: 12px 25px;
  font-size: 16px;
  background: #00ff00;
  color: #000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;

  &:disabled {
    background: #004400;
    color: #00ff00;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.div)`
  width: 100%;
  color: #ff0000;
  text-align: center;
  margin-top: 10px;
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 4px solid #00ff00;
  border-radius: 50%;
  border-top-color: transparent;
`;

const InfoPanel = styled(motion.div)`
  position: absolute;
  top: 100px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #00ff00;
  max-width: 300px;
  z-index: 2;
`;

const StateSelector = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #00ff00;
  max-width: 300px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 2;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #111;
  }

  &::-webkit-scrollbar-thumb {
    background: #00aa00;
    border-radius: 5px;
  }
`;

const StateOption = styled.div`
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 5px;
  margin-bottom: 5px;

  &:hover {
    background: rgba(0, 255, 0, 0.2);
  }

  ${(props) =>
    props.selected &&
    `
    background: rgba(0, 255, 0, 0.4);
    font-weight: bold;
  `}
`;

const PCList = styled(motion.div)`
  position: absolute;
  top: 100px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #ff00ff;
  max-width: 300px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 2;

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #111;
  }

  &::-webkit-scrollbar-thumb {
    background: #aa00aa;
    border-radius: 5px;
  }
`;

const PCOption = styled.div`
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 5px;
  margin-bottom: 5px;

  &:hover {
    background: rgba(255, 0, 255, 0.2);
  }

  ${(props) =>
    props.selected &&
    `
    background: rgba(255, 0, 255, 0.4);
    font-weight: bold;
  `}
`;

const Legend = styled(motion.div)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #00ff00;
  z-index: 2;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  background: ${(props) => props.color};
  margin-right: 10px;
  border-radius: 3px;
`;

const AttributionText = styled.div`
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  z-index: 1;
`;

const MyMap = () => {
  const [viewport, setViewport] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 4,
    pitch: 45,
    bearing: 0,
  });

  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedPC, setSelectedPC] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [showStateSidebar, setShowStateSidebar] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Process GeoJSON data 
  const processedGeoData = useMemo(() => {
    const features = Array.isArray(indiaGeoData) ? indiaGeoData : 
                    (indiaGeoData.features ? indiaGeoData.features : [indiaGeoData]);
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  }, []);

  // Extract unique states from GeoJSON
  const statesList = useMemo(() => {
    if (!processedGeoData || !processedGeoData.features) return [];
    
    const states = new Set();
    processedGeoData.features.forEach(feature => {
      if (feature.properties && feature.properties.STATE_NAME) {
        states.add(feature.properties.STATE_NAME);
      }
    });
    
    return Array.from(states).sort();
  }, [processedGeoData]);

  // Create state boundaries GeoJSON
  const stateData = useMemo(() => {
    if (!processedGeoData || !processedGeoData.features) return null;
    
    // Group features by state
    const stateMap = {};
    processedGeoData.features.forEach(feature => {
      if (!feature.properties || !feature.properties.STATE_NAME) return;
      
      const stateName = feature.properties.STATE_NAME;
      if (!stateMap[stateName]) {
        stateMap[stateName] = [];
      }
      stateMap[stateName].push(feature);
    });
    
    // Create a feature collection with state boundaries
    return {
      type: 'FeatureCollection',
      features: Object.keys(stateMap).map(stateName => {
        // Calculate state properties
        const stateFeatures = stateMap[stateName];
        const pcCount = stateFeatures.length;
        const stCode = stateFeatures[0].properties.ST_CODE;
        
        // Try to create a MultiPolygon for each state by combining PC boundaries
        try {
          const polygons = stateFeatures
            .map(feature => {
              if (!feature.geometry || !feature.geometry.coordinates) return null;
              return feature.geometry.type === 'Polygon' 
                ? feature.geometry.coordinates 
                : feature.geometry.type === 'MultiPolygon'
                  ? feature.geometry.coordinates
                  : null;
            })
            .filter(coords => coords !== null);
          
          return {
            type: 'Feature',
            properties: {
              STATE_NAME: stateName,
              PC_COUNT: pcCount,
              ST_CODE: stCode
            },
            geometry: {
              type: 'MultiPolygon',
              coordinates: polygons
            }
          };
        } catch (e) {
          console.warn(`Error creating state boundary for ${stateName}:`, e);
          return null;
        }
      }).filter(feature => feature !== null)
    };
  }, [processedGeoData]);

  // Filter constituencies by selected state
  const pcData = useMemo(() => {
    if (!processedGeoData || !selectedState) return null;
    
    return {
      type: 'FeatureCollection',
      features: processedGeoData.features.filter(
        feature => feature.properties && feature.properties.STATE_NAME === selectedState
      )
    };
  }, [processedGeoData, selectedState]);

  // Get PCs list for the selected state
  const pcList = useMemo(() => {
    if (!pcData || !pcData.features) return [];
    
    return pcData.features
      .map(feature => ({
        name: feature.properties.PC_NAME,
        number: feature.properties.PC_No
      }))
      .sort((a, b) => a.number - b.number);
  }, [pcData]);

  // Function to find PC at a point using turf.js
  const findPCAtPoint = (lng, lat) => {
    if (!processedGeoData || !processedGeoData.features) return null;
    
    const point = turf.point([lng, lat]);
    
    for (const feature of processedGeoData.features) {
      try {
        if (!feature.geometry) continue;
        
        const geom = feature.geometry.type === 'Polygon'
          ? turf.polygon(feature.geometry.coordinates)
          : feature.geometry.type === 'MultiPolygon'
            ? turf.multiPolygon(feature.geometry.coordinates)
            : null;
            
        if (geom && turf.booleanPointInPolygon(point, geom)) {
          return {
            stateName: feature.properties.STATE_NAME,
            pcName: feature.properties.PC_NAME,
            pcNo: feature.properties.PC_No,
            stCode: feature.properties.ST_CODE,
          };
        }
      } catch (e) {
        console.warn('Error in point-in-polygon check:', e);
      }
    }
    
    return null;
  };

  // Handle search using Nominatim API for geocoding
  const handleSearch = async (event) => {
    event.preventDefault();
    const placeName = event.target.city.value;
    setError(null);
  
    try {
      setLoading(true);
  
      // Use Nominatim API for geocoding (free)
      const geocodeResponse = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: `${placeName}, India`,
            format: 'json',
            limit: 1,
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'Electoral Map Visualization App'
          }
        }
      );
  
      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        throw new Error('Location not found');
      }
  
      const location = geocodeResponse.data[0];
      const lat = parseFloat(location.lat);
      const lng = parseFloat(location.lon);
      
      // Find which PC/state contains this location
      const pcInfo = findPCAtPoint(lng, lat);
      
      if (pcInfo) {
        setSelectedState(pcInfo.stateName);
        setSelectedPC(pcInfo.pcName);
        
        setPopupInfo({
          longitude: lng,
          latitude: lat,
          stateName: pcInfo.stateName,
          pcName: pcInfo.pcName,
          pcNo: pcInfo.pcNo
        });
      } else {
        // If no exact PC match is found, try to get state information from Nominatim
        const address = location.address;
        const stateName = address.state;
        
        if (stateName && statesList.includes(stateName)) {
          setSelectedState(stateName);
          setSelectedPC(null);
        }
        
        setPopupInfo({
          longitude: lng,
          latitude: lat,
          locationName: location.display_name,
          stateName: address.state || 'Unknown'
        });
      }
      
      // Get additional location info with reverse geocoding
      const reverseResponse = await axios.get(
        'https://nominatim.openstreetmap.org/reverse',
        {
          params: {
            lat,
            lon: lng,
            format: 'json',
            addressdetails: 1,
            zoom: 14
          },
          headers: {
            'User-Agent': 'Electoral Map Visualization App'
          }
        }
      );
      
      const address = reverseResponse.data.address;
      
      // Create GeoJSON for search result
      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: address.city || address.town || address.village || address.county || placeName,
              type: 'search-point',
              address: reverseResponse.data.display_name
            },
            geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            }
          }
        ]
      };

      setCityData({
        geoJSON,
        center: [lng, lat]
      });

      // Update viewport to focus on the searched location
      setViewport({
        longitude: lng,
        latitude: lat,
        zoom: 10,
        pitch: 45,
        bearing: 0,
        transitionDuration: 2000,
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error fetching location data');
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on the map
  const handleMapClick = (event) => {
    const { features } = event;
    
    if (!features || features.length === 0) {
      // Clicked on empty area - do nothing or reset selection
      return;
    }
    
    const clickedFeature = features[0];
    
    if (clickedFeature.layer.id === 'state-fills') {
      // Clicked on a state
      setSelectedState(clickedFeature.properties.STATE_NAME);
      setSelectedPC(null);
      setPopupInfo(null);
    } else if (clickedFeature.layer.id === 'pc-fills') {
      // Clicked on a PC
      setSelectedPC(clickedFeature.properties.PC_NAME);
      
      // Create popup info
      try {
        // Get centroid for popup placement
        const centroid = getFeatureCentroid(clickedFeature);
        
        if (centroid) {
          setPopupInfo({
            longitude: centroid[0],
            latitude: centroid[1],
            stateName: clickedFeature.properties.STATE_NAME,
            pcName: clickedFeature.properties.PC_NAME,
            pcNo: clickedFeature.properties.PC_No
          });
        }
      } catch (e) {
        console.warn('Error getting coordinates for popup', e);
      }
    } else if (clickedFeature.layer.id === 'search-point') {
      // Clicked on search point - show detailed info
      const { lng, lat } = event.lngLat;
      
      setPopupInfo({
        longitude: lng,
        latitude: lat,
        locationName: clickedFeature.properties.name,
        address: clickedFeature.properties.address
      });
    }
  };

  // Handle hovering over map features
  const handleHover = (event) => {
    const { features } = event;
    if (features && features.length > 0) {
      setHoveredFeature(features[0]);
    } else {
      setHoveredFeature(null);
    }
  };

  // Calculate centroid for a polygon feature
  const getFeatureCentroid = (feature) => {
    try {
      if (!feature || !feature.geometry) return null;
      
      const geom = feature.geometry.type === 'Polygon'
        ? turf.polygon(feature.geometry.coordinates)
        : feature.geometry.type === 'MultiPolygon'
          ? turf.multiPolygon(feature.geometry.coordinates)
          : null;
          
      if (!geom) return null;
          
      const centroid = turf.centroid(geom);
      return centroid.geometry.coordinates;
    } catch (e) {
      console.warn('Error calculating centroid', e);
      return null;
    }
  };

  // Reset view to all of India
  const resetView = () => {
    setSelectedState(null);
    setSelectedPC(null);
    setPopupInfo(null);
    setCityData(null);
    
    setViewport({
      latitude: 20.5937,
      longitude: 78.9629,
      zoom: 4,
      pitch: 45,
      bearing: 0,
      transitionDuration: 1000,
    });
  };

  return (
    <StyledContainer>
      <AnimatePresence>
        {loading && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </LoadingOverlay>
        )}
      </AnimatePresence>

      {/* Search form */}
      <SearchForm
        onSubmit={handleSearch}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SearchInput
          type="text"
          name="city"
          placeholder="Search for a location in India"
          disabled={loading}
        />
        <SearchButton
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Searching...' : 'Search'}
        </SearchButton>
        {error && (
          <ErrorMessage initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {error}
          </ErrorMessage>
        )}
      </SearchForm>

      {/* State selection sidebar */}
      {showStateSidebar && !selectedState && (
        <StateSelector
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3>States & Union Territories</h3>
          <hr style={{ borderColor: '#00ff00', marginBottom: '10px' }} />
          {statesList.map(state => (
            <StateOption 
              key={state} 
              selected={state === selectedState}
              onClick={() => {
                setSelectedState(state);
                setSelectedPC(null);
                setPopupInfo(null);
                
                // Find center point of the state for better view
                const stateFeature = stateData.features.find(f => f.properties.STATE_NAME === state);
                if (stateFeature) {
                  const centroid = getFeatureCentroid(stateFeature);
                  if (centroid) {
                    setViewport({
                      longitude: centroid[0],
                      latitude: centroid[1],
                      zoom: 6,
                      pitch: 45,
                      bearing: 0,
                      transitionDuration: 1500,
                    });
                  }
                }
              }}
            >
              {state}
            </StateOption>
          ))}
        </StateSelector>
      )}

      {/* PC list when state is selected */}
      {selectedState && (
        <PCList
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{selectedState}</h3>
            <button 
              onClick={resetView}
              style={{ 
                background: 'transparent', 
                border: '1px solid #ff00ff',
                color: '#ff00ff',
                borderRadius: '5px',
                padding: '5px 10px',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
          <p>{pcList.length} Parliamentary Constituencies</p>
          <hr style={{ borderColor: '#ff00ff', marginBottom: '10px' }} />
          {pcList.map(pc => (
            <PCOption 
              key={pc.name} 
              selected={pc.name === selectedPC}
              onClick={() => {
                setSelectedPC(pc.name);
                
                // Find PC and center view on it
                const pcFeature = pcData.features.find(f => 
                  f.properties.PC_NAME === pc.name
                );
                
                if (pcFeature) {
                  const centroid = getFeatureCentroid(pcFeature);
                  if (centroid) {
                    setPopupInfo({
                      longitude: centroid[0],
                      latitude: centroid[1],
                      stateName: selectedState,
                      pcName: pc.name,
                      pcNo: pc.number
                    });
                    
                    setViewport({
                      longitude: centroid[0],
                      latitude: centroid[1],
                      zoom: 8,
                      pitch: 45,
                      bearing: 0,
                      transitionDuration: 1500,
                    });
                  }
                }
              }}
            >
              {pc.number}. {pc.name}
            </PCOption>
          ))}
        </PCList>
      )}

      {/* Legend */}
      {showLegend && (
        <Legend
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h4>Map Legend</h4>
          <LegendItem>
            <LegendColor color="#00aa44" />
            <span>States</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#440044" />
            <span>Parliamentary Constituencies</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#ff00ff" />
            <span>Selected PC</span>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#00ff00" />
            <span>Search Location</span>
          </LegendItem>
        </Legend>
      )}

      {/* Map component */}
      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onClick={handleMapClick}
        onMouseMove={handleHover}
        interactiveLayerIds={['state-fills', 'pc-fills', 'search-point']}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Render state boundaries */}
        {stateData && !selectedState && (
          <Source id="states-source" type="geojson" data={stateData}>
            <Layer
              id="state-fills"
              type="fill"
              paint={{
                'fill-color': [
                  'case',
                  ['boolean', ['==', ['get', 'STATE_NAME'], hoveredFeature?.properties?.STATE_NAME || ''], false],
                  '#00ff88',  // Highlighted state color
                  '#00aa44'   // Default state color
                ],
                'fill-opacity': 0.5
              }}
            />
            <Layer
              id="state-borders"
              type="line"
              paint={{
                'line-color': '#00ff00',
                'line-width': 1,
                'line-opacity': 0.8
              }}
            />
            <Layer
              id="state-labels"
              type="symbol"
              layout={{
                'text-field': ['get', 'STATE_NAME'],
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 14,
                'text-anchor': 'center',
                'text-allow-overlap': false
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1
              }}
            />
          </Source>
        )}

        {/* Render PC boundaries when a state is selected */}
        {pcData && selectedState && (
          <Source id="pcs-source" type="geojson" data={pcData}>
            <Layer
              id="pc-fills"
              type="fill"
              paint={{
                'fill-color': [
                  'case',
                  ['boolean', ['==', ['get', 'PC_NAME'], selectedPC || ''], false],
                  '#ff00ff',  // Selected PC
                  [
                    'case',
                    ['boolean', ['==', ['get', 'PC_NAME'], hoveredFeature?.properties?.PC_NAME || ''], false],
                    '#aa00aa',  // Hovered PC
                    '#440044'   // Default PC color
                  ]
                ],
                'fill-opacity': 0.7
              }}
            />
            <Layer
              id="pc-borders"
              type="line"
              paint={{
                'line-color': '#ff00ff',
                'line-width': 2,
                'line-opacity': 0.9
              }}
            />
            <Layer
              id="pc-labels"
              type="symbol"
              layout={{
                'text-field': ['get', 'PC_NAME'],
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-anchor': 'center',
                'text-allow-overlap': false
              }}
              paint={{
                'text-color': '#ffffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1
              }}
            />
          </Source>
        )}

        {/* Show search result when available */}
        {cityData && (
          <Source id="city-data" type="geojson" data={cityData.geoJSON}>
            <Layer
              id="search-point"
              type="circle"
              paint={{
                'circle-radius': 8,
                'circle-color': '#00ff00',
                'circle-opacity': 0.8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#ffffff'
              }}
            />
          </Source>
        )}

        {/* Popup for selected PC or search result */}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            anchor="bottom"
            maxWidth="300px"
          >
            <div style={{ padding: '5px' }}>
              {popupInfo.pcName ? (
                <>
                  <h4 style={{ margin: '0 0 5px' }}>
                    {popupInfo.pcName}
                  </h4>
                  <p style={{ margin: '0 0 3px' }}>
                    <strong>State:</strong> {popupInfo.stateName}
                  </p>
                  {popupInfo.pcNo && (
                    <p style={{ margin: '0' }}>
                      <strong>PC Number:</strong> {popupInfo.pcNo}
                    </p>
                  )}
                </>
              ) : popupInfo.locationName ? (
                <>
                  <h4 style={{ margin: '0 0 5px' }}>
                    {popupInfo.locationName}
                  </h4>
                  {popupInfo.stateName && (
                    <p style={{ margin: '0 0 3px' }}>
                      <strong>State:</strong> {popupInfo.stateName}
                    </p>
                  )}
                  {popupInfo.address && (
                    <p style={{ margin: '0', fontSize: '12px' }}>
                      {popupInfo.address}
                    </p>
                  )}
                </>
              ) : (
                <p style={{ margin: '0' }}>
                  Location Information
                </p>
              )}
            </div>
          </Popup>
        )}

        {/* Hover popup for any feature */}
        {hoveredFeature && !popupInfo && hoveredFeature.layer.id !== 'search-point' && (
          <Popup
            longitude={getFeatureCentroid(hoveredFeature)?.[0] || 0}
            latitude={getFeatureCentroid(hoveredFeature)?.[1] || 0}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
          >
            <div>
              {hoveredFeature.properties.PC_NAME && (
                <p><strong>PC:</strong> {hoveredFeature.properties.PC_NAME}</p>
              )}
              {hoveredFeature.properties.STATE_NAME && (
                <p><strong>State:</strong> {hoveredFeature.properties.STATE_NAME}</p>
              )}
              {hoveredFeature.properties.PC_No && (
                <p><strong>PC Number:</strong> {hoveredFeature.properties.PC_No}</p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      <AttributionText>
        Data from Municipal Corporation of India | Geocoding: © OpenStreetMap contributors
      </AttributionText>
    </StyledContainer>
  );
};

export default MyMap;