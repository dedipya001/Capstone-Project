// src/pages/LocationStatsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import '../styles/locationStatsPage.css';

// Import Map components for the waste visualization section
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.eyJ1IjoiZHVtbXl0b2tlbiIsImEiOiJjbHptNXVhdTQwMXJsMmlyejFibGFkbG91In0.cmSsGMNm6Mh6Dq00SZ-Vbg";

const MARKER_COLORS = {
  "historic": "#FF9800",
  "religious": "#FFC107",
  "educational": "#3F51B5",
  "commercial": "#9C27B0",
  "recreation": "#4CAF50",
  "transport": "#F44336",
  "infrastructure": "#2196F3",
  "government": "#795548",
  "market": "#FF5722",
  "hospital": "#E91E63",
  "library": "#673AB7",
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const LocationStatsPage = () => {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [stats, setStats] = useState(null);
  const [wasteStats, setWasteStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [mapViewport, setMapViewport] = useState({
    latitude: 16.5062,
    longitude: 80.6480,
    zoom: 12,
    bearing: 0,
    pitch: 0
  });

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch location details
        const locationResponse = await fetch(`http://localhost:5000/api/locations/${locationId}`);
        if (!locationResponse.ok) throw new Error('Failed to fetch location data');
        const locationData = await locationResponse.json();
        setLocation(locationData);
        
        // Update map viewport to focus on this location
        if (locationData.latitude && locationData.longitude) {
          setMapViewport({
            ...mapViewport,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            zoom: 14
          });
        }
        
        // Fetch basic stats
        const statsResponse = await fetch(`http://localhost:5000/api/stats/location/${locationId}`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats data');
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch waste analysis data
        const wasteStatsResponse = await fetch(`http://localhost:5000/api/waste/stats/${locationId}`);
        if (!wasteStatsResponse.ok) throw new Error('Failed to fetch waste statistics');
        const wasteStatsData = await wasteStatsResponse.json();
        setWasteStats(wasteStatsData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchLocationData();
  }, [locationId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Navigate back to the map and highlight this location
  const viewOnMap = () => {
    // You can implement this to pass state via navigate, or use localStorage
    // to remember which location to highlight when returning to the map
    localStorage.setItem('highlightLocationId', locationId);
    navigate('/map');
  };

  // Heat map data for waste visualization
  const generateHeatmapData = () => {
    if (!wasteStats || !wasteStats.areaData) return null;
    
    return {
      type: 'FeatureCollection',
      features: wasteStats.areaData.map(point => ({
        type: 'Feature',
        properties: {
          intensity: point.intensity,
          wastePercentage: point.wastePercentage
        },
        geometry: {
          type: 'Point',
          coordinates: [point.longitude, point.latitude]
        }
      }))
    };
  };

  if (loading) {
    return (
      <div className="location-stats-page loading-container">
        <div className="spinner"></div>
        <h2>Loading statistics...</h2>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="location-stats-page error-container">
        <h2>Error Loading Statistics</h2>
        <p>{error || "Location not found"}</p>
        <Link to="/map" className="back-button">Return to Map</Link>
      </div>
    );
  }

  // If wasteStats is still loading or unavailable
  if (!wasteStats) {
    return (
      <div className="location-stats-page loading-container">
        <div className="spinner"></div>
        <h2>Processing waste data...</h2>
      </div>
    );
  }

  const timeSeriesData = selectedPeriod === 'daily' ? wasteStats.dailyData : wasteStats.weeklyData;
  const xAxisKey = selectedPeriod === 'daily' ? 'date' : 'week';

  return (
    <div className="location-stats-page">
      <header className="stats-page-header" style={{ backgroundColor: MARKER_COLORS[location.category] }}>
        <div className="header-content">
          <h1>{location.name} - Statistics</h1>
          <div className="location-meta">
            <span className="category-badge">{location.category}</span>
            <span className="coordinates">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
        </div>
        <Link to="/map" className="back-to-map">
          <span className="back-icon">‹</span>
          Back to Map
        </Link>
      </header>
      
      <div className="stats-summary">
        <div className="summary-card">
          <h3>Average Garbage</h3>
          <div className="summary-value">{wasteStats.summary.averageWastePercentage.toFixed(2)}%</div>
          <div className="summary-label">of image area</div>
        </div>
        <div className="summary-card">
          <h3>Highest Recorded</h3>
          <div className="summary-value">{wasteStats.summary.highestWastePercentage.toFixed(2)}%</div>
          <div className="summary-label">on {formatDate(wasteStats.summary.highestWasteDate)}</div>
        </div>
        <div className="summary-card">
          <h3>Images Analyzed</h3>
          <div className="summary-value">{wasteStats.summary.totalImagesAnalyzed}</div>
          <div className="summary-label">total images</div>
        </div>
        <div className="summary-card">
          <h3>Waste-Free</h3>
          <div className="summary-value">{wasteStats.summary.wasteFreePercentage.toFixed(1)}%</div>
          <div className="summary-label">of all images</div>
        </div>
        {/* <div className="summary-card">
          <h3>Most Affected</h3>
          <div className="summary-value">{wasteStats.summary.mostAffectedArea}</div>
          <div className="summary-label">area</div>
        </div> */}
      </div>
      
      <div className="stats-controls">
        <h2>Garbage Detection Time Series</h2>
        <div className="period-selector">
          <button 
            className={`period-button ${selectedPeriod === 'daily' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('daily')}
          >
            Daily
          </button>
          <button 
            className={`period-button ${selectedPeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('weekly')}
          >
            Weekly
          </button>
        </div>
      </div>
      
      <div className="chart-container time-series">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }} 
              tickFormatter={selectedPeriod === 'daily' ? formatDate : undefined} 
            />
            <YAxis label={{ value: 'Waste %', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value) => [`${value.toFixed(2)}%`, "Garbage Coverage"]} 
              labelFormatter={selectedPeriod === 'daily' ? formatDate : undefined}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="avgWastePercentage" 
              name="Waste Percentage" 
              stroke={MARKER_COLORS[location.category]} 
              fill={`${MARKER_COLORS[location.category]}80`} 
              activeDot={{ r: 8 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="stats-row">
        <div className="stats-column">
          <h2>Garbage Distribution</h2>
          <div className="chart-container pie-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteStats.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteStats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} images`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* <div className="stats-column">
          <h2>Garbage Hotspots</h2>
          <div className="chart-container bar-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteStats.zones} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax + 5']} />
                <YAxis dataKey="name" type="category" scale="band" />
                <Tooltip formatter={(value) => [`${value}%`, "Garbage Percentage"]} />
                <Legend />
                <Bar dataKey="percentage" name="Garbage %" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}
      </div>
      
      {/* Map visualization of waste concentration */}
      <div className="waste-map-container">
        <h2>Waste Concentration Map</h2>
        <div className="map-wrapper" style={{ height: 400, borderRadius: 8, overflow: 'hidden' }}>
          <Map
            initialViewState={mapViewport}
            onMove={evt => setMapViewport(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />
            
            {/* Heat map for waste distribution */}
            {generateHeatmapData() && (
              <Source id="waste-heat" type="geojson" data={generateHeatmapData()}>
                <Layer
                  id="waste-heat-layer"
                  type="heatmap"
                  paint={{
                    'heatmap-weight': ['get', 'intensity'],
                    'heatmap-intensity': 1.5,
                    'heatmap-color': [
                      'interpolate',
                      ['linear'],
                      ['heatmap-density'],
                      0, 'rgba(0, 255, 0, 0)',
                      0.2, 'rgba(0, 255, 0, 0.2)',
                      0.4, 'rgba(255, 255, 0, 0.5)',
                      0.6, 'rgba(255, 140, 0, 0.8)',
                      0.8, 'rgba(255, 0, 0, 1)'
                    ],
                    'heatmap-radius': 40,
                    'heatmap-opacity': 0.8
                  }}
                />
              </Source>
            )}
            
            {/* Location marker */}
            <Source
              id="location-marker"
              type="geojson"
              data={{
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Point',
                  coordinates: [location.longitude, location.latitude]
                }
              }}
            >
              <Layer
                id="location-point"
                type="circle"
                paint={{
                  'circle-radius': 10,
                  'circle-color': MARKER_COLORS[location.category],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#ffffff',
                }}
              />
            </Source>
          </Map>
        </div>
        <div className="map-legend">
          <div className="legend-title">Waste Intensity</div>
          <div className="legend-gradient">
            <div className="gradient"></div>
            <div className="gradient-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="stats-actions">
        <Link to={`/location/${locationId}/photos`} className="action-button view-photos">
          <span className="action-icon">📷</span>
          View Photos
        </Link>
        <button className="action-button view-on-map" onClick={viewOnMap}>
          <span className="action-icon">🗺️</span>
          View on Map
        </button>
        <button className="action-button download-report" onClick={() => alert('PDF report generation will be available in the next update.')}>
          <span className="action-icon">📊</span>
          Download Report
        </button>
      </div>
      
      <footer className="stats-footer">
        <p>Garbage detection powered by YOLOv8 ML model. Data analysis based on images from April 2025.</p>
        <p>For more information about the waste management system, please contact municipal authorities.</p>
      </footer>
    </div>
  );
};

export default LocationStatsPage;
