import React from 'react';

const RouteIcon = ({ size = 26, className = '', style = {} }) => {
  // route.png aspect ratio is ~2.52 : 1
  const scaledWidth = Math.round(size * 2.52);

  return (
    <img
      src="/route.png"
      alt="Route Swap"
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

export default RouteIcon;
