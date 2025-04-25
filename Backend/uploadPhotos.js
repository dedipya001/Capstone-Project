const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
require('dotenv').config();
const Location = require('./models/Location');
const Photo = require('./models/Photo');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dedipyagoswami001:6Ry2mqBqFYru2Eta@cluster0.84udc0z.mongodb.net/vijayawada_map', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Define dataset paths for 7m and 10m
const datasetPaths = {
  '7m': '/Users/abhay.raj1/Desktop/Capstone-Project/Backend/7metres',
  '10m': '/Users/abhay.raj1/Desktop/Capstone-Project/Backend/10metres'
};

// Tracking variables
let currentLocationIndex = 0; // Current location being processed (0-5 for locations 1-6)
let currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

// Function to create upload directories if they don't exist
const createUploadDirs = (locationId) => {
  const baseDir = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString());
  const subDirs = ['7m', '10m'];

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  subDirs.forEach((subDir) => {
    const dirPath = path.join(baseDir, subDir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  console.log(`Created directories for location ${locationId}`);
};

// Function to get the next available date for a location and dataset
const getAvailableDate = (locationId, datasetName, startDate = new Date()) => {
  let currentCheckDate = new Date(startDate);
  
  // Keep checking future dates until we find one with <2 images
  while (true) {
    const dateStr = currentCheckDate.toISOString().split('T')[0];
    const dateDir = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString(), datasetName, dateStr);
    
    // If the directory doesn't exist, this date is available
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
      return dateStr;
    }
    
    // If the directory exists, check how many images it contains
    const files = fs.readdirSync(dateDir);
    if (files.length < 2) {
      return dateStr;
    }
    
    // This date already has 2 images, try the next day
    currentCheckDate.setDate(currentCheckDate.getDate() + 1);
  }
};

// Function to process a new file
const processNewFile = async (filePath, datasetName) => {
  try {
    console.log(`Processing new file: ${filePath}`);

    // Get all locations
    const locations = await Location.find().sort({ id: 1 });
    if (locations.length === 0) {
      console.error("No locations found");
      return;
    }

    // Get the current location
    const location = locations[currentLocationIndex];
    const locationId = location.id;
    
    // Create directories for the location if they don't exist
    createUploadDirs(locationId);
    
    // Find an available date for this location and dataset
    const availableDate = getAvailableDate(locationId, datasetName);
    console.log(`Assigning ${datasetName} image to location ${locationId} for date ${availableDate}`);
    
    // Get the directory for this date
    const dayDir = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString(), datasetName, availableDate);
    
    // Generate a unique filename
    const uniqueFileName = `photo_${Date.now()}_${path.basename(filePath)}`;
    const targetPath = path.join(dayDir, uniqueFileName);
    
    // Copy the file to the target directory
    fs.copyFileSync(filePath, targetPath);
    
    // Save the photo details to the database
    const photo = new Photo({
      locationId,
      captureDate: new Date(availableDate),
      filePath: targetPath.replace(__dirname, ''), // Save relative path
      fileName: uniqueFileName,
      caption: `${location.name} - ${datasetName} view on ${availableDate}`,
      metadata: {
        width: 800, // Placeholder values
        height: 600, // Placeholder values
        size: fs.statSync(targetPath).size
      },
      stats: {
        peopleCount: Math.floor(Math.random() * 20), // Random stats for demo
        vehicleCount: Math.floor(Math.random() * 10),
        garbageLevel: ['low', 'medium', 'high', 'none'][Math.floor(Math.random() * 4)],
        weatherCondition: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'][Math.floor(Math.random() * 5)]
      }
    });
    
    await photo.save();
    console.log(`✅ Photo saved to database for location ${locationId}: ${targetPath}`);
    
    // Check if we need to move to the next location
    const files = fs.readdirSync(dayDir);
    if (files.length >= 2) {
      // Move to the next location for the next file
      currentLocationIndex = (currentLocationIndex + 1) % locations.length;
      console.log(`Moving to next location: ${locations[currentLocationIndex].id}`);
    }
  } catch (error) {
    console.error(`Error processing new file ${filePath}:`, error);
  }
};

// Function to set up a watcher for a dataset
const setupWatcher = (datasetPath, datasetName) => {
  const watcher = chokidar.watch(datasetPath, {
    persistent: true,
    ignoreInitial: true, // Ignore existing files when starting the watcher
    awaitWriteFinish: true // Wait until the file is fully written
  });

  watcher.on('add', (filePath) => {
    console.log(`New file detected in ${datasetName} dataset: ${filePath}`);
    processNewFile(filePath, datasetName);
  });

  watcher.on('error', (error) => {
    console.error(`Watcher error for ${datasetName}:`, error);
  });

  console.log(`Watcher set up for ${datasetName} dataset at ${datasetPath}`);
};

// Main function to initialize watchers
const main = async () => {
  try {
    // Set up watchers for each dataset
    for (const [datasetName, datasetPath] of Object.entries(datasetPaths)) {
      setupWatcher(datasetPath, datasetName);
    }

    console.log('Watchers set up successfully. Monitoring datasets for changes...');
  } catch (error) {
    console.error('Error initializing watchers:', error);
    mongoose.disconnect();
  }
};

// Handle application shutdown gracefully
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.disconnect();
  console.log('MongoDB connection closed');
  process.exit(0);
});

// Run the main function
main();
