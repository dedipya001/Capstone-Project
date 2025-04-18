const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dedipyagoswami001:6Ry2mqBqFYru2Eta@cluster0.84udc0z.mongodb.net/vijayawada_map', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

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
    ref: 'Location'
  },
  date: {
    type: Date,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  caption: String,
  metadata: {
    width: Number,
    height: Number,
    size: Number,
    format: String
  },
  tags: [String],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

PhotoSchema.index({ locationId: 1, date: 1 });

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

// Get stats for a location
app.get('/api/stats/location/:locationId', async (req, res) => {
  try {
    // For now, generate mock stats
    // In a real implementation, this would calculate actual stats from your data
    const location = await Location.findOne({ id: Number(req.params.locationId) });
    
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }
    
    // Get the first and last dates of photos for this location
    const firstPhoto = await Photo.findOne({ locationId: Number(req.params.locationId) }).sort({ date: 1 });
    const lastPhoto = await Photo.findOne({ locationId: Number(req.params.locationId) }).sort({ date: -1 });
    
    // Generate mock visitor data (in a real app, this would be actual data)
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
      returnRate: Math.floor(Math.random() * 15) + 80
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// At the end of server.js, after app.listen()
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const Photo = require('./models/Photo');

// Define dataset paths to monitor
const datasetPaths = {
  '7m': '/Users/abhay.raj1/Desktop/Capstone-Project/Backend/7metres', 
  '10m': '/Users/abhay.raj1/Desktop/Capstone-Project/Backend/10metres'
};

// Create folder structure for a location if it doesn't exist
const createLocationFolders = (locationId) => {
  const baseDir = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString());
  const subDirs = ['7m', '10m'];

  subDirs.forEach((subDir) => {
    const dirPath = path.join(baseDir, subDir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

// Function to save photo to database
const savePhotoToDB = async (locationId, subDir, filePath, fileName, captureDate) => {
  try {
    const photo = new Photo({
      locationId,
      captureDate,
      filePath: filePath.replace(__dirname, ''),
      fileName,
      caption: `Photo from ${subDir}`,
      metadata: {
        width: 800, // Placeholder
        height: 600, // Placeholder
        size: fs.statSync(filePath).size
      },
      stats: {
        peopleCount: Math.floor(Math.random() * 20),
        vehicleCount: Math.floor(Math.random() * 10),
        garbageLevel: ['low', 'medium', 'high', 'none'][Math.floor(Math.random() * 4)],
        weatherCondition: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'][Math.floor(Math.random() * 5)]
      }
    });

    await photo.save();
    console.log(`Photo saved to database: ${fileName}`);
  } catch (error) {
    console.error(`Error saving photo to database: ${error.message}`);
  }
};

// Function to watch dataset and process new images
const watchDataset = (datasetPath, subDir) => {
  console.log(`Watching dataset: ${datasetPath} for ${subDir}`);
  
  const watcher = chokidar.watch(datasetPath, { 
    persistent: true,
    ignoreInitial: false, // Process existing files when starting
    awaitWriteFinish: true // Wait until file is fully written
  });

  watcher.on('add', async (filePath) => {
    try {
      // Check if it's an image file
      if (!/\.(jpg|jpeg|png|gif)$/i.test(filePath)) {
        return;
      }

      console.log(`Processing file: ${filePath}`);
      const fileName = path.basename(filePath);

      // Get all locations
      const Location = mongoose.model('Location');
      const locations = await Location.find();

      // Process for each location
      for (const location of locations) {
        const locationId = location.id;
        
        // Create folders if they don't exist
        createLocationFolders(locationId);
        
        // Set the date to today
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Create day folder if it doesn't exist
        const dateFolderName = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayFolder = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString(), subDir, dateFolderName);
        
        if (!fs.existsSync(dayFolder)) {
          fs.mkdirSync(dayFolder, { recursive: true });
        }
        
        // Create a unique filename
        const uniqueFileName = `${locationId}_${subDir}_${dateFolderName}_${Date.now()}_${fileName}`;
        const targetPath = path.join(dayFolder, uniqueFileName);
        
        // Copy the file
        fs.copyFileSync(filePath, targetPath);
        console.log(`File copied to: ${targetPath}`);
        
        // Save to database
        await savePhotoToDB(locationId, subDir, targetPath, uniqueFileName, new Date(year, month - 1, day));
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}: ${error.message}`);
    }
  });

  watcher.on('error', error => console.error(`Watcher error: ${error}`));
};

// Start watching each dataset
Object.entries(datasetPaths).forEach(([subDir, datasetPath]) => {
  watchDataset(datasetPath, subDir);
});

console.log('File watchers started for automatic photo processing');
