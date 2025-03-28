'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { refreshToken } from '@/utils/oauth';
import Sidebar from '@/components/Sidebar';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Activity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  start_date_local: string;
  type: string;
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity1, setSelectedActivity1] = useState<string>('');
  const [selectedActivity2, setSelectedActivity2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<Array<Record<string, number | null>>>([]);
  const [showGraph, setShowGraph] = useState(false);


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

        if (response.status === 401) { //no refresh token
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

  //get data 
  const fetchStreamData = async (activityId: string) => {
    try {
      const accessToken = localStorage.getItem('strava_access_token');
  
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }
  
      const response = await fetch(
        `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=time,velocity_smooth&key_by_type=true`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
  
      if (response.status === 401) {
        throw new Error('Unauthorized: Token may have expired. Try logging in again.');
      }
  
      if (response.status === 404) { //this is me trying to figure out how to work with activities that don't have data (idk if this works (i don't think it does but it doesn't break it so yolo))
        console.warn(`Stream data not found for activity ${activityId}. Returning default data.`);
        return {
          velocity_smooth: { data: [] }, //empty velocity data
          missingVelocity: true, //boolean for checking if it is missing the data (try to see if you can get it removed from dropdown)
          time: { data: [] }, //time data
        };
      }
  
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      //again trying to figure out same problem as above
      if (!data.velocity_smooth || !data.velocity_smooth.data) {
        console.warn(`No velocity data found for activity ${activityId}. All velocity data will be set to 0.`);
        return {
          velocity_smooth: { data: [] }, // Empty velocity data
          missingVelocity: true, // Indicating that velocity data is missing
          time: { data: [] },
        };
      }
  
      return {
        velocity_smooth: data.velocity_smooth,
        missingVelocity: false, //velocity exists! 
        time: data.time,
      };
    } catch (error) {
      console.error(`Error fetching stream data for activity ${activityId}:`, error);
      return {
        velocity_smooth: { data: [] }, // Empty velocity data
        missingVelocity: true, // Indicating that velocity data is missing
        time: { data: [] },
      };
    }
  };
  

  //handle comparison
  const handleCompare = async () => { //need to select 2 activities
    if (!selectedActivity1 || !selectedActivity2) {
      alert('Please select two activities to compare.');
      return;
    }
  
    try { //get the data
      const [stream1, stream2] = await Promise.all([
        fetchStreamData(selectedActivity1),
        fetchStreamData(selectedActivity2),
      ]);
  
      // if 1 or both are missing velocity (handles one at a time, I don't think it would be actually better to check both at the same time)
      if (stream1.missingVelocity) {
        alert('Activity 1 is missing real time data, please select a different activity');
        return;
      }
      if (stream2.missingVelocity) {
        alert('Activity 2 is missing real time data, please select a different activity');
        return;
      }
  
      const timeSeries1 = stream1.time.data; // Time in seconds
      const velocityData1 = stream1.velocity_smooth.data; // Smoothed velocity
      const timeSeries2 = stream2.time.data;
      const velocityData2 = stream2.velocity_smooth.data;

  
      // Convert velocity data to speed (km/min)
      const speedData1 = velocityData1.map((velocity: number) => (velocity * 60) / 1000);
      const speedData2 = velocityData2.map((velocity: number) => (velocity * 60) / 1000);
  
      const filterTimeSeries = (timeSeries: number[], speedData: (number | null)[], totalTime: number) => {
        let intervalInSeconds = 5 * 60; // Default to 5-minute intervals (for super long activities it auto changes)
      
        // For really short activities, change the interval
        if (totalTime < 600) {
          intervalInSeconds = 30; // If it's less than 10 minutes, use 30-second intervals
        }
      
        let firstPointAdded = false; //for some reason the 0 data point started showing multiple times an I've no idea why
      
        return timeSeries.reduce<{ time: number; speed: number | null }[]>((acc, time, index) => {
          if ((time % intervalInSeconds === 0 &&(time !=0 ||!firstPointAdded)) || index === timeSeries.length - 1) {
            time = Math.round(time);
            acc.push({ time, speed: speedData[index] });
            firstPointAdded = true; // Mark that the first point is added
          }
      
          return acc;
        }, []);
      };
  
      const filteredData1 = filterTimeSeries(timeSeries1, speedData1, timeSeries1.length-1);
      const filteredData2 = filterTimeSeries(timeSeries2, speedData2,timeSeries2.length-1);
      const isActivity1Longer = filteredData1[filteredData1.length - 1]?.time >= filteredData2[filteredData2.length - 1]?.time;//check which is longer
  
      //this section is to make the longer activity the base of the graph
      const longActivity = isActivity1Longer ? filteredData1 : filteredData2;
      const shortActivity = isActivity1Longer ? filteredData2 : filteredData1;
  
      const formattedData = longActivity.map((point, index) => ({
        time: Math.round((point.time / 60)*100)/100, //Convert to minutes + 2 decimals (needed for v short things)
        [isActivity1Longer ? (activities.find(a => a.id === parseInt(selectedActivity1))?.name || 'Activity 1') : (activities.find(a => a.id === parseInt(selectedActivity2))?.name || 'Activity 2')]: point.speed,
        [isActivity1Longer ? (activities.find(a => a.id === parseInt(selectedActivity2))?.name || 'Activity 2') : (activities.find(a => a.id === parseInt(selectedActivity1))?.name || 'Activity 1')]: shortActivity[index]?.speed || 0,
      }));
  
      setGraphData(formattedData);
      setShowGraph(true);
    } catch (error) {
      console.error('Error fetching stream data:', error);
      setError('Failed to fetch activity stream data');
    }
  };

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
        <h3 className="text-xs text-gray-900 mb-4">Please select two activities you would like to compare</h3>

        {/*drop downs*/}
        <div className="flex gap-[130px] mb-0">
          <h2 className="text-s font-semibold text-gray-900 mb-0">Activity 1</h2>
          <h2 className="text-s font-semibold text-gray-900 mb-0">Activity 2</h2>
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

          {/* Submit button */}
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
          <div className="max-h-[180px] bg-white shadow-md rounded overflow-y-auto">
            <h2 className="text-2xl font-semibold text-gray-900 px-4 mt-4">Your Activities:</h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4 mt-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <li key={activity.id} className="bg-[#faf5f0] p-4 shadow-md rounded-lg hover:shadow-xl transition">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Velocity Over Time</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={graphData}>
                <XAxis dataKey="time" label={{ value: 'Time (minutes)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Speed (km/min)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend
                  payload={[
                    { value: activities.find(a => a.id === parseInt(selectedActivity1))?.name || 'Activity 1', type: 'line', color: '#000000' },
                    { value: activities.find(a => a.id === parseInt(selectedActivity2))?.name || 'Activity 2', type: 'line', color: '#FC4C02' },
                  ]}
                />
                {Object.keys(graphData[0] || {}).filter((key) => key !== 'time').map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={index === 0 ? "#000000" : "#FC4C02"} 
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