import React from 'react';
import { Source, Layer } from 'react-map-gl';

export const StateLayers = ({ stateData, hoveredStateName }) => {
  if (!stateData) return null;
  
  return (
    <Source id="states-source" type="geojson" data={stateData}>
      <Layer
        id="state-fills"
        type="fill"
        paint={{
          'fill-color': [
            'case',
            ['boolean', ['==', ['get', 'STATE_NAME'], hoveredStateName || ''], false],
            '#00ff88',  // Highlighted state color
            '#00aa44'   // Default state color
          ],
          'fill-opacity': 0.5
        }}
      />
      <Layer
        id="state-borders"
        type="line"
        paint={{
          'line-color': '#00ff00',
          'line-width': 1,
          'line-opacity': 0.8
        }}
      />
      <Layer
        id="state-labels"
        type="symbol"
        layout={{
          'text-field': ['get', 'STATE_NAME'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
          'text-anchor': 'center',
          'text-allow-overlap': false
        }}
        paint={{
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }}
      />
    </Source>
  );
};

export const PCLayers = ({ pcData, selectedPC, hoveredPCName }) => {
  if (!pcData) return null;
  
  return (
    <Source id="pcs-source" type="geojson" data={pcData}>
      <Layer
        id="pc-fills"
        type="fill"
        paint={{
          'fill-color': [
            'case',
            ['boolean', ['==', ['get', 'PC_NAME'], selectedPC || ''], false],
            '#ff00ff',  // Selected PC
            [
              'case',
              ['boolean', ['==', ['get', 'PC_NAME'], hoveredPCName || ''], false],
              '#aa00aa',  // Hovered PC
              '#440044'   // Default PC color
            ]
          ],
          'fill-opacity': 0.7
        }}
      />
      <Layer
        id="pc-borders"
        type="line"
        paint={{
          'line-color': '#ff00ff',
          'line-width': 2,
          'line-opacity': 0.9
        }}
      />
      <Layer
        id="pc-labels"
        type="symbol"
        layout={{
          'text-field': ['get', 'PC_NAME'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
          'text-allow-overlap': false
        }}
        paint={{
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }}
      />
    </Source>
  );
};

export const SearchResultLayer = ({ geoJSON }) => {
  if (!geoJSON) return null;
  
  return (
    <Source id="city-data" type="geojson" data={geoJSON}>
      <Layer
        id="search-point"
        type="circle"
        paint={{
          'circle-radius': 8,
          'circle-color': '#00ff00',
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }}
      />
    </Source>
  );
};