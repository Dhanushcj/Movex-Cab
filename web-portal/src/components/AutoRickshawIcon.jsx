import React from 'react';

export const AutoRickshawIcon = ({ size = 24, className = '' }) => {
  const scaledWidth = Math.round(size * 1.25);
  return (
    <img
      src="/auto.png"
      alt="Auto Rickshaw"
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

export default AutoRickshawIcon;
