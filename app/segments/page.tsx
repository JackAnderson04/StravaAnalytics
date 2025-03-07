'use client';

import { useState, useEffect } from 'react';
import { refreshToken } from '../../utils/oauth';
import Sidebar from '../../components/Sidebar';
import SegmentDetailModal from '../../components/segments/SegmentDetailModal';
import YearFilter from '../../components/segments/YearFilter';
import SegmentsTable from '../../components/segments/SegmentsTable';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';
import { formatTime, formatDistance } from '../../utils/formatters';
interface AthleteData {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  profile: string;
  profile_medium: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
}


interface SegmentEffortData {
  id: number;
  segment: {
    id: number;
    name: string;
    distance: number;
  };
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  average_watts: number;
  average_heartrate: number;
  max_heartrate: number;
  pr_rank: number | null;
}

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

// Helper functions can be moved to utils
export const formatTime = (seconds: number) => {
  if (seconds === Number.MAX_VALUE || seconds === null) return "-";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatDistance = (meters: number) => {
  // Convert to miles instead of kilometers
  const miles = meters * 0.000621371;
  if (miles >= 0.1) {
    return `${miles.toFixed(1)} mi`;
  }
  // For very short segments, show feet
  const feet = meters * 3.28084;
  return `${Math.round(feet)} ft`;
};

export default function SegmentsPage() {
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [segmentStats, setSegmentStats] = useState<SegmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState<string[]>(['2024', '2023', '2022']);
  const availableYears = ['2025', '2024', '2023', '2022'];
  const [selectedSegment, setSelectedSegment] = useState<SegmentStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSegments, setTotalSegments] = useState(0);
  const segmentsPerPage = 15;


  const toggleYear = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };

  const processSegmentEfforts = (
    segmentEfforts: SegmentEffortData[], 
    activityType: string, 
    segmentMap: Map<number, SegmentStats>
  ) => {
    for (const effort of segmentEfforts) {
      const segmentId = effort.segment.id;
      const effortDate = new Date(effort.start_date);
      const year = effortDate.getFullYear().toString();
      
      let segmentStat = segmentMap.get(segmentId);
      if (!segmentStat) {
        segmentStat = {
          segmentId,
          segmentName: effort.segment.name,
          segmentDistance: effort.segment.distance,
          activityType: activityType || 'Ride',
          efforts: {},
          allTimeBest: {
            time: Number.MAX_VALUE,
            date: ''
          },
          komTime: null
        };
        segmentMap.set(segmentId, segmentStat);
      }
      if (!segmentStat.efforts[year]) {
        segmentStat.efforts[year] = {
          bestTime: Number.MAX_VALUE,
          date: '',
          isPR: false
        };
      }
      if (effort.elapsed_time < segmentStat.efforts[year].bestTime) {
        segmentStat.efforts[year] = {
          bestTime: effort.elapsed_time,
          date: effort.start_date,
          isPR: !!effort.pr_rank
        };
      }
      if (effort.elapsed_time < segmentStat.allTimeBest.time) {
        segmentStat.allTimeBest = {
          time: effort.elapsed_time,
          date: effort.start_date
        };
      }
    }
  };

  const fetchKomTimes = async (
    segmentIds: number[], 
    accessToken: string,
    segmentMap: Map<number, SegmentStats>
  ) => {
    try {
      const batchSize = 5; 
      const limitedSegmentIds = segmentIds.slice(0, 15); 
      
      console.log(`Fetching KOM times for ${limitedSegmentIds.length} segments of ${segmentIds.length} total`);
      
      for (let i = 0; i < limitedSegmentIds.length; i += batchSize) {
        const batch = limitedSegmentIds.slice(i, i + batchSize);
        
        //process segments one by one instead of in parallel to reduce API load
        for (const segmentId of batch) {
          try {

            const leaderboardResponse = await fetch(
              `https://www.strava.com/api/v3/segments/${segmentId}/leaderboard?per_page=1&page=1`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`
                }
              }
            );
            
            if (!leaderboardResponse.ok) {
              console.warn(`Failed to fetch leaderboard for segment ${segmentId}`);
              continue;
            }
            
            const leaderboard = await leaderboardResponse.json();
            
            const komTime = leaderboard.entries && leaderboard.entries.length > 0 
              ? leaderboard.entries[0].elapsed_time 
              : null;
            
            const segmentStat = segmentMap.get(segmentId);
            if (segmentStat) {
              segmentStat.komTime = komTime;
              segmentMap.set(segmentId, segmentStat);
              console.log(`KOM time for ${segmentStat.segmentName}: ${formatTime(komTime || 0)}`);
            }
          
            await new Promise(resolve => setTimeout(resolve, 300));
            
          } catch (error) {
            console.error(`Error fetching data for segment ${segmentId}:`, error);
          }
        }
        

        if (i + batchSize < limitedSegmentIds.length) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    } catch (error) {
      console.error('Error fetching KOM times:', error);
    }
  };

  useEffect(() => {
    const fetchSegmentData = async () => {
      try {
        let accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          setLoading(false);
          return;
        }
        const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (athleteResponse.status === 401) {
          const refreshTokenStr = localStorage.getItem('strava_refresh_token');
          if (!refreshTokenStr) {
            throw new Error('No refresh token available');
          }

          const newTokenData = await refreshToken(refreshTokenStr);
          localStorage.setItem('strava_access_token', newTokenData.access_token);
          localStorage.setItem('strava_refresh_token', newTokenData.refresh_token);
          accessToken = newTokenData.access_token;
        }

        if (!athleteResponse.ok) {
          throw new Error('Failed to fetch athlete data');
        }

        const athleteData = await athleteResponse.json();
        setAthlete(athleteData);
        const activitiesResponse = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?per_page=${segmentsPerPage}&page=${currentPage}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
        
        if (!activitiesResponse.ok) {
          throw new Error(`Failed to fetch activities page ${currentPage}`);
        }
        
        const activities = await activitiesResponse.json();
        
        setTotalSegments(activities.length > 0 ? activities.length * 3 : 0); //Estimate total for pagination
        
        console.log("Pagination debug:", {
          activitiesCount: activities.length,
          currentPage,
          estimatedTotal: activities.length * 3
        });

        const segmentMap: Map<number, SegmentStats> = new Map();
  
        for (const activity of activities) {
          if (!activity.id) continue;
          const activityDetailResponse = await fetch(
            `https://www.strava.com/api/v3/activities/${activity.id}?include_all_efforts=true`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );
          
          if (!activityDetailResponse.ok) continue;
          
          const activityDetail = await activityDetailResponse.json();
          
          if (activityDetail.segment_efforts && activityDetail.segment_efforts.length > 0) {
            processSegmentEfforts(
              activityDetail.segment_efforts, 
              activity.type, 
              segmentMap
            );
          }
        }
        
        const segmentIds = Array.from(segmentMap.keys());
        
        await fetchKomTimes(segmentIds, accessToken, segmentMap);
        
        setSegmentStats(Array.from(segmentMap.values()));
      } catch (error) {
        console.error('Error fetching segment data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch segment data');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchSegmentData();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-20">
          <LoadingSpinner message="Loading segment data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 ml-20">
          <ErrorDisplay error={error} returnUrl="/" />
        </div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20 p-6">
        <main className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Segment Performance</h2>
            
            {athlete && (
              <p className="text-gray-600 mb-6">
                Welcome, {athlete.firstname}! View your performance across different segments and years.
                Personal records are highlighted in orange.
              </p>
            )}
            
            {/* Year filter component */}
            <YearFilter 
              availableYears={availableYears}
              selectedYears={selectedYears}
              toggleYear={toggleYear}
            />
            
            {/* Segments table component */}
            <SegmentsTable 
              segmentStats={segmentStats}
              selectedYears={selectedYears}
              formatDistance={formatDistance}
              formatTime={formatTime}
              onSegmentClick={(segment) => {
                setSelectedSegment(segment);
                setIsModalOpen(true);
              }}
              showKom={true}
            />
            
            {/* Pagination component */}
            {totalSegments > segmentsPerPage && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalItems={totalSegments}
                  itemsPerPage={segmentsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </main>

        {/* Segment detail modal */}
        <SegmentDetailModal 
          segment={selectedSegment}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formatTime={formatTime}
          formatDistance={formatDistance}
        />
      </div>
    </div>
  );
}