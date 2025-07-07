import {
  getZipCodeCoordinates,
  geocodeAddress,
  calculateDistance,
  calculateDistancesToCompanies,
  filterCompaniesByDeliveryRadius,
  normalizeZipCode,
  Coordinates
} from '../../src/services/locationService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Location Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variables for testing
    process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-key';
  });

  describe('normalizeZipCode', () => {
    it('should normalize 5-digit zip codes', () => {
      expect(normalizeZipCode('12345')).toBe('12345');
      expect(normalizeZipCode('01234')).toBe('01234');
    });

    it('should normalize 9-digit zip codes', () => {
      expect(normalizeZipCode('12345-6789')).toBe('12345');
      expect(normalizeZipCode('123456789')).toBe('12345');
    });

    it('should handle zip codes with spaces', () => {
      expect(normalizeZipCode('12345 6789')).toBe('12345');
      expect(normalizeZipCode(' 12345 ')).toBe('12345');
    });

    it('should return first 5 digits for invalid zip codes', () => {
      expect(normalizeZipCode('1234')).toBe('1234');
      expect(normalizeZipCode('abcde')).toBe('abcde');
      expect(normalizeZipCode('')).toBe('');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const coord1: Coordinates = { latitude: 40.7128, longitude: -74.0060 }; // New York
      const coord2: Coordinates = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles
      
      const distance = calculateDistance(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
      
      // Distance between NYC and LA is approximately 2445 miles
      expect(distance).toBeCloseTo(2446, 0);
    });

    it('should return 0 for identical coordinates', () => {
      const coord1: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      const coord2: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const distance = calculateDistance(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
      
      expect(distance).toBe(0);
    });

    it('should calculate distance for close coordinates', () => {
      const coord1: Coordinates = { latitude: 40.7128, longitude: -74.0060 }; // New York
      const coord2: Coordinates = { latitude: 40.7589, longitude: -73.9851 }; // Manhattan
      
      const distance = calculateDistance(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
      
      // Distance should be less than 10 miles
      expect(distance).toBeLessThan(10);
      expect(distance).toBeGreaterThan(0);
    });

    it('should handle edge cases with extreme coordinates', () => {
      const coord1: Coordinates = { latitude: 90, longitude: 0 }; // North Pole
      const coord2: Coordinates = { latitude: -90, longitude: 0 }; // South Pole
      
      const distance = calculateDistance(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
      
      // Distance should be approximately half the Earth's circumference
      expect(distance).toBeCloseTo(12438, 0);
    });
  });

  describe('getZipCodeCoordinates', () => {
    it('should return coordinates for valid zip code', async () => {
      // Mock the zip code API response
      const mockZipResponse = {
        data: {
          places: [
            {
              latitude: '40.7128',
              longitude: '-74.0060'
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValue(mockZipResponse);

      const coordinates = await getZipCodeCoordinates('10001');

      expect(coordinates).toEqual({
        latitude: 40.7128,
        longitude: -74.0060
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('http://api.zippopotam.us/us/10001');
    });

    it('should return null for invalid zip code', async () => {
      const mockResponse = {
        data: {
          results: [],
          status: 'ZERO_RESULTS'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const coordinates = await getZipCodeCoordinates('00000');

      expect(coordinates).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const coordinates = await getZipCodeCoordinates('10001');

      expect(coordinates).toBeNull();
    });

    it('should handle API rate limit errors', async () => {
      const mockResponse = {
        data: {
          results: [],
          status: 'OVER_QUERY_LIMIT'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const coordinates = await getZipCodeCoordinates('10001');

      expect(coordinates).toBeNull();
    });

    it('should handle missing API key', async () => {
      delete process.env.GOOGLE_MAPS_API_KEY;

      const coordinates = await getZipCodeCoordinates('10001');

      expect(coordinates).toBeNull();
    });
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for valid address', async () => {
      const mockResponse = {
        data: {
          results: [
            {
              geometry: {
                location: {
                  lat: 40.7128,
                  lng: -74.0060
                }
              }
            }
          ],
          status: 'OK'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const coordinates = await geocodeAddress('New York, NY');

      expect(coordinates).toEqual({
        latitude: 40.7128,
        longitude: -74.0060
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://maps.googleapis.com/maps/api/geocode/json?address=New%20York%2C%20NY&key=test-google-maps-key'
      );
    });

    it('should return null for invalid address', async () => {
      const mockResponse = {
        data: {
          results: [],
          status: 'ZERO_RESULTS'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const coordinates = await geocodeAddress('Invalid Address 12345');

      expect(coordinates).toBeNull();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      const coordinates = await geocodeAddress('New York, NY');

      expect(coordinates).toBeNull();
    });

    it('should handle empty address', async () => {
      const coordinates = await geocodeAddress('');

      expect(coordinates).toBeNull();
    });

    it('should handle API permission errors', async () => {
      const mockResponse = {
        data: {
          results: [],
          status: 'REQUEST_DENIED'
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const coordinates = await geocodeAddress('New York, NY');

      expect(coordinates).toBeNull();
    });
  });

  describe('calculateDistancesToCompanies', () => {
    it('should calculate distances to all companies', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 }; // NYC
      
      const companies = [
        {
          _id: '1',
          name: 'Close Company',
          address: {
            coordinates: { latitude: 40.7128, longitude: -74.0060 } // Same as customer
          },
          settings: { deliveryRadius: 25 }
        },
        {
          _id: '2',
          name: 'Far Company',
          address: {
            coordinates: { latitude: 34.0522, longitude: -118.2437 } // LA
          },
          settings: { deliveryRadius: 25 }
        }
      ];

      const results = calculateDistancesToCompanies(customerCoords, companies);

      expect(results).toHaveLength(2);
      expect(results[0].distance).toBe(0);
      expect(results[1].distance).toBeCloseTo(2446, 0);
      expect(results[0].company).toBeDefined();
      expect(results[0].withinDeliveryRadius).toBe(true);
      expect(results[1].withinDeliveryRadius).toBe(false);
    });

    it('should handle companies without location data', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const companies = [
        {
          _id: '1',
          name: 'Valid Company',
          address: {
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          },
          settings: { deliveryRadius: 25 }
        },
        {
          _id: '2',
          name: 'Invalid Company',
          address: {} // No coordinates
        }
      ];

      const results = calculateDistancesToCompanies(customerCoords, companies);

      expect(results).toHaveLength(1);
      expect(results[0].distance).toBe(0);
    });

    it('should sort results by distance', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const companies = [
        {
          _id: '1',
          name: 'Far Company',
          address: {
            coordinates: { latitude: 34.0522, longitude: -118.2437 } // LA
          },
          settings: { deliveryRadius: 25 }
        },
        {
          _id: '2',
          name: 'Close Company',
          address: {
            coordinates: { latitude: 40.7589, longitude: -73.9851 } // Manhattan
          },
          settings: { deliveryRadius: 25 }
        }
      ];

      const results = calculateDistancesToCompanies(customerCoords, companies);

      expect(results).toHaveLength(2);
      expect(results[0].distance).toBeLessThan(results[1].distance);
      expect(results[0].company.name).toBe('Close Company');
      expect(results[1].company.name).toBe('Far Company');
    });
  });

  describe('filterCompaniesByDeliveryRadius', () => {
    it('should filter companies within delivery radius', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const companies = [
        {
          _id: '1',
          name: 'Close Company',
          address: {
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          },
          settings: { deliveryRadius: 25 },
          toObject: () => ({ _id: '1', name: 'Close Company' })
        },
        {
          _id: '2',
          name: 'Far Company',
          address: {
            coordinates: { latitude: 34.0522, longitude: -118.2437 }
          },
          settings: { deliveryRadius: 25 },
          toObject: () => ({ _id: '2', name: 'Far Company' })
        }
      ];

      const results = filterCompaniesByDeliveryRadius(customerCoords, companies);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Close Company');
      expect(results[0].distance).toBe(0);
    });

    it('should use default delivery radius when not specified', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const companies = [
        {
          _id: '1',
          name: 'Close Company',
          address: {
            coordinates: { latitude: 40.7128, longitude: -74.0060 } // Same coordinates
          },
          settings: {}, // No delivery radius specified
          toObject: () => ({ _id: '1', name: 'Close Company' })
        }
      ];

      const results = filterCompaniesByDeliveryRadius(customerCoords, companies);

      expect(results).toHaveLength(1);
      expect(results[0].distance).toBe(0);
    });

    it('should handle companies with large delivery radius', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const companies = [
        {
          _id: '1',
          name: 'Wide Coverage Company',
          address: {
            coordinates: { latitude: 34.0522, longitude: -118.2437 }
          },
          settings: { deliveryRadius: 3000 }, // Very large radius
          toObject: () => ({ _id: '1', name: 'Wide Coverage Company' })
        }
      ];

      const results = filterCompaniesByDeliveryRadius(customerCoords, companies);

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Wide Coverage Company');
      expect(results[0].distance).toBeCloseTo(2446, 0);
    });

    it('should sort results by distance', () => {
      const customerCoords: Coordinates = { latitude: 40.7128, longitude: -74.0060 };
      
      const companies = [
        {
          _id: '1',
          name: 'Medium Distance Company',
          address: {
            coordinates: { latitude: 40.7589, longitude: -73.9851 }
          },
          settings: { deliveryRadius: 25 },
          toObject: () => ({ _id: '1', name: 'Medium Distance Company' })
        },
        {
          _id: '2',
          name: 'Close Company',
          address: {
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          },
          settings: { deliveryRadius: 25 },
          toObject: () => ({ _id: '2', name: 'Close Company' })
        }
      ];

      const results = filterCompaniesByDeliveryRadius(customerCoords, companies);

      expect(results).toHaveLength(2);
      expect(results[0].distance).toBeLessThan(results[1].distance);
      expect(results[0].name).toBe('Close Company');
      expect(results[1].name).toBe('Medium Distance Company');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid coordinate data', () => {
      const invalidCoords = { latitude: NaN, longitude: NaN };
      const validCoords = { latitude: 40.7128, longitude: -74.0060 };
      
      const distance = calculateDistance(invalidCoords.latitude, invalidCoords.longitude, validCoords.latitude, validCoords.longitude);
      
      expect(distance).toBeNaN();
    });

    it('should handle null/undefined coordinates', () => {
      const coord1 = { latitude: 40.7128, longitude: -74.0060 };
      const coord2 = { latitude: null as any, longitude: undefined as any };
      
      const distance = calculateDistance(coord1.latitude, coord1.longitude, coord2.latitude, coord2.longitude);
      
      expect(distance).toBeNaN();
    });

    it('should handle timeout errors in geocoding', async () => {
      mockedAxios.get.mockRejectedValue(new Error('ECONNABORTED'));

      const coordinates = await geocodeAddress('New York, NY');

      expect(coordinates).toBeNull();
    });
  });
});