'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts'; 
import Sidebar from '@/components/Sidebar';
import ProgressBottomBar from '@/components/ProgressBottomBar';
import MoonProgressCircle from '@/components/MoonProgressCircle';
import TopActivities from '@/components/TopActivities';

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
          <MoonProgressCircle />
          <TopActivities />
          <ProgressBottomBar />
        </div>
      </main>
    </div>
  );
}
