import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface LocationData {
  address: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
  landmark: string;
  latitude?: number;
  longitude?: number;
}

interface EnhancedLocationInputProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

// Pre-defined location suggestions based on city/state combinations
const LOCATION_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  'Mumbai': {
    'Maharashtra': [
      'Andheri West', 'Andheri East', 'Bandra West', 'Bandra East',
      'Juhu', 'Versova', 'Lokhandwala', 'Goregaon West', 'Goregaon East',
      'Malad West', 'Malad East', 'Kandivali West', 'Kandivali East',
      'Borivali West', 'Borivali East', 'Dahisar West', 'Dahisar East'
    ]
  },
  'Delhi': {
    'Delhi': [
      'Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'South Extension',
      'Greater Kailash', 'Hauz Khas', 'Saket', 'Malviya Nagar',
      'Rajouri Garden', 'Punjabi Bagh', 'Paschim Vihar', 'Janakpuri'
    ]
  },
  'Bangalore': {
    'Karnataka': [
      'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City',
      'Marathahalli', 'Indiranagar', 'Rajajinagar', 'Jayanagar',
      'JP Nagar', 'BTM Layout', 'Bannerghatta Road', 'Sarjapur Road'
    ]
  },
  'Pune': {
    'Maharashtra': [
      'Koregaon Park', 'Aundh', 'Viman Nagar', 'Wakad', 'Hinjewadi',
      'Kothrud', 'Hadapsar', 'Magarpatta', 'Baner', 'Pimple Saudagar'
    ]
  }
};

// Common landmarks and areas
const COMMON_LANDMARKS = [
  'Near Metro Station', 'Opposite Mall', 'Near Hospital', 'Beside Park',
  'Near School', 'Opposite Bank', 'Near Temple', 'Beside Market',
  'Near Bus Stop', 'Opposite Restaurant', 'Near Police Station'
];

// PIN code patterns for validation
const PINCODE_PATTERNS = {
  'Maharashtra': /^[4][0-9]{5}$/,
  'Delhi': /^[1][1][0-9]{4}$/,
  'Karnataka': /^[5][6][0-9]{4}$/,
  'Tamil Nadu': /^[6][0-9]{5}$/,
  'Gujarat': /^[3][8][0-9]{4}$/,
  'Rajasthan': /^[3][0-9]{5}$/,
  'Uttar Pradesh': /^[2][0-9]{5}$/,
  'West Bengal': /^[7][0-9]{5}$/,
  'Madhya Pradesh': /^[4][5-9][0-9]{4}$/,
  'Andhra Pradesh': /^[5][0-9]{5}$/,
  'Telangana': /^[5][0-9]{5}$/,
  'Kerala': /^[6][7-9][0-9]{4}$/,
  'Punjab': /^[1][4-7][0-9]{4}$/,
  'Haryana': /^[1][2-3][0-9]{4}$/
};

export const EnhancedLocationInput: React.FC<EnhancedLocationInputProps> = ({
  value,
  onChange,
  onValidationChange,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Get area suggestions based on city and state
  const getAreaSuggestions = (city: string, state: string): string[] => {
    if (LOCATION_SUGGESTIONS[city]?.[state]) {
      return LOCATION_SUGGESTIONS[city][state];
    }
    return [];
  };

  // Validate address format
  const validateAddress = (address: string): string => {
    if (!address.trim()) return 'Address is required';
    if (address.length < 10) return 'Address must be at least 10 characters';
    if (address.length > 200) return 'Address must be less than 200 characters';
    return '';
  };

  // Validate PIN code based on state
  const validatePinCode = (pinCode: string, state: string): string => {
    if (!pinCode.trim()) return 'PIN code is required';
    if (!/^[0-9]{6}$/.test(pinCode)) return 'PIN code must be 6 digits';

    const pattern = PINCODE_PATTERNS[state as keyof typeof PINCODE_PATTERNS];
    if (pattern && !pattern.test(pinCode)) {
      return `Invalid PIN code for ${state}`;
    }
    return '';
  };

  // Validate area/locality
  const validateArea = (area: string): string => {
    if (!area.trim()) return 'Area/Locality is required';
    if (area.length < 3) return 'Area must be at least 3 characters';
    if (area.length > 50) return 'Area must be less than 50 characters';
    return '';
  };

  // Validate city
  const validateCity = (city: string): string => {
    if (!city.trim()) return 'City is required';
    if (city.length < 2) return 'City must be at least 2 characters';
    if (city.length > 50) return 'City must be less than 50 characters';
    return '';
  };

  // Main validation function
  const validateLocation = (location: LocationData): boolean => {
    const errors: Record<string, string> = {};

    errors.address = validateAddress(location.address);
    errors.area = validateArea(location.area);
    errors.city = validateCity(location.city);
    errors.pinCode = validatePinCode(location.pinCode, location.state);

    if (!location.state) {
      errors.state = 'State is required';
    }

    // Remove empty error messages
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    setValidationErrors(errors);
    const valid = Object.keys(errors).length === 0;
    setIsValid(valid);
    onValidationChange?.(valid);
    return valid;
  };

  // Handle input changes with validation
  const handleInputChange = (field: keyof LocationData, fieldValue: string) => {
    const newLocation = { ...value, [field]: fieldValue };
    onChange(newLocation);
    validateLocation(newLocation);

    // Show area suggestions when city/state changes
    if (field === 'city' || field === 'state') {
      const areaSuggestions = getAreaSuggestions(newLocation.city, newLocation.state);
      if (areaSuggestions.length > 0) {
        setSuggestions(areaSuggestions);
        setShowSuggestions(true);
      }
    }
  };

  // Handle area input with suggestions
  const handleAreaInput = (areaValue: string) => {
    handleInputChange('area', areaValue);

    if (areaValue.length > 1) {
      const areaSuggestions = getAreaSuggestions(value.city, value.state);
      const filtered = areaSuggestions.filter(area =>
        area.toLowerCase().includes(areaValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (suggestion: string) => {
    handleInputChange('area', suggestion);
    setShowSuggestions(false);
  };

  // Get current location (basic implementation)
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = {
            ...value,
            latitude,
            longitude
          };
          onChange(newLocation);
          alert('Location detected! Please fill in the address details manually.');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter address manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const [mapError, setMapError] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validate on mount and when value changes
  useEffect(() => {
    validateLocation(value);
  }, [value]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input with Validation */}
      <div className="relative">
        <Input
          label="Address *"
          value={value.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Street address, building name, etc."
          leftIcon={<MapPin className="w-5 h-5" />}
          className={`${validationErrors.address ? 'border-red-300 focus:border-red-500' : ''}`}
        />
        {validationErrors.address && (
          <div className="flex items-center mt-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.address}
          </div>
        )}
      </div>

      {/* Area Input with Suggestions */}
      <div className="relative" ref={suggestionRef}>
        <Input
          label="Area/Locality *"
          value={value.area}
          onChange={(e) => handleAreaInput(e.target.value)}
          placeholder="e.g. Bandra West, Koramangala, Sector 5"
          leftIcon={<Search className="w-5 h-5" />}
          className={`${validationErrors.area ? 'border-red-300 focus:border-red-500' : ''}`}
        />
        {validationErrors.area && (
          <div className="flex items-center mt-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.area}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* City and PIN Code Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            label="City *"
            value={value.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            className={`${validationErrors.city ? 'border-red-300 focus:border-red-500' : ''}`}
          />
          {validationErrors.city && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.city}
            </div>
          )}
        </div>

        <div>
          <Input
            label="PIN Code *"
            value={value.pinCode}
            onChange={(e) => handleInputChange('pinCode', e.target.value)}
            placeholder="e.g. 400050"
            className={`${validationErrors.pinCode ? 'border-red-300 focus:border-red-500' : ''}`}
          />
          {validationErrors.pinCode && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-1" />
              {validationErrors.pinCode}
            </div>
          )}
        </div>
      </div>

      {/* State Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State *
        </label>
        <select
          value={value.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors.state ? 'border-red-300' : 'border-gray-300'}`}
        >
          <option value="">Select state</option>
          <option value="Maharashtra">Maharashtra</option>
          <option value="Delhi">Delhi</option>
          <option value="Karnataka">Karnataka</option>
          <option value="Tamil Nadu">Tamil Nadu</option>
          <option value="Gujarat">Gujarat</option>
          <option value="Rajasthan">Rajasthan</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="West Bengal">West Bengal</option>
          <option value="Madhya Pradesh">Madhya Pradesh</option>
          <option value="Andhra Pradesh">Andhra Pradesh</option>
          <option value="Telangana">Telangana</option>
          <option value="Kerala">Kerala</option>
          <option value="Punjab">Punjab</option>
          <option value="Haryana">Haryana</option>
        </select>
        {validationErrors.state && (
          <div className="flex items-center mt-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validationErrors.state}
          </div>
        )}
      </div>

      {/* Landmark Input */}
      <div className="relative">
        <Input
          label="Landmark (Optional)"
          value={value.landmark}
          onChange={(e) => handleInputChange('landmark', e.target.value)}
          placeholder="e.g. Near Phoenix Mall, Opposite Metro Station"
        />

        {/* Landmark Suggestions */}
        {value.landmark.length === 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-2">Common landmarks:</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANDMARKS.slice(0, 6).map((landmark, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange('landmark', landmark)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {landmark}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Use Current Location
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          {showMap ? 'Hide Map' : 'Preview Location'}
        </Button>
      </div>

      {/* Validation Status */}
      {isValid && (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-1" />
          Location information is complete and valid
        </div>
      )}

      {/* Map Preview */}
      {showMap && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Location Preview</h4>
          <div className="w-full h-64 border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50">
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h5 className="text-lg font-semibold text-gray-800 mb-2">Location Preview</h5>
              <div className="text-sm text-gray-600 mb-4 max-w-xs">
                <p className="font-medium">{value.city}, {value.state}</p>
                {value.area && <p className="text-xs">{value.area}</p>}
                {value.address && <p className="text-xs text-gray-500 mt-1">{value.address}</p>}
              </div>
              <button
                onClick={() => {
                  const locationParts = [];
                  if (value.address) locationParts.push(value.address);
                  if (value.area) locationParts.push(value.area);
                  if (value.city) locationParts.push(value.city);
                  if (value.state) locationParts.push(value.state);
                  if (value.pinCode) locationParts.push(value.pinCode);
                  if (value.landmark) locationParts.push(`near ${value.landmark}`);

                  const query = locationParts.join(', ');
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query || 'India')}`;
                  window.open(mapsUrl, '_blank');
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                View in Google Maps
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click "View in Google Maps" to see the exact location in a new tab.
          </p>
        </div>
      )}
    </div>
  );
};