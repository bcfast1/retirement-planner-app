// This is now primarily a Server Component for data fetching

import { notFound } from 'next/navigation';
import Link from 'next/link';
import locationsData from '../../../../data/locations.json'; // Adjust path based on directory structure
import LocationDetailPageClient from './LocationDetailPageClient'; // Import from same directory

// Define interfaces (can be shared in a types file later)
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
  foodSceneDetails?: FoodScenePlace[];
}

// Function to find location data by ID (can run on server)
const getLocationById = (id: string): Location | undefined => {
  return (locationsData as Location[]).find(loc => loc.id === id) as Location | undefined;
};

// Define the props structure expected by Next.js for this page
interface LocationPageServerProps {
  params: {
    locationId: string;
  };
}

// This Server Component fetches data and passes it to the Client Component
export default function LocationPage({ params }: LocationPageServerProps) {
  const { locationId } = params;
  const location = getLocationById(locationId);

  // If location not found, show 404
  if (!location) {
    notFound();
  }

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

      <main className="container mx-auto max-w-7xl">
        {/* Render the Client Component, passing the fetched location data */}
        <LocationDetailPageClient location={location} />
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
