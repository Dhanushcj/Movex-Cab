import React from 'react';

export const BikeIcon = ({ size = 24, className = '' }) => {
  const scaledWidth = Math.round(size * 1.3);
  return (
    <img
      src="/bike.png"
      alt="Bike"
      className={className}
      style={{
        width: `${scaledWidth}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    />
  );
};

export default BikeIcon;
