'use client';

interface SegmentStats {
  segmentId: number;
  segmentName: string;
  segmentDistance: number;
  activityType: string;
  efforts: {
    [year: string]: {
      bestTime: number;
      date: string;
      isPR: boolean;
    };
  };
  allTimeBest: {
    time: number;
    date: string;
  };
  komTime: number | null; //ddded KOM time
}

interface SegmentsTableProps {
  segmentStats: SegmentStats[];
  selectedYears: string[];
  formatDistance: (meters: number) => string;
  formatTime: (seconds: number) => string;
  onSegmentClick: (segment: SegmentStats) => void;
  showKom?: boolean;
}

const SegmentsTable = ({
  segmentStats,
  selectedYears,
  formatDistance,
  formatTime,
  onSegmentClick,
  showKom = false
}: SegmentsTableProps) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Segment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Distance
            </th>
            {selectedYears.map(year => (
              <th key={year} scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {year}
              </th>
            ))}
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              All-Time Best
            </th>
            {showKom && (
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                KOM
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {segmentStats.map((segment) => (
            <tr 
              key={segment.segmentId} 
              className="hover:bg-gray-50 cursor-pointer" 
              onClick={() => onSegmentClick(segment)}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                <a 
                  href={`https://www.strava.com/segments/${segment.segmentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 hover:underline flex items-center"
                  onClick={(e) => e.stopPropagation()} // Prevent row click when clicking link
                >
                  {segment.segmentName}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  segment.activityType === 'Ride' ? 'bg-orange-100 text-orange-800' : 
                  segment.activityType === 'Run' ? 'bg-green-100 text-green-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {segment.activityType}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDistance(segment.segmentDistance)}
              </td>
              {selectedYears.map(year => {
                const yearData = segment.efforts[year];
                const isPR = yearData && segment.allTimeBest.time === yearData.bestTime;
                
                return (
                  <td key={`${segment.segmentId}-${year}`} className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {yearData ? (
                      <div className={`font-medium ${isPR ? 'text-orange-500' : 'text-gray-900'}`}>
                        {formatTime(yearData.bestTime)}
                        {isPR && <span className="ml-1">★</span>}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                );
              })}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-orange-500">
                {formatTime(segment.allTimeBest.time)}
              </td>
              {showKom && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                  {segment.komTime ? (
                    <span className="text-green-600">{formatTime(segment.komTime)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              )}
            </tr>
          ))}
          
          {segmentStats.length === 0 && (
            <tr>
              <td colSpan={showKom ? selectedYears.length + 5 : selectedYears.length + 4} className="px-6 py-4 text-sm text-gray-500 text-center">
                No segment data available. Try completing some segments on Strava!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SegmentsTable;