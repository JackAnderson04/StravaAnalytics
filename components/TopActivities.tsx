
'use client';


import { useEffect, useState } from 'react';


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

export default TopActivities;