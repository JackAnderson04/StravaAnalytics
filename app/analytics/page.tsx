'use client';

import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

type ActivityBreakdown = {
  Run: number;
  Ride: number;
  Other: number;
};

interface Activity {
  id: number;
  name: string;
  distance: number; // in meters
  moving_time: number; // in seconds
  total_elevation_gain: number;
  start_date_local: string;
  type: string;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalDistance: 0,
    totalTime: 0,
    elevationGain: 0,
    longestRide: 0,
    fastest5K: null as string | null,
    biggestClimb: 0,
    weekly: [] as { week: string; km: number }[],
    breakdown: { Run: 0, Ride: 0, Other: 0 } as ActivityBreakdown,
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        let accessToken = localStorage.getItem('strava_access_token');
        if (!accessToken) {
          setError('No access token found');
          return;
        }

        const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=200', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) throw new Error('Failed to fetch activities');

        const data: Activity[] = await res.json();
        console.log('Activities fetched:', data);
        calculateStats(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const calculateStats = (data: Activity[]) => {
    let totalDistance = 0;
    let totalTime = 0;
    let elevationGain = 0;
    let longestRide = 0;
    let biggestClimb = 0;
    let fastest5K = Number.MAX_SAFE_INTEGER;
    const breakdown = { Run: 0, Ride: 0, Other: 0 };
    const weeklyMap: Record<string, number> = {};

    data.forEach((act) => {
      totalDistance += act.distance;
      totalTime += act.moving_time;
      elevationGain += act.total_elevation_gain;

      const week = new Date(act.start_date_local);
      const weekKey = `${week.getFullYear()}-W${getWeekNumber(week)}`;
      weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + act.distance / 1000;

      if (act.type === 'Run') breakdown.Run++;
      else if (act.type === 'Ride') breakdown.Ride++;
      else breakdown.Other++;

      if (act.type === 'Ride' && act.distance > longestRide) longestRide = act.distance;
      if (act.total_elevation_gain > biggestClimb) biggestClimb = act.total_elevation_gain;
      if (act.type === 'Run' && act.distance >= 5000 && act.moving_time < fastest5K) {
        fastest5K = act.moving_time;
      }
    });

    const weekly = Object.entries(weeklyMap)
      .map(([week, km]) => ({ week, km: parseFloat(km.toFixed(1)) }))
      .sort((a, b) => (a.week < b.week ? -1 : 1));

    setStats({
      totalDistance,
      totalTime,
      elevationGain,
      longestRide,
      fastest5K: fastest5K === Number.MAX_SAFE_INTEGER ? null : formatTime(fastest5K),
      biggestClimb,
      weekly,
      breakdown,
    });
  };

  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 ml-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Analytics</h2>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Distance" value={`${stats.totalDistance ? (stats.totalDistance / 1000).toFixed(1) : '0.0'} km`} />
          <StatCard title="Total Time" value={`${stats.totalTime ? Math.round(stats.totalTime / 3600) : '0'} hrs`} />
          <StatCard title="Elevation Gain" value={`${stats.elevationGain ? stats.elevationGain.toFixed(0) : '0'} m`} />
        </div>

        {/* Weekly Progress */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.weekly}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="km" fill="#FC4C02" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Activity Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Run', value: stats.breakdown.Run },
                  { name: 'Ride', value: stats.breakdown.Ride },
                  { name: 'Other', value: stats.breakdown.Other },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#FC4C02" />
                <Cell fill="#000000" />
                <Cell fill="#8884d8" />
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Personal Records */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Records</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex justify-between">
              <span>Longest Ride</span>
              <span className="font-semibold">{(stats.longestRide / 1000).toFixed(1)} km</span>
            </li>
            <li className="flex justify-between">
              <span>Fastest 5K Run</span>
              <span className="font-semibold">{stats.fastest5K ?? 'N/A'}</span>
            </li>
            <li className="flex justify-between">
              <span>Biggest Climb</span>
              <span className="font-semibold">{stats.biggestClimb.toFixed(0)} m</span>
            </li>
          </ul>
        </div>

        {/* Future Feature Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Goals & Trends</h3>
          <div className="h-24 flex items-center justify-center text-gray-400 text-xl">🎯 Coming soon...</div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <h3 className="text-lg font-semibold text-orange-600">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
