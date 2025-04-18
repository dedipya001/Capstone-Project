const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Location = require('./models/Location');
const Photo = require('./models/Photo');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dedipyagoswami001:6Ry2mqBqFYru2Eta@cluster0.84udc0z.mongodb.net/vijayawada_map', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Sample location data
const locationData = [
  {
    id: 1,
    name: "Kanaka Durga Temple",
    category: "religious",
    description: "Famous temple dedicated to Goddess Durga located on Indrakeeladri hill.",
    latitude: 16.5175,
    longitude: 80.6096,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg/320px-Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg"
  },
  {
    id: 2,
    name: "Prakasam Barrage",
    category: "infrastructure",
    description: "Major dam across Krishna River connecting Vijayawada with Guntur district.",
    latitude: 16.5061,
    longitude: 80.6080,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Prakasam_Barrage_evening.jpg/320px-Prakasam_Barrage_evening.jpg"
  },
  {
    id: 3,
    name: "Vijayawada Railway Station",
    category: "transport",
    description: "One of the busiest railway stations in India with over 1.4 million passengers daily.",
    latitude: 16.5175,
    longitude: 80.6236,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vijayawada_Junction_railway_station_board.jpg/320px-Vijayawada_Junction_railway_station_board.jpg"
  },
  {
    id: 4,
    name: "Rajiv Gandhi Park",
    category: "recreation",
    description: "Major urban park in the heart of the city with lush greenery.",
    latitude: 16.5009,
    longitude: 80.6525,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Rajiv_Gandhi_Park%2C_Vijayawada.jpg/320px-Rajiv_Gandhi_Park%2C_Vijayawada.jpg"
  },
  {
    id: 5,
    name: "Mangalagiri Market Area",
    category: "market",
    description: "A bustling market area known for textiles, fresh produce, spices, and local handicrafts.",
    latitude: 16.4300,
    longitude: 80.5580,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 6,
    name: "SRM University, AP",
    category: "educational",
    description: "A prominent private university offering undergraduate, postgraduate, and doctoral programs.",
    latitude: 16.4807,
    longitude: 80.5010,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SRM_University%2C_Andhra_Pradesh.jpg/320px-SRM_University%2C_Andhra_Pradesh.jpg"
  }
];

// Define dataset paths for 7m and 10m
const datasetPaths = {
  '7m': '/Users/abhay.raj1/Desktop/Capstone-Project/Backend/7metres',
  '10m': '/Users/abhay.raj1/Desktop/Capstone-Project/Backend/10metres'
};

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

// Function to get images from dataset folders
const getImagesFromDataset = (datasetPath) => {
  try {
    if (!fs.existsSync(datasetPath)) {
      console.error(`Dataset path ${datasetPath} does not exist`);
      return [];
    }
    
    const files = fs.readdirSync(datasetPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    return imageFiles.map(file => path.join(datasetPath, file));
  } catch (error) {
    console.error(`Error getting images from dataset ${datasetPath}:`, error);
    return [];
  }
};

// Function to generate photo data for a location with structured folders
const generatePhotosForLocation = async (location) => {
  console.log(`Generating photos for ${location.name}...`);
  const photos = [];
  const locationId = location.id;
  
  try {
    // Create base directories for the location
    createUploadDirs(locationId);
    
    // Process each dataset (7m and 10m)
    for (const [datasetName, datasetPath] of Object.entries(datasetPaths)) {
      console.log(`Processing ${datasetName} dataset from ${datasetPath}`);
      
      // Get all images from dataset
      const sourceImages = getImagesFromDataset(datasetPath);
      
      if (sourceImages.length === 0) {
        console.error(`No images found in dataset: ${datasetPath}`);
        continue;
      }
      
      console.log(`Found ${sourceImages.length} images in ${datasetName} dataset`);
      
      // Generate 2 photos per day for the month of April 2025
      const year = 2025;
      const month = 4; // April
      const daysInMonth = new Date(year, month, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        // Create day directory
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayDir = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString(), datasetName, dateStr);
        
        if (!fs.existsSync(dayDir)) {
          fs.mkdirSync(dayDir, { recursive: true });
        }
        
        // Add 2 images for each day
        for (let photoNum = 1; photoNum <= 2; photoNum++) {
          // Get a random image from the dataset
          const randomIndex = Math.floor(Math.random() * sourceImages.length);
          const sourceImage = sourceImages[randomIndex];
          
          // Create a unique filename
          const filename = `photo_${photoNum}.jpg`;
          const targetPath = path.join(dayDir, filename);
          
          try {
            // Copy the image from dataset to the day folder
            fs.copyFileSync(sourceImage, targetPath);
            
            // Get file stats
            const fileStats = fs.statSync(targetPath);
            
            // Create relative path for database
            const relativePath = `/uploads/locationPhotos/${locationId}/${datasetName}/${dateStr}/${filename}`;
            
            // Create photo document
            const photo = {
              locationId: locationId,
              captureDate: new Date(year, month - 1, day),
              filePath: relativePath,
              fileName: filename,
              caption: `${location.name} - ${datasetName} view on ${dateStr}`,
              metadata: {
                width: 800,
                height: 600,
                size: fileStats.size
              },
              stats: {
                peopleCount: Math.floor(Math.random() * 20),
                vehicleCount: Math.floor(Math.random() * 10),
                garbageLevel: ['low', 'medium', 'high', 'none'][Math.floor(Math.random() * 4)],
                weatherCondition: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'][Math.floor(Math.random() * 5)]
              }
            };
            
            photos.push(photo);
            console.log(`  - Created photo: ${datasetName}/${dateStr}/${filename}`);
          } catch (copyError) {
            console.error(`  - Error copying file ${sourceImage} to ${targetPath}:`, copyError);
          }
        }
      }
    }
    
    return photos;
  } catch (error) {
    console.error(`Error generating photos for ${location.name}:`, error);
    return photos;
  }
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Location.deleteMany({});
    await Photo.deleteMany({});
    
    // Insert locations
    console.log('Inserting locations...');
    await Location.insertMany(locationData);
    console.log(`✅ Added ${locationData.length} locations`);
    
    // Generate and insert photos for each location
    for (const location of locationData) {
      console.log(`Processing location: ${location.name}`);
      const photos = await generatePhotosForLocation(location);
      
      if (photos.length > 0) {
        await Photo.insertMany(photos);
        console.log(`✅ Added ${photos.length} photos for ${location.name}`);
      } else {
        console.warn(`⚠️ No photos were generated for ${location.name}`);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Setup watcher for automatic updates
const setupWatcher = () => {
  const chokidar = require('chokidar');
  
  for (const [datasetName, datasetPath] of Object.entries(datasetPaths)) {
    console.log(`Setting up watcher for ${datasetName} dataset at ${datasetPath}`);
    
    // Initialize watcher
    const watcher = chokidar.watch(datasetPath, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: true
    });
    
    // Handle new files
    watcher.on('add', async (filePath) => {
      try {
        // Check if it's an image
        if (!/\.(jpg|jpeg|png)$/i.test(filePath)) {
          return;
        }
        
        console.log(`New file detected in ${datasetName} dataset: ${filePath}`);
        
        // Get all locations
        const locations = await Location.find({});
        
        // For each location, add the new image
        for (const location of locations) {
          const locationId = location.id;
          
          // Create directories if they don't exist
          createUploadDirs(locationId);
          
          // Current date
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const day = now.getDate();
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Create day directory
          const dayDir = path.join(__dirname, 'uploads', 'locationPhotos', locationId.toString(), datasetName, dateStr);
          
          if (!fs.existsSync(dayDir)) {
            fs.mkdirSync(dayDir, { recursive: true });
          }
          
          // Generate unique filename
          const timestamp = new Date().getTime();
          const filename = `photo_${timestamp}.jpg`;
          const targetPath = path.join(dayDir, filename);
          
          // Copy file
          fs.copyFileSync(filePath, targetPath);
          console.log(`  - Copied to ${targetPath}`);
          
          // Create relative path for database
          const relativePath = `/uploads/locationPhotos/${locationId}/${datasetName}/${dateStr}/${filename}`;
          
          // Create and save photo document
          const photo = new Photo({
            locationId: locationId,
            captureDate: now,
            filePath: relativePath,
            fileName: filename,
            caption: `${location.name} - ${datasetName} view on ${dateStr}`,
            metadata: {
              width: 800,
              height: 600,
              size: fs.statSync(targetPath).size
            },
            stats: {
              peopleCount: Math.floor(Math.random() * 20),
              vehicleCount: Math.floor(Math.random() * 10),
              garbageLevel: ['low', 'medium', 'high', 'none'][Math.floor(Math.random() * 4)],
              weatherCondition: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'][Math.floor(Math.random() * 5)]
            }
          });
          
          await photo.save();
          console.log(`  - Added to database for location ${locationId}`);
        }
      } catch (error) {
        console.error(`Error processing new file ${filePath}:`, error);
      }
    });
    
    watcher.on('error', error => {
      console.error(`Watcher error: ${error}`);
    });
  }
  
  console.log('Watchers set up successfully. Monitoring datasets for changes...');
};

// Run the seeding function and set up watchers
const init = async () => {
  try {
    await seedDatabase();
    setupWatcher();
  } catch (error) {
    console.error('Error during initialization:', error);
    mongoose.disconnect();
  }
};

// Export the function for use in other modules
module.exports = {
  generatePhotosForLocation
};

// Execute the script if it's run directly
if (require.main === module) {
  init();
}
