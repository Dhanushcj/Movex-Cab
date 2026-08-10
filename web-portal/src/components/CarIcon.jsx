import React from 'react';

export const CarIcon = ({ size = 26, className = '' }) => {
  const scaledWidth = Math.round(size * 1.35);
  return (
    <img
      src="/car.png"
      alt="Cab"
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

export default CarIcon;
