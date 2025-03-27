'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function HelpPage() {
  return (
    
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 ml-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Help Page</h1>
      <p className="text-gray-700 mb-6 max-w-lg text-center">
        
      </p>

      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Common Questions</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li><strong>What is Strava Analytics?</strong> - An add-on for Strava to give more data analytics for athletes</li>
          <li><strong>Should I be worried about my data?</strong> - We do not store any of the data from Strava</li>
          <li><strong>Something is not working, what do I do?</strong> - We are sorry that something is not working, if you want it fixed please email rosemary.shelton@marquette.edu</li>
          <li><strong>Can I delete my account with Strava Analytics</strong> - You are logged in through Strava, we do not have hold any account information</li>
        </ul>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-[#FC4C02] hover:underline">Log Out</Link>
      </div>
      </main>
    </div>
  );
}