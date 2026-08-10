import React from 'react';

export const BusIcon = ({ size = 24, className = '' }) => {
  const scaledWidth = Math.round(size * 1.3);
  return (
    <img
      src="/bus.png"
      alt="Bus"
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

export default BusIcon;
