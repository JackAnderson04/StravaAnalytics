
'use client';
import { useEffect, useState } from 'react';
import { refreshToken } from '@/utils/oauth';

// New progress bar component
const ProgressBottomBar = () => {
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const US_DISTANCE = 2800; // miles across the US
  const MILWAUKEE_TO_MADISON = 79.2; // miles from Milwaukee to Madison

  // Track how many times each distance has been completed
  const [usCompletionCount, setUsCompletionCount] = useState<number>(0);
  const [madisonCompletionCount, setMadisonCompletionCount] = useState<number>(0);

  useEffect(() => {
    const fetchTotalDistance = async () => {
      try {
        let accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          return;
        }

        let athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
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

          athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
        }

        if (!athleteResponse.ok) {
          throw new Error('Failed to fetch athlete data');
        }

        const athleteData = await athleteResponse.json();
        const statsResponse = await fetch(
          `https://www.strava.com/api/v3/athletes/${athleteData.id}/stats`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch athlete stats');
        }

        const stats = await statsResponse.json();
        const totalMiles = stats.all_ride_totals.distance * 0.000621371;
        setTotalDistance(totalMiles);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchTotalDistance();
  }, []);

  // Calculate progress for each distance and cap at 100%
  const progressUS = Math.min((totalDistance / US_DISTANCE) * 100, 100);
  const progressMilwaukeeToMadison = Math.min((totalDistance / MILWAUKEE_TO_MADISON) * 100, 100);

  // Update completion count only when totalDistance changes
  useEffect(() => {
    if (totalDistance > 0) {
      setUsCompletionCount(Math.floor(totalDistance / US_DISTANCE));
      setMadisonCompletionCount(Math.floor(totalDistance / MILWAUKEE_TO_MADISON));
    }
  }, [totalDistance]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Function to render markers at specific percentage points of the bar (25%, 50%, 75%, 100%)
  const renderProgressMarkers = (totalProgress: number) => {
    const markers = [25, 50, 75, 100]; // Markers at 25%, 50%, 75%, and 100%
    return markers.map((marker) => {
      const position = (marker / 100) * totalProgress; // Calculate position for each marker
      return (
        <div
          key={marker}
          className="absolute top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full"
          style={{
            left: `${position}%`,
          }}
        />
      );
    });
  };

  return (
    <div className="relative w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-[#FC4C02] h-4 rounded-full"
        style={{ width: `${progressUS}%` }}
      />
      {/* Render the progress markers */}
      {renderProgressMarkers(progressUS)}

      <div className="mt-2 text-sm text-center">
        <p>{`Distance across the US (2,800 miles): ${progressUS.toFixed(2)}% completed`}</p>
        {progressUS === 100 && ` (${usCompletionCount}x)`}
        
        <p>{`Distance from Milwaukee to Madison (79.2 miles): ${progressMilwaukeeToMadison.toFixed(2)}% completed`}</p>
        {progressMilwaukeeToMadison === 100 && ` (${madisonCompletionCount}x)`}
      </div>
    </div>
  );
};

export default ProgressBottomBar;