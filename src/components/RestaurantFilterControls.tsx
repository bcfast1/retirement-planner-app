'use client';

import React, { useState, useEffect } from 'react';

interface RestaurantFilterControlsProps {
  allTypes: string[];
  selectedTypes: string[];
  onFilterChange: (selectedTypes: string[]) => void;
}

const RestaurantFilterControls: React.FC<RestaurantFilterControlsProps> = ({
  allTypes,
  selectedTypes,
  onFilterChange,
}) => {
  const [showAll, setShowAll] = useState(true);

  // Handle individual checkbox change
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    let newSelectedTypes: string[];

    if (checked) {
      newSelectedTypes = [...selectedTypes, value];
    } else {
      newSelectedTypes = selectedTypes.filter(type => type !== value);
    }

    // Update parent state
    onFilterChange(newSelectedTypes);
    // Uncheck "All" if any individual box is unchecked
    setShowAll(newSelectedTypes.length === allTypes.length);
  };

  // Handle "All" checkbox change
  const handleShowAllChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setShowAll(checked);
    if (checked) {
      onFilterChange(allTypes); // Select all types
    } else {
      onFilterChange([]); // Deselect all types
    }
  };

  // Effect to handle initial state or changes from parent
  useEffect(() => {
    setShowAll(selectedTypes.length === 0 || selectedTypes.length === allTypes.length);
  }, [selectedTypes, allTypes]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Filter Food Scene Places:</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {/* "All" Checkbox */}
        <div>
          <input
            type="checkbox"
            id="type-all"
            name="type-all"
            checked={showAll}
            onChange={handleShowAllChange}
            className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="type-all" className="text-sm font-medium text-gray-900 dark:text-gray-300">
            All Types
          </label>
        </div>

        {/* Individual Type Checkboxes */}
        {allTypes.sort().map(type => (
          <div key={type}>
            <input
              type="checkbox"
              id={`type-${type}`}
              name="restaurant-type"
              value={type}
              checked={selectedTypes.includes(type)}
              onChange={handleCheckboxChange}
              className="mr-2 rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor={`type-${type}`} className="text-sm font-medium text-gray-900 dark:text-gray-300">
              {type}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantFilterControls;
