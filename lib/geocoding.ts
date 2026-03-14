// Simple geocoding utilities
// In production, you'd want to use a proper geocoding service

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiYW1lZW51IiwiYSI6ImNrOTFwcHdlYjAwOGczbmt5Mzk1eHBoNDYifQ.BwOWHvAtshdRUF--Y4kimQ";

export interface GeocodeResult {
  coordinates: [number, number];
  address: string;
  place_name: string;
}

// Reverse geocode: coordinates to address
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
  }

  // Fallback to coordinates if geocoding fails
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// Forward geocode: address to coordinates
export async function forwardGeocode(
  address: string
): Promise<GeocodeResult[]> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place&limit=5`
    );

    if (response.ok) {
      const data = await response.json();
      return data.features.map((feature: any) => ({
        coordinates: feature.center as [number, number],
        address: feature.place_name,
        place_name: feature.place_name,
      }));
    }
  } catch (error) {
    console.error("Forward geocoding error:", error);
  }

  return [];
}

// Get user's current location
export function getCurrentLocation(): Promise<{
  coordinates: [number, number];
  address: string;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { longitude, latitude } = position.coords;
        const address = await reverseGeocode(longitude, latitude);

        resolve({
          coordinates: [longitude, latitude],
          address,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}
