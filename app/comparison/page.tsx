'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { refreshToken } from '@/utils/oauth';
import Sidebar from '@/components/Sidebar';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define the structure of an activity object
interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  type: string;
}

export default function Activities() {
  // State variables
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity1, setSelectedActivity1] = useState<string>('');
  const [selectedActivity2, setSelectedActivity2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<Array<Record<string, number | null>>>([]);
  const [showGraph, setShowGraph] = useState(false);

  // Fetch activities when the component mounts
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        let accessToken = localStorage.getItem('strava_access_token');

        if (!accessToken) {
          setError('No access token found');
          window.location.href = '/';
          return;
        }

        const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 401) {
          const refreshTokenStr = localStorage.getItem('strava_refresh_token');
          if (!refreshTokenStr) throw new Error('No refresh token available');

          const newTokenData = await refreshToken(refreshTokenStr);
          localStorage.setItem('strava_access_token', newTokenData.access_token);
          localStorage.setItem('strava_refresh_token', newTokenData.refresh_token);
          accessToken = newTokenData.access_token;

          const retryResponse = await fetch('https://www.strava.com/api/v3/athlete/activities', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!retryResponse.ok) throw new Error('Failed to fetch activities');
          const retryData = await retryResponse.json();
          setActivities(retryData);
        } else if (!response.ok) {
          throw new Error('Failed to fetch activities');
        } else {
          const data = await response.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch activities');
        localStorage.removeItem('strava_access_token');
        localStorage.removeItem('strava_refresh_token');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Function to fetch activity stream data (including velocity_smooth)
  const fetchStreamData = async (activityId: string) => {
    let accessToken = localStorage.getItem('strava_access_token');
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=time,velocity_smooth&key_by_type=true`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch activity stream');
    }
    return response.json();
  };

  //handle comparison
  const handleCompare = async () => {
    if (!selectedActivity1 || !selectedActivity2) { //makes sure there are two activities
      alert('Please select two activities to compare.');
      return;
    }
    
  
    try {
      const [stream1, stream2] = await Promise.all([ //gets all data
        fetchStreamData(selectedActivity1),
        fetchStreamData(selectedActivity2),
      ]);
      
  
      const timeSeries1 = stream1.time.data; // Time in seconds
      const velocityData1 = stream1.velocity_smooth.data; // Smoothed velocity
      const timeSeries2 = stream2.time.data;
      const velocityData2 = stream2.velocity_smooth.data;
      
  
      //KM/min
      const speedData1 = velocityData1.map((velocity: number) =>(velocity * 60) / 1000);
      const speedData2 = velocityData2.map((velocity: number) =>(velocity * 60) / 1000);
  
      //gets every 5 minutes 
      const filterEveryFiveMinutes = (timeSeries: number[], speedData: (number | null)[]) => {
        const fiveMinInSeconds = 5 * 60;
        return timeSeries.reduce<{ time: number; speed: number | null }[]>((acc, time, index) => {
          if (time % fiveMinInSeconds === 0) { // || index === timeSeries.length - 1
            time = Math.round(time);
            acc.push({ time, speed: speedData[index] });
          }
          return acc;
        }, []);
      };
  
      const filteredData1 = filterEveryFiveMinutes(timeSeries1, speedData1);
      const filteredData2 = filterEveryFiveMinutes(timeSeries2, speedData2);
      const isActivity1Longer = filteredData1[filteredData1.length - 1]?.time >= filteredData2[filteredData2.length - 1]?.time;
      //above line checks which is longer cause we need the longer one to be the length of the graph
      // Assign names based on duration
      const longActivity = isActivity1Longer ? filteredData1 : filteredData2;
      const shortctivity = isActivity1Longer ? filteredData2 : filteredData1;
      //const name1 = stream1.name; ->eventually want to figure out how to get activity name
      const formattedData = longActivity.map((point, index) => ({
        time: Math.round(point.time / 60), // Convert to minutes
      
        [isActivity1Longer? 'Activity 1' : 'Activity 2']: point.speed,
        [isActivity1Longer? 'Activity 2' : 'Activity 1']: shortctivity[index]?.speed ||0 , //map the velocitys to the times
      }));
  
      setGraphData(formattedData);
      setShowGraph(true);
    } catch (error) {
      console.error('Error fetching stream data:', error);
      setError('Failed to fetch activity stream data');
    }
  };

 // const activityColors = ['#FC4C02', '#000000'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 ml-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Activities Comparison</h2>

        {/*dropdowns for selecting activities */}
        <div className="flex gap-[130px] mb-4">
          <h2 className="text-s text-gray-900 mb-4">Activity 1</h2>
          <h2 className="text-s text-gray-900 mb-4">Activity 2</h2>
        </div>
        
        <div className="flex gap-4 mb-6">
          <select
            className="p-2 border rounded text-[#FC4C02] cursor-pointer"
            value={selectedActivity1}
            onChange={(e) => setSelectedActivity1(e.target.value)}
          >
            <option value="">Select first activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 border rounded text-[#FC4C02] cursor-pointer"
            value={selectedActivity2}
            onChange={(e) => setSelectedActivity2(e.target.value)}
          >
            <option value="">Select second activity</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          {/*submit button*/}
          <button
            className="px-4 py-2 bg-[#FC4C02] text-white rounded hover:bg-[#e03e00] transition"
            onClick={handleCompare}
          >
            Compare
          </button>
        </div>

        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="max-h-[180px] overflow-y-auto">
            <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <li key={activity.id} className="bg-white p-4 shadow-md rounded-lg hover:shadow-lg transition">
                    <Link href={`/activities/${activity.id}`} className="block p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-[#FC4C02]">{activity.name}</h3>
                      <p className="text-gray-600 mt-2">
                        <span className="font-bold">{activity.type}</span> |{' '}
                        <span>{Math.round(activity.distance / 1000)} km</span> |{' '}
                        <span>{new Date(activity.start_date_local).toLocaleDateString()}</span>
                      </p>
                    </Link>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">No activities found.</p>
              )}
            </ul>
          </div>
        )}

        {/* Render Graph */}
        {showGraph && (
          <div className="mt-8 bg-white p-6 rounded shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Pace Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={graphData}>
                <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Speed (km/min)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {Object.keys(graphData[0] || {}).filter((key) => key !== 'time').map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={index === 0 ? "#000000" : "#FC4C02"} // black for first activity, orange for the other
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
