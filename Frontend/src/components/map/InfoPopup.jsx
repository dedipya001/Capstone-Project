import React from 'react';
import { Popup } from 'react-map-gl';
import '../../styles/mapStyles.css';

// Popup for selected locations
export const FeaturePopup = ({ popupInfo, onClose }) => {
  if (!popupInfo) return null;

  return (
    <Popup
      longitude={popupInfo.longitude}
      latitude={popupInfo.latitude}
      closeButton={true}
      closeOnClick={false}
      onClose={onClose}
      anchor="bottom"
      maxWidth="300px"
    >
      <div style={{ padding: '5px' }}>
        {popupInfo.pcName ? (
          <>
            <h4 style={{ margin: '0 0 5px' }}>
              {popupInfo.pcName}
            </h4>
            <p style={{ margin: '0 0 3px' }}>
              <strong>State:</strong> {popupInfo.stateName}
            </p>
            {popupInfo.pcNo && (
              <p style={{ margin: '0' }}>
                <strong>PC Number:</strong> {popupInfo.pcNo}
              </p>
            )}
          </>
        ) : popupInfo.locationName ? (
          <>
            <h4 style={{ margin: '0 0 5px' }}>
              {popupInfo.locationName}
            </h4>
            {popupInfo.stateName && (
              <p style={{ margin: '0 0 3px' }}>
                <strong>State:</strong> {popupInfo.stateName}
              </p>
            )}
            {popupInfo.address && (
              <p style={{ margin: '0', fontSize: '12px' }}>
                {popupInfo.address}
              </p>
            )}
          </>
        ) : (
          <p style={{ margin: '0' }}>
            Location Information
          </p>
        )}
      </div>
    </Popup>
  );
};

// Hover popup
export const HoverPopup = ({ feature, centroidFn }) => {
  if (!feature || !feature.properties || feature.layer.id === 'search-point') return null;
  
  const centroid = centroidFn(feature);
  if (!centroid) return null;
  
  return (
    <Popup
      longitude={centroid[0]}
      latitude={centroid[1]}
      closeButton={false}
      closeOnClick={false}
      anchor="bottom"
    >
      <div>
        {feature.properties.PC_NAME && (
          <p><strong>PC:</strong> {feature.properties.PC_NAME}</p>
        )}
        {feature.properties.STATE_NAME && (
          <p><strong>State:</strong> {feature.properties.STATE_NAME}</p>
        )}
        {feature.properties.PC_No && (
          <p><strong>PC Number:</strong> {feature.properties.PC_No}</p>
        )}
      </div>
    </Popup>
  );
};