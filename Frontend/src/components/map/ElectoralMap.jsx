import React, { useState, useEffect, useRef } from 'react';
import Map, { Source, Layer, Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/vijayawadaStyles.css';

// Import components
import SearchBar from './SearchBar';
import MapInfo from './MapInfo';
import LoadingOverlay from './LoadingOverlay';
import GarbageMonitor from './GarbageMonitor';
import Attribution from '../common/Attribution';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Vijayawada coordinates and default viewport
const VIJAYAWADA_CENTER = {
  longitude: 80.6480,
  latitude: 16.5062
};

const DEFAULT_VIEWPORT = {
  ...VIJAYAWADA_CENTER,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

// Categories for landmarks
const CATEGORIES = {
  HISTORIC: 'historic',
  RELIGIOUS: 'religious',
  EDUCATIONAL: 'educational',
  COMMERCIAL: 'commercial',
  RECREATION: 'recreation',
  TRANSPORT: 'transport',
  INFRASTRUCTURE: 'infrastructure',
  GOVERNMENT: 'government',
  GARBAGE: 'garbage',
  MARKET: 'market',
  HOSPITAL: 'hospital',
  LIBRARY: 'library'
};

// Vijayawada city boundary GeoJSON
const VIJAYAWADA_BOUNDARY = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [80.5642, 16.4724],
      [80.6063, 16.4510],
      [80.6392, 16.4474],
      [80.6842, 16.4655],
      [80.7142, 16.4910],
      [80.7249, 16.5210],
      [80.7302, 16.5510],
      [80.7232, 16.5824],
      [80.6956, 16.6237],
      [80.6556, 16.6383],
      [80.6063, 16.6324],
      [80.5642, 16.6037],
      [80.5570, 16.5724],
      [80.5570, 16.5210],
      [80.5642, 16.4724]
    ]]
  }
};

// Garbage collection points with status
const GARBAGE_COLLECTION_POINTS = [
  {
    id: 'gc1',
    name: 'Benz Circle Collection Point',
    category: CATEGORIES.GARBAGE,
    status: 'critical', // Options: normal, attention, critical
    fillLevel: 85,  // percentage full
    lastCollected: '2025-03-20T08:30:00',
    latitude: 16.5060,
    longitude: 80.6420,
    address: 'Benz Circle, MG Road, Vijayawada'
  },
  {
    id: 'gc2',
    name: 'Railway Station Waste Facility',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 40,
    lastCollected: '2025-03-21T07:15:00',
    latitude: 16.5190,
    longitude: 80.6250,
    address: 'Near Platform 1, Vijayawada Railway Station'
  },
  {
    id: 'gc3',
    name: 'Governorpet Collection Center',
    category: CATEGORIES.GARBAGE,
    status: 'attention',
    fillLevel: 70,
    lastCollected: '2025-03-20T16:00:00',
    latitude: 16.5079,
    longitude: 80.6315,
    address: 'Governorpet Main Road, Vijayawada'
  },
  {
    id: 'gc4',
    name: 'Autonagar Waste Management',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 35,
    lastCollected: '2025-03-21T06:45:00',
    latitude: 16.4890,
    longitude: 80.6750,
    address: 'Autonagar Industrial Area, Vijayawada'
  },
  {
    id: 'gc5',
    name: 'Ajit Singh Nagar Recycling Center',
    category: CATEGORIES.GARBAGE,
    status: 'attention',
    fillLevel: 65,
    lastCollected: '2025-03-20T17:30:00',
    latitude: 16.5232,
    longitude: 80.6650,
    address: 'Ajit Singh Nagar, Vijayawada'
  },
  {
    id: 'gc6',
    name: 'Gunadala Collection Point',
    category: CATEGORIES.GARBAGE,
    status: 'critical',
    fillLevel: 90,
    lastCollected: '2025-03-20T09:00:00',
    latitude: 16.5298,
    longitude: 80.6420,
    address: 'Near Gunadala Matha Church, Vijayawada'
  },
  {
    id: 'gc7',
    name: 'Machavaram Collection Center',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 28,
    lastCollected: '2025-03-21T08:00:00',
    latitude: 16.5170,
    longitude: 80.6550,
    address: 'Machavaram Down, Vijayawada'
  },
  {
    id: 'gc8',
    name: 'Patamata Collection Facility',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 55,
    lastCollected: '2025-03-21T07:30:00',
    latitude: 16.4930,
    longitude: 80.6600,
    address: 'Patamata Main Road, Vijayawada'
  }
];

// Major landmarks in Vijayawada with coordinates
const VIJAYAWADA_LANDMARKS = [
  {
    id: 1,
    name: "Kanaka Durga Temple",
    category: CATEGORIES.RELIGIOUS,
    description: "Famous temple dedicated to Goddess Durga located on Indrakeeladri hill. One of the most important religious sites in Andhra Pradesh.",
    latitude: 16.5175,
    longitude: 80.6096,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg/320px-Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg"
  },
  {
    id: 2,
    name: "Prakasam Barrage",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Major dam across Krishna River connecting Vijayawada with Guntur district. Built in 1957, it serves irrigation needs and is a popular tourist spot.",
    latitude: 16.5061,
    longitude: 80.6080,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Prakasam_Barrage_evening.jpg/320px-Prakasam_Barrage_evening.jpg"
  },
  {
    id: 3,
    name: "Vijayawada Railway Station",
    category: CATEGORIES.TRANSPORT,
    description: "One of the busiest railway stations in India with over 1.4 million passengers daily. A key junction connecting North and South India.",
    latitude: 16.5175,
    longitude: 80.6236,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vijayawada_Junction_railway_station_board.jpg/320px-Vijayawada_Junction_railway_station_board.jpg"
  },
  {
    id: 4,
    name: "Bhavani Island",
    category: CATEGORIES.RECREATION,
    description: "River island and tourist attraction in Krishna River. Features water sports, resort accommodations, and recreational activities.",
    latitude: 16.5280,
    longitude: 80.5947,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Krishna_River_Vijayawada.jpg/320px-Krishna_River_Vijayawada.jpg"
  },
  {
    id: 5,
    name: "Rajiv Gandhi Park",
    category: CATEGORIES.RECREATION,
    description: "Major urban park in the heart of the city with lush greenery, walking paths, and recreational facilities for families.",
    latitude: 16.5009,
    longitude: 80.6525,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Rajiv_Gandhi_Park%2C_Vijayawada.jpg/320px-Rajiv_Gandhi_Park%2C_Vijayawada.jpg"
  },
  {
    id: 6,
    name: "Municipal Corporation Office",
    category: CATEGORIES.GOVERNMENT,
    description: "Administrative headquarters of the Vijayawada Municipal Corporation that manages civic infrastructure and public services in the city.",
    latitude: 16.5165, 
    longitude: 80.6226,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Vijayawada_Municipal_Corporation.jpg/320px-Vijayawada_Municipal_Corporation.jpg"
  },
  {
    id: 7,
    name: "Andhra University Vijayawada Campus",
    category: CATEGORIES.EDUCATIONAL,
    description: "Major educational institution offering undergraduate and postgraduate programs in various disciplines.",
    latitude: 16.5350,
    longitude: 80.6480,
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b0/Andhra_University_logo.png/220px-Andhra_University_logo.png"
  },
  {
    id: 8,
    name: "Krishna University",
    category: CATEGORIES.EDUCATIONAL,
    description: "State university established in 2008, offering higher education in arts, sciences and professional courses.",
    latitude: 16.5261,
    longitude: 80.6710,
    image: "https://www.krishnauniversity.ac.in/images/homepage_background.jpg"
  },
  {
    id: 9,
    name: "SRR & CVR Government Degree College",
    category: CATEGORIES.EDUCATIONAL,
    description: "One of the oldest educational institutions in the region, offering undergraduate programs in various fields.",
    latitude: 16.5141,
    longitude: 80.6375,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/SRR_%26_CVR_Government_College.jpg/320px-SRR_%26_CVR_Government_College.jpg"
  },
  {
    id: 10,
    name: "Governorpet Market",
    category: CATEGORIES.MARKET,
    description: "Vibrant local market selling fresh produce, textiles, and household items. Popular shopping destination for locals.",
    latitude: 16.5094,
    longitude: 80.6295,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 11,
    name: "Rythu Bazar (Farmers' Market)",
    category: CATEGORIES.MARKET,
    description: "Direct farmer-to-consumer market where local farmers sell fresh fruits and vegetables at regulated prices.",
    latitude: 16.5052,
    longitude: 80.6447,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Rythu_Bazar.jpg/320px-Rythu_Bazar.jpg"
  },
  {
    id: 12,
    name: "Besant Road Shopping Area",
    category: CATEGORIES.MARKET,
    description: "Popular commercial street with fashion boutiques, jewelry stores, and various retail shops.",
    latitude: 16.5120,
    longitude: 80.6260,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 13,
    name: "PVP Mall",
    category: CATEGORIES.COMMERCIAL,
    description: "Modern shopping mall with retail stores, food court and cinema. One of the largest shopping destinations in the city.",
    latitude: 16.5036,
    longitude: 80.6476,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/PVP_Square%2C_Vijayawada.jpg/320px-PVP_Square%2C_Vijayawada.jpg"
  },
  {
    id: 14,
    name: "Government General Hospital",
    category: CATEGORIES.HOSPITAL,
    description: "Major public hospital providing healthcare services to Vijayawada and surrounding regions.",
    latitude: 16.5110,
    longitude: 80.6290,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Government_General_Hospital%2C_Vijayawada.jpg/320px-Government_General_Hospital%2C_Vijayawada.jpg"
  },
  {
    id: 15,
    name: "Victoria Jubilee Museum",
    category: CATEGORIES.HISTORIC,
    description: "Archaeological museum housed in a historic building from 1887. Features ancient sculptures, paintings, and artifacts from the region.",
    latitude: 16.5090,
    longitude: 80.6343,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Victoria_Jubilee_Museum.jpg/320px-Victoria_Jubilee_Museum.jpg"
  },
  {
    id: 16,
    name: "Krishnaveni Ghat",
    category: CATEGORIES.RECREATION,
    description: "Scenic riverfront area along the Krishna River, popular for evening walks and cultural events.",
    latitude: 16.5089,
    longitude: 80.6120,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Krishna_River_Vijayawada_2.jpg/320px-Krishna_River_Vijayawada_2.jpg"
  },
  {
    id: 17,
    name: "Vijayawada Bus Station",
    category: CATEGORIES.TRANSPORT,
    description: "Modern bus terminal handling intercity and interstate bus services, connecting Vijayawada to various destinations.",
    latitude: 16.5158,
    longitude: 80.6242,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Vijayawada_Bus_Station.jpg/320px-Vijayawada_Bus_Station.jpg"
  },
  {
    id: 18,
    name: "Mahatma Gandhi Road",
    category: CATEGORIES.COMMERCIAL,
    description: "Main commercial street with shops, restaurants and businesses. One of the busiest areas in Vijayawada.",
    latitude: 16.5103,
    longitude: 80.6278,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 19,
    name: "Punnami Ghat",
    category: CATEGORIES.RECREATION,
    description: "Popular riverfront promenade along Krishna River. Features musical fountains, boating facilities, and stunning sunset views.",
    latitude: 16.5114,
    longitude: 80.6147,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Krishna_River_Front%2C_Vijayawada.jpg/320px-Krishna_River_Front%2C_Vijayawada.jpg"
  },
  {
    id: 20,
    name: "Indira Gandhi Municipal Stadium",
    category: CATEGORIES.RECREATION,
    description: "Multi-purpose stadium hosting cricket and football events with a capacity of over 25,000 spectators.",
    latitude: 16.5134,
    longitude: 80.6336,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Indira_Gandhi_Municipal_Stadium.jpg/320px-Indira_Gandhi_Municipal_Stadium.jpg"
  },
  {
    id: 21,
    name: "Andhra Loyola College",
    category: CATEGORIES.EDUCATIONAL,
    description: "Premier educational institution founded in 1954. Known for its academic excellence and sprawling campus.",
    latitude: 16.5350,
    longitude: 80.6380,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Andhra_Loyola_College.jpg/320px-Andhra_Loyola_College.jpg"
  },
  {
    id: 22,
    name: "Siddhartha Medical College",
    category: CATEGORIES.EDUCATIONAL,
    description: "Established medical college offering MBBS and higher medical education with an attached teaching hospital.",
    latitude: 16.5065,
    longitude: 80.6532,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Siddhartha_Medical_College.jpg/320px-Siddhartha_Medical_College.jpg"
  },
  {
    id: 23,
    name: "Vijayawada City Central Library",
    category: CATEGORIES.LIBRARY,
    description: "Public library with extensive collection of books, periodicals and digital resources serving the city's residents.",
    latitude: 16.5070,
    longitude: 80.6400,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Central_Library%2C_Vijayawada.jpg/320px-Central_Library%2C_Vijayawada.jpg"
  },
  {
    id: 24,
    name: "Water Filtration Plant",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Municipal water treatment facility that processes and purifies water from Krishna River for the city's residents.",
    latitude: 16.5150,
    longitude: 80.6020,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Water_Treatment_Plant.jpg/320px-Water_Treatment_Plant.jpg"
  },
  {
    id: 25,
    name: "District Collector's Office",
    category: CATEGORIES.GOVERNMENT,
    description: "Administrative headquarters for the district collector and government services for Krishna district.",
    latitude: 16.5156,
    longitude: 80.6416,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/District_Collector_Office%2C_Krishna.jpg/320px-District_Collector_Office%2C_Krishna.jpg"
  }
];

// Map marker colors based on landmark category
const MARKER_COLORS = {
  [CATEGORIES.HISTORIC]: "#FF9800",      // Orange
  [CATEGORIES.RELIGIOUS]: "#FFC107",     // Amber
  [CATEGORIES.EDUCATIONAL]: "#3F51B5",   // Indigo
  [CATEGORIES.COMMERCIAL]: "#9C27B0",    // Purple
  [CATEGORIES.RECREATION]: "#4CAF50",    // Green
  [CATEGORIES.TRANSPORT]: "#F44336",     // Red
  [CATEGORIES.INFRASTRUCTURE]: "#2196F3", // Blue
  [CATEGORIES.GOVERNMENT]: "#795548",    // Brown
  [CATEGORIES.MARKET]: "#FF5722",        // Deep Orange
  [CATEGORIES.HOSPITAL]: "#E91E63",      // Pink
  [CATEGORIES.LIBRARY]: "#673AB7",       // Deep Purple
};

// Garbage marker colors based on status
const GARBAGE_STATUS_COLORS = {
  normal: "#4CAF50",      // Green
  attention: "#FF9800",   // Orange
  critical: "#F44336",    // Red
};

const ElectoralMap = () => {
  const { addToast } = useToast();
  const { mapSettings } = useSettings();
  const mapRef = useRef();
  
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [selectedGarbage, setSelectedGarbage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showGarbageMonitor, setShowGarbageMonitor] = useState(false);
  const [garbageStats, setGarbageStats] = useState({
    total: GARBAGE_COLLECTION_POINTS.length,
    normal: GARBAGE_COLLECTION_POINTS.filter(point => point.status === 'normal').length,
    attention: GARBAGE_COLLECTION_POINTS.filter(point => point.status === 'attention').length,
    critical: GARBAGE_COLLECTION_POINTS.filter(point => point.status === 'critical').length,
    averageFillLevel: Math.round(GARBAGE_COLLECTION_POINTS.reduce((sum, point) => sum + point.fillLevel, 0) / GARBAGE_COLLECTION_POINTS.length)
  });

  // Filter landmarks by active category
  const filteredLandmarks = activeCategory 
    ? VIJAYAWADA_LANDMARKS.filter(landmark => landmark.category === activeCategory)
    : VIJAYAWADA_LANDMARKS;

  // Show initial notification
  useEffect(() => {
    addToast(
      'Welcome to the Vijayawada City Map! Click on landmarks to explore.',
      'info',
      5000,
      { once: true, id: 'vijayawada-welcome' }
    );
  }, [addToast]);

  // Handle search for locations within Vijayawada
  const handleSearch = async (placeName) => {
    setError(null);
    
    if (!placeName) {
      setError("Please enter a location to search");
      return;
    }
    
    try {
      setLoading(true);
      
      // Format search query to focus on Vijayawada
      const searchQuery = `${placeName}, Vijayawada, Andhra Pradesh`;
      
      // Search Mapbox geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?proximity=${VIJAYAWADA_CENTER.longitude},${VIJAYAWADA_CENTER.latitude}&bbox=80.56,16.47,80.73,16.64&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const location = data.features[0];
        
        // Check if the result is within approximately 10km of Vijayawada center
        const [lng, lat] = location.center;
        
        // Smooth fly to the searched location
        flyToLocation(lng, lat, 15);
        
        // Show success notification
        addToast(`Location found: ${location.place_name}`, 'success', 3000);
        
        // Check if the location matches any of our landmarks or garbage points
        const matchedLandmark = VIJAYAWADA_LANDMARKS.find(landmark => 
          Math.abs(landmark.latitude - lat) < 0.005 && 
          Math.abs(landmark.longitude - lng) < 0.005
        );
        
        const matchedGarbage = GARBAGE_COLLECTION_POINTS.find(point => 
          Math.abs(point.latitude - lat) < 0.005 && 
          Math.abs(point.longitude - lng) < 0.005
        );
        
        if (matchedLandmark) {
          setSelectedLandmark(matchedLandmark);
        } else if (matchedGarbage) {
          setSelectedGarbage(matchedGarbage);
        }
      } else {
        addToast("No results found in Vijayawada", 'warning', 3000);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setError(error.message || 'Error searching for location');
      addToast(error.message || 'Error searching for location', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Smooth fly to a location
  const flyToLocation = (longitude, latitude, zoom = 14, pitch = 45) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: zoom,
      pitch: pitch,
      bearing: 0,
      duration: 2000,
      essential: true
    });
  };
  
  // Handle clicking on a landmark marker
  const handleLandmarkClick = (landmark) => {
    setSelectedLandmark(landmark);
    setSelectedGarbage(null);
    addToast(`Selected: ${landmark.name}`, 'info', 2000);
    
    // Fly to the selected landmark
    flyToLocation(landmark.longitude, landmark.latitude, 16);
  };
  
  // Handle clicking on a garbage collection point
  const handleGarbageClick = (point) => {
    setSelectedGarbage(point);
    setSelectedLandmark(null);
    
    const statusText = {
      normal: 'Normal operation',
      attention: 'Needs attention',
      critical: 'Critical - urgent collection needed'
    };
    
    addToast(`Garbage Collection Point: ${statusText[point.status]}`, point.status === 'critical' ? 'error' : point.status === 'attention' ? 'warning' : 'success', 3000);
    
    // Fly to the garbage collection point
    flyToLocation(point.longitude, point.latitude, 17);
  };

  // Reset view to show all of Vijayawada
  const resetView = () => {
    setSelectedLandmark(null);
    setSelectedGarbage(null);
    setActiveCategory(null);
    
    mapRef.current?.flyTo({
      ...DEFAULT_VIEWPORT,
      duration: 1500,
      essential: true
    });
    
    addToast('View reset to Vijayawada city center', 'info', 2000);
  };

  // Toggle legend visibility
  const toggleLegend = () => {
    setShowLegend(!showLegend);
    addToast(`Map legend ${!showLegend ? 'shown' : 'hidden'}`, 'info', 2000);
  };

  // Filter by category
  const handleCategoryFilter = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      addToast('Showing all landmarks', 'info', 2000);
    } else {
      setActiveCategory(category);
      addToast(`Filtering: ${category.charAt(0).toUpperCase() + category.slice(1)} landmarks`, 'info', 2000);
    }
  };

  // Toggle info panel
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };
  
  // Toggle garbage monitor panel
  const toggleGarbageMonitor = () => {
    setShowGarbageMonitor(!showGarbageMonitor);
    
    if (!showGarbageMonitor) {
      // If we're showing the monitor, auto-select garbage category
      setActiveCategory(CATEGORIES.GARBAGE);
      addToast('Showing garbage collection points', 'info', 2000);
    }
  };

  return (
    <div className="vijayawada-map-container">
      <LoadingOverlay loading={loading} />
      
      <SearchBar 
        onSearch={handleSearch} 
        loading={loading} 
        error={error} 
        placeholder="Search places in Vijayawada..." 
      />
      
      <div className="map-control-panel">
        <button 
          className="map-control-button"
          onClick={resetView}
          title="Reset view"
        >
          <span className="control-icon">🔄</span>
          <span className="control-text">Reset</span>
        </button>
        
        <button 
          className="map-control-button"
          onClick={toggleLegend}
          title={showLegend ? "Hide legend" : "Show legend"}
        >
          <span className="control-icon">🏷️</span>
          <span className="control-text">{showLegend ? "Hide" : "Show"} Legend</span>
        </button>
        
        <button 
          className="map-control-button"
          onClick={toggleGarbageMonitor}
          title="Garbage Monitoring"
          className={`map-control-button ${showGarbageMonitor ? 'active' : ''}`}
        >
          <span className="control-icon">🗑️</span>
          <span className="control-text">Garbage Monitor</span>
        </button>
        
        <button 
          className="map-control-button"
          onClick={toggleInfo}
          title={showInfo ? "Hide info" : "Show info"}
        >
          <span className="control-icon">ℹ️</span>
          <span className="control-text">About Map</span>
        </button>
      </div>
      
      {showInfo && (
        <MapInfo onClose={() => setShowInfo(false)} />
      )}
      
      {showGarbageMonitor && (
        <GarbageMonitor 
          garbagePoints={GARBAGE_COLLECTION_POINTS} 
          stats={garbageStats} 
          onClose={() => setShowGarbageMonitor(false)}
          onPointSelect={handleGarbageClick}
        />
      )}
      
      {showLegend && (
        <div className="category-filter">
          <h3>Filter Places</h3>
          <div className="filter-options">
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <button 
                key={value}
                className={`filter-button ${activeCategory === value ? 'active' : ''}`}
                style={{ 
                  backgroundColor: activeCategory === value ? 
                    (value === CATEGORIES.GARBAGE ? '#333' : MARKER_COLORS[value]) : 
                    'rgba(255,255,255,0.7)',
                  color: activeCategory === value ? '#fff' : '#333'
                }}
                onClick={() => handleCategoryFilter(value)}
              >
                <span 
                  className="category-icon" 
                  style={{ 
                    backgroundColor: value === CATEGORIES.GARBAGE ? '#333' : MARKER_COLORS[value]
                  }}
                ></span>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapSettings?.mapStyle || "mapbox://styles/mapbox/streets-v12"}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['vijayawada-boundary-fill']}
      >
        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />
        
        {/* Vijayawada City Boundary */}
        <Source id="vijayawada-boundary" type="geojson" data={VIJAYAWADA_BOUNDARY}>
          <Layer
            id="vijayawada-boundary-fill"
            type="fill"
            paint={{
              'fill-color': 'rgba(0, 170, 68, 0.1)',
              'fill-outline-color': '#00aa44'
            }}
          />
          <Layer
            id="vijayawada-boundary-line"
            type="line"
            paint={{
              'line-color': '#00aa44',
              'line-width': 2,
              'line-dasharray': [3, 2]
            }}
          />
        </Source>

        {/* Render markers for each landmark */}
        {filteredLandmarks.map(landmark => (
          <Marker
            key={landmark.id}
            latitude={landmark.latitude}
            longitude={landmark.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleLandmarkClick(landmark);
            }}
          >
            <div 
              className={`landmark-marker ${selectedLandmark?.id === landmark.id ? 'active' : ''}`}
              style={{ 
                backgroundColor: MARKER_COLORS[landmark.category],
                borderColor: selectedLandmark?.id === landmark.id ? "#FFFFFF" : "rgba(0,0,0,0.2)"
              }}
            >
              <span className="landmark-marker-label">{landmark.name.split(' ')[0]}</span>
            </div>
          </Marker>
        ))}
        
        {/* Render garbage collection point markers */}
        {(activeCategory === null || activeCategory === CATEGORIES.GARBAGE) && 
          GARBAGE_COLLECTION_POINTS.map(point => (
            <Marker
              key={point.id}
              latitude={point.latitude}
              longitude={point.longitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleGarbageClick(point);
              }}
            >
              <div 
                className={`garbage-marker ${selectedGarbage?.id === point.id ? 'active' : ''} ${point.status}`}
                style={{ 
                  borderColor: selectedGarbage?.id === point.id ? "#FFFFFF" : "rgba(0,0,0,0.2)"
                }}
              >
                <div 
                  className="fill-indicator" 
                  style={{ height: `${point.fillLevel}%` }}
                ></div>
                <span className="garbage-marker-label">
                  {point.fillLevel}%
                </span>
              </div>
            </Marker>
          ))
        }

        {/* Popup for selected landmark */}
        {selectedLandmark && (
          <Popup
            latitude={selectedLandmark.latitude}
            longitude={selectedLandmark.longitude}
            closeOnClick={false}
            onClose={() => setSelectedLandmark(null)}
            anchor="top"
            offset={20}
            className="landmark-popup"
            maxWidth="350px"
          >
            <div className="popup-content">
              <div className="popup-header" style={{ backgroundColor: MARKER_COLORS[selectedLandmark.category] }}>
                <h3>{selectedLandmark.name}</h3>
                <span className="category-badge">
                  {selectedLandmark.category.charAt(0).toUpperCase() + selectedLandmark.category.slice(1)}
                </span>
              </div>
              
              <div className="popup-image-container">
                <img src={selectedLandmark.image} alt={selectedLandmark.name} />
              </div>
              
              <p className="popup-description">{selectedLandmark.description}</p>
              
              <div className="popup-footer">
                <button 
                  className="popup-action-button"
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLandmark.latitude},${selectedLandmark.longitude}&travelmode=driving`, '_blank');
                  }}
                >
                  <span className="action-icon">📍</span>
                  Directions
                </button>
                <button 
                  className="popup-action-button"
                  onClick={() => {
                    addToast("Feature coming soon!", "info", 2000);
                  }}
                >
                  <span className="action-icon">📸</span>
                  Photos
                </button>
              </div>
            </div>
          </Popup>
        )}
        
        {/* Popup for selected garbage collection point */}
        {selectedGarbage && (
          <Popup
            latitude={selectedGarbage.latitude}
            longitude={selectedGarbage.longitude}
            closeOnClick={false}
            onClose={() => setSelectedGarbage(null)}
            anchor="top"
            offset={20}
            className="garbage-popup"
            maxWidth="350px"
          >
            <div className="popup-content">
              <div className="popup-header garbage-header" style={{ 
                backgroundColor: GARBAGE_STATUS_COLORS[selectedGarbage.status] 
              }}>
                <h3>{selectedGarbage.name}</h3>
                <span className={`status-badge ${selectedGarbage.status}`}>
                  {selectedGarbage.status.charAt(0).toUpperCase() + selectedGarbage.status.slice(1)}
                </span>
              </div>
              
              <div className="garbage-stats">
                <div className="stat-item">
                  <span className="stat-value">{selectedGarbage.fillLevel}%</span>
                  <span className="stat-label">Fill Level</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(selectedGarbage.lastCollected).toLocaleDateString()}
                  </span>
                  <span className="stat-label">Last Collected</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(selectedGarbage.lastCollected).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="stat-label">Time</span>
                </div>
              </div>
              
              <p className="popup-description">{selectedGarbage.address}</p>
              
              <div className="popup-footer">
                <button 
                  className="popup-action-button"
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedGarbage.latitude},${selectedGarbage.longitude}&travelmode=driving`, '_blank');
                  }}
                >
                  <span className="action-icon">📍</span>
                  Directions
                </button>
                <button 
                  className="popup-action-button report-button"
                  onClick={() => {
                    addToast("Report submitted to municipal authorities", "success", 3000);
                  }}
                >
                  <span className="action-icon">⚠️</span>
                  Report Issue
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <div className="map-footer">
        <button 
          className="municipal-portal-button"
          onClick={() => window.open('https://cdma.ap.gov.in/VMC/index.jsp', '_blank')}
        >
          <span className="portal-icon">🏛️</span>
          Municipal Portal
        </button>
      </div>

      <Attribution />
    </div>
  );
};

export default ElectoralMap;