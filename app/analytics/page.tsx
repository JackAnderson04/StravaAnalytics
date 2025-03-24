'use client';

import Sidebar from '@/components/Sidebar';

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 ml-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Analytics</h2>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h3 className="text-lg font-semibold text-orange-600">Total Distance</h3>
            <p className="text-2xl font-bold mt-2">684 km</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h3 className="text-lg font-semibold text-orange-600">Total Time</h3>
            <p className="text-2xl font-bold mt-2">42 hrs</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <h3 className="text-lg font-semibold text-orange-600">Elevation Gain</h3>
            <p className="text-2xl font-bold mt-2">5,320 m</p>
          </div>
        </div>

        {/* Weekly Progress Placeholder */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Weekly Progress</h3>
          <div className="h-48 flex items-center justify-center text-gray-400">
            📈 Graph Placeholder
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Activity Breakdown</h3>
          <div className="h-48 flex items-center justify-center text-gray-400">
            🥧 Pie Chart Placeholder (Run / Ride / Swim)
          </div>
        </div>

        {/* Personal Records */}
        <div className="bg-white p-6 rounded-lg shadow mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Records</h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-gray-700">
              <span>Longest Ride</span>
              <span className="font-semibold">75 km</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Fastest 5K Run</span>
              <span className="font-semibold">21:43</span>
            </li>
            <li className="flex justify-between text-gray-700">
              <span>Biggest Climb</span>
              <span className="font-semibold">1,200 m</span>
            </li>
          </ul>
        </div>

        {/* Future Feature */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Goals & Trends</h3>
          <div className="h-24 flex items-center justify-center text-gray-400">
            🎯 Coming soon...
          </div>
        </div>
      </main>
    </div>
  );
}
