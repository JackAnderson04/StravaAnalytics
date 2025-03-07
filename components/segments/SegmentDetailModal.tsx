'use client';

import { useState } from 'react';

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
  komTime: number | null; // Added KOM time
}

interface SegmentModalProps {
  segment: SegmentStats | null;
  isOpen: boolean;
  onClose: () => void;
  formatTime: (seconds: number) => string;
  formatDistance: (meters: number) => string;
}

const SegmentDetailModal = ({
  segment,
  isOpen,
  onClose,
  formatTime,
  formatDistance
}: SegmentModalProps) => {
  if (!isOpen || !segment) return null;

  // Format date (YYYY-MM-DD)
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  // Sort years in descending order
  const sortedYears = Object.keys(segment.efforts).sort((a, b) => 
    parseInt(b) - parseInt(a)
  );

  // Calculate gap between Personal Record and KOM
  const prToKomGap = segment.komTime && segment.allTimeBest.time
    ? segment.allTimeBest.time - segment.komTime
    : null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{segment.segmentName}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 flex flex-wrap gap-4">
            <a 
              href={`https://www.strava.com/segments/${segment.segmentId}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
            >
              View on Strava
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                segment.activityType === 'Ride' ? 'bg-orange-100 text-orange-800' : 
                segment.activityType === 'Run' ? 'bg-green-100 text-green-800' : 
                'bg-blue-100 text-blue-800'
              }`}>
                {segment.activityType}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {formatDistance(segment.segmentDistance)}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Personal Record Card */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-orange-800 mb-2">Your Personal Record</h4>
              <div className="flex justify-between text-orange-700">
                <span className="text-2xl font-bold">{formatTime(segment.allTimeBest.time)}</span>
                <span>{formatDate(segment.allTimeBest.date)}</span>
              </div>
            </div>
            
            {/* KOM Card */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">Segment KOM</h4>
              <div className="flex justify-between text-green-700">
                <span className="text-2xl font-bold">
                  {segment.komTime ? formatTime(segment.komTime) : '-'}
                </span>
                {prToKomGap && prToKomGap > 0 && (
                  <span className="text-sm">
                    {`You're ${formatTime(prToKomGap)} behind`}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <h4 className="text-sm font-medium text-gray-700 mb-2">Year-by-Year Performance</h4>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Best Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PR</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedYears.map(year => {
                  const effort = segment.efforts[year];
                  const isPR = effort.bestTime === segment.allTimeBest.time;
                  
                  return (
                    <tr key={year} className={isPR ? 'bg-orange-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(effort.bestTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(effort.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isPR && (
                          <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">
                            PR
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {sortedYears.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                      No yearly data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentDetailModal;

