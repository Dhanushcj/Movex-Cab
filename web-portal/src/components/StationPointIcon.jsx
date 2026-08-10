import React from 'react';

const StationPointIcon = ({ size = 20, className = '', style = {} }) => {
  return (
    <img
      src="/point.png"
      alt="Station Point"
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style
      }}
    />
  );
};

export default StationPointIcon;
