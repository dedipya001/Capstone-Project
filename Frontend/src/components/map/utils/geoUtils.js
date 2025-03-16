import * as turf from '@turf/turf';

/**
 * Calculate centroid for a polygon feature
 */
export const getFeatureCentroid = (feature) => {
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

/**
 * Find which PC/constituency contains a point
 */
export const findPCAtPoint = (lng, lat, geoData) => {
  if (!geoData || !geoData.features) return null;
  
  const point = turf.point([lng, lat]);
  
  for (const feature of geoData.features) {
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

/**
 * Process GeoJSON data to create state boundaries
 */
export const createStateBoundaries = (geoData) => {
  if (!geoData || !geoData.features) return null;
  
  // Group features by state
  const stateMap = {};
  geoData.features.forEach(feature => {
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
};

/**
 * Extract unique states from GeoJSON
 */
export const extractStatesList = (geoData) => {
  if (!geoData || !geoData.features) return [];
  
  const states = new Set();
  geoData.features.forEach(feature => {
    if (feature.properties && feature.properties.STATE_NAME) {
      states.add(feature.properties.STATE_NAME);
    }
  });
  
  return Array.from(states).sort();
};

/**
 * Get PCs for a selected state
 */
export const getConstituenciesForState = (geoData, stateName) => {
  if (!geoData || !stateName) return null;
  
  return {
    type: 'FeatureCollection',
    features: geoData.features.filter(
      feature => feature.properties && feature.properties.STATE_NAME === stateName
    )
  };
};