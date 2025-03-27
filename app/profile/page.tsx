'use client';

import Sidebar from '@/components/Sidebar';

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 ml-20">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Profile</h2>

        {/* User Info Card */}
        <div className="bg-white p-6 rounded-xl shadow flex items-center gap-6 mb-8">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-orange-400"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Hector Reyes</h3>
            <p className="text-gray-500">Training for the moon 🚀</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
            <h4 className="text-sm text-orange-600">Total Distance</h4>
            <p className="text-2xl font-bold text-orange-800 mt-1">684 km</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
            <h4 className="text-sm text-orange-600">Activities</h4>
            <p className="text-2xl font-bold text-orange-800 mt-1">120</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg shadow text-center">
            <h4 className="text-sm text-orange-600">Followers</h4>
            <p className="text-2xl font-bold text-orange-800 mt-1">45</p>
          </div>
        </div>

        {/* Favorite Activities */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Favorite Activities</h4>
          <ul className="space-y-3">
            <li className="text-gray-700">🚴‍♂️ Lakefront Trail - 40km Ride</li>
            <li className="text-gray-700">🏃‍♂️ 5K Sprint Challenge</li>
            <li className="text-gray-700">🏊‍♂️ Open Water Swim - Summer 2024</li>
          </ul>
        </div>

        {/* Settings / Connect Button */}
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">Want to refresh your data?</p>
          <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg">
            🔄 Connect to Strava
          </button>
        </div>
      </main>
    </div>
  );
}
