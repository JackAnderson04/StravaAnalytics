// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AthleteData {
  firstname?: string;
  lastname?: string;
  profile?: string;
}

export default function Dashboard() {
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to extract token from URL hash
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
        // Try to get token from URL first, then localStorage
        let accessToken = getTokenFromHash();
        if (accessToken) {
          // If we found token in URL, save it
          localStorage.setItem('strava_access_token', accessToken);
          // Clean up the URL
          window.location.hash = '';
        } else {
          // If not in URL, try localStorage
          accessToken = localStorage.getItem('strava_access_token');
        }

        console.log('Access token available:', !!accessToken);

        if (!accessToken) {
          console.log('No access token found, redirecting to home');
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

        const data = await response.json();
        console.log('Athlete data received:', data);
        setAthlete(data);
      } catch (error) {
        console.error('Error fetching athlete data:', error);
        localStorage.removeItem('strava_access_token'); // Clear invalid token
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
        <div className="text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Strava Analytics</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/activities"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Activities
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {athlete && (
                <span className="text-gray-700">
                  Welcome, {athlete.firstname}!
                </span>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Dashboard</h2>
            {athlete && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Welcome to your personal Strava Analytics dashboard, {athlete.firstname} {athlete.lastname}!
                </p>
                {/* We'll add more dashboard content here later */}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}