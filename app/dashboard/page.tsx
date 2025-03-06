'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar'; // Import the Sidebar component

// Define the structure of Athlete data
interface Activity {
  id: number;
  name: string;
  distance: number; // distance in kilometers
  type: string;
}


// Distance to the moon in miles
const DISTANCE_TO_MOON = 238900; 

/**
 * Component to display a circular progress bar showing the progress towards the moon
 */
const MoonProgressCircle = () => {
  const [totalDistance, setTotalDistance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTotalDistance = async () => {
      try {
        const accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          return;
        }

        // Store athlete ID/Token
        const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!athleteResponse.ok) throw new Error('Failed to fetch athlete data');

        const athleteData = await athleteResponse.json();
        const statsResponse = await fetch(
          `https://www.strava.com/api/v3/athletes/${athleteData.id}/stats`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!statsResponse.ok) throw new Error('Failed to fetch athlete stats');

        const stats = await statsResponse.json();
        const totalMiles = stats.all_ride_totals.distance * 0.000621371; // Convert meters to miles
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

  if (loading) return <div className="w-96 h-96 flex items-center justify-center">Loading...</div>;

  if (error) {
    return (
      <div className="w-96 h-96 flex items-center justify-center text-red-500 text-center">
        {error}
      </div>
    );
  }

  const progress = (totalDistance / DISTANCE_TO_MOON) * 100; // Calculate progress percentage
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-gray-800 mb-4">{progress.toFixed(2)}%</span>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <div className="text-sm text-gray-600">
          <div>Ride to the moon progress:</div>
          <div>
            {Math.round(totalDistance).toLocaleString()}/{DISTANCE_TO_MOON.toLocaleString()} miles
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Displays the progress circle within a container
 */
const MoonProgressDisplay = () => (
  <div className="bg-white rounded-lg">
    <MoonProgressCircle />
  </div>
);

/**
 * Component to fetch and display top activities (Rides, Runs, Swims)
 */
const TopActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          return;
        }

        const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch activities');

        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <div>Loading top activities...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const ActivityList = ({ title, activities }: { title: string; activities: Activity[] }) => (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      <ul className="space-y-4">
        {activities.map((activity, index) => (
          <li key={index} className="bg-white p-4 shadow rounded-md">
            <Link href={`/activities/${activity.id}`} className="block hover:bg-gray-100 p-4 rounded-lg transition">
              <h3 className="text-lg font-semibold text-indigo-700">{activity.name}</h3>
              <p className="text-gray-600">{activity.type} | {activity.distance} km</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  // Filter top 3 activities by type
  const topRides = activities.filter((activity) => activity.type === 'Ride').slice(0, 3);
  const topRuns = activities.filter((activity) => activity.type === 'Run').slice(0, 3);
  const topSwims = activities.filter((activity) => activity.type === 'Swim').slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <ActivityList title="Top 3 Rides" activities={topRides} />
      <ActivityList title="Top 3 Runs" activities={topRuns} />
      <ActivityList title="Top 3 Swims" activities={topSwims} />
    </div>
  );
};

/**
 * Main Dashboard component that displays sidebar, moon progress, and top activities
 */
export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 ml-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Dashboard</h2>
        <MoonProgressDisplay />
        <TopActivities />
      </main>
    </div>
  );
}
