'use client';

import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  return (
    
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 ml-20">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Settings Page</h1>
      <p className="text-gray-700 mb-6 max-w-lg text-center">
        None of these settings are being saved permanently 
      </p>

      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Options</h2>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-[#FC4C02] hover:underline">Log Out</Link>
      </div>
      </main>
    </div>
  );
}
