'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';


// define the structure of an ActivityDetails object
interface ActivityDetails {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  type: string;
  start_date_local: string;
  average_speed: number;
  total_elevation_gain: number;
}

export default function ActivityDetailsPage() {
  const { id } = useParams(); // get activity id from the url
  const [activity, setActivity] = useState<ActivityDetails | null>(null); // store activity details
  const [loading, setLoading] = useState(true); // track loading
  const [error, setError] = useState<string | null>(null); // track errors


  // fetch activity details when the component mounts or when id changes
  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
         // retrieve access token from local storage
        const accessToken = localStorage.getItem('strava_access_token');
        
        // redirect to home if no token is found
        if (!accessToken) {
          setError('No access token found');
          window.location.href = '/';
          return;
        }


        // fetch specific activity details using the id
        const response = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!response.ok) throw new Error('Failed to fetch activity details');
        
         // parse and store the activity data
        const data = await response.json();
        setActivity(data);
      } catch (error) {
        console.error('Error fetching activity:', error);
        setError('Failed to load activity details.');
      } finally {
        setLoading(false); // mark loading as complete
      }
    };

    fetchActivityDetails();
  }, [id]); // re-run effect if the id changes


  // show loading 
  if (loading) return <div className="text-center">Loading...</div>;
  // shor error
  if (error) return <div className="text-center text-red-500">{error}</div>;

  // case where activity data is not yet available
  if (!activity) return <div className="text-center">Loading activity details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{activity?.name}</h1>
      <p>
        {activity?.type} - {activity?.distance ? Math.round(activity.distance / 1000) : "N/A"} km
      </p>
      <p>Elevation Gain: {activity?.total_elevation_gain ?? "N/A"} meters</p>
      <p>Average Speed: {activity?.average_speed ? activity.average_speed.toFixed(2) : "N/A"} m/s</p>
    </div>
  );
}
