'use client';

interface YearFilterProps {
  availableYears: string[];
  selectedYears: string[];
  toggleYear: (year: string) => void;
}

const YearFilter = ({ availableYears, selectedYears, toggleYear }: YearFilterProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Select years to show:</h3>
      <div className="flex flex-wrap gap-2">
        {availableYears.map(year => (
          <button
            key={year}
            onClick={() => toggleYear(year)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              selectedYears.includes(year)
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearFilter;