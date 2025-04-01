'use client';

import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import MapContainer from '../../components/mapping/MapContainer';
import MapControls from '../../components/mapping/MapControls';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorDisplay from '../../components/common/ErrorDisplay';

export default function TerritoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalysisStarted, setIsAnalysisStarted] = useState(false);
  const [maxActivities, setMaxActivities] = useState(100);
  const [radius, setRadius] = useState(5); //default 5 miles
  const [coverage, setCoverage] = useState<number | null>(null);
  const [centerPoint, setCenterPoint] = useState<[number, number] | null>(null);

  const handleStartAnalysis = async () => {
    if (!centerPoint) {
      setError('Please select a center point on the map first');
      return;
    }

    setLoading(true);
    setError(null);
    setIsAnalysisStarted(true);

    //Next steps, this is where we're gonna call the backend
    setTimeout(() => {
      const mockCoverage = Math.floor(Math.random() * 60) + 20;
      setCoverage(mockCoverage);
      setLoading(false);
    }, 1500);
  };

  const handleMaxActivitiesChange = (value: number) => {
    setMaxActivities(value);
  };

  const handleRadiusChange = (value: number) => {
    setRadius(value);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCenterPoint([lat, lng]);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-20 p-6">
        <main className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Map Analysis</h2>
            <p className="text-gray-600 mb-6">
              Select a point on the map, set a radius, and analyze what percentage of that area you&apos;ve covered in your Strava activities.
            </p>

            <MapControls
              isAnalysisStarted={isAnalysisStarted}
              onStartAnalysis={handleStartAnalysis}
              maxActivities={maxActivities}
              onMaxActivitiesChange={handleMaxActivitiesChange}
              radius={radius}
              onRadiusChange={handleRadiusChange}
              coverage={coverage}
            />

            {loading ? (
              <LoadingSpinner message="Analyzing your map coverage..." />
            ) : error ? (
              <ErrorDisplay error={error} />
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-[600px] mt-4">
                <MapContainer
                  radius={radius}
                  centerPoint={centerPoint}
                  onMapClick={handleMapClick}
                  setLoading={setLoading}
                  setError={setError}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}