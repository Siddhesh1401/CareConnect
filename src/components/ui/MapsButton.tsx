import React from 'react';
import { MapPin } from 'lucide-react';

interface MapsButtonProps {
  address?: string;
  area?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const MapsButton: React.FC<MapsButtonProps> = ({ 
  address, 
  area,
  city, 
  state,
  pinCode,
  landmark, 
  className = '', 
  variant = 'default',
  size = 'md'
}) => {
  const handleMapsClick = () => {
    // Construct enhanced location string for maximum Google Maps accuracy
    const locationParts: string[] = [];
    
    // Add address (street, building) first for specificity
    if (address?.trim()) {
      locationParts.push(address.trim());
    }
    
    // Add area/locality for neighborhood context
    if (area?.trim()) {
      locationParts.push(area.trim());
    }
    
    // Add city for regional context
    if (city?.trim()) {
      locationParts.push(city.trim());
    }
    
    // Add state for broader regional context
    if (state?.trim()) {
      locationParts.push(state.trim());
    }
    
    // Add PIN code for precise location identification
    if (pinCode?.trim()) {
      locationParts.push(pinCode.trim());
    }
    
    // Add landmark if provided for easier recognition
    if (landmark?.trim()) {
      locationParts.push(`near ${landmark.trim()}`);
    }
    
    if (locationParts.length === 0) {
      alert('Location details not available');
      return;
    }
    
    const locationString = locationParts.join(', ');
    
    // Create Google Maps URL with enhanced location data
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationString)}`;
    
    // Open in new tab
    window.open(mapsUrl, '_blank');
  };

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-2", 
    lg: "px-4 py-2 text-base gap-2"
  };

  // Icon sizes
  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 18
  };

  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    ghost: "text-blue-600 hover:bg-blue-50 focus:ring-blue-500"
  };

  return (
    <button
      type="button"
      onClick={handleMapsClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title="Open location in Google Maps"
    >
      <MapPin size={iconSizes[size]} />
      View in Maps
    </button>
  );
};

export default MapsButton;