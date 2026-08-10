import React from 'react';

const LocationIcon = ({ size = 18, className = '', style = {} }) => {
  // location.png aspect ratio is ~0.75
  const scaledWidth = Math.round(size * 0.75);

  return (
    <img
      src="/location.png"
      alt="Location"
      width={scaledWidth}
      height={size}
      className={className}
      style={{
        width: `${scaledWidth}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
    />
  );
};

export default LocationIcon;
