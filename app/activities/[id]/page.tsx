'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Define the structure of an ActivityDetails object
interface ActivityDetails {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  type: string;
  start_date_local: string;
  average_speed: number;
  total_elevation_gain: number;
  photos?: { primary: { urls: { [key: string]: string } } }; // Optional photos structure
}

export default function ActivityDetailsPage() {
  const { id } = useParams(); // Get activity id from the URL
  const [activity, setActivity] = useState<ActivityDetails | null>(null); // Store activity details
  const [loading, setLoading] = useState(true); // Track loading
  const [error, setError] = useState<string | null>(null); // Track errors

  // Fetch activity details when the component mounts or when id changes
  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        // Retrieve access token from local storage
        const accessToken = localStorage.getItem('strava_access_token');

        // Redirect to home if no token is found
        if (!accessToken) {
          setError('No access token found');
          window.location.href = '/';
          return;
        }

        // Fetch specific activity details using the id
        const response = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch activity details');

        // Parse and store the activity data
        const data = await response.json();
        setActivity(data);
      } catch (error: any) {
        console.error('Error fetching activity:', error.message);
        setError('Failed to load activity details.');
      } finally {
        setLoading(false); // Mark loading as complete
      }
    };

    fetchActivityDetails();
  }, [id]); // Re-run effect if the id changes

  // Show loading
  if (loading) return <div className="text-center">Loading...</div>;

  // Show error
  if (error) return <div className="text-center text-red-500">{error}</div>;

  // Case where activity data is not yet available
  if (!activity) return <div className="text-center">Loading activity details...</div>;

  // Extract photo URL if available
  const photoUrl = activity.photos?.primary?.urls["600"]; // Use string "600" directly as the index

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{activity?.name}</h1>
      <p>
        {activity?.type} - {activity?.distance ? Math.round(activity.distance / 1000) : 'N/A'} km
      </p>
      <p>Elevation Gain: {activity?.total_elevation_gain ?? 'N/A'} meters</p>
      <p>Average Speed: {activity?.average_speed ? activity.average_speed.toFixed(2) : 'N/A'} m/s</p>
      {photoUrl && (
        <div className="mt-6">
          <img src={photoUrl} alt={`${activity.name} photo`} className="rounded-lg shadow-lg" />
        </div>
      )}
    </div>
  );
}
