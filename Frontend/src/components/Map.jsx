// import React, { useState } from 'react';
// import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import styled from 'styled-components';
// import 'mapbox-gl/dist/mapbox-gl.css';

// const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
// const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

// // Styled components remain the same...
// const StyledContainer = styled.div`
//   position: relative;
//   width: 100vw;
//   height: 100vh;
//   background: #000;
// `;

// const SearchForm = styled(motion.form)`
//   position: absolute;
//   top: 20px;
//   left: 50%;
//   transform: translateX(-50%);
//   z-index: 1;
//   background: rgba(0, 0, 0, 0.8);
//   padding: 20px;
//   border-radius: 10px;
//   border: 2px solid #00ff00;
//   box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
//   width: 90%;
//   max-width: 500px;
//   display: flex;
//   flex-wrap: wrap;
//   gap: 10px;
// `;

// const SearchInput = styled.input`
//   flex: 1;
//   min-width: 200px;
//   padding: 12px;
//   font-size: 16px;
//   background: #222;
//   color: #00ff00;
//   border: 1px solid #00ff00;
//   border-radius: 5px;
//   outline: none;
//   transition: all 0.3s ease;

//   &:focus {
//     box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
//   }
// `;

// const SearchButton = styled(motion.button)`
//   padding: 12px 25px;
//   font-size: 16px;
//   background: #00ff00;
//   color: #000;
//   border: none;
//   border-radius: 5px;
//   cursor: pointer;
//   white-space: nowrap;

//   &:disabled {
//     background: #004400;
//     color: #00ff00;
//     cursor: not-allowed;
//   }
// `;

// const ErrorMessage = styled(motion.div)`
//   width: 100%;
//   color: #ff0000;
//   text-align: center;
//   margin-top: 10px;
// `;

// const LoadingOverlay = styled(motion.div)`
//   position: fixed;
//   top: 0;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: rgba(0, 0, 0, 0.7);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   z-index: 1000;
// `;

// const LoadingSpinner = styled(motion.div)`
//   width: 50px;
//   height: 50px;
//   border: 4px solid #00ff00;
//   border-radius: 50%;
//   border-top-color: transparent;
// `;


// const MyMap = () => {
//   const [viewport, setViewport] = useState({
//     latitude: 20.5937,
//     longitude: 78.9629,
//     zoom: 4,
//     pitch: 45,
//     bearing: 0,
//   });

//   const [cityData, setCityData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSearch = async (event) => {
//     event.preventDefault();
//     const cityName = event.target.city.value;
//     setError(null);

//     try {
//       setLoading(true);

//       // 1. Get city coordinates using HERE Geocoding API
//       const geocodeResponse = await axios.get(
//         'https://geocode.search.hereapi.com/v1/geocode',
//         {
//           params: {
//             q: `${cityName}, India`,
//             apiKey: HERE_API_KEY,
//             limit: 1,
//           },
//         }
//       );

//       if (!geocodeResponse.data.items?.length) {
//         throw new Error('City not found');
//       }

//       const city = geocodeResponse.data.items[0];
//       const { lat, lng } = city.position;

//       // 2. Fetch administrative areas (already in your code)
//       const browseResponse = await axios.get(
//         'https://browse.search.hereapi.com/v1/browse',
//         {
//           params: {
//             at: `${lat},${lng}`,
//             apiKey: HERE_API_KEY,
//             limit: 100,
//             categories: '300-3000-0025,300-3100,550-5510-0202,500-5520,600-6100-0062', // administrative areas
//             radius: 10000,
//           },
//         }
//       );

//       // 3. Fetch popular/highlighted areas (e.g., major attractions)
//       //    Use different categories or a dedicated HERE endpoint for places of interest.
//       const highlightsResponse = await axios.get(
//         'https://browse.search.hereapi.com/v1/browse',
//         {
//           params: {
//             at: `${lat},${lng}`,
//             apiKey: HERE_API_KEY,
//             limit: 50,
//             categories: '300-3100,500-5000,500-5400,500-5500,500-5510',  // Example category set
//             radius: 10000,
//           },
//         }
//       );

//       // Build GeoJSON
//       const cityBoundaryFeature = {
//         type: 'Feature',
//         properties: {
//           name: city.address.city || city.address.county,
//           type: 'city-boundary',
//         },
//         geometry: {
//           type: 'Polygon',
//           coordinates: [[
//             [city.mapView.west, city.mapView.south],
//             [city.mapView.east, city.mapView.south],
//             [city.mapView.east, city.mapView.north],
//             [city.mapView.west, city.mapView.north],
//             [city.mapView.west, city.mapView.south],
//           ]],
//         },
//       };

//       const adminFeatures = browseResponse.data.items
//         .filter((item) => {
//           const title = item.title.toLowerCase();
//           return (
//             item.position &&
//             (title.includes('district') ||
//               title.includes('zila') ||
//               title.includes('mandal') ||
//               title.includes('taluk') ||
//               title.includes('division'))
//           );
//         })
//         .map((item) => ({
//           type: 'Feature',
//           properties: {
//             name: item.title,
//             type: 'administrative',
//             level: item.categories?.[0]?.name || 'district',
//           },
//           geometry: {
//             type: 'Point',
//             coordinates: [item.position.lng, item.position.lat],
//           },
//         }));

//       // Create features for highlighted/popular areas
//       const highlightFeatures = highlightsResponse.data.items
//         .map((place) => ({
//           type: 'Feature',
//           properties: {
//             name: place.title,
//             type: 'highlight-area',
//           },
//           geometry: {
//             type: 'Point',
//             coordinates: [place.position.lng, place.position.lat],
//           },
//         }));

//       // Combine all features into a single GeoJSON
//       const geoJSON = {
//         type: 'FeatureCollection',
//         features: [
//           cityBoundaryFeature,
//           ...adminFeatures,
//           ...highlightFeatures,
//         ],
//       };

//       setCityData({
//         geoJSON,
//         bounds: [
//           city.mapView.west,
//           city.mapView.south,
//           city.mapView.east,
//           city.mapView.north,
//         ],
//       });

//       // Update viewport to city location
//       setViewport((prev) => ({
//         ...prev,
//         longitude: lng,
//         latitude: lat,
//         zoom: 11,
//         pitch: 45,
//         bearing: 0,
//         transitionDuration: 2000,
//       }));
//     } catch (error) {
//       console.error('Error:', error);
//       setError(error.message || 'Error fetching city data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <StyledContainer>
//       <AnimatePresence>
//         {loading && (
//           <LoadingOverlay
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <LoadingSpinner
//               animate={{ rotate: 360 }}
//               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//             />
//           </LoadingOverlay>
//         )}
//       </AnimatePresence>

//       <SearchForm
//         onSubmit={handleSearch}
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         <SearchInput
//           type="text"
//           name="city"
//           placeholder="Search for an Indian city"
//           disabled={loading}
//         />
//         <SearchButton
//           type="submit"
//           disabled={loading}
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           {loading ? 'Searching...' : 'Search'}
//         </SearchButton>
//         {error && (
//           <ErrorMessage initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//             {error}
//           </ErrorMessage>
//         )}
//       </SearchForm>

//       <Map
//         {...viewport}
//         onMove={(evt) => setViewport(evt.viewState)}
//         style={{ width: '100%', height: '100%' }}
//         mapStyle="mapbox://styles/mapbox/dark-v11"
//         mapboxAccessToken={MAPBOX_TOKEN}
//       >
//         <NavigationControl position="top-right" />
//         {cityData && (
//           <Source id="city-data" type="geojson" data={cityData.geoJSON}>
//             {/* City boundary */}
//             <Layer
//               id="city-boundary"
//               type="line"
//               filter={['==', ['get', 'type'], 'city-boundary']}
//               paint={{
//                 'line-color': '#00ff00',
//                 'line-width': 3,
//                 'line-opacity': 0.8,
//                 'line-dasharray': [2, 2],
//               }}
//             />

//             {/* Administrative labels */}
//             <Layer
//               id="administrative-labels"
//               type="symbol"
//               filter={['==', ['get', 'type'], 'administrative']}
//               layout={{
//                 'text-field': ['get', 'name'],
//                 'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
//                 'text-size': 16,
//                 'text-anchor': 'center',
//                 'text-justify': 'center',
//                 'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
//                 'text-radial-offset': 0.5,
//                 'text-letter-spacing': 0.05,
//               }}
//               paint={{
//                 'text-color': '#00ff00',
//                 'text-halo-color': '#000',
//                 'text-halo-width': 2,
//               }}
//             />

//             {/* Highlighted/popular locations */}
//             <Layer
//               id="highlight-locations"
//               type="circle"
//               filter={['==', ['get', 'type'], 'highlight-area']}
//               paint={{
//                 'circle-color': '#ff00ff',
//                 'circle-radius': 8,
//                 'circle-stroke-width': 2,
//                 'circle-stroke-color': '#fff',
//               }}
//             />

//             {/* (Optional) label the highlighted places */}
//             <Layer
//               id="highlight-labels"
//               type="symbol"
//               filter={['==', ['get', 'type'], 'highlight-area']}
//               layout={{
//                 'text-field': ['get', 'name'],
//                 'text-size': 14,
//                 'text-offset': [0, 1],
//                 'text-anchor': 'top',
//               }}
//               paint={{
//                 'text-color': '#ff00ff',
//                 'text-halo-color': '#000',
//                 'text-halo-width': 1,
//               }}
//             />
//           </Source>
//         )}
//       </Map>
//     </StyledContainer>
//   );
// };

// export default MyMap;




import React, { useState, useEffect, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl, Popup } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import styled from 'styled-components';
import 'mapbox-gl/dist/mapbox-gl.css';
import indiaGeoData from '../assets/india_geo.json';
import * as turf from '@turf/turf';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const HERE_API_KEY = import.meta.env.VITE_HERE_API_KEY;

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

  // Process GeoJSON data for efficient rendering
  const processedGeoData = useMemo(() => {
    if (!indiaGeoData) return null;
    
    // Create a FeatureCollection if needed
    if (!indiaGeoData.type || indiaGeoData.type !== 'FeatureCollection') {
      return {
        type: 'FeatureCollection',
        features: Array.isArray(indiaGeoData) ? indiaGeoData : [indiaGeoData]
      };
    }
    return indiaGeoData;
  }, []);

  // Create separate layers for states and PCs
  const stateData = useMemo(() => {
    if (!processedGeoData) return null;
    
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
        // Create a MultiPolygon geometry for each state
        const stateFeatures = stateMap[stateName];
        return {
          type: 'Feature',
          properties: {
            STATE_NAME: stateName,
            PC_COUNT: stateFeatures.length,
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: stateFeatures.map(feature => 
              feature.geometry.type === 'Polygon' 
                ? [feature.geometry.coordinates[0]]
                : feature.geometry.coordinates[0]
            )
          }
        };
      })
    };
  }, [processedGeoData]);

  // Filter PCs when a state is selected
  const pcData = useMemo(() => {
    if (!processedGeoData || !selectedState) return null;
    
    return {
      type: 'FeatureCollection',
      features: processedGeoData.features.filter(
        feature => feature.properties && feature.properties.STATE_NAME === selectedState
      )
    };
  }, [processedGeoData, selectedState]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const cityName = event.target.city.value;
    setError(null);
  
    try {
      setLoading(true);
  
      // Get city coordinates using HERE Geocoding API
      const geocodeResponse = await axios.get(
        'https://geocode.search.hereapi.com/v1/geocode',
        {
          params: {
            q: `${cityName}, India`,
            apiKey: HERE_API_KEY,
            limit: 1,
          },
        }
      );
  
      if (!geocodeResponse.data.items?.length) {
        throw new Error('City not found');
      }
  
      const city = geocodeResponse.data.items[0];
      const { lat, lng } = city.position;
      
      // Find which PC/state contains this location
      if (processedGeoData) {
        const point = turf.point([lng, lat]);
        
        let foundState = null;
        let foundPC = null;
        
        for (const feature of processedGeoData.features) {
          try {
            const poly = feature.geometry.type === 'Polygon' 
              ? turf.polygon(feature.geometry.coordinates) 
              : turf.multiPolygon(feature.geometry.coordinates);
            
            if (turf.booleanPointInPolygon(point, poly)) {
              foundState = feature.properties.STATE_NAME;
              foundPC = feature.properties.PC_NAME;
              break;
            }
          } catch (e) {
            console.warn('Error checking point in polygon', e);
          }
        }
        
        if (foundState) {
          setSelectedState(foundState);
          setSelectedPC(foundPC);
          
          setPopupInfo({
            longitude: lng,
            latitude: lat,
            stateName: foundState,
            pcName: foundPC
          });
        }
      }
      
      // Update viewport to focus on the city
      setViewport({
        longitude: lng,
        latitude: lat,
        zoom: 10,
        pitch: 45,
        bearing: 0,
        transitionDuration: 2000,
      });
      
      // Fetch administrative areas
      const browseResponse = await axios.get(
        'https://browse.search.hereapi.com/v1/browse',
        {
          params: {
            at: `${lat},${lng}`,
            apiKey: HERE_API_KEY,
            limit: 100,
            categories: '300-3000-0025,300-3100,550-5510-0202,500-5520,600-6100-0062', // administrative areas
            radius: 10000,
          },
        }
      );

      const geoJSON = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: city.address.city || city.address.county,
              type: 'city-boundary',
            },
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [city.mapView.west, city.mapView.south],
                [city.mapView.east, city.mapView.south],
                [city.mapView.east, city.mapView.north],
                [city.mapView.west, city.mapView.north],
                [city.mapView.west, city.mapView.south],
              ]],
            },
          },
          ...browseResponse.data.items
            .filter((item) => {
              const title = item.title.toLowerCase();
              return (
                item.position &&
                (title.includes('district') ||
                  title.includes('zila') ||
                  title.includes('mandal') ||
                  title.includes('taluk') ||
                  title.includes('division'))
              );
            })
            .map((item) => ({
              type: 'Feature',
              properties: {
                name: item.title,
                type: 'administrative',
                level: item.categories?.[0]?.name || 'district',
              },
              geometry: {
                type: 'Point',
                coordinates: [item.position.lng, item.position.lat],
              },
            })),
        ],
      };

      setCityData({
        geoJSON,
        bounds: [
          city.mapView.west,
          city.mapView.south,
          city.mapView.east,
          city.mapView.north,
        ],
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error fetching city data');
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on the map
  const handleMapClick = (event) => {
    if (!event.features || event.features.length === 0) {
      setSelectedState(null);
      setSelectedPC(null);
      setPopupInfo(null);
      return;
    }
    
    const clickedFeature = event.features[0];
    
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
        const coordinates = clickedFeature.geometry.type === 'Polygon'
          ? clickedFeature.geometry.coordinates[0][0]
          : clickedFeature.geometry.coordinates[0][0][0];
          
        setPopupInfo({
          longitude: coordinates[0],
          latitude: coordinates[1],
          stateName: clickedFeature.properties.STATE_NAME,
          pcName: clickedFeature.properties.PC_NAME,
          pcNo: clickedFeature.properties.PC_No
        });
      } catch (e) {
        console.warn('Error getting coordinates for popup', e);
      }
    }
  };

  // Handle hovering over the map
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
      
      const polygon = feature.geometry.type === 'Polygon'
        ? turf.polygon(feature.geometry.coordinates)
        : turf.multiPolygon(feature.geometry.coordinates);
      
      const centroid = turf.centroid(polygon);
      return centroid.geometry.coordinates;
    } catch (e) {
      console.warn('Error calculating centroid', e);
      return null;
    }
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

      <SearchForm
        onSubmit={handleSearch}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SearchInput
          type="text"
          name="city"
          placeholder="Search for an Indian city"
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

      {selectedState && (
        <InfoPanel
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
        >
          <h3>{selectedState}</h3>
          {selectedPC && <h4>PC: {selectedPC}</h4>}
          <button onClick={() => {
            setSelectedState(null);
            setSelectedPC(null);
            setPopupInfo(null);
            
            // Reset view to India
            setViewport({
              latitude: 20.5937,
              longitude: 78.9629,
              zoom: 4,
              pitch: 45,
              bearing: 0,
              transitionDuration: 1000,
            });
          }}>
            Back to All States
          </button>
        </InfoPanel>
      )}

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onClick={handleMapClick}
        onMouseMove={handleHover}
        interactiveLayerIds={['state-fills', 'pc-fills']}
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

        {/* Show city data when available */}
        {cityData && (
          <Source id="city-data" type="geojson" data={cityData.geoJSON}>
            <Layer
              id="city-boundary"
              type="line"
              filter={['==', ['get', 'type'], 'city-boundary']}
              paint={{
                'line-color': '#00ff00',
                'line-width': 3,
                'line-opacity': 0.8,
                'line-dasharray': [2, 2],
              }}
            />

            <Layer
              id="administrative-points"
              type="circle"
              filter={['==', ['get', 'type'], 'administrative']}
              paint={{
                'circle-radius': 6,
                'circle-color': '#00ffff',
                'circle-opacity': 0.7,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff'
              }}
            />

            <Layer
              id="administrative-labels"
              type="symbol"
              filter={['==', ['get', 'type'], 'administrative']}
              layout={{
                'text-field': ['get', 'name'],
                'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-anchor': 'top',
                'text-offset': [0, 1],
                'text-allow-overlap': false
              }}
              paint={{
                'text-color': '#00ffff',
                'text-halo-color': '#000000',
                'text-halo-width': 1
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
          >
            <div style={{ padding: '5px' }}>
              <h4 style={{ margin: '0 0 5px' }}>
                {popupInfo.pcName || 'Location Info'}
              </h4>
              <p style={{ margin: '0 0 3px' }}>
                <strong>State:</strong> {popupInfo.stateName}
              </p>
              {popupInfo.pcNo && (
                <p style={{ margin: '0' }}>
                  <strong>PC Number:</strong> {popupInfo.pcNo}
                </p>
              )}
            </div>
          </Popup>
        )}

        {/* Hover popup for any feature */}
        {hoveredFeature && !popupInfo && (
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
    </StyledContainer>
  );
};

export default MyMap;