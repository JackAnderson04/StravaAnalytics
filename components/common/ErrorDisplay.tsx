'use client';

import Link from 'next/link';

interface ErrorDisplayProps {
  error: string;
  returnUrl?: string;
}

const ErrorDisplay = ({ error, returnUrl = '/' }: ErrorDisplayProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <svg 
          className="h-16 w-16 text-red-500 mx-auto mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
        <p className="text-red-500 mb-6">{error}</p>
        <Link
          href={returnUrl}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorDisplay;