// app/ConnectButton.tsx
'use client';

import { handleStravaLogin } from '@/utils/oauth';

export default function ConnectButton() {
  return (
    <button
      onClick={handleStravaLogin}
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FC4C02] hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-colors duration-200"
    >
      Connect with Strava
    </button>
  );
}