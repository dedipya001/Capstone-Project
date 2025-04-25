const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dedipyagoswami001:6Ry2mqBqFYru2Eta@cluster0.84udc0z.mongodb.net/vijayawada_map', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Load waste detection data from JSON file
let wasteDetectionData = {};
try {
  const dataPath = path.join(__dirname, '/results/waste_detection_results.json');
  const jsonData = fs.readFileSync(dataPath, 'utf8');
  wasteDetectionData = JSON.parse(jsonData);
  console.log('Waste detection data loaded successfully');
} catch (err) {
  console.error('Error loading waste detection data:', err);
  wasteDetectionData = {};
}

// Define schemas (same as in uploadPhotos.js)
const LocationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  latitude: Number,
  longitude: Number,
  mainImage: String
});

const PhotoSchema = new mongoose.Schema({
  locationId: {
    type: Number,
    required: true,
    index: true
  },
  captureDate: {
    type: Date,
    required: true,
    index: true
  },
  captureDistance: {
    type: String,
    enum: ['7m', '10m'],
    required: true,
    default: '10m'
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  metadata: {
    size: Number,
    width: Number,
    height: Number,
    format: String
  },
  stats: {
    peopleCount: {
      type: Number,
      default: 0
    },
    vehicleCount: {
      type: Number,
      default: 0
    },
    garbageLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none'
    },
    weatherCondition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'],
      default: 'unknown'
    }
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for faster queries
PhotoSchema.index({ locationId: 1, captureDate: 1, captureDistance: 1 });

const Location = mongoose.model('Location', LocationSchema);
const Photo = mongoose.model('Photo', PhotoSchema);

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// API routes

// Get all locations
app.get('/api/locations', async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific location
app.get('/api/locations/:id', async (req, res) => {
  try {
    const location = await Location.findOne({ id: req.params.id });
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get photos for a location with date filtering
app.get('/api/photos/location/:locationId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { locationId: Number(req.params.locationId) };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const photos = await Photo.find(query).sort({ date: 1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get photos grouped by date for a location
app.get('/api/photos/location/:locationId/by-date', async (req, res) => {
  try {
    const photos = await Photo.find({ 
      locationId: Number(req.params.locationId) 
    }).sort({ date: 1 });
    
    // Group by date
    const photosByDate = {};
    photos.forEach(photo => {
      const dateKey = photo.date.toISOString().split('T')[0];
      if (!photosByDate[dateKey]) {
        photosByDate[dateKey] = [];
      }
      photosByDate[dateKey].push(photo);
    });
    
    res.json(photosByDate);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get waste detection data for a location
app.get('/api/waste/location/:locationId', (req, res) => {
  try {
    const locationId = req.params.locationId;
    
    if (!wasteDetectionData[locationId]) {
      return res.status(404).json({ message: 'Waste data not found for this location' });
    }
    
    res.json(wasteDetectionData[locationId]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get aggregated waste stats for a location
app.get('/api/waste/stats/:locationId', (req, res) => {
  try {
    const locationId = req.params.locationId;
    
    if (!wasteDetectionData[locationId]) {
      return res.status(404).json({ message: 'Waste data not found for this location' });
    }
    
    const locationData = wasteDetectionData[locationId];
    const allDistances = Object.keys(locationData);
    
    // Combine data from all camera distances
    let dailyData = {};
    let totalReadings = 0;
    let totalWaste = 0;
    let maxWaste = 0;
    let maxWasteDate = '';
    let zeroWasteCount = 0;
    
    allDistances.forEach(distance => {
      const distanceData = locationData[distance];
      
      Object.keys(distanceData).forEach(date => {
        if (!dailyData[date]) {
          dailyData[date] = {
            date: date,
            readings: [],
            totalWaste: 0,
            avgWaste: 0,
            imageCount: 0
          };
        }
        
        distanceData[date].forEach(reading => {
          dailyData[date].readings.push(reading.waste_percentage);
          dailyData[date].totalWaste += reading.waste_percentage;
          dailyData[date].imageCount += 1;
          
          totalReadings += 1;
          totalWaste += reading.waste_percentage;
          
          if (reading.waste_percentage === 0) {
            zeroWasteCount += 1;
          }
          
          if (reading.waste_percentage > maxWaste) {
            maxWaste = reading.waste_percentage;
            maxWasteDate = date;
          }
        });
        
        dailyData[date].avgWaste = dailyData[date].totalWaste / dailyData[date].imageCount;
      });
    });
    
    // Convert to array and sort by date
    const dailyWasteArray = Object.values(dailyData)
      .map(day => ({
        date: day.date,
        avgWastePercentage: day.avgWaste,
        imageCount: day.imageCount
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate weekly data
    const weeklyData = {};
    dailyWasteArray.forEach(day => {
      const date = new Date(day.date);
      // Get the week number (approximate)
      const weekNum = Math.ceil((date.getDate()) / 7);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const weekKey = `${monthYear}-W${weekNum}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: `Week ${weekNum}`,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          totalWaste: 0,
          imageCount: 0
        };
      }
      
      weeklyData[weekKey].totalWaste += day.avgWastePercentage * day.imageCount;
      weeklyData[weekKey].imageCount += day.imageCount;
    });
    
    // Calculate weekly averages
    const weeklyWasteArray = Object.values(weeklyData)
      .map(week => ({
        week: week.week,
        avgWastePercentage: week.totalWaste / week.imageCount,
        imageCount: week.imageCount
      }))
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.month !== b.month) return a.month - b.month;
        return parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]);
      });
    
    // Calculate area waste distribution for the heat map
    const areaData = [];
    const latIncrement = 0.01; // Approximately 1km
    const lngIncrement = 0.01;
    
    // For visualization on the electoral map, create geographic waste distribution
    // This will be used for heatmap visualization
    areaData.push({
      latitude: 16.5060 + (locationId * 0.005), // Slightly offset based on location ID
      longitude: 80.6420 + (locationId * 0.003),
      intensity: (totalWaste / totalReadings) / 100, // Normalize to 0-1 scale
      wastePercentage: (totalWaste / totalReadings).toFixed(2)
    });
    
    // Calculate distribution data for pie chart
    const distributionRanges = {
      '0-20%': 0,
      '20-40%': 0,
      '40-60%': 0,
      '60-80%': 0,
      '80-100%': 0
    };
    
    // Calculate stats for all readings
    let allReadings = [];
    allDistances.forEach(distance => {
      const distanceData = locationData[distance];
      Object.keys(distanceData).forEach(date => {
        distanceData[date].forEach(reading => {
          allReadings.push(reading.waste_percentage);
          
          if (reading.waste_percentage >= 0 && reading.waste_percentage < 20) {
            distributionRanges['0-20%'] += 1;
          } else if (reading.waste_percentage >= 20 && reading.waste_percentage < 40) {
            distributionRanges['20-40%'] += 1;
          } else if (reading.waste_percentage >= 40 && reading.waste_percentage < 60) {
            distributionRanges['40-60%'] += 1;
          } else if (reading.waste_percentage >= 60 && reading.waste_percentage < 80) {
            distributionRanges['60-80%'] += 1;
          } else if (reading.waste_percentage >= 80 && reading.waste_percentage <= 100) {
            distributionRanges['80-100%'] += 1;
          }
        });
      });
    });
    
    // Format distribution data for charts
    const distributionData = Object.keys(distributionRanges).map(range => ({
      name: range,
      value: distributionRanges[range]
    }));
    
    // Return the aggregated stats
    res.json({
      dailyData: dailyWasteArray,
      weeklyData: weeklyWasteArray,
      distribution: distributionData,
      areaData: areaData,
      summary: {
        averageWastePercentage: totalWaste / totalReadings,
        highestWastePercentage: maxWaste,
        highestWasteDate: maxWasteDate,
        totalImagesAnalyzed: totalReadings,
        wasteFreePercentage: (zeroWasteCount / totalReadings) * 100,
      }
    });
  } catch (err) {
    console.error('Error calculating waste stats:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get stats for a location
app.get('/api/stats/location/:locationId', async (req, res) => {
  try {
    // Get waste stats first
    const locationId = req.params.locationId;
    let wasteStats = null;
    
    if (wasteDetectionData[locationId]) {
      const locationData = wasteDetectionData[locationId];
      const allDistances = Object.keys(locationData);
      
      // Calculate basic waste stats
      let totalReadings = 0;
      let totalWaste = 0;
      let maxWaste = 0;
      let maxWasteDate = '';
      
      allDistances.forEach(distance => {
        const distanceData = locationData[distance];
        
        Object.keys(distanceData).forEach(date => {
          distanceData[date].forEach(reading => {
            totalReadings += 1;
            totalWaste += reading.waste_percentage;
            
            if (reading.waste_percentage > maxWaste) {
              maxWaste = reading.waste_percentage;
              maxWasteDate = date;
            }
          });
        });
      });
      
      wasteStats = {
        averageWastePercentage: (totalWaste / totalReadings).toFixed(2),
        highestWastePercentage: maxWaste.toFixed(2),
        highestWasteDate: maxWasteDate,
        totalImagesAnalyzed: totalReadings
      };
    }
    
    // Get the location info
    const location = await Location.findOne({ id: Number(req.params.locationId) });
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Get the first and last dates of photos for this location
    const firstPhoto = await Photo.findOne({ locationId: Number(req.params.locationId) }).sort({ date: 1 });
    const lastPhoto = await Photo.findOne({ locationId: Number(req.params.locationId) }).sort({ date: -1 });
    
    // Generate visitor data (in a real app, this would be actual data)
    const visitorData = [];
    const currentDate = new Date(2025, 3, 1); // April 1, 2025
    const endDate = new Date(2025, 3, 30);    // April 30, 2025
    
    while (currentDate <= endDate) {
      // Only include every 5th day
      if (currentDate.getDate() % 5 === 0 || currentDate.getDate() === 1 || currentDate.getDate() === 30) {
        visitorData.push({
          date: currentDate.toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 500) + 300
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const stats = {
      visitors: visitorData,
      distribution: [
        { name: "Morning", value: 35 },
        { name: "Afternoon", value: 45 },
        { name: "Evening", value: 15 },
        { name: "Night", value: 5 }
      ],
      totalVisitors: Math.floor(Math.random() * 5000) + 7000,
      averageRating: (Math.random() * 1 + 4).toFixed(1),
      returnRate: Math.floor(Math.random() * 15) + 80,
      wasteStats: wasteStats
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get map waste data for heatmap visualization
app.get('/api/waste/map-data', (req, res) => {
  try {
    // Generate waste heatmap data for the map
    const mapData = [];
    
    // Process each location's data
    Object.keys(wasteDetectionData).forEach(locationId => {
      const locationData = wasteDetectionData[locationId];
      const allDistances = Object.keys(locationData);
      
      let totalReadings = 0;
      let totalWaste = 0;
      
      allDistances.forEach(distance => {
        const distanceData = locationData[distance];
        
        Object.keys(distanceData).forEach(date => {
          distanceData[date].forEach(reading => {
            totalReadings += 1;
            totalWaste += reading.waste_percentage;
          });
        });
      });
      
      const avgWaste = totalWaste / totalReadings;
      
      // Base coordinates for Vijayawada landmarks
      const baseCoordinates = {
        1: { lat: 16.5175, lng: 80.6096 }, // Kanaka Durga Temple
        2: { lat: 16.5061, lng: 80.6080 }, // Prakasam Barrage
        3: { lat: 16.5175, lng: 80.6236 }, // Vijayawada Railway Station
        4: { lat: 16.5009, lng: 80.6525 }, // Rajiv Gandhi Park
        5: { lat: 16.4300, lng: 80.5580 }, // Mangalagiri Market Area
        6: { lat: 16.4807, lng: 80.5010 }  // SRM University
      };
      
      // Add the heatmap point for this location
      if (baseCoordinates[locationId]) {
        mapData.push({
          locationId: Number(locationId),
          latitude: baseCoordinates[locationId].lat,
          longitude: baseCoordinates[locationId].lng,
          intensity: avgWaste / 100, // Normalize to 0-1 scale
          wastePercentage: avgWaste.toFixed(2)
        });
        
        // Add a few nearby points with slightly lower intensity for better visualization
        for (let i = 0; i < 3; i++) {
          mapData.push({
            locationId: Number(locationId),
            latitude: baseCoordinates[locationId].lat + (Math.random() * 0.01 - 0.005),
            longitude: baseCoordinates[locationId].lng + (Math.random() * 0.01 - 0.005),
            intensity: (avgWaste / 100) * (0.8 - (i * 0.2)),
            wastePercentage: (avgWaste * (0.8 - (i * 0.2))).toFixed(2)
          });
        }
      }
    });
    
    res.json(mapData);
  } catch (err) {
    console.error('Error generating map waste data:', err);
    res.status(500).json({ message: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
