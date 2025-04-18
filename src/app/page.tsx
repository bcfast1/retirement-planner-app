'use client'; // Mark this page as a Client Component because we'll use hooks/state for dynamic import

import { useState, useMemo } from 'react'; // Import useState
import dynamic from 'next/dynamic';
import Link from 'next/link'; // Import Link
import locationsData from '../../data/locations.json';
import FilterControls, { FilterState } from '../components/FilterControls'; // Import FilterControls and its state type
import countyFoodDataRaw from '../../data/county_food_data.json'; // Import the new county data

// Define interfaces for data structures
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
  // Add optional fields for county food data
  countyFips?: string | null; // Add FIPS code for linking
  fsrPer1k?: number | null; // Full-service restaurants per 1k pop
  pcFsrSales?: number | null; // Per capita restaurant sales
  fmrktPer1k?: number | null; // Farmers' markets per 1k pop
}

interface Airport {
  id: string;
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

// Define County Food Data structure (matching the output of the script)
interface CountyFoodData {
    FIPS: string;
    State: string;
    County: string;
    FSRPTH16?: number | null;
    PC_FSRSALES12?: number | null;
    FMRKTPTH18?: number | null;
}

// Create a lookup map for county data by FIPS code
const countyDataMap: { [key: string]: CountyFoodData } = {};
(countyFoodDataRaw as CountyFoodData[]).forEach(county => {
    if (county.FIPS) {
        // Ensure FIPS is consistently padded if needed
        const fipsKey = county.FIPS.padStart(5, '0');
        countyDataMap[fipsKey] = county;
    }
});

// Add FIPS codes to locations (based on previous searches)
const locationToFipsMap: { [key: string]: string | null } = {
    "simpsonville-sc": "45045",
    "travelers-rest-sc": "45045",
    "pendleton-sc": "45007",
    "easley-sc": "45077",
    "honea-path-sc": "45007", // Using Anderson
    "seneca-sc": "45073",
    "bluffton-sc": "45013",
    "beaufort-sc": "45013",
    "summerville-sc": "45035", // Using Dorchester
    "moncks-corner-sc": "45015",
    "georgetown-sc": "45043",
    "murrells-inlet-sc": "45043",
    "little-river-sc": "45051",
    "conway-sc": "45051",
    "socastee-sc": "45051",
    "garden-city-sc": "45051", // Using Horry
    "cayce-sc": "45063", // Using Lexington
    "west-columbia-sc": "45063",
    "irmo-sc": "45063", // Using Lexington
    "batesburg-leesville-sc": "45063", // Using Lexington
    "macon-ga": "13021",
    "adairsville-ga": "13015",
    // FIPS for others were not gathered yet - map to null
    "clarkesville-ga": null, // Habersham
    "roswell-ga": null, // Fulton
    "fayetteville-ga": null, // Fayette
    "pooler-ga": null, // Chatham
    "port-wentworth-ga": null, // Chatham
    "rincon-ga": null, // Effingham
    "georgetown-ga": null, // Chatham
    "richmond-hill-ga": null, // Bryan
    "evans-ga": null, // Columbia
    "north-augusta-sc": null, // Aiken
    "aiken-sc": null, // Aiken
    "martinez-ga": null, // Columbia
    "thomson-ga": null, // McDuffie
};


export default function Home() {
  // Original locations data, now augmented with FIPS and county data
  const augmentedLocations: Location[] = useMemo(() => {
      return (locationsData as Location[]).map(loc => {
          const fips = locationToFipsMap[loc.id] ?? null; // Get FIPS or null
          const countyData = fips ? countyDataMap[fips] : undefined;
          return {
              ...loc,
              countyFips: fips, // Store the FIPS code itself
              fsrPer1k: countyData?.FSRPTH16,
              pcFsrSales: countyData?.PC_FSRSALES12,
              fmrktPer1k: countyData?.FMRKTPTH18,
          };
      });
  }, []); // Calculate only once


  // Define Airport Data
  const airports: Airport[] = [
    { id: 'GSP', name: 'Greenville-Spartanburg Intl.', latitude: 34.8959008, longitude: -82.2172338 },
    { id: 'CHS', name: 'Charleston Intl.', latitude: 32.8916648, longitude: -80.0395233 },
    { id: 'MYR', name: 'Myrtle Beach Intl.', latitude: 33.6822019, longitude: -78.92789429999999 },
    { id: 'CAE', name: 'Columbia Metropolitan', latitude: 33.941917, longitude: -81.1220015 },
    { id: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl.', latitude: 33.6324187, longitude: -84.4333116 },
    { id: 'SAV', name: 'Savannah/Hilton Head Intl.', latitude: 32.1294229, longitude: -81.201871 },
    { id: 'AGS', name: 'Augusta Regional', latitude: 33.3702411, longitude: -81.96497450000001 },
  ];

  // Define Hospital Data
  const hospitals: Hospital[] = [
    { id: 'prisma-gvl', name: 'Prisma Health Greenville Memorial', latitude: 34.8187964, longitude: -82.41293329999999, websiteLink: 'https://prismahealth.org/locations/hospitals/greenville-memorial-hospital' },
    { id: 'spartanburg-med', name: 'Spartanburg Medical Center', latitude: 34.9667095, longitude: -81.93869520000001, websiteLink: 'https://www.spartanburgregional.com/locations/spartanburg-medical-center' },
    { id: 'musc-chs', name: 'MUSC Health University Medical Center', latitude: 32.7849784, longitude: -79.9472066, websiteLink: 'https://muschealth.org/locations/university-medical-center' },
    { id: 'roper-chs', name: 'Roper Hospital', latitude: 32.7828329, longitude: -79.9494575, websiteLink: 'https://www.rsfh.com/roper-hospital/' },
    { id: 'grand-strand-med', name: 'Grand Strand Medical Center', latitude: 33.7583409, longitude: -78.8200993, websiteLink: 'https://mygrandstrandhealth.com/' },
    { id: 'tidelands-waccamaw', name: 'Tidelands Waccamaw Community Hospital', latitude: 33.5605114, longitude: -79.0428567, websiteLink: 'https://www.tidelandshealth.org/locations/profile/tidelandswaccamaw/' },
    { id: 'prisma-richland', name: 'Prisma Health Richland Hospital', latitude: 34.027766, longitude: -81.0316345, websiteLink: 'https://prismahealth.org/locations/hospitals/richland-hospital' },
    { id: 'lexington-med', name: 'Lexington Medical Center', latitude: 34.0060496, longitude: -81.1146945, websiteLink: 'https://lexmed.com/' },
    { id: 'northside-cherokee', name: 'Northside Hospital Cherokee', latitude: 34.2296681, longitude: -84.46602039999999, websiteLink: 'https://www.northside.com/locations/northside-hospital-cherokee' },
    { id: 'piedmont-fayette', name: 'Piedmont Fayette Hospital', latitude: 33.4519367, longitude: -84.5084164, websiteLink: 'https://www.piedmont.org/locations/piedmont-fayette/about' },
    { id: 'atrium-macon', name: 'Atrium Health Navicent The Medical Center', latitude: 32.8338321, longitude: -83.6365537, websiteLink: 'https://navicenthealth.org/' },
    { id: 'memorial-sav', name: 'Memorial Health University Medical Center', latitude: 32.0303424, longitude: -81.089434, websiteLink: 'https://memorialhealth.com/' },
    { id: 'stjoseph-sav', name: "St. Joseph's Hospital", latitude: 31.9853909, longitude: -81.1553605, websiteLink: 'https://www.sjchs.org/hospitals/st-josephs-hospital' },
    { id: 'piedmont-aug', name: 'Piedmont Augusta Hospital', latitude: 33.4707366, longitude: -81.9827533, websiteLink: 'https://www.piedmont.org/locations/piedmont-augusta/about' },
    { id: 'wellstar-mcg', name: 'Wellstar MCG Health Medical Center', latitude: 33.4712347, longitude: -81.9905825, websiteLink: 'https://www.wellstar.org/locations/hospital/mcg-health-medical-center' },
  ];

  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    state: 'ALL',
    minPrice: null,
    maxPrice: null,
    maxAirportProximity: null,
    foodSceneFocus: false,
    recreationFocus: false,
  });

  // Handler for updating filters
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  // Calculate filtered locations based on current filters
  // Use augmentedLocations which includes county data
  const filteredLocations = useMemo(() => {
    return augmentedLocations.filter(loc => { // Use augmentedLocations here
      // State filter
      if (filters.state !== 'ALL' && loc.state !== filters.state) {
        return false;
      }
      // Price Range filter (only filter if price exists for the location)
      if (loc.medianHomePrice !== null) {
        if (filters.minPrice !== null && loc.medianHomePrice < filters.minPrice) {
          return false; // Price is below minimum
        }
        if (filters.maxPrice !== null && loc.medianHomePrice > filters.maxPrice) {
          return false; // Price is above maximum
        }
      } else {
        // If location has no price, exclude it if any price filter is set
        if (filters.minPrice !== null || filters.maxPrice !== null) {
          return false;
        }
      }
       // Max Airport Proximity filter (only filter if proximity exists)
      if (filters.maxAirportProximity !== null && loc.airportProximityMinutes !== null && loc.airportProximityMinutes > filters.maxAirportProximity) {
        return false;
      }
      // Food Scene focus filter
      if (filters.foodSceneFocus && !loc.foodSceneFocus) {
        return false;
      }
      // Recreation focus filter
      if (filters.recreationFocus && !loc.recreationFocus) {
        return false;
      }
      return true; // Include location if all checks pass
    });
  }, [augmentedLocations, filters]); // FIX: Use augmentedLocations in dependency array

  // Get unique states for the dropdown
  const allStates = useMemo(() => {
    // Use augmentedLocations here to ensure consistency if needed, though original locations is likely fine
    const states = new Set(augmentedLocations.map(loc => loc.state)); // FIX: Use augmentedLocations
    return Array.from(states).sort();
  }, [augmentedLocations]); // FIX: Use augmentedLocations in dependency array


  // Dynamically import the MapDisplay component only on the client-side
  const MapDisplay = useMemo(() => dynamic(
    () => import('../components/MapDisplay'),
    {
      loading: () => <p className="text-center">Loading map...</p>, // Optional loading indicator
      ssr: false // Ensure it's not rendered on the server
    }
  ), []); // Empty dependency array ensures this runs only once on mount


  return (
    <div className="min-h-screen p-8 sm:p-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400">
          Retirement Location Planner
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          Exploring potential retirement spots in South Carolina and Georgia.
        </p>
      </header>

      <main className="container mx-auto">
         {/* Filter Controls Section */}
        <section className="mb-8">
           <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            allStates={allStates}
          />
        </section>

        {/* Map Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-700">
            Location Map ({filteredLocations.length} locations showing)
          </h2>
          {/* Render the dynamically imported map with filtered locations, airports, and hospitals */}
          <MapDisplay locations={filteredLocations} airports={airports} hospitals={hospitals} />
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Note: Location markers require icon files in `public/leaflet/`. If markers are missing, copy `marker-icon.png`, `marker-icon-2x.png`, and `marker-shadow.png` from `node_modules/leaflet/dist/images/` to `public/leaflet/`. Airport and Hospital icons are rendered using inline SVG/HTML.
          </p>
        </section>

        {/* Location List Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-300 dark:border-gray-700">
            Potential Locations List ({filteredLocations.length} showing)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Render filtered locations */}
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location: Location) => ( // Explicitly type location here
                <div
                  key={location.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-semibold mb-2 text-blue-700 dark:text-blue-300">
                {location.name}, {location.state}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Area: {location.area} | Airport: {location.airport}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                {location.description}
              </p>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span>
                  Price: {location.medianHomePrice ? `$${(location.medianHomePrice / 1000).toFixed(0)}k` : 'N/A'} |{' '}
                </span>
                <span>
                  Airport Proximity: {location.airportProximityMinutes ? `${location.airportProximityMinutes} min` : 'N/A'}
                </span>
                <div className="mt-1">
                  <span className={`inline-block rounded px-2 py-0.5 mr-1 ${location.foodSceneFocus ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    Food Scene
                  </span>
                  <span className={`inline-block rounded px-2 py-0.5 ${location.recreationFocus ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    Recreation
                  </span>
                </div>
                {/* Display County Food Data */}
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                  <p className="font-semibold mb-0.5">County Data ({location.countyFips ? `FIPS: ${location.countyFips}` : 'N/A'}):</p>
                  <p>Restaurants/1k (2016): {location.fsrPer1k?.toFixed(2) ?? 'N/A'}</p>
                  <p>Restaurant Spend/Cap (2012): {location.pcFsrSales ? `$${location.pcFsrSales.toFixed(2)}` : 'N/A'}</p>
                  <p>Farmers Markets/1k (2018): {location.fmrktPer1k?.toFixed(2) ?? 'N/A'}</p>
                </div>
                 {/* Add Links */}
                <div className="mt-2 text-xs">
                  {location.foodSceneLink && (
                    <a
                      href={location.foodSceneLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                    >
                      Food/Info
                    </a>
                  )}
                  {location.recreationLink && (
                    <a
                      href={location.recreationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                    >
                      Recreation
                    </a>
                  )}
                   {/* Add Real Estate Link */}
                  {location.realEstateLink && (
                    <a
                      href={location.realEstateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2.5 py-0.5 rounded"
                    >
                      Real Estate
                    </a>
                  )}
                  {/* Add Food Scene Detail Link for Macon */}
                  {location.id === 'macon-ga' && (
                     <Link
                      href={`/locations/${location.id}`}
                      className="inline-block bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded"
                    >
                      Food Scene Details
                    </Link>
                  )}
                </div>
              </div>
            </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
                No locations match the current filters.
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
        <p>Retirement Planner App - Cline Development</p>
      </footer>
    </div>
  );
}
