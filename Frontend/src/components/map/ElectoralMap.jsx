// src/components/map/ElectoralMap.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/mapStyles.css';

// Import components
import SearchBar from './SearchBar';
import StateSelector from './StateSelector';
import PCList from './PCList';
import MapLegend from './MapLegend';
import LoadingOverlay from './LoadingOverlay';
import { FeaturePopup, HoverPopup } from './InfoPopup';
import { StateLayers, PCLayers, SearchResultLayer } from './MapLayers';
import Attribution from '../common/Attribution';

// Import utilities
import { 
  getFeatureCentroid, 
  extractStatesList,
  createStateBoundaries,
  getConstituenciesForState
} from './utils/geoUtils';
import {
  DEFAULT_VIEWPORT,
  processSearchResults
} from './utils/mapUtils';

// Import data
import indiaGeoData from '../../assets/india_geo.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const ElectoralMap = () => {
  const { addToast } = useToast();
  // Get settings from context
  const { mapSettings } = useSettings();
  
  // State for map viewport
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  
  // State for search and UI
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedPC, setSelectedPC] = useState(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  
  // Use map settings from context instead of local state
  const showStateSidebar = mapSettings.showStateSidebar;
  const showLegend = mapSettings.showLegend;
  const showPopups = mapSettings.showPopups;
  const mapStyle = mapSettings.mapStyle;

  // Process GeoJSON data 
  const processedGeoData = useMemo(() => {
    const features = Array.isArray(indiaGeoData) ? indiaGeoData : 
                    (indiaGeoData.features ? indiaGeoData.features : [indiaGeoData]);
    
    return {
      type: 'FeatureCollection',
      features: features
    };
  }, []);

  // Extract state and constituency data
  const statesList = useMemo(() => extractStatesList(processedGeoData), [processedGeoData]);
  const stateData = useMemo(() => createStateBoundaries(processedGeoData), [processedGeoData]);
  const pcData = useMemo(() => 
    getConstituenciesForState(processedGeoData, selectedState), 
    [processedGeoData, selectedState]
  );

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

  // Show initial map loaded notification
  useEffect(() => {
    // Show this notification only once per session
    addToast(
      'Electoral map initialized successfully', 
      'info', 
      5000,
      { once: true, id: 'map-initialized' }
    );
  }, [addToast]);

  // Handle search
  const handleSearch = async (placeName) => {
    setError(null);
  
    try {
      setLoading(true);
      
      const result = await processSearchResults(placeName, processedGeoData, statesList);
      
      if (result.pcInfo) {
        setSelectedState(result.pcInfo.stateName);
        setSelectedPC(result.pcInfo.pcName);
        
        if (showPopups) {
          setPopupInfo({
            longitude: result.location.lng,
            latitude: result.location.lat,
            stateName: result.pcInfo.stateName,
            pcName: result.pcInfo.pcName,
            pcNo: result.pcInfo.pcNo
          });
        }
        
        // Show constituency found notification
        addToast(
          `Found constituency: ${result.pcInfo.pcName} in ${result.pcInfo.stateName}`,
          'success',
          5000
        );
      } else {
        // If no exact PC match is found
        if (result.stateName) {
          setSelectedState(result.stateName);
          setSelectedPC(null);
          
          // Show state found notification
          addToast(
            `Found location in ${result.stateName}`,
            'success',
            5000
          );
        } else {
          // General location found
          addToast(
            `Location found: ${result.location.name}`,
            'info',
            5000
          );
        }
        
        if (showPopups) {
          setPopupInfo({
            longitude: result.location.lng,
            latitude: result.location.lat,
            locationName: result.location.name,
            stateName: result.location.state || 'Unknown',
            address: result.location.displayName
          });
        }
      }

      setCityData({
        geoJSON: result.geoJSON,
        center: [result.location.lng, result.location.lat]
      });

      // Update viewport to focus on the searched location
      setViewport({
        longitude: result.location.lng,
        latitude: result.location.lat,
        zoom: 10,
        pitch: 45,
        bearing: 0,
        transitionDuration: 2000,
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Error fetching location data');
      
      // Show error notification
      addToast(
        error.message || 'Error searching for location',
        'error',
        8000
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle clicking on the map
  const handleMapClick = (event) => {
    if (!mapSettings.enableInteractions) return;
    
    const { features } = event;
    
    if (!features || features.length === 0) {
      // Clicked on empty area - do nothing or reset selection
      return;
    }
    
    const clickedFeature = features[0];
    
    if (clickedFeature.layer.id === 'state-fills') {
      // Clicked on a state
      const stateName = clickedFeature.properties.STATE_NAME;
      setSelectedState(stateName);
      setSelectedPC(null);
      setPopupInfo(null);
      
      // Show state selection notification
      addToast(
        `Selected state: ${stateName}`,
        'info',
        3000
      );
    } else if (clickedFeature.layer.id === 'pc-fills') {
      // Clicked on a PC
      const pcName = clickedFeature.properties.PC_NAME;
      setSelectedPC(pcName);
      
      // Show PC selection notification
      addToast(
        `Selected constituency: ${pcName}`,
        'info',
        3000
      );
      
      // Create popup info if popups are enabled
      if (showPopups) {
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
          
          // Show error for popup placement
          addToast(
            'Could not center view on selected constituency',
            'warning',
            3000
          );
        }
      }
    } else if (clickedFeature.layer.id === 'search-point' && showPopups) {
      // Clicked on search point - show detailed info
      const { lng, lat } = event.lngLat;
      const placeName = clickedFeature.properties.name;
      
      // Notification for clicking on a search point
      addToast(
        `Viewing details for ${placeName}`,
        'info',
        3000
      );
      
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
    if (!mapSettings.enableInteractions) return;
    
    const { features } = event;
    if (features && features.length > 0) {
      setHoveredFeature(features[0]);
    } else {
      setHoveredFeature(null);
    }
  };

  // Handle state selection
  const handleSelectState = (state) => {
    setSelectedState(state);
    setSelectedPC(null);
    setPopupInfo(null);
    
    // Notification for state selection from sidebar
    addToast(
      `Selected state: ${state}`,
      'info',
      3000
    );
    
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
      } else {
        // Notification if centering fails
        addToast(
          `Could not center view on ${state}`,
          'warning',
          3000
        );
      }
    }
  };

  // Handle PC selection
  const handleSelectPC = (pc) => {
    setSelectedPC(pc.name);
    
    // Notification for constituency selection from list
    addToast(
      `Selected constituency: ${pc.name}`,
      'info',
      3000
    );
    
    // Find PC and center view on it
    const pcFeature = pcData.features.find(f => 
      f.properties.PC_NAME === pc.name
    );
    
    if (pcFeature) {
      const centroid = getFeatureCentroid(pcFeature);
      if (centroid) {
        if (showPopups) {
          setPopupInfo({
            longitude: centroid[0],
            latitude: centroid[1],
            stateName: selectedState,
            pcName: pc.name,
            pcNo: pc.number
          });
        }
        
        setViewport({
          longitude: centroid[0],
          latitude: centroid[1],
          zoom: 8,
          pitch: 45,
          bearing: 0,
          transitionDuration: 1500,
        });
      } else {
        // Notification if centering fails
        addToast(
          `Could not center view on ${pc.name}`,
          'warning',
          3000
        );
      }
    }
  };

  // Reset view to all of India
  const resetView = () => {
    setSelectedState(null);
    setSelectedPC(null);
    setPopupInfo(null);
    setCityData(null);
    
    // Notification for view reset
    addToast(
      'View reset to all of India',
      'info',
      3000
    );
    
    setViewport({
      ...DEFAULT_VIEWPORT,
      transitionDuration: 1000,
    });
  };

  // Get hover state for layers
  const hoveredStateName = hoveredFeature?.layer?.id === 'state-fills' 
    ? hoveredFeature.properties.STATE_NAME 
    : null;
    
  const hoveredPCName = hoveredFeature?.layer?.id === 'pc-fills' 
    ? hoveredFeature.properties.PC_NAME 
    : null;

  return (
    <div className="map-container">
      <LoadingOverlay loading={loading} />
      
      <SearchBar onSearch={handleSearch} loading={loading} error={error} />
      
      {showStateSidebar && !selectedState && (
        <StateSelector 
          statesList={statesList} 
          selectedState={selectedState}
          onSelectState={handleSelectState} 
        />
      )}

      {selectedState && (
        <PCList
          state={selectedState}
          pcList={pcList}
          selectedPC={selectedPC}
          onSelectPC={handleSelectPC}
          onBack={resetView}
        />
      )}

      {showLegend && <MapLegend />}

      <Map
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        onClick={handleMapClick}
        onMouseMove={handleHover}
        interactiveLayerIds={['state-fills', 'pc-fills', 'search-point']}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Map Layers */}
        {stateData && !selectedState && (
          <StateLayers 
            stateData={stateData} 
            hoveredStateName={hoveredStateName} 
          />
        )}

        {pcData && selectedState && (
          <PCLayers 
            pcData={pcData} 
            selectedPC={selectedPC} 
            hoveredPCName={hoveredPCName} 
          />
        )}

        {cityData && (
          <SearchResultLayer geoJSON={cityData.geoJSON} />
        )}

        {/* Popups */}
        {showPopups && popupInfo && (
          <FeaturePopup 
            popupInfo={popupInfo} 
            onClose={() => setPopupInfo(null)} 
          />
        )}

        {showPopups && hoveredFeature && !popupInfo && 
         hoveredFeature.layer.id !== 'search-point' && (
          <HoverPopup 
            feature={hoveredFeature} 
            centroidFn={getFeatureCentroid} 
          />
        )}
      </Map>

      <Attribution />
    </div>
  );
};

export default ElectoralMap;