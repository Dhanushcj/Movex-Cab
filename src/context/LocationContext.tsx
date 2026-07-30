import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Location from 'expo-location';
import axios from 'axios';

interface LocationContextType {
  location: Location.LocationObject | null;
  locationAddress: string;
  errorMsg: string | null;
  loadingLocation: boolean;
  requestLocationPermission: () => Promise<boolean>;
  geocodeSearch: (query: string) => Promise<any[]>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('Locating...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoadingLocation(false);
        return false;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      setLocation(currentLocation);
      reverseGeocode(currentLocation.coords.latitude, currentLocation.coords.longitude);

      // Start watching for location updates
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      return true;
    } catch (error: any) {
      setErrorMsg(error.message || 'Failed to request location permission');
      setLoadingLocation(false);
      return false;
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Use ArcGIS reverse geocoding API
      const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=json&location=${longitude},${latitude}`;
      const response = await axios.get(url);
      if (response.data && response.data.address) {
        setLocationAddress(response.data.address.Match_addr || response.data.address.LongLabel);
      } else {
        setLocationAddress(`Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.warn('Reverse geocoding ArcGIS failed, using coordinates format:', error);
      setLocationAddress(`Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setLoadingLocation(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const geocodeSearch = async (query: string): Promise<any[]> => {
    try {
      let locationParam = '';
      if (location) {
        const { latitude, longitude } = location.coords;
        locationParam = `&location=${longitude},${latitude}&distance=50000`; // 50km radius
      }
      
      const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&SingleLine=${encodeURIComponent(query)}&maxLocations=10${locationParam}`;
      const response = await axios.get(url);
      
      if (response.data && response.data.candidates) {
        return response.data.candidates.map((item: any) => {
          let distanceStr = null;
          if (location) {
            const dist = calculateDistance(location.coords.latitude, location.coords.longitude, item.location.y, item.location.x);
            distanceStr = dist.toFixed(1) + ' km';
          }
          return {
            address: item.address,
            coordinates: [item.location.x, item.location.y], // [lng, lat]
            distance: distanceStr
          };
        });
      }
      return [];
    } catch (error) {
      console.error('ArcGIS Geocoding query failed:', error);
      return [];
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  return (
    <LocationContext.Provider value={{
      location,
      locationAddress,
      errorMsg,
      loadingLocation,
      requestLocationPermission,
      geocodeSearch
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};
