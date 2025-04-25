# wasteDetectionMonitor.py
from ultralytics import YOLO
import cv2
import numpy as np
import os
import json
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Load trained YOLO model
model = YOLO("/Users/abhay.raj1/Desktop/Capstone-Project/Backend/runs1/detect/train/weights/best.pt")

# Known reference values
known_distance_m = 10.0               # distance at which known_scene_width applies
known_scene_width_m = 20.0            # real-world width covered at known_distance_m

# Results JSON path
results_json_path = "/Users/abhay.raj1/Desktop/Capstone-Project/Backend/results/waste_detection_results.json"
photos_root_folder = "/Users/abhay.raj1/Desktop/Capstone-Project/Backend/uploads/locationPhotos"

# Function to process a single image
def process_image(image_path, capture_distance_m):
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error: Unable to load image {image_path}")
        return None

    image_height, image_width = img.shape[:2]
    total_image_area_pixels = image_height * image_width

    # Calculate real-world scene width at current distance using inverse proportionality
    scene_width_m = (known_scene_width_m * capture_distance_m) / known_distance_m

    # Scene real-world height (keeping aspect ratio)
    scene_height_m = scene_width_m * (image_height / image_width)

    # Scene total real-world area (m²)
    scene_area_m2 = scene_width_m * scene_height_m

    # Area per pixel in real-world (m²)
    area_per_pixel_m2 = scene_area_m2 / total_image_area_pixels

    # Inference
    results = model(image_path)

    # Create mask for detected waste areas
    waste_mask = np.zeros((image_height, image_width), dtype=np.uint8)

    # Draw filled areas in mask for each detection
    for box in results[0].boxes.xyxy:
        x1, y1, x2, y2 = map(int, box)
        cv2.rectangle(waste_mask, (x1, y1), (x2, y2), 255, -1)

    # Waste pixels count
    waste_pixels = cv2.countNonZero(waste_mask)

    # Real-world waste area (m²)
    waste_area_m2 = waste_pixels * area_per_pixel_m2

    # Waste percentage based on real-world areas
    waste_percentage_realworld = (waste_area_m2 / scene_area_m2) * 100

    return waste_percentage_realworld

# Function to load existing JSON data or create empty structure
def load_or_create_json():
    if os.path.exists(results_json_path):
        try:
            with open(results_json_path, "r") as json_file:
                return json.load(json_file)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {results_json_path}. Creating new JSON structure.")
            return {}
    return {}

# Function to save results to JSON
def save_json(data):
    with open(results_json_path, "w") as json_file:
        json.dump(data, json_file, indent=4)
    print(f"✅ Results saved to {results_json_path}")

# Function to process a newly added image and update the JSON
def process_new_image(image_path):
    print(f"Processing new image: {image_path}")
    
    # Parse the path to extract place, distance, and date
    # Expected path format: .../locationPhotos/{place}/{distance}/{date}/{image}
    path_parts = image_path.split(os.path.sep)
    
    # Find the index of locationPhotos in the path
    try:
        photos_index = path_parts.index("locationPhotos")
    except ValueError:
        print(f"Error: Invalid path structure for {image_path}")
        return
    
    # Extract components
    try:
        place_folder = path_parts[photos_index + 1]
        distance_folder = path_parts[photos_index + 2]  # 7m or 10m
        date_folder = path_parts[photos_index + 3]
        image_name = path_parts[-1]
    except IndexError:
        print(f"Error: Path does not contain expected structure: {image_path}")
        return
    
    # Determine the capture distance
    capture_distance_m = 7.0 if distance_folder == "7m" else 10.0
    
    # Process the image to get waste percentage
    waste_percentage = process_image(image_path, capture_distance_m)
    
    if waste_percentage is None:
        print(f"Error: Could not process image {image_path}")
        return
    
    # Load existing results
    results = load_or_create_json()
    
    # Update the results
    if place_folder not in results:
        results[place_folder] = {}
    
    if distance_folder not in results[place_folder]:
        results[place_folder][distance_folder] = {}
    
    if date_folder not in results[place_folder][distance_folder]:
        results[place_folder][distance_folder][date_folder] = []
    
    # Add this image's result
    results[place_folder][distance_folder][date_folder].append({
        "image": image_name,
        "waste_percentage": waste_percentage
    })
    
    # Save the updated results
    save_json(results)

# Class to handle file system events
class ImageHandler(FileSystemEventHandler):
    def on_created(self, event):
        if event.is_directory:
            return
        
        # Check if the created file is an image
        if event.src_path.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            # Run the processor after a short delay to ensure the file is fully written
            time.sleep(1)
            process_new_image(event.src_path)

# Function to process all places and generate complete results JSON
def process_all_places(force_reprocess=False):
    print("Processing all existing images...")
    results = {} if force_reprocess else load_or_create_json()
    
    # Walk through the place folders
    for place_folder in sorted(os.listdir(photos_root_folder)):
        place_path = os.path.join(photos_root_folder, place_folder)
        if not os.path.isdir(place_path):
            continue
            
        print(f"Processing place: {place_folder}...")
        
        if place_folder not in results:
            results[place_folder] = {}
        
        # Process 7m and 10m folders
        for distance_folder in ["7m", "10m"]:
            distance_path = os.path.join(place_path, distance_folder)
            if not os.path.isdir(distance_path):
                continue
                
            print(f"  Processing folder: {distance_folder}...")
            
            if distance_folder not in results[place_folder]:
                results[place_folder][distance_folder] = {}
                
            capture_distance_m = 7.0 if distance_folder == "7m" else 10.0
            
            # Process each date folder
            for date_folder in sorted(os.listdir(distance_path)):
                date_path = os.path.join(distance_path, date_folder)
                if not os.path.isdir(date_path):
                    continue
                    
                # Skip if already processed and not force reprocessing
                if not force_reprocess and date_folder in results[place_folder][distance_folder]:
                    print(f"    Skipping already processed date: {date_folder}")
                    continue
                    
                print(f"    Processing date: {date_folder}...")
                
                day_results = []
                
                # Process each image in the date folder
                for image_file in sorted(os.listdir(date_path)):
                    image_path = os.path.join(date_path, image_file)
                    if not os.path.isfile(image_path) or not image_path.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
                        continue
                        
                    print(f"      Processing image: {image_file}")
                    waste_percentage = process_image(image_path, capture_distance_m)
                    
                    if waste_percentage is not None:
                        day_results.append({
                            "image": image_file,
                            "waste_percentage": waste_percentage
                        })
                
                # Add results for the day
                results[place_folder][distance_folder][date_folder] = day_results
    
    # Save all results to JSON
    save_json(results)
    print("Finished processing all existing images.")

# Main function
def main():
    # Process existing images first
    process_all_places(force_reprocess=False)
    
    # Set up observer to watch for new images
    event_handler = ImageHandler()
    observer = Observer()
    observer.schedule(event_handler, photos_root_folder, recursive=True)
    observer.start()
    
    print(f"Watching for new images in {photos_root_folder}...")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# Run the main function
if __name__ == "__main__":
    main()
