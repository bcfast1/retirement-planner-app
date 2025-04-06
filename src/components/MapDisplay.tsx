'use client'; // Required for React Leaflet components

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import Leaflet library
import Link from 'next/link'; // Import Link

import React from 'react'; // Ensure React is imported if not already implicitly

// Define the Location interface again for type safety within this component
// Ensure all expected properties are listed
interface Location {
  id: string;
  name: string;
  state: string;
  area: string; // Added area back if needed by other parts, though not used in popup
  description: string; // Make sure description is here
  medianHomePrice: number | null;
  airport: string;
  airportProximityMinutes: number | null;
  foodSceneFocus: boolean;
  recreationFocus: boolean;
  latitude: number | null;
  longitude: number | null;
  foodSceneDetails?: FoodScenePlace[]; // Add optional array for detailed places
}

// Define structure for individual food scene places
interface FoodScenePlace {
  name: string;
  type: string[]; // Array of types (e.g., ['Brewpub', 'Downtown'])
  address?: string; // Optional address
  latitude: number;
  longitude: number;
  notes?: string; // Optional notes
  link?: string | null; // Optional link
}

// Define an interface for Airport data
interface Airport {
  id: string; // e.g., 'GSP', 'ATL'
  name: string;
  latitude: number;
  longitude: number;
}

// Define an interface for Hospital data
interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  websiteLink?: string; // Add optional website link
}

interface MapDisplayProps {
  locations: Location[];
  airports?: Airport[];
  hospitals?: Hospital[]; // Make hospitals optional
  foodScenePlaces?: FoodScenePlace[]; // Add prop for food scene places
  selectedFoodSceneTypes?: string[]; // Add prop for selected types
  mapCenter?: [number, number]; // Optional prop to override center
  mapZoom?: number; // Optional prop to override zoom
}

// --- Icon Definitions ---

// Default icon for locations
// You might need to copy marker-icon.png, marker-icon-2x.png, and marker-shadow.png
// from 'leaflet/dist/images' to your 'public/leaflet' directory
// Or use a CDN path if preferred
const locationIcon = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom DivIcon for airports using inline SVG
const airplaneSVG = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 122.88 122.88" style="enable-background:new 0 0 122.88 122.88; fill: #3B82F6;" xml:space="preserve"> {/* Added blue fill */}
<style type="text/css">
	.st0{fill-rule:evenodd;clip-rule:evenodd;}
</style>
<g>
	<path class="st0" d="M16.63,105.75c0.01-4.03,2.3-7.97,6.03-12.38L1.09,79.73c-1.36-0.59-1.33-1.42-0.54-2.4l4.57-3.9
		c0.83-0.51,1.71-0.73,2.66-0.47l26.62,4.5l22.18-24.02L4.8,18.41c-1.31-0.77-1.42-1.64-0.07-2.65l7.47-5.96l67.5,18.97L99.64,7.45
		c6.69-5.79,13.19-8.38,18.18-7.15c2.75,0.68,3.72,1.5,4.57,4.08c1.65,5.06-0.91,11.86-6.96,18.86L94.11,43.18l18.97,67.5
		l-5.96,7.47c-1.01,1.34-1.88,1.23-2.65-0.07L69.43,66.31L45.41,88.48l4.5,26.62c0.26,0.94,0.05,1.82-0.47,2.66l-3.9,4.57
		c-0.97,0.79-1.81,0.82-2.4-0.54l-13.64-21.57c-4.43,3.74-8.37,6.03-12.42,6.03C16.71,106.24,16.63,106.11,16.63,105.75
		L16.63,105.75z"/>
</g>
</svg>
`;

const airplaneIcon = L.divIcon({
  html: airplaneSVG,
  className: 'leaflet-div-icon-airplane', // Add a class for potential styling
  iconSize: [30, 30], // Adjust size as needed
  iconAnchor: [15, 15], // Center the icon
  popupAnchor: [0, -15]
});

// Custom DivIcon for hospitals using simple HTML (+)
const hospitalIcon = L.divIcon({
  html: `<div style="font-size: 20px; color: red; font-weight: bold; text-align: center; line-height: 20px;">+</div>`,
  className: 'leaflet-div-icon-hospital', // Add a class for potential styling
  iconSize: [20, 20], // Adjust size as needed
  iconAnchor: [10, 10], // Center the icon
  popupAnchor: [0, -10] // Adjust popup position
});

// Custom DivIcon for food places (e.g., fork and knife) - Placeholder SVG
const foodSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#A855F7" width="24px" height="24px"> {/* Purple fill */}
  <path d="M0 0h24v24H0z" fill="none"/>
  <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2v7z"/>
</svg>
`;

const foodIcon = L.divIcon({
  html: foodSVG,
  className: 'leaflet-div-icon-food',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});


// Set default icon for regular markers (important if prototype was modified elsewhere)
L.Marker.prototype.options.icon = locationIcon;


const MapDisplay: React.FC<MapDisplayProps> = ({
  locations,
  airports = [],
  hospitals = [],
  foodScenePlaces = [], // Default to empty array
  selectedFoodSceneTypes = [], // Default to empty array
  mapCenter, // Receive optional center
  mapZoom // Receive optional zoom
}) => {
  // Filter locations that have valid coordinates
  const locationsWithCoords = locations.filter(
    (loc): loc is Location & { latitude: number; longitude: number; description: string; realEstateLink?: string } =>
      loc.latitude !== null && loc.longitude !== null
  );

  // Filter food scene places based on selected types
  const filteredFoodScenePlaces = foodScenePlaces.filter(place =>
    selectedFoodSceneTypes.length === 0 || // Show all if no types selected or "All" is implicitly handled by parent
    place.type.some(t => selectedFoodSceneTypes.includes(t))
  );

  // Determine map center and zoom
  // Use provided props if available, otherwise calculate default
  const center: [number, number] = mapCenter ?? [33.5, -82.0]; // Default center SC/GA
  const zoom: number = mapZoom ?? 7; // Default zoom

  if (typeof window === 'undefined') {
    // Avoid rendering Leaflet components on the server
    return null;
  }

  return (
    <MapContainer
      center={center} // Use the determined center
      zoom={zoom} // Use the determined zoom
      scrollWheelZoom={true} // Enable scroll wheel zoom
      style={{ height: '500px', width: '100%' }} // Ensure container has dimensions
      className="rounded-lg shadow border border-gray-300 dark:border-gray-700"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Render Location Markers */}
      {locationsWithCoords.map((location) => (
        <Marker
          key={`loc-${location.id}`} // Add prefix to key for uniqueness
          position={[location.latitude, location.longitude]}
          icon={locationIcon} // Use the location icon
        >
          <Popup>
            <strong>{location.name}, {location.state}</strong><br/>
            {/* Add more details here if needed */}
            {location.description.split('.')[0]}... {/* Should now be safe to access directly */}
            {/* Add Zillow Link */}
            {location.realEstateLink && (
               <>
                <br />
                <a
                  href={location.realEstateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  View Homes (Zillow)
                </a>
              </>
            )}
             {/* Add Food Scene Detail Link for Macon */}
            {location.id === 'macon-ga' && (
              <>
                <br />
                <Link
                  href={`/locations/${location.id}`}
                  className="text-purple-600 dark:text-purple-400 hover:underline text-xs"
                >
                  View Food Scene Details
                </Link>
              </>
            )}
          </Popup>
        </Marker>
      ))}

       {/* Render Airport Markers */}
      {airports.map((airport) => (
        <Marker
          key={`apt-${airport.id}`} // Add prefix to key
          position={[airport.latitude, airport.longitude]}
          icon={airplaneIcon} // Use the airplane icon
        >
          <Popup>
            <strong>{airport.name} ({airport.id})</strong><br/>
            Airport
          </Popup>
        </Marker>
      ))}

       {/* Render Hospital Markers */}
      {hospitals.map((hospital) => (
        <Marker
          key={`hosp-${hospital.id}`} // Add prefix to key
          position={[hospital.latitude, hospital.longitude]}
          icon={hospitalIcon} // Use the hospital icon
        >
          <Popup>
            <strong>{hospital.name}</strong><br/>
            Hospital
            {hospital.websiteLink && (
              <>
                <br />
                <a
                  href={hospital.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                >
                  Visit Website
                </a>
              </>
            )}
          </Popup>
        </Marker>
      ))}

      {/* Render Food Scene Place Markers */}
      {filteredFoodScenePlaces.map((place, index) => (
        <Marker
          key={`food-${place.name}-${index}`} // Use name and index for key
          position={[place.latitude, place.longitude]}
          icon={foodIcon} // Use the food icon
        >
          <Popup>
            <strong>{place.name}</strong><br/>
            Type(s): {place.type.join(', ')}<br/>
            {place.address && <>{place.address}<br/></>}
            {place.notes && <>{place.notes}<br/></>}
            {place.link && (
              <a
                href={place.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
              >
                Visit Website
              </a>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapDisplay;
