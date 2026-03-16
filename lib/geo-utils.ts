import { getCountryName } from './country-mappings';

// Safely decode URL-encoded header values
function safeDecodeURIComponent(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Geo data type
export type GeoData = {
  country: string | null;
  country_name: string | null;
  city: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
};

// Extract geo data from Vercel request headers
export function getGeoData(headers: Headers): GeoData {
  const country = headers.get('x-vercel-ip-country');
  const rawCity = headers.get('x-vercel-ip-city');
  const rawRegion = headers.get('x-vercel-ip-country-region');
  const rawLat = headers.get('x-vercel-ip-latitude');
  const rawLng = headers.get('x-vercel-ip-longitude');
  const rawTimezone = headers.get('x-vercel-ip-timezone');

  return {
    country: country || null,
    country_name: getCountryName(country),
    city: safeDecodeURIComponent(rawCity),
    region: safeDecodeURIComponent(rawRegion),
    latitude: rawLat ? parseFloat(rawLat) : null,
    longitude: rawLng ? parseFloat(rawLng) : null,
    timezone: safeDecodeURIComponent(rawTimezone),
  };
}
