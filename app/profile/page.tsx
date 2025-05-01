'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

interface AthleteData {
  firstname: string;
  lastname: string;
  profile: string;
  bio?: string;
  follower_count: number;
}

interface ActivitySummary {
  name: string;
  type: string;
  distance: number;
}

export default function ProfilePage() {
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [stats, setStats] = useState({
    totalDistance: 0,
    activityCount: 0,
  });
  const [favoriteActivities, setFavoriteActivities] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStravaData = async () => {
      try {
        const accessToken = localStorage.getItem('strava_access_token');
        
        if (!accessToken) {
          setError('No Strava access token found. Please connect to Strava.');
          setLoading(false);
          return;
        }

        const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!athleteResponse.ok) {
          throw new Error('Failed to fetch athlete data');
        }

        const athleteData: AthleteData = await athleteResponse.json();
        setAthlete(athleteData);

        const activitiesResponse = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=100', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!activitiesResponse.ok) {
          throw new Error('Failed to fetch activities');
        }

        const activities: ActivitySummary[] = await activitiesResponse.json();
        
        const totalDistanceMeters = activities.reduce((sum, activity) => sum + activity.distance, 0);
        const totalDistanceKm = (totalDistanceMeters / 1000).toFixed(0);
        
        setStats({
          totalDistance: parseInt(totalDistanceKm),
          activityCount: activities.length,
        });
        
        const activityTypes = Array.from(new Set(activities.map(a => a.type)));
        
        const favorites = activityTypes
          .map(type => {
            const typeActivities = activities.filter(a => a.type === type);
            return typeActivities.sort((a, b) => b.distance - a.distance)[0];
          })
          .filter(Boolean)
          .slice(0, 3);

        setFavoriteActivities(favorites);
        
      } catch (error) {
        console.error('Error fetching Strava data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch Strava data');
      } finally {
        setLoading(false);
      }
    };

    fetchStravaData();
  }, []);

  const handleStravaConnect = () => {
    alert('This would redirect to Strava authorization page');
  };

  const getActivityEmoji = (type: string) => {
    const emojiMap: {[key: string]: string} = {
      'Ride': '🚴‍♂️',
      'Run': '🏃‍♂️',
      'Swim': '🏊‍♂️',
      'Hike': '🥾',
      'Walk': '🚶‍♂️',
      'AlpineSki': '⛷️',
      'Workout': '💪',
      'Yoga': '🧘‍♀️'
    };
    
    return emojiMap[type] || '🏆';
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return `${km.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 p-6 ml-20 flex items-center justify-center">
          <div className="text-xl text-gray-600">Loading Strava data...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 ml-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Profile</h2>

        {error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-500 mb-6">
            {error}
            <button 
              onClick={handleStravaConnect}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
            >
              Connect to Strava
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow flex items-center gap-6 mb-8">
              <img
                src={athlete?.profile || "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-orange-400"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {athlete ? `${athlete.firstname} ${athlete.lastname}` : 'Athlete Name'}
                </h3>
                <p className="text-gray-500">{athlete?.bio || 'Strava Athlete'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
                <h4 className="text-sm text-orange-600">Total Distance</h4>
                <p className="text-2xl font-bold text-orange-800 mt-1">{stats.totalDistance} km</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
                <h4 className="text-sm text-orange-600">Activities</h4>
                <p className="text-2xl font-bold text-orange-800 mt-1">{stats.activityCount}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
                <h4 className="text-sm text-orange-600">Followers</h4>
                <p className="text-2xl font-bold text-orange-800 mt-1">{athlete?.follower_count || 0}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Favorite Activities</h4>
              {favoriteActivities.length > 0 ? (
                <ul className="space-y-3">
                  {favoriteActivities.map((activity, index) => (
                    <li key={index} className="text-gray-700">
                      {getActivityEmoji(activity.type)} {activity.name} - {formatDistance(activity.distance)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No activities found</p>
              )}
            </div>
          </>
        )}

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">Want to refresh your data?</p>
          <button 
            onClick={handleStravaConnect}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg"
          >
            🔄 Connect to Strava
          </button>
        </div>
      </main>
    </div>
  );
}