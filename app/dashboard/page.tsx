'use client';

import { useEffect, useState } from 'react';
import { refreshToken } from '@/utils/oauth';
import Sidebar from '@/components/Sidebar';



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



interface Activity {
  name: string;
  distance: number; // distance in meters (will convert to miles)
  type: string;
}

const TopActivities = () => {
  const [topRides, setTopRides] = useState<{ name: string; distance: number }[]>([]);
  const [topRuns, setTopRuns] = useState<{ name: string; distance: number }[]>([]);
  const [topSwims, setTopSwims] = useState<{ name: string; distance: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopActivities = async () => {
      try {
        const accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          return;
        }

        const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch activities');
        }

        const activities: Activity[] = await activitiesResponse.json();

        const rides = activities
          .filter((activity) => activity.type === 'Ride')
          .map((ride) => ({
            name: ride.name,
            distance: ride.distance * 0.000621371,
          }))
          .sort((a: { distance: number }, b: { distance: number }) => b.distance - a.distance)
          .slice(0, 3);

        const runs = activities
          .filter((activity) => activity.type === 'Run')
          .map((run) => ({
            name: run.name,
            distance: run.distance * 0.000621371,
          }))
          .sort((a: { distance: number }, b: { distance: number }) => b.distance - a.distance)
          .slice(0, 3);

        const swims = activities
          .filter((activity) => activity.type === 'Swim')
          .map((swim) => ({
            name: swim.name,
            distance: swim.distance * 0.000621371,
          }))
          .sort((a: { distance: number }, b: { distance: number }) => b.distance - a.distance)
          .slice(0, 3);

        setTopRides(rides);
        setTopRuns(runs);
        setTopSwims(swims);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchTopActivities();
  }, []);

  if (loading) {
    return <div>Loading top activities...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const ActivityList = ({
    title,
    activities,
  }: {
    title: string;
    activities: { name: string; distance: number }[];
  }) => (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
      <ul className="space-y-4">
        {activities.map((activity, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition duration-300"
          >
            <div className="flex items-center">
              <span
                className="text-lg font-bold bg-[#FC4C02] text-white rounded-full h-8 w-8 flex items-center justify-center mr-4"
              >
                {index + 1}
              </span>
              <div>
                <p className="text-gray-800 font-semibold">{activity.name}</p>
                <p className="text-sm text-gray-500">
                  Distance: {activity.distance.toFixed(2)} miles
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 grid grid-cols-3 gap-6">
      <ActivityList title="Top 3 Rides" activities={topRides} />
      <ActivityList title="Top 3 Runs" activities={topRuns} />
      <ActivityList title="Top 3 Swims" activities={topSwims} />
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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      
      <main className="flex-1 p-6 ml-20">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search activities..."
              className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400
                         text-orange-500 placeholder:text-orange-300 bg-white"
            />
            <span className="absolute left-3 top-2 text-orange-400">🔍</span>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Dashboard</h2>
        
        <div className="space-y-6">
          <MoonProgressDisplay />
          <TopActivities />

        </div>
      </main>
    </div>
  );
}
