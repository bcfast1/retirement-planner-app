'use client'; // Needed for state and dynamic imports

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import locationsData from '../../../../data/locations.json'; // Adjust path based on directory structure
import RestaurantFilterControls from '../../../components/RestaurantFilterControls'; // Import the new filter component

// Define interfaces locally for this page
interface FoodScenePlace {
  name: string;
  type: string[];
  address?: string;
  latitude: number;
  longitude: number;
  notes?: string;
  link?: string | null;
}

interface Location {
  id: string;
  name: string;
  state: string;
  area: string;
  description: string;
  medianHomePrice: number | null;
  airport: string;
  airportProximityMinutes: number | null;
  foodSceneFocus: boolean;
  recreationFocus: boolean;
  latitude: number | null;
  longitude: number | null;
  foodSceneLink?: string;
  recreationLink?: string;
  realEstateLink?: string;
  countyFips?: string | null;
  fsrPer1k?: number | null;
  pcFsrSales?: number | null;
  fmrktPer1k?: number | null;
  // detailedFoodSceneNotes?: string; // Replaced by foodSceneDetails
  foodSceneDetails?: FoodScenePlace[]; // Expecting the structured array now
}

// Define props for the page component - Removed as per fix
// interface LocationPageProps {
//   params: {
//     locationId: string;
//   };
// }

// Function to find location data by ID
const getLocationById = (id: string): Location | undefined => {
  // Ensure the find returns the correct type, including the optional array
  return (locationsData as Location[]).find(loc => loc.id === id) as Location | undefined;
};

// Dynamically import MapDisplay only on the client-side
const MapDisplay = dynamic(
  () => import('../../../components/MapDisplay'), // Adjust path if needed
  {
    loading: () => <p className="text-center">Loading map...</p>,
    ssr: false
  }
);

// Update function signature to directly type params
export default function LocationPage({ params }: { params: { locationId: string } }) {
  const { locationId } = params; // This should now work correctly
  const location = getLocationById(locationId);

  // If location not found, show 404
  if (!location || !location.latitude || !location.longitude) {
    // Need lat/lon for map center
    // Need lat/lon for map center
    notFound();
  }

  // Memoize foodSceneDetails to address ESLint warning and ensure stability
  const foodSceneDetails = useMemo(() => location.foodSceneDetails || [], [location.foodSceneDetails]);

  // Get unique types for filtering
  const allFoodSceneTypes = useMemo(() => {
    const types = new Set<string>();
    foodSceneDetails.forEach(place => {
      place.type.forEach(t => types.add(t));
    });
    return Array.from(types);
  }, [foodSceneDetails]);

  // State for selected filter types
  const [selectedRestaurantTypes, setSelectedRestaurantTypes] = useState<string[]>([]);

  // Filter food scene details based on selected types
  const filteredFoodSceneDetails = useMemo(() => {
    if (selectedRestaurantTypes.length === 0) {
      return foodSceneDetails; // Show all if no filter selected
    }
    return foodSceneDetails.filter(place =>
      place.type.some(t => selectedRestaurantTypes.includes(t))
    );
  }, [foodSceneDetails, selectedRestaurantTypes]);

  // Handle filter changes
  const handleFilterChange = (newTypes: string[]) => {
    setSelectedRestaurantTypes(newTypes);
  };

  // Define map center and zoom for this specific location page
  const mapCenter: [number, number] = [location.latitude, location.longitude];
  const mapZoom = 13; // Zoom level focused on the city/area

  return (
    <div className="min-h-screen p-8 sm:p-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
          {location.name}, {location.state} - Food Scene Details
        </h1>
        <div className="text-center mt-4">
          <Link href="/" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            &larr; Back to Map & List
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl"> {/* Wider container */}

        {/* Map Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-700">
            Map of Food Scene Places
          </h2>
          {/* Render the dynamically imported map */}
          <MapDisplay
            locations={[location]} // Pass only the current location for its main pin
            foodScenePlaces={filteredFoodSceneDetails} // Pass the filtered places
            selectedFoodSceneTypes={selectedRestaurantTypes} // Pass selected types (for potential future map logic)
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            // Do not pass airports/hospitals unless desired on this specific map
          />
        </section>

         {/* Filter Controls Section */}
         {allFoodSceneTypes.length > 0 && (
           <section className="mb-8">
             <RestaurantFilterControls
               allTypes={allFoodSceneTypes}
               selectedTypes={selectedRestaurantTypes}
               onFilterChange={handleFilterChange}
             />
           </section>
         )}


        {/* Detail Blocks Section */}
        <section>
           <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-700">
            Food Scene Details ({filteredFoodSceneDetails.length} showing)
          </h2>
          {foodSceneDetails.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFoodSceneDetails.length > 0 ? (
                filteredFoodSceneDetails.map((place, index) => (
                  <div key={`${place.name}-${index}`} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h3 className="text-lg font-semibold mb-1 text-purple-700 dark:text-purple-300">{place.name}</h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Type(s): {place.type.join(', ')}
                    </p>
                    {place.address && (
                       <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{place.address}</p>
                    )}
                    {place.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 flex-grow">{place.notes}</p>
                    )}
                    {place.link && (
                      <div className="mt-auto pt-2">
                        <a
                          href={place.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                 <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                   No places match the selected filter(s).
                 </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No detailed food scene places available for this location yet.</p>
          )}
        </section>
      </main>

      <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
        <p>Retirement Planner App - Cline Development</p>
      </footer>
    </div>
  );
}

// Optional: Generate static paths if you know all location IDs beforehand
// export async function generateStaticParams() {
//   return (locationsData as Location[]).map((location) => ({
//     locationId: location.id,
//   }));
// }
