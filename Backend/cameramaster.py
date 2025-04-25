# master_controller.py
import subprocess
import os
import time
import threading
import signal
import sys

def run_camera():
    print("Starting camera.py...")
    subprocess.run(["python3", "camera.py"])

def run_node_uploader():
    print("Starting uploadPhotos.js...")
    subprocess.run(["node", "uploadPhotos.js"])

def run_waste_detection():
    print("Starting wasteDetectionMonitor.py...")
    subprocess.run(["python3", "wasteDetectionMonitor.py"])

def signal_handler(sig, frame):
    print("Shutting down gracefully...")
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create and start threads for each process
    camera_thread = threading.Thread(target=run_camera)
    node_thread = threading.Thread(target=run_node_uploader)
    waste_thread = threading.Thread(target=run_waste_detection)
    
    # Make threads daemon so they exit when main program exits
    camera_thread.daemon = True
    node_thread.daemon = True
    waste_thread.daemon = True
    
    # Start all threads
    camera_thread.start()
    time.sleep(2)  # Give camera.py a moment to initialize
    node_thread.start()
    time.sleep(2)  # Give Node.js a moment to initialize
    waste_thread.start()
    
    print("All processes started! Press Ctrl+C to exit.")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Interrupted by user")
