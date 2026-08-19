import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, LocateFixed, Check, Bell, Users, ArrowUpDown, Info, User, Search, MapPin, ChevronRight, Ticket, Navigation, CheckCircle2 } from 'lucide-react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BikeIcon from '../components/BikeIcon';
import AutoRickshawIcon from '../components/AutoRickshawIcon';
import CarIcon from '../components/CarIcon';
import BusIcon from '../components/BusIcon';
import styles from './CustomerBooking.module.css';
import API from '../services/api';
import { useSocket } from '../context/SocketContext';

const defaultCenter = { lat: 13.0827, lng: 80.2707 }; // Chennai
const routeColors = ['#0053B3', '#D49F0C', '#10B981', '#EF4444', '#8B5CF6'];

function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      const lat = typeof center.lat === 'number' ? center.lat : Array.isArray(center) ? center[0] : null;
      const lng = typeof center.lng === 'number' ? center.lng : Array.isArray(center) ? center[1] : null;
      if (lat && lng) {
        map.flyTo([lat, lng], zoom || 14, { animate: true, duration: 1.2 });
      }
    }
  }, [center, zoom, map]);
  return null;
}

const userLocationIcon = L.divIcon({
  className: 'user-live-location-marker',
  html: `<div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(37, 99, 235, 0.4); animation: pulse-ring 2s infinite ease-out;"></div>
    <div style="width: 14px; height: 14px; border-radius: 50%; background: #2563EB; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 2;"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isPointNearRoute(lat, lng, route, maxDistanceKm = 6.0) {
  if (!route) return true;
  const polyline = route.decodedPolyline || [];
  const junctions = (route.junctions || []).map(j => ({
    lat: j.location.coordinates[1],
    lng: j.location.coordinates[0]
  }));
  const points = polyline.length > 0 ? polyline : junctions;
  if (points.length === 0) return true;

  let minDistance = Infinity;
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const dist = getHaversineDistanceKm(lat, lng, pt.lat, pt.lng);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance <= maxDistanceKm;
}

const decodePolyline = (t) => {
  let n, o, a = 0, r = 0, s = 0, l = 0, i = [];
  for (; a < t.length;) {
    n = 0, o = 0;
    do {
      o |= (31 & (n = t.charCodeAt(a++) - 63)) << l;
      l += 5;
    } while (n >= 32);
    const d = 1 & o ? ~(o >> 1) : o >> 1;
    r += d;
    l = 0, n = 0, o = 0;
    do {
      o |= (31 & (n = t.charCodeAt(a++) - 63)) << l;
      l += 5;
    } while (n >= 32);
    const u = 1 & o ? ~(o >> 1) : o >> 1;
    s += u;
    l = 0;
    i.push({ lat: r / 1e5, lng: s / 1e5 });
  }
  return i;
};

// Custom snapping logic to map the click to the closest polyline coordinate
const getClosestPointOnLine = (pt, line) => {
  if (!line || line.length < 2) return pt;
  let minDistance = Infinity;
  let closestPoint = null;
  
  for (let i = 0; i < line.length - 1; i++) {
    const p1 = line[i];
    const p2 = line[i+1];
    
    const l2 = Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2);
    if (l2 === 0) continue;
    
    let t = ((pt.lat - p1.lat) * (p2.lat - p1.lat) + (pt.lng - p1.lng) * (p2.lng - p1.lng)) / l2;
    t = Math.max(0, Math.min(1, t));
    
    const proj = {
      lat: p1.lat + t * (p2.lat - p1.lat),
      lng: p1.lng + t * (p2.lng - p1.lng)
    };
    
    const dist = Math.sqrt(Math.pow(pt.lat - proj.lat, 2) + Math.pow(pt.lng - proj.lng, 2));
    if (dist < minDistance) {
      minDistance = dist;
      closestPoint = proj;
    }
  }
  return closestPoint || pt;
};

const CustomerBooking = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState('mini');
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null); // null, 'searching', 'booked'
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  const [pickupQuery, setPickupQuery] = useState('');
  const [dropQuery, setDropQuery] = useState('');
  const [pickupSearchResults, setPickupSearchResults] = useState([]);
  const [dropSearchResults, setDropSearchResults] = useState([]);
  const [isPickupFocused, setIsPickupFocused] = useState(false);
  const [isDropFocused, setIsDropFocused] = useState(false);

  const mapRef = useRef(null);

  const vehicles = [
    { id: 'bike', name: 'Forge Bike', capacity: 1, time: '2 min', baseFare: 45, icon: BikeIcon, type: 'bike' },
    { id: 'auto', name: 'Forge Auto', capacity: 3, time: '3 min', baseFare: 65, icon: AutoRickshawIcon, type: 'auto' },
    { id: 'mini', name: 'Forge Mini', capacity: 3, time: '4 min', baseFare: 120, icon: CarIcon, type: 'car' },
    { id: 'bus', name: 'Forge Bus', capacity: 40, time: '6 min', baseFare: 180, icon: BusIcon, type: 'bus' },
  ];

  const resolveJunctionRealName = async (j) => {
    if (j.displayName) return j.displayName;
    if (!j.location || !j.location.coordinates) return j.name;
    const lng = j.location.coordinates[0];
    const lat = j.location.coordinates[1];
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        const mainPart = data.address.road || data.address.suburb || data.address.neighbourhood || data.address.amenity || data.address.bus_stop || data.address.town || data.display_name.split(',')[0];
        const subPart = data.address.city || data.address.town || data.address.county || data.address.state_district || '';
        const realName = subPart && !mainPart.includes(subPart) ? `${mainPart}, ${subPart}` : mainPart;
        return realName;
      }
      if (data && data.display_name) {
        return data.display_name.split(',')[0];
      }
    } catch (e) {
      console.warn("Failed to reverse geocode junction", e);
    }
    return j.name;
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.get('/route-manager/routes');
        if (res.data.success) {
          const processedRoutes = await Promise.all(res.data.data.map(async (r, idx) => {
            const enrichedJunctions = await Promise.all((r.junctions || []).map(async (j) => {
              const realName = await resolveJunctionRealName(j);
              return {
                ...j,
                name: realName || j.name,
                displayName: realName || j.name
              };
            }));

            return {
              ...r,
              junctions: enrichedJunctions,
              displayColor: routeColors[idx % routeColors.length],
              decodedPolyline: r.polyline ? decodePolyline(r.polyline) : []
            };
          }));
          setRoutes(processedRoutes);
        }
      } catch (err) {
        console.error('Failed to fetch routes', err);
      }
    };
    fetchRoutes();
  }, []);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [activePass, setActivePass] = useState(null);

  // Pass Verification Effect
  useEffect(() => {
    const fetchMyPass = async () => {
      try {
        const res = await API.get('/subscriptions/my-pass');
        if (!res.data.success || !res.data.data) {
          alert("You must have an active pass to book a ride.");
          navigate('/customer/passes');
        } else {
          setActivePass(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch pass', err);
        alert("You must have an active pass to book a ride.");
        navigate('/customer/passes');
      }
    };
    fetchMyPass();
  }, [navigate]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentPosition({ lat, lng });
          setMapCenter({ lat, lng });

          // Snap to closest junction on the selected route or available routes
          const routesToSearch = selectedRoute ? [selectedRoute] : routes;
          let minDistance = Infinity;
          let closestJunction = null;
          let matchingRoute = null;

          routesToSearch.forEach(r => {
            (r.junctions || []).forEach(j => {
              const jLat = j.location.coordinates[1];
              const jLng = j.location.coordinates[0];
              const dist = getHaversineDistanceKm(lat, lng, jLat, jLng);
              if (dist < minDistance) {
                minDistance = dist;
                closestJunction = j;
                matchingRoute = r;
              }
            });
          });

          if (closestJunction) {
            if (matchingRoute && !selectedRoute) {
              setSelectedRoute(matchingRoute);
            }
            setPickupLocation(closestJunction);
            setPickupQuery(closestJunction.name);
          }
        },
        (error) => {
          console.warn("Unable to fetch location", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation not available or denied:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchDrivers = async () => {
      const pos = currentPosition || mapCenter;
      const lat = pos ? (typeof pos.lat === 'number' ? pos.lat : Array.isArray(pos) ? pos[0] : 13.0827) : 13.0827;
      const lng = pos ? (typeof pos.lng === 'number' ? pos.lng : Array.isArray(pos) ? pos[1] : 80.2707) : 80.2707;
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;
      try {
        const res = await API.get(`/drivers/nearby?lat=${lat}&lng=${lng}&radius=10`);
        if (res.data.success) {
          setActiveDrivers(res.data.drivers || []);
        }
      } catch (err) {
        console.error('Failed to fetch nearby drivers', err);
      }
    };
    
    fetchDrivers();
    const intervalId = setInterval(fetchDrivers, 10000);
    return () => clearInterval(intervalId);
  }, [currentPosition, mapCenter]);

  // Synchronize input fields when locations are set from map or current location
  useEffect(() => {
    if (pickupLocation?.name) {
      setPickupQuery(pickupLocation.name.split(',')[0]);
    } else {
      setPickupQuery('');
    }
  }, [pickupLocation]);

  useEffect(() => {
    if (dropLocation?.name) {
      setDropQuery(dropLocation.name.split(',')[0]);
    } else {
      setDropQuery('');
    }
  }, [dropLocation]);

  // Search logic for Pickup Input (Searches all locations along the selected route)
  useEffect(() => {
    if (!pickupQuery || pickupQuery.trim().length < 1) {
      const routesToSearch = selectedRoute ? [selectedRoute] : routes;
      const defaultMatches = [];
      routesToSearch.forEach(r => {
        (r.junctions || []).forEach(j => {
          if (!defaultMatches.some(m => m.name === j.name)) {
            defaultMatches.push({
              _id: j._id || `j-${j.name}`,
              name: j.displayName || j.name,
              subtext: r.name || 'Route Stop',
              location: j.location,
              route: r
            });
          }
        });
      });
      setPickupSearchResults(defaultMatches);
      return;
    }

    const timer = setTimeout(async () => {
      const routesToSearch = selectedRoute ? [selectedRoute] : routes;
      const localMatches = [];

      routesToSearch.forEach(r => {
        (r.junctions || []).forEach(j => {
          const nameToUse = j.displayName || j.name;
          if (nameToUse.toLowerCase().includes(pickupQuery.toLowerCase().trim()) && !localMatches.some(m => m.name === nameToUse)) {
            localMatches.push({
              _id: j._id || `j-${nameToUse}`,
              name: nameToUse,
              subtext: r.name || 'Route Stop',
              location: j.location,
              route: r
            });
          }
        });
      });

      try {
        const targetRoute = selectedRoute || routes[0];
        let searchParam = pickupQuery;
        if (targetRoute && targetRoute.junctions && targetRoute.junctions.length > 0) {
          const firstJ = targetRoute.junctions[0];
          const areaName = firstJ.displayName || firstJ.name;
          searchParam = `${pickupQuery} ${areaName.split(',').pop() || ''}`;
        }

        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchParam)}&countrycodes=in&limit=10`);
        const data = await res.json();
        
        const filteredOsmMatches = (data || [])
          .map(item => {
            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);
            const matchingR = routesToSearch.find(r => isPointNearRoute(itemLat, itemLng, r, 6.0));
            if (!matchingR) return null;
            
            return {
              _id: `osm-${item.place_id}`,
              name: item.display_name.split(',')[0],
              subtext: `${item.display_name.split(',').slice(1, 3).join(',')} (${matchingR.name || 'On Route'})`,
              location: { coordinates: [itemLng, itemLat] },
              route: matchingR
            };
          })
          .filter(Boolean);

        const combined = [...localMatches];
        filteredOsmMatches.forEach(osmItem => {
          if (!combined.some(c => c.name.toLowerCase() === osmItem.name.toLowerCase())) {
            combined.push(osmItem);
          }
        });

        setPickupSearchResults(combined);
      } catch (e) {
        setPickupSearchResults(localMatches);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupQuery, routes, selectedRoute]);

  // Search logic for Drop Input (Searches all locations along the selected route)
  useEffect(() => {
    if (!dropQuery || dropQuery.trim().length < 1) {
      const routesToSearch = selectedRoute ? [selectedRoute] : routes;
      const defaultMatches = [];
      routesToSearch.forEach(r => {
        (r.junctions || []).forEach(j => {
          if (!defaultMatches.some(m => m.name === j.name)) {
            defaultMatches.push({
              _id: j._id || `j-${j.name}`,
              name: j.displayName || j.name,
              subtext: r.name || 'Route Stop',
              location: j.location,
              route: r
            });
          }
        });
      });
      setDropSearchResults(defaultMatches);
      return;
    }

    const timer = setTimeout(async () => {
      const routesToSearch = selectedRoute ? [selectedRoute] : routes;
      const localMatches = [];

      routesToSearch.forEach(r => {
        (r.junctions || []).forEach(j => {
          const nameToUse = j.displayName || j.name;
          if (nameToUse.toLowerCase().includes(dropQuery.toLowerCase().trim()) && !localMatches.some(m => m.name === nameToUse)) {
            localMatches.push({
              _id: j._id || `j-${nameToUse}`,
              name: nameToUse,
              subtext: r.name || 'Route Stop',
              location: j.location,
              route: r
            });
          }
        });
      });

      try {
        const targetRoute = selectedRoute || routes[0];
        let searchParam = dropQuery;
        if (targetRoute && targetRoute.junctions && targetRoute.junctions.length > 0) {
          const firstJ = targetRoute.junctions[0];
          const areaName = firstJ.displayName || firstJ.name;
          searchParam = `${dropQuery} ${areaName.split(',').pop() || ''}`;
        }

        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchParam)}&countrycodes=in&limit=10`);
        const data = await res.json();
        
        const filteredOsmMatches = (data || [])
          .map(item => {
            const itemLat = parseFloat(item.lat);
            const itemLng = parseFloat(item.lon);
            const matchingR = routesToSearch.find(r => isPointNearRoute(itemLat, itemLng, r, 6.0));
            if (!matchingR) return null;
            
            return {
              _id: `osm-${item.place_id}`,
              name: item.display_name.split(',')[0],
              subtext: `${item.display_name.split(',').slice(1, 3).join(',')} (${matchingR.name || 'On Route'})`,
              location: { coordinates: [itemLng, itemLat] },
              route: matchingR
            };
          })
          .filter(Boolean);

        const combined = [...localMatches];
        filteredOsmMatches.forEach(osmItem => {
          if (!combined.some(c => c.name.toLowerCase() === osmItem.name.toLowerCase())) {
            combined.push(osmItem);
          }
        });

        setDropSearchResults(combined);
      } catch (e) {
        setDropSearchResults(localMatches);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [dropQuery, routes, selectedRoute]);

  const handleSelectPickupSearchResult = (item) => {
    if (item.route && (!selectedRoute || selectedRoute._id !== item.route._id)) {
      setSelectedRoute(item.route);
    }
    setPickupLocation({
      _id: item._id,
      name: item.name,
      location: item.location
    });
    setPickupQuery(item.name);
    setMapCenter({
      lat: item.location.coordinates[1],
      lng: item.location.coordinates[0]
    });
    setIsPickupFocused(false);
  };

  const handleSelectDropSearchResult = (item) => {
    if (item.route && (!selectedRoute || selectedRoute._id !== item.route._id)) {
      setSelectedRoute(item.route);
    }
    setDropLocation({
      _id: item._id,
      name: item.name,
      location: item.location
    });
    setDropQuery(item.name);
    setMapCenter({
      lat: item.location.coordinates[1],
      lng: item.location.coordinates[0]
    });
    setIsDropFocused(false);
  };

  const snapToRoute = (dragLat, dragLng) => {
    const routesToSearch = selectedRoute ? [selectedRoute] : routes;
    let minDistance = Infinity;
    let nearestPoint = { lat: dragLat, lng: dragLng };
    let matchingRoute = null;

    routesToSearch.forEach(r => {
      const points = r.decodedPolyline && r.decodedPolyline.length > 0
        ? r.decodedPolyline
        : (r.junctions || []).map(j => ({ lat: j.location.coordinates[1], lng: j.location.coordinates[0] }));

      points.forEach(pt => {
        const dist = getHaversineDistanceKm(dragLat, dragLng, pt.lat, pt.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestPoint = pt;
          matchingRoute = r;
        }
      });
    });

    return { nearestPoint, matchingRoute };
  };

  const handlePickupMarkerDragEnd = async (e) => {
    const target = e.target;
    if (!target) return;
    const latLng = target.getLatLng();
    const { nearestPoint, matchingRoute } = snapToRoute(latLng.lat, latLng.lng);

    if (matchingRoute && (!selectedRoute || selectedRoute._id !== matchingRoute._id)) {
      setSelectedRoute(matchingRoute);
    }

    const realName = await reverseGeocode(nearestPoint.lat, nearestPoint.lng);
    const newLocation = {
      _id: `drag-pickup-${Date.now()}`,
      name: realName || 'Pickup Location',
      location: { coordinates: [nearestPoint.lng, nearestPoint.lat] }
    };

    setPickupLocation(newLocation);
    setPickupQuery(newLocation.name);
  };

  const handleDropMarkerDragEnd = async (e) => {
    const target = e.target;
    if (!target) return;
    const latLng = target.getLatLng();
    const { nearestPoint, matchingRoute } = snapToRoute(latLng.lat, latLng.lng);

    if (matchingRoute && (!selectedRoute || selectedRoute._id !== matchingRoute._id)) {
      setSelectedRoute(matchingRoute);
    }

    const realName = await reverseGeocode(nearestPoint.lat, nearestPoint.lng);
    const newLocation = {
      _id: `drag-drop-${Date.now()}`,
      name: realName || 'Drop Location',
      location: { coordinates: [nearestPoint.lng, nearestPoint.lat] }
    };

    setDropLocation(newLocation);
    setDropQuery(newLocation.name);
  };

  const handleSwapLocations = () => {
    const tempLoc = pickupLocation;
    const tempQ = pickupQuery;
    setPickupLocation(dropLocation);
    setPickupQuery(dropQuery);
    setDropLocation(tempLoc);
    setDropQuery(tempQ);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    setPickupLocation(null);
    setDropLocation(null);
    
    if (mapRef.current && route.decodedPolyline && route.decodedPolyline.length > 0 && window.google?.maps) {
      try {
        const bounds = new window.google.maps.LatLngBounds();
        route.decodedPolyline.forEach(coord => {
          bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      } catch (e) {}
    }
  };

  const reverseGeocode = async (lat, lng) => {
    if (window.google?.maps) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        if (response.results[0]) {
          return response.results[0].formatted_address.split(',')[0];
        }
      } catch (e) {
        console.warn("Google Geocoder failed, trying fallback: " + e);
      }
    }
    
    // Fallback to OSM Nominatim
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.address) {
        return data.address.road || data.address.suburb || data.address.neighbourhood || data.display_name.split(',')[0];
      }
    } catch (e) {
      console.error("OSM Geocoder failed: " + e);
    }
    
    return "Selected Location";
  };

  const handleJunctionClick = (junction) => {
    if (!pickupLocation) {
      setPickupLocation(junction);
    } else if (!dropLocation && junction._id !== pickupLocation._id) {
      setDropLocation(junction);
    }
  };

  const handlePolylineClick = async (e, route) => {
    // If not the selected route, just select it
    if (!selectedRoute || selectedRoute._id !== route._id) {
      handleRouteSelect(route);
      return;
    }

    // Both points already selected, do nothing
    if (pickupLocation && dropLocation) return;

    const clickCoord = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const lineCoords = route.decodedPolyline;
    const snappedCoord = getClosestPointOnLine(clickCoord, lineCoords);
    
    const locationName = await reverseGeocode(snappedCoord.lat, snappedCoord.lng);

    const customJunction = {
      _id: `temp-${Date.now()}`,
      name: locationName,
      location: { coordinates: [snappedCoord.lng, snappedCoord.lat] }
    };

    if (!pickupLocation) {
      setPickupLocation(customJunction);
    } else {
      setDropLocation(customJunction);
    }
  };

  const handleMarkerDrag = async (e, isPickup) => {
    if (!selectedRoute) return;
    const clickCoord = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    const lineCoords = selectedRoute.decodedPolyline;
    const snappedCoord = getClosestPointOnLine(clickCoord, lineCoords);
    const locationName = await reverseGeocode(snappedCoord.lat, snappedCoord.lng);
    const customJunction = {
      _id: `temp-${Date.now()}`,
      name: locationName,
      location: { coordinates: [snappedCoord.lng, snappedCoord.lat] }
    };
    if (isPickup) {
      setPickupLocation(customJunction);
    } else {
      setDropLocation(customJunction);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoute || !pickupLocation || !dropLocation) return;
    
    setLoading(true);
    setBookingStatus('searching');
    
    try {
      const res = await API.post('/bookings', {
        routeId: selectedRoute._id,
        pickup: {
          address: pickupLocation.name,
          coordinates: pickupLocation.location.coordinates
        },
        drop: {
          address: dropLocation.name,
          coordinates: dropLocation.location.coordinates
        },
        vehicleType: selectedVehicle,
        paymentMethod: 'cash'
      });
      
      if (res.data.success) {
        if (socket) {
          socket.emit('ride:request', {
            bookingId: res.data.data._id,
            routeId: selectedRoute._id,
            vehicleType: selectedVehicle
          });
        }
        
        setTimeout(() => {
          setBookingStatus('booked');
          setLoading(false);
          setTimeout(() => navigate(`/customer/tracking/${res.data.data._id}`), 2000);
        }, 1500);
      }
    } catch (err) {
      console.error('Booking failed', err);
      alert(err.response?.data?.message || 'Failed to create booking. Please try again.');
      setBookingStatus(null);
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setPickupLocation(null);
    setDropLocation(null);
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      <div className={`${styles.stepItem} ${styles.active}`}>
        <div className={styles.stepCircle}>1</div>
        <span>Route</span>
      </div>
      <div className={`${styles.stepLine} ${pickupLocation && dropLocation ? styles.activeLine : ''}`}></div>
      <div className={`${styles.stepItem} ${pickupLocation && dropLocation ? styles.active : ''}`}>
        <div className={styles.stepCircle}>2</div>
        <span>Vehicle</span>
      </div>
      <div className={`${styles.stepLine} ${selectedVehicle && pickupLocation && dropLocation ? styles.activeLine : ''}`}></div>
      <div className={`${styles.stepItem} ${selectedVehicle && pickupLocation && dropLocation ? styles.active : ''}`}>
        <div className={styles.stepCircle}>3</div>
        <span>Confirm</span>
      </div>
    </div>
  );

  let distInfo = { dist: "0.0", time: 0 };
  if (pickupLocation && dropLocation) {
    try {
      const p1Lat = pickupLocation.location.coordinates[1];
      const p1Lng = pickupLocation.location.coordinates[0];
      const p2Lat = dropLocation.location.coordinates[1];
      const p2Lng = dropLocation.location.coordinates[0];
      const distKm = getHaversineDistanceKm(p1Lat, p1Lng, p2Lat, p2Lng);
      distInfo = {
        dist: distKm.toFixed(1),
        time: Math.round(distKm * 1.5) || 1
      };
    } catch(e) {}
  }

  if (!activePass) {
    return <div style={{padding: 40, textAlign: 'center', marginTop: 100, fontSize: 20}}>Checking pass status...</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      {/* GLOBAL TOP HEADER - Removed from here because the global layout already has it! */}
      {/* Wait, the global layout in the screenshot HAS the top header, but it lacks the secondary title "Book a Ride - Choose your route..." and the notification icon styles. */}
      {/* Looking at the screenshot, the global layout top nav ONLY has "Book a Ride" on the left, and "DC Dhanush Chakravarthy" on the right. */}
      {/* Our specific "Book a Ride - Choose your route" is inside the content area. */}
      {/* Let's wrap our main content in a container that pushes the new header to the top of our content area. */}

      <div className={styles.bookingSplitWrapper}>
        {/* LEFT SIDEBAR PANEL */}
        <div className={styles.sidebarPanel}>
          <div className={styles.topHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.title}>Book a Ride</h1>
              <p className={styles.subtitle}>Choose your route and ride type</p>
            </div>
            <div className={styles.headerRight}>
              <button className={styles.iconBtn}><Bell size={20} /></button>
              <button className={styles.iconBtn}><User size={20} /></button>
            </div>
          </div>
          {renderStepIndicator()}

          <div className={styles.sidebarContent}>
            
            <h3 className={styles.sectionTitleMain}>Where are you going?</h3>
            <div className={styles.bookingStateCard}>
              <div className={styles.locationsSummary}>
                
                <div className={styles.locInputWrapper}>
                  <div className={styles.locDotWrapper}>
                    <div className={styles.locDot}></div>
                    <div className={styles.locLine}></div>
                  </div>
                  <div className={styles.inputArea}>
                    <span className={styles.locLabel}>Pickup Location</span>
                    <div className={styles.inputField}>
                      <div className={styles.searchContainer}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          value={pickupQuery}
                          onChange={(e) => {
                            setPickupQuery(e.target.value);
                            if (!isPickupFocused) setIsPickupFocused(true);
                          }}
                          onFocus={() => setIsPickupFocused(true)}
                          onBlur={() => setTimeout(() => setIsPickupFocused(false), 200)}
                          placeholder="Type pickup location or search..."
                        />
                        {isPickupFocused && pickupSearchResults.length > 0 && (
                          <div className={styles.searchDropdown}>
                            {pickupSearchResults.map((item) => (
                              <div
                                key={item._id}
                                className={styles.dropdownItem}
                                onMouseDown={() => handleSelectPickupSearchResult(item)}
                              >
                                <MapPin size={16} className={styles.dropdownIcon} />
                                <div>
                                  <div className={styles.dropdownTitle}>{item.name}</div>
                                  <div className={styles.dropdownSub}>{item.subtext}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className={styles.useCurrentBtn} onClick={handleUseCurrentLocation}>
                        <LocateFixed size={14} /> Use current location
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.swapBtnWrapper}>
                  <button className={styles.swapBtn} onClick={handleSwapLocations} title="Swap pickup & drop location">
                    <ArrowUpDown size={14} color="#64748b" />
                  </button>
                </div>

                <div className={styles.locInputWrapper}>
                  <div className={styles.locDotWrapper}>
                    <div className={styles.locDotDrop}></div>
                  </div>
                  <div className={styles.inputArea}>
                    <span className={styles.locLabel}>Drop Location</span>
                    <div className={styles.inputField}>
                      <div className={styles.searchContainer}>
                        <input
                          type="text"
                          className={styles.searchInput}
                          value={dropQuery}
                          onChange={(e) => {
                            setDropQuery(e.target.value);
                            if (!isDropFocused) setIsDropFocused(true);
                          }}
                          onFocus={() => setIsDropFocused(true)}
                          onBlur={() => setTimeout(() => setIsDropFocused(false), 200)}
                          placeholder="Type drop location or search..."
                        />
                        {isDropFocused && dropSearchResults.length > 0 && (
                          <div className={styles.searchDropdown}>
                            {dropSearchResults.map((item) => (
                              <div
                                key={item._id}
                                className={styles.dropdownItem}
                                onMouseDown={() => handleSelectDropSearchResult(item)}
                              >
                                <MapPin size={16} className={styles.dropdownIcon} />
                                <div>
                                  <div className={styles.dropdownTitle}>{item.name}</div>
                                  <div className={styles.dropdownSub}>{item.subtext}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <Search size={18} color="#94a3b8" />
                    </div>
                  </div>
                </div>

              </div>
              
              {pickupLocation && dropLocation && (
                <div className={styles.routeDistanceInfo}>
                  <div className={styles.routePathText}>
                    <MapPin size={14} color="var(--forge-blue)" /> {pickupLocation.name.split(',')[0]} → {dropLocation.name.split(',')[0]}
                  </div>
                  <span className={styles.routeMeta}>Distance {distInfo.dist} km <span className={styles.bullet}>•</span> Est. time {distInfo.time} min</span>
                </div>
              )}
            </div>

            {pickupLocation && dropLocation && activePass && (
              <>
                <div className={styles.passCard}>
                  <div className={styles.passLeft}>
                    <div className={styles.passIcon}><Ticket size={24} color="var(--forge-blue)" /></div>
                    <div className={styles.passInfo}>
                      <h4>{activePass.pass?.name || 'Mobility Pass'} Applied</h4>
                      <p><span className={styles.strikeThru}>₹180.00</span> fare waived on this route</p>
                    </div>
                  </div>
                  <div className={styles.passRight}>
                    <div className={styles.passStatus}>ACTIVE</div>
                    <a href="/customer/passes" className={styles.viewPassLink}>View Pass →</a>
                  </div>
                </div>

                <div className={styles.vehicleSelection}>
                  <h3 className={styles.sectionTitleMain}>Choose a ride</h3>
                  <div className={styles.vehicleGrid}>
                    {vehicles.map(v => {
                      const Icon = v.icon;
                      const isSelected = selectedVehicle === v.id;
                      return (
                        <div 
                          key={v.id} 
                          className={`${styles.vehicleCard} ${isSelected ? styles.selected : ''}`}
                          onClick={() => setSelectedVehicle(v.id)}
                        >
                          {isSelected && <div className={styles.checkIcon}><Check size={12} /></div>}
                          <div className={styles.vehicleImage}>
                            <Icon size={32} color={isSelected ? "#1e293b" : "#64748b"} />
                          </div>
                          <div className={styles.vehicleInfo}>
                            <h4>{v.name}</h4>
                            <p className={styles.etaText}>{v.time} away</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.actionFooter}>
                  <button 
                    className={styles.btnPrimary}
                    onClick={handleConfirmBooking}
                    disabled={loading || bookingStatus}
                  >
                    {bookingStatus === 'searching' ? 'Finding Driver...' : bookingStatus === 'booked' ? 'Ride Booked!' : 'Continue to Confirm →'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Searching Overlay */}
          {bookingStatus === 'searching' && (
            <div className={styles.searchingOverlay}>
              <div className={styles.spinner}></div>
              <h3>Connecting to nearby drivers...</h3>
              <p>Please wait while we match your ride.</p>
            </div>
          )}
          
          {bookingStatus === 'booked' && (
            <div className={styles.searchingOverlay}>
              <CheckCircle2 size={48} color="#10B981" style={{marginBottom: 16}} />
              <h3>Ride Confirmed!</h3>
              <p>Redirecting to your ride details...</p>
            </div>
          )}
        </div>

        {/* RIGHT MAP PANEL */}
        <div className={styles.mapContainer}>
          {pickupLocation && dropLocation && (
            <>
              <div className={styles.mapTopOverlay}>
                <div className={styles.overlayRouteText}>
                  <strong>{pickupLocation.name.split(',')[0]}</strong> <span>→</span> <strong>{dropLocation.name.split(',')[0]}</strong>
                </div>
                <div className={styles.overlayRouteMeta}>
                   <div className={styles.metaIcon}><MapPin size={12}/></div> {distInfo.dist} km &nbsp;&nbsp; <div className={styles.metaIcon}>⏳</div> {distInfo.time} min
                </div>
              </div>
              <div className={styles.mapBottomOverlay}>
                <div className={styles.nearbyTitle}>3 vehicles nearby</div>
                <div className={styles.nearbyGrid}>
                  <div className={styles.nearbyItem}><span className={styles.nIcon}>🏍</span> 2 min</div>
                  <div className={styles.nearbyItem}><span className={styles.nIcon}>🛺</span> 3 min</div>
                  <div className={styles.nearbyItem}><span className={styles.nIcon}>🚗</span> 4 min</div>
                </div>
              </div>
            </>
          )}

          <MapContainer
            center={[mapCenter.lat || 13.0827, mapCenter.lng || 80.2707]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <MapFlyController center={mapCenter} zoom={13} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              subdomains="abcd"
              maxZoom={19}
            />
            {routes.filter(r => !selectedRoute || selectedRoute._id === r._id).map((route) => {
              const isSelected = selectedRoute?._id === route._id;
              if (!route.decodedPolyline || route.decodedPolyline.length === 0) return null;
              const positions = route.decodedPolyline.map(p => [p.lat, p.lng]);

              return (
                <Polyline
                  key={route._id}
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? '#FBBF24' : '#3B82F6',
                    opacity: isSelected ? 1.0 : 0.6,
                    weight: isSelected ? 6 : 4,
                  }}
                  eventHandlers={{
                    click: (e) => {
                      const clickCoord = { lat: e.latlng.lat, lng: e.latlng.lng };
                      handlePolylineClick({ latLng: { lat: () => clickCoord.lat, lng: () => clickCoord.lng } }, route);
                    }
                  }}
                />
              );
            })}

            {/* Custom Pickup Marker (Draggable) */}
            {pickupLocation && (
              <Marker
                position={[pickupLocation.location.coordinates[1], pickupLocation.location.coordinates[0]]}
                draggable={true}
                eventHandlers={{
                  dragend: handlePickupMarkerDragEnd
                }}
                icon={L.divIcon({
                  className: 'pickup-marker',
                  html: `<div style="width: 22px; height: 22px; border-radius: 50%; background: #10B981; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: grab;"></div>`,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11]
                })}
              />
            )}
            
            {/* Custom Drop Marker (Draggable) */}
            {dropLocation && (
              <Marker
                position={[dropLocation.location.coordinates[1], dropLocation.location.coordinates[0]]}
                draggable={true}
                eventHandlers={{
                  dragend: handleDropMarkerDragEnd
                }}
                icon={L.divIcon({
                  className: 'drop-marker',
                  html: `<div style="width: 22px; height: 22px; border-radius: 50%; background: #EF4444; border: 3px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.4); cursor: grab;"></div>`,
                  iconSize: [22, 22],
                  iconAnchor: [11, 11]
                })}
              />
            )}
            
            {/* Active Nearby Drivers Markers */}
            {activeDrivers.map((driver) => {
              const type = (driver.vehicle?.type || driver.vehicleType || '').toLowerCase();
              const emoji = type === 'bike' ? '🏍️' : type === 'auto' ? '🛺' : '🚗';
              return (
                <Marker
                  key={driver._id}
                  position={[driver.currentLocation.coordinates[1], driver.currentLocation.coordinates[0]]}
                  icon={L.divIcon({
                    className: 'driver-marker',
                    html: `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${emoji}</div>`,
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                  })}
                />
              );
            })}
            {/* User Live Location Marker */}
            {currentPosition && (
              <Marker
                position={[currentPosition.lat, currentPosition.lng]}
                icon={userLocationIcon}
                title="Your Current Location"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CustomerBooking;
