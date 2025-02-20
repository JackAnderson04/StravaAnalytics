'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { refreshToken } from '@/utils/oauth';

// define the structure of an activity object
interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  type: string;
}

export default function Activities() {
  // state variables to store activities, loading status, and errors
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch activities when the component mounts
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // retrieve access token from local storage
        let accessToken = localStorage.getItem('strava_access_token');

        // redirect to home if no token is found
        if (!accessToken) {
          setError('No access token found');
          window.location.href = '/';
          return;
        }

        // fetch activities from api
        const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        // if token is expired 401 error - refresh it
        if (response.status === 401) {
          const refreshTokenStr = localStorage.getItem('strava_refresh_token');
          if (!refreshTokenStr) throw new Error('No refresh token available');

          // request a new access token
          const newTokenData = await refreshToken(refreshTokenStr);
          localStorage.setItem('strava_access_token', newTokenData.access_token);
          localStorage.setItem('strava_refresh_token', newTokenData.refresh_token);
          accessToken = newTokenData.access_token;

          // retry fetching activities with new token
          const retryResponse = await fetch('https://www.strava.com/api/v3/athlete/activities', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });

          if (!retryResponse.ok) throw new Error('Failed to fetch activities');
          const retryData = await retryResponse.json();
          setActivities(retryData);
        } else if (!response.ok) {
          throw new Error('Failed to fetch activities');
        } else {
          // successfully fetched activities
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch activities');

        // remove invalid tokens from local storage
        localStorage.removeItem('strava_access_token');
        localStorage.removeItem('strava_refresh_token');
      } finally {
        setLoading(false); // mark loading as complete
      }
    };

    fetchActivities();
  }, []);

  // show loading indicator while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-300 to-white">
      {/* Navigation Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-[#FC4C02]">Strava Activities</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/activities" className="border-[#FC4C02] text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Activities
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Activities</h2>

          {/* Display error message if any */}
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <ul className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <li key={activity.id} className="bg-white p-4 shadow rounded-md">
                    {/* Make each activity clickable */}
                    <Link href={`/activities/${activity.id}`} className="block hover:bg-gray-100 p-4 rounded-lg transition">
                      <h3 className="text-lg font-semibold text-indigo-700">{activity.name}</h3>
                      <p className="text-gray-600">
                        {activity.type} | {Math.round(activity.distance / 1000)} km | {new Date(activity.start_date_local).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No activities found.</p>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
