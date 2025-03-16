import requests

# Bounding box for Bardhaman-Durgapur (approximate)
BBOX = "23.1,87.2,23.7,87.9"  # Format: (south, west, north, east)

QUERY = f"""
[out:json];
(
  node["tourism"="attraction"]({BBOX});
  node["shop"="mall"]({BBOX});
  node["leisure"="park"]({BBOX});
);
out body;
"""

url = "http://overpass-api.de/api/interpreter"
response = requests.get(url, params={"data": QUERY})
data = response.json()

# Print places found
places = [elem["tags"].get("name", "Unknown Place") for elem in data.get("elements", [])]
print(places)
