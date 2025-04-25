import cv2
import os
import time
from datetime import datetime

# Paths to the folders where images will be saved
folder_7m = "/Users/abhay.raj1/Desktop/Capstone-Project/Backend/7metres"
folder_10m = "/Users/abhay.raj1/Desktop/Capstone-Project/Backend/10metres"

# Ensure the folders exist; if not, create them
os.makedirs(folder_7m, exist_ok=True)
os.makedirs(folder_10m, exist_ok=True)

# Initialize the camera (0 is the default camera index, change it if you have multiple cameras)
camera = cv2.VideoCapture(0)

# Function to save an image to a folder
def save_image(folder, img, img_number):
    # Create a timestamped image name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{folder}/image_{img_number}_{timestamp}.jpg"
    cv2.imwrite(filename, img)
    print(f"Image saved to {filename}")

# Main loop to take pictures every 1 minutes
try:
    img_number = 0  # Image counter
    while True:
        # Read from the camera
        ret, frame = camera.read()
        if not ret:
            print("Failed to capture image. Exiting.")
            break

        # Increment the image counter
        img_number += 1

        # Save one image into the 7m folder
        save_image(folder_7m, frame, img_number)

        # Save another image into the 10m folder
        save_image(folder_10m, frame, img_number)

        # Wait for 2 minutes (120 seconds)
        print("Waiting for 1 minutes before capturing the next images...")
        time.sleep(60)

except KeyboardInterrupt:
    print("Interrupted by user. Exiting...")
finally:
    # Release the camera and close all windows
    camera.release()
    cv2.destroyAllWindows()
    print("Camera released and program terminated.")
