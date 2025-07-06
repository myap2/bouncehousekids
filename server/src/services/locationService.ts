import axios from 'axios';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: Coordinates;
}

export interface DistanceResult {
  distance: number; // in miles
  company: any;
  withinDeliveryRadius: boolean;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Geocode an address to get coordinates
 * Uses multiple fallback methods for reliability
 */
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    // Try with Google Maps API if available
    if (process.env.GOOGLE_MAPS_API_KEY) {
      return await geocodeWithGoogle(address);
    }
    
    // Fallback to OpenStreetMap Nominatim (free)
    return await geocodeWithNominatim(address);
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Geocode using Google Maps API
 */
async function geocodeWithGoogle(address: string): Promise<Coordinates | null> {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    
    if (response.data.results && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    
    return null;
  } catch (error) {
    console.error('Google geocoding failed:', error);
    return null;
  }
}

/**
 * Geocode using OpenStreetMap Nominatim (free alternative)
 */
async function geocodeWithNominatim(address: string): Promise<Coordinates | null> {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Nominatim geocoding failed:', error);
    return null;
  }
}

/**
 * Get coordinates for a zip code
 */
export async function getZipCodeCoordinates(zipCode: string): Promise<Coordinates | null> {
  try {
    // First try with a zip code API service
    if (process.env.ZIPPOPOTAM_API_ENABLED !== 'false') {
      const response = await axios.get(`http://api.zippopotam.us/us/${zipCode}`);
      if (response.data && response.data.places && response.data.places.length > 0) {
        const place = response.data.places[0];
        return {
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude)
        };
      }
    }
    
    // Fallback to geocoding the zip code
    return await geocodeAddress(zipCode);
  } catch (error) {
    console.error('Zip code geocoding failed:', error);
    return null;
  }
}

/**
 * Calculate distances from a customer location to companies
 */
export function calculateDistancesToCompanies(
  customerCoordinates: Coordinates,
  companies: any[]
): DistanceResult[] {
  return companies
    .filter(company => 
      company.address && 
      company.address.coordinates && 
      company.address.coordinates.latitude && 
      company.address.coordinates.longitude
    )
    .map(company => {
      const distance = calculateDistance(
        customerCoordinates.latitude,
        customerCoordinates.longitude,
        company.address.coordinates.latitude,
        company.address.coordinates.longitude
      );
      
      const withinDeliveryRadius = distance <= (company.settings?.deliveryRadius || 25);
      
      return {
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        company,
        withinDeliveryRadius
      };
    })
    .sort((a, b) => a.distance - b.distance); // Sort by distance
}

/**
 * Filter companies by delivery radius
 */
export function filterCompaniesByDeliveryRadius(
  customerCoordinates: Coordinates,
  companies: any[]
): any[] {
  const distanceResults = calculateDistancesToCompanies(customerCoordinates, companies);
  return distanceResults
    .filter(result => result.withinDeliveryRadius)
    .map(result => ({
      ...result.company.toObject(),
      distance: result.distance
    }));
}

/**
 * Create a full address string from address components
 */
export function formatAddress(address: any): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode
  ].filter(part => part && part.trim());
  
  return parts.join(', ');
}

/**
 * Normalize zip code (remove spaces, ensure 5 digits)
 */
export function normalizeZipCode(zipCode: string): string {
  return zipCode.replace(/\s/g, '').substring(0, 5);
}

/**
 * Get companies within a certain radius of a location
 */
export async function getCompaniesWithinRadius(
  centerCoordinates: Coordinates,
  radiusMiles: number,
  companies: any[]
): Promise<any[]> {
  const companiesWithDistance = calculateDistancesToCompanies(centerCoordinates, companies);
  
  return companiesWithDistance
    .filter(result => result.distance <= radiusMiles)
    .map(result => ({
      ...result.company.toObject(),
      distance: result.distance
    }));
}

/**
 * Update company coordinates if they don't exist
 */
export async function updateCompanyCoordinates(company: any): Promise<void> {
  try {
    if (!company.address.coordinates || 
        !company.address.coordinates.latitude || 
        !company.address.coordinates.longitude) {
      
      const fullAddress = formatAddress(company.address);
      const coordinates = await geocodeAddress(fullAddress);
      
      if (coordinates) {
        company.address.coordinates = coordinates;
        await company.save();
        console.log(`Updated coordinates for company: ${company.name}`);
      }
    }
  } catch (error) {
    console.error(`Failed to update coordinates for company ${company.name}:`, error);
  }
}

/**
 * Batch update coordinates for multiple companies
 */
export async function batchUpdateCompanyCoordinates(companies: any[]): Promise<void> {
  console.log(`Updating coordinates for ${companies.length} companies...`);
  
  for (const company of companies) {
    await updateCompanyCoordinates(company);
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Batch coordinate update completed');
}