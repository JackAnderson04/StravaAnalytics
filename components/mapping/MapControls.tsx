'use client';

interface MapControlsProps {
  //isAnalysisStarted: boolean;
  onStartAnalysis: () => void;
  maxActivities: number;
  onMaxActivitiesChange: (value: number) => void;
  radius: number;
  onRadiusChange: (value: number) => void;
  coverage: number | null;
}

const MapControls = ({
  //isAnalysisStarted,
  onStartAnalysis,
  maxActivities,
  onMaxActivitiesChange,
  radius,
  onRadiusChange,
  coverage
}: MapControlsProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Radius Slider */}
        <div>
          <label htmlFor="radius-slider" className="block text-sm font-medium text-gray-700 mb-2">
            Radius: {radius} miles
          </label>
          <input
            id="radius-slider"
            type="range"
            min="1"
            max="20"
            step="1"
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FC4C02 ${radius * 4.5}%, #ddd ${radius * 5}%)`, 
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Select a radius to analyze (1-20 miles)
          </p>
        </div>

        {/* Activity Limit Slider */}
        <div>
          <label htmlFor="activity-slider" className="block text-sm font-medium text-gray-700 mb-2">
            Max Activities: {maxActivities}
          </label>
          <input
            id="activity-slider"
            type="range"
            min="10"
            max="500"
            step="10"
            value={maxActivities}
            onChange={(e) => onMaxActivitiesChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FC4C02 ${(maxActivities - 10) / 490 * 100}%, #ddd ${(maxActivities - 10) / 490 * 100}%)`,
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Limit the number of activities to analyze (affects API usage)
          </p>
        </div>

        {/* Analysis Button */}
        <div className="flex flex-col items-center justify-center">
          <button
            onClick={onStartAnalysis}
            className="px-4 py-2 rounded-md text-white font-medium bg-[#FC4C02] hover:bg-[#FC4C02] hover:opacity-80"
          >
            Start Analysis
          </button>
          
          <p className="text-xs text-gray-500 mt-1">
            First click on the map to select a center point
          </p>

          {coverage !== null && (
            <div className="mt-3 text-center">
              <div className="text-lg font-bold">
                Coverage: {coverage}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, coverage)}%`, backgroundColor: "#FC4C02" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapControls;