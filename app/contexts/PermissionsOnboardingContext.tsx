import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

interface PermissionsOnboardingContextType {
  cameraPermissionGranted: boolean;
  locationPermissionGranted: boolean;
  requestCameraPermission: () => Promise<boolean>;
  requestLocationPermission: () => Promise<boolean>;
  checkCameraPermission: () => Promise<boolean>;
  checkLocationPermission: () => Promise<boolean>;
}

const PermissionsOnboardingContext = createContext<PermissionsOnboardingContextType | undefined>(undefined);

interface PermissionsOnboardingProviderProps {
  children: ReactNode;
}

export function PermissionsOnboardingProvider({ children }: PermissionsOnboardingProviderProps) {
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Camera.getCameraPermissionsAsync();
      const granted = status === 'granted';
      setCameraPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      return false;
    }
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';
      setCameraPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  return (
    <PermissionsOnboardingContext.Provider
      value={{
        cameraPermissionGranted,
        locationPermissionGranted,
        requestCameraPermission,
        requestLocationPermission,
        checkCameraPermission,
        checkLocationPermission,
      }}
    >
      {children}
    </PermissionsOnboardingContext.Provider>
  );
}

export function usePermissionsOnboarding() {
  const context = useContext(PermissionsOnboardingContext);
  if (context === undefined) {
    throw new Error('usePermissionsOnboarding must be used within a PermissionsOnboardingProvider');
  }
  return context;
}