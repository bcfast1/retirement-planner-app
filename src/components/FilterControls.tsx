'use client';

import React from 'react';

// Define the structure for filter values
export interface FilterState {
  state: string; // 'ALL', 'SC', 'GA'
  minPrice: number | null; // Min median home price
  maxPrice: number | null; // Max median home price
  maxAirportProximity: number | null; // Max minutes from airport
  foodSceneFocus: boolean;
  recreationFocus: boolean;
}

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  allStates: string[]; // List of unique states from data
  // Add props for min/max price ranges if needed later
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  allStates,
}) => {
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ state: e.target.value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    onFilterChange({ maxPrice: value });
  };

   const handleMaxAirportProximityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : null;
    onFilterChange({ maxAirportProximity: value });
  };

  const handleFoodSceneToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ foodSceneFocus: e.target.checked });
  };

  const handleRecreationToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ recreationFocus: e.target.checked });
  };


  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Filter Locations</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* State Filter */}
        <div>
          <label htmlFor="state-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State
          </label>
          <select
            id="state-filter"
            value={filters.state}
            onChange={handleStateChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All States</option>
            {allStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label htmlFor="min-price-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Min Median Price ($k)
          </label>
          <input
            type="number"
            id="min-price-filter"
            placeholder="e.g., 150"
            value={filters.minPrice !== null ? filters.minPrice / 1000 : ''} // Display in thousands
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) * 1000 : null;
              onFilterChange({ minPrice: value });
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            min="0"
            step="10"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="max-price-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Median Price ($k)
          </label>
          <input
            type="number"
            id="max-price-filter"
            placeholder="e.g., 400"
            value={filters.maxPrice !== null ? filters.maxPrice / 1000 : ''} // Display in thousands
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value, 10) * 1000 : null;
              onFilterChange({ maxPrice: value });
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            min="0"
            step="10"
          />
        </div>

         {/* Max Airport Proximity Filter */}
        <div>
          <label htmlFor="max-airport-proximity-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Airport Proximity (min)
          </label>
          <input
            type="number"
            id="max-airport-proximity-filter"
            placeholder="e.g., 60"
            value={filters.maxAirportProximity !== null ? filters.maxAirportProximity : ''}
            onChange={handleMaxAirportProximityChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            min="0"
            step="5"
          />
        </div>

        {/* Focus Filters (Checkboxes) */}
        <div className="flex items-end space-x-4 col-span-1 lg:col-span-2">
           <div className="flex items-center">
            <input
              id="food-scene-filter"
              type="checkbox"
              checked={filters.foodSceneFocus}
              onChange={handleFoodSceneToggle}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="food-scene-filter" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Food Scene Focus
            </label>
          </div>
           <div className="flex items-center">
            <input
              id="recreation-filter"
              type="checkbox"
              checked={filters.recreationFocus}
              onChange={handleRecreationToggle}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="recreation-filter" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Recreation Focus
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FilterControls;
