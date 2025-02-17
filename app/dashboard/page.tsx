'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { refreshToken } from '@/utils/oauth';

interface AthleteData {
  firstname?: string;
  lastname?: string;
  profile?: string;
}

const DISTANCE_TO_MOON = 238900; //miles

const MoonProgressCircle = () => {
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalDistance = async () => {
      try {
        let accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          return;
        }

        //store athlete ID/Token
        let athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (athleteResponse.status === 401) { //handle error 401: token expired
          const refreshTokenStr = localStorage.getItem('strava_refresh_token');
          if (!refreshTokenStr) {
            throw new Error('No refresh token available');
          }

          const newTokenData = await refreshToken(refreshTokenStr);
          localStorage.setItem('strava_access_token', newTokenData.access_token);
          localStorage.setItem('strava_refresh_token', newTokenData.refresh_token);
          accessToken = newTokenData.access_token;
          
          //retry with new token. Only going to retry once to not overuse API calls
          athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
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
              'Authorization': `Bearer ${accessToken}` 
            }
          }
        );

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch athlete stats');
        }

        const stats = await statsResponse.json();
        const totalMiles = stats.all_ride_totals.distance * 0.000621371;  
        /* This converts total distance in meters to miles. 
        I was seeing about 1% discrepancy between my data on strava and display on the dashboard.
        Would like to see this be more accurate*/
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

  
  const progress = (totalDistance / DISTANCE_TO_MOON) * 100; //your progress divided by total distance in %
  
  
  const radius = 90;
  const circumference = 2 * Math.PI * radius; //there's gotta be a more concise way to do this lol
  const progressOffset = circumference - (progress / 100) * circumference;

  if (loading) {
    return <div className="w-96 h-96 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="w-96 h-96 flex items-center justify-center text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-96 h-96 flex items-center justify-center">
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="192"
          cy="192"
          r={radius}
          stroke="currentColor"
          strokeWidth="36"
          fill="transparent"
          className="text-orange-100"
        />
        {/* Progress circle */}
        <circle
          cx="192"
          cy="192"
          r={radius}
          stroke="currentColor"
          strokeWidth="36"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          className="text-[#FC4C02]"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-gray-800 mb-4">
          {progress.toFixed(2)}%
        </span>
      </div>
      {/* Bottom text */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="text-sm text-gray-600">
          <div>Ride to the moon progress:</div>
          <div>{Math.round(totalDistance).toLocaleString()}/{DISTANCE_TO_MOON.toLocaleString()} miles</div>  {/* show your progress over total distance */}
        </div>
      </div>
    </div>
  );
};


const MoonProgressDisplay = () => {
  return (
    <div className="bg-white rounded-lg">
      <MoonProgressCircle />
    </div>
  );
};

export default function Dashboard() {
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTokenFromHash = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        const match = hash.match(/access_token=([^&]+)/);
        return match ? match[1] : null;
      }
      return null;
    };

    const fetchAthleteData = async () => {
      try {
        let accessToken = getTokenFromHash();
        if (accessToken) {
          localStorage.setItem('strava_access_token', accessToken);
          window.location.hash = '';
        } else {
          accessToken = localStorage.getItem('strava_access_token');
        }

        if (!accessToken) {
          window.location.href = '/';
          return;
        }

        const response = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch athlete data');
        }

        const data = await response.json();
        setAthlete(data);
      } catch (error) {
        console.error('Error fetching athlete data:', error);
        localStorage.removeItem('strava_access_token');
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 to-white">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-[#FC4C02]">Strava Analytics</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-[#FC4C02] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/activities"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Activities
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {athlete && (
                <span className="text-gray-700">
                  Welcome, {athlete.firstname}!
                </span>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Dashboard</h2>
          {athlete && (
            <div className="space-y-6">
              <p className="text-gray-600">

              </p>
              <MoonProgressDisplay />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}