const Photo = require('../models/Photo');
const Location = require('../models/Location');
const path = require('path');
const fs = require('fs');

// Get photos by location id
exports.getPhotosByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const { date, month, year } = req.query;
    
    let query = { locationId: Number(locationId) };
    
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
    
    const photos = await Photo.find(query).sort({ captureDate: 1 });
    
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
    
    const startDate = new Date(year, month - 1, date);
    const endDate = new Date(year, month - 1, date, 23, 59, 59);
    
    const photos = await Photo.find({
      captureDate: { $gte: startDate, $lte: endDate }
    }).sort({ locationId: 1 });
    
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
    const { month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month
    
    const photos = await Photo.find({
      locationId: Number(locationId),
      captureDate: { $gte: startDate, $lte: endDate }
    }).sort({ captureDate: 1 });
    
    // Calculate daily averages
    const dailyStats = {};
    
    photos.forEach(photo => {
      const day = photo.captureDate.getDate();
      
      if (!dailyStats[day]) {
        dailyStats[day] = {
          day,
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
    
    const { locationId, date, month, year, captionPrefix } = req.body;
    
    if (!locationId || !date || !month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
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
    
    // Process each uploaded file
    const captureDate = new Date(year, month - 1, date);
    const uploadedPhotos = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      // Create photo document
      const photo = new Photo({
        locationId: Number(locationId),
        captureDate,
        filePath: file.path.replace('public', ''),
        fileName: file.filename,
        caption: `${captionPrefix || location.name} - Photo ${i+1}`,
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