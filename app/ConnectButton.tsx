'use client';

import { handleStravaLogin } from '@/utils/oauth';

export default function ConnectStrava() {
    return (
        <button
            onClick={handleStravaLogin}
            className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
            Connect with Strava
        </button>
    );
}