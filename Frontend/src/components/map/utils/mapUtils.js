import axios from 'axios';
import { findPCAtPoint } from './geoUtils';

/**
 * Default viewport for India
 */
export const DEFAULT_VIEWPORT = {
  latitude: 20.5937,
  longitude: 78.9629,
  zoom: 4,
  pitch: 45,
  bearing: 0,
};

/**
 * Geocode a location using Nominatim API
 */
export const searchLocation = async (placeName) => {
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
  return {
    lat: parseFloat(location.lat),
    lng: parseFloat(location.lon),
    displayName: location.display_name,
    address: location.address
  };
};

/**
 * Get additional details about a location using reverse geocoding
 */
export const getLocationDetails = async (lat, lng) => {
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
  
  return reverseResponse.data;
};

/**
 * Create GeoJSON for a search result
 */
export const createSearchResultGeoJSON = (lng, lat, name, address) => {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name,
          type: 'search-point',
          address
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      }
    ]
  };
};

/**
 * Process search results and find related electoral data
 */
export const processSearchResults = async (placeName, processedGeoData, statesList) => {
  // Get basic location data
  const location = await searchLocation(placeName);
  
  // Find constituency containing this location
  const pcInfo = findPCAtPoint(location.lng, location.lat, processedGeoData);
  
  // Get detailed information about the location
  const reverseData = await getLocationDetails(location.lat, location.lng);
  const address = reverseData.address;
  
  // Create GeoJSON for the search point
  const locationName = address.city || address.town || address.village || address.county || placeName;
  const geoJSON = createSearchResultGeoJSON(
    location.lng, 
    location.lat, 
    locationName, 
    reverseData.display_name
  );
  
  return {
    pcInfo,
    address,
    location: {
      lat: location.lat,
      lng: location.lng,
      name: locationName,
      displayName: reverseData.display_name,
      state: address.state
    },
    geoJSON,
    stateName: pcInfo ? pcInfo.stateName : (address.state && statesList.includes(address.state) ? address.state : null)
  };
};