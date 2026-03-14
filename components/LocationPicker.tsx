"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Map, { Marker } from "react-map-gl";
import { MapPin, X, Check, Loader2, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  reverseGeocode,
  getCurrentLocation,
  forwardGeocode,
} from "@/lib/geocoding";
import { useToast, ToastContainer } from "@/components/ui/toast";

interface LocationPickerProps {
  onLocationSelect: (location: {
    coordinates: [number, number];
    address: string;
  }) => void;
  onClose: () => void;
  initialLocation?: { coordinates: [number, number]; address: string };
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export function LocationPicker({
  onLocationSelect,
  onClose,
  initialLocation,
}: LocationPickerProps) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: initialLocation?.coordinates[0] || -74.006,
    latitude: initialLocation?.coordinates[1] || 40.7128,
    zoom: 13,
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: [number, number];
    address: string;
  } | null>(initialLocation || null);

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [manualAddress, setManualAddress] = useState(
    initialLocation?.address || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!initialLocation);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const hasInitialized = useRef(false);

  const { toasts, removeToast, showError, showSuccess } = useToast();

  // Check location permission and get user's current location on component mount
  useEffect(() => {
    let isMounted = true;

    if (!initialLocation && !hasInitialized.current) {
      hasInitialized.current = true;
      const initializeLocation = async () => {
        try {
          // Check if geolocation is supported
          if (!navigator.geolocation) {
            if (isMounted) {
              showError(
                "Location not supported",
                "Your browser doesn't support location services"
              );
              setIsInitializing(false);
            }
            return;
          }

          // Check current permission state
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });

          if (!isMounted) return;

          if (permission.state === "denied") {
            showError(
              "Location access denied",
              "Please enable location access in your browser settings"
            );
            setIsInitializing(false);
            return;
          }

          if (permission.state === "prompt") {
            setShowPermissionPrompt(true);
            setIsInitializing(false);
            return;
          }

          // Permission is granted, get location
          setIsGeocoding(true);
          const location = await getCurrentLocation();

          if (!isMounted) return;

          // Update both view state and initialization state together
          setViewState((prev) => ({
            ...prev,
            longitude: location.coordinates[0],
            latitude: location.coordinates[1],
            zoom: 15,
          }));

          showSuccess(
            "Location found",
            "Map centered on your current location"
          );
        } catch (error) {
          console.error("Error getting initial location:", error);
          if (isMounted) {
            showError("Location unavailable", "Using default location instead");
          }
        } finally {
          // Batch state updates to prevent flickering
          if (isMounted) {
            setIsGeocoding(false);
            setIsInitializing(false);
          }
        }
      };

      initializeLocation();
    } else {
      setIsInitializing(false);
    }

    return () => {
      isMounted = false;
    };
  }, [initialLocation]); // Removed showError and showSuccess from dependencies

  const handleMapClick = useCallback(async (event: any) => {
    const { lng, lat } = event.lngLat;

    setIsGeocoding(true);

    try {
      const address = await reverseGeocode(lng, lat);

      const location = {
        coordinates: [lng, lat] as [number, number],
        address,
      };

      // Batch state updates to prevent flickering
      setSelectedLocation(location);
      setManualAddress(address);
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handleConfirm = () => {
    if (selectedLocation) {
      const finalLocation = {
        ...selectedLocation,
        address: manualAddress || selectedLocation.address,
      };
      onLocationSelect(finalLocation);
    }
  };

  const handleAddressChange = (address: string) => {
    setManualAddress(address);
    if (selectedLocation) {
      setSelectedLocation({
        ...selectedLocation,
        address,
      });
    }
  };

  // Get user's current location with permission handling
  const handleGetCurrentLocation = async () => {
    try {
      if (!navigator.geolocation) {
        showError(
          "Location not supported",
          "Your browser doesn't support location services"
        );
        return;
      }

      setIsGeocoding(true);
      const location = await getCurrentLocation();

      setViewState({
        longitude: location.coordinates[0],
        latitude: location.coordinates[1],
        zoom: 15,
      });

      setSelectedLocation(location);
      setManualAddress(location.address);
      showSuccess("Location updated", "Using your current location");
    } catch (error) {
      console.error("Error getting location:", error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showError(
              "Location access denied",
              "Please enable location access in your browser settings"
            );
            break;
          case error.POSITION_UNAVAILABLE:
            showError(
              "Location unavailable",
              "Unable to determine your location"
            );
            break;
          case error.TIMEOUT:
            showError(
              "Location timeout",
              "Location request timed out, please try again"
            );
            break;
          default:
            showError("Location error", "Unable to get your location");
        }
      } else {
        showError("Location error", "Unable to get your location");
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle permission request
  const handleRequestPermission = async () => {
    setShowPermissionPrompt(false);
    await handleGetCurrentLocation();
  };

  // Search for address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const results = await forwardGeocode(searchQuery);

      if (results.length > 0) {
        const result = results[0];

        setViewState({
          longitude: result.coordinates[0],
          latitude: result.coordinates[1],
          zoom: 15,
        });

        setSelectedLocation({
          coordinates: result.coordinates,
          address: result.address,
        });
        setManualAddress(result.address);
      }
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {/* Permission Prompt */}
        {showPermissionPrompt && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Location Permission</h3>
              </div>
              <p className="text-gray-600 mb-6">
                We'd like to center the map on your current location to make it
                easier to report nearby issues. You can always search for or
                click on any location manually.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPermissionPrompt(false)}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button onClick={handleRequestPermission} className="flex-1">
                  Allow Location
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg border border-border w-full max-w-4xl h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Select Location</h2>
                <p className="text-sm text-muted-foreground">
                  Click on the map or search for an address
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for an address..."
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                size="sm"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 relative">
            <Map
              {...viewState}
              onMove={(evt) => setViewState(evt.viewState)}
              mapboxAccessToken="pk.eyJ1IjoiYW1lZW51IiwiYSI6ImNrOTFwcHdlYjAwOGczbmt5Mzk1eHBoNDYifQ.BwOWHvAtshdRUF--Y4kimQ"
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              onClick={handleMapClick}
              cursor="crosshair"
            >
              {selectedLocation && (
                <Marker
                  longitude={selectedLocation.coordinates[0]}
                  latitude={selectedLocation.coordinates[1]}
                  anchor="bottom"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-red-500 border-3 border-white rounded-full shadow-xl flex items-center justify-center animate-pulse">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </Marker>
              )}
            </Map>

            {/* Loading overlay */}
            {(isGeocoding || isInitializing) && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <div className="bg-card rounded-lg p-4 shadow-lg border border-border flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    {isInitializing
                      ? "Finding your location..."
                      : "Getting address..."}
                  </span>
                </div>
              </div>
            )}

            {/* Current location button */}
            <Button
              onClick={handleGetCurrentLocation}
              className="absolute top-4 right-4 shadow-lg"
              size="sm"
              disabled={isGeocoding}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Use My Location
            </Button>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border space-y-4">
            {selectedLocation && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Address</label>
                <Input
                  value={manualAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="Enter or edit the address"
                />
                <p className="text-xs text-muted-foreground">
                  Coordinates: {selectedLocation.coordinates[1].toFixed(6)},{" "}
                  {selectedLocation.coordinates[0].toFixed(6)}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedLocation}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Location
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
