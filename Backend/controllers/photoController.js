const Photo = require('../models/Photo');
const Location = require('../models/Location');
const path = require('path');
const fs = require('fs');

// Get photos by location id
exports.getPhotosByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { date, month, year, captureDistance } = req.query;
    
    let query = { locationId: Number(locationId) };
    
    // Add captureDistance filter if provided
    if (captureDistance) {
      query.captureDistance = captureDistance;
    }
    
    // Add date filter if provided
    if (date && month && year) {
      const startDate = new Date(year, month - 1, date);
      const endDate = new Date(year, month - 1, date, 23, 59, 59);
      
      query.captureDate = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
      
      query.captureDate = { $gte: startDate, $lte: endDate };
    }
    
    const photos = await Photo.find(query).sort({ captureDate: 1, captureDistance: 1 });
    
    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// Get photos by date for all locations
exports.getPhotosByDate = async (req, res) => {
  try {
    const { date, month, year } = req.params;
    const { captureDistance } = req.query;
    
    const startDate = new Date(year, month - 1, date);
    const endDate = new Date(year, month - 1, date, 23, 59, 59);
    
    let query = {
      captureDate: { $gte: startDate, $lte: endDate }
    };
    
    // Add captureDistance filter if provided
    if (captureDistance) {
      query.captureDistance = captureDistance;
    }
    
    const photos = await Photo.find(query).sort({ locationId: 1, captureDistance: 1 });
    
    res.status(200).json({
      success: true,
      count: photos.length,
      data: photos
    });
  } catch (error) {
    console.error('Error fetching photos by date:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// Get photos for stats
exports.getPhotoStatsForLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { month, year, captureDistance } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
    
    let query = {
      locationId: Number(locationId),
      captureDate: { $gte: startDate, $lte: endDate }
    };
    
    // Add captureDistance filter if provided
    if (captureDistance) {
      query.captureDistance = captureDistance;
    }
    
    const photos = await Photo.find(query).sort({ captureDate: 1 });
    
    // Calculate daily averages
    const dailyStats = {};
    
    photos.forEach(photo => {
      const day = photo.captureDate.getDate();
      const distance = photo.captureDistance || 'unknown';
      
      if (!dailyStats[day]) {
        dailyStats[day] = {
          day,
          distanceStats: { '7m': { count: 0 }, '10m': { count: 0 } },
          peopleCount: 0,
          vehicleCount: 0,
          garbageStats: { low: 0, medium: 0, high: 0, none: 0 },
          weatherStats: { sunny: 0, cloudy: 0, rainy: 0, foggy: 0, unknown: 0 },
          photoCount: 0
        };
      }
      
      const dayStat = dailyStats[day];
      dayStat.peopleCount += photo.stats.peopleCount || 0;
      dayStat.vehicleCount += photo.stats.vehicleCount || 0;
      dayStat.garbageStats[photo.stats.garbageLevel] += 1;
      dayStat.weatherStats[photo.stats.weatherCondition] += 1;
      dayStat.photoCount += 1;
      
      // Track stats by distance
      if (distance === '7m' || distance === '10m') {
        dayStat.distanceStats[distance].count += 1;
      }
    });
    
    // Calculate averages
    Object.keys(dailyStats).forEach(day => {
      const stat = dailyStats[day];
      const photoCount = stat.photoCount;
      
      if (photoCount > 0) {
        stat.peopleCount = Math.round(stat.peopleCount / photoCount);
        stat.vehicleCount = Math.round(stat.vehicleCount / photoCount);
      }
    });
    
    // Convert to array for easier frontend handling
    const dailyStatsArray = Object.values(dailyStats);
    
    res.status(200).json({
      success: true,
      locationId: Number(locationId),
      month,
      year,
      captureDistance: captureDistance || 'all',
      dailyStats: dailyStatsArray
    });
  } catch (error) {
    console.error('Error fetching photo stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// Upload new photos
exports.uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const { locationId, date, month, year, captionPrefix, captureDistance } = req.body;
    
    if (!locationId || !date || !month || !year || !captureDistance) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Validate capture distance
    if (captureDistance !== '7m' && captureDistance !== '10m') {
      return res.status(400).json({
        success: false,
        error: 'Invalid capture distance. Must be either "7m" or "10m"'
      });
    }
    
    // Check if location exists
    const location = await Location.findOne({ id: Number(locationId) });
    
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }
    
    // Check how many photos already exist for this day and capture distance
    const captureDate = new Date(year, month - 1, date);
    const startDate = new Date(year, month - 1, date);
    const endDate = new Date(year, month - 1, date, 23, 59, 59);
    
    const existingPhotos = await Photo.find({
      locationId: Number(locationId),
      captureDistance,
      captureDate: { $gte: startDate, $lte: endDate }
    });
    
    if (existingPhotos.length >= 2) {
      return res.status(400).json({
        success: false,
        error: `Already have 2 photos for location ${locationId} at ${captureDistance} on ${month}/${date}/${year}`
      });
    }
    
    // Limit upload to only what's needed (max 2 total)
    const maxAllowedUploads = 2 - existingPhotos.length;
    const filesToProcess = req.files.slice(0, maxAllowedUploads);
    
    // Process each uploaded file
    const uploadedPhotos = [];
    
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      
      // Create photo document
      const photo = new Photo({
        locationId: Number(locationId),
        captureDate,
        captureDistance,
        filePath: file.path.replace('public', ''),
        fileName: file.filename,
        caption: `${captionPrefix || location.name} - ${captureDistance} - Photo ${existingPhotos.length + i + 1}`,
        metadata: {
          size: file.size,
          width: 0, // These would be populated by an image processing library
          height: 0
        },
        stats: {
          peopleCount: Math.floor(Math.random() * 20), // Example random stats
          vehicleCount: Math.floor(Math.random() * 10),
          garbageLevel: ['low', 'medium', 'high', 'none'][Math.floor(Math.random() * 4)],
          weatherCondition: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'][Math.floor(Math.random() * 5)]
        }
      });
      
      await photo.save();
      uploadedPhotos.push(photo);
    }
    
    res.status(201).json({
      success: true,
      count: uploadedPhotos.length,
      data: uploadedPhotos
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};
