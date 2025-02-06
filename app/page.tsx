// app/page.tsx
import ConnectButton from "./ConnectButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-100 to-white">
      {/* Simple Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-[#FC4C02]">
                Strava Analytics
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-24 sm:py-32">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Elevate Your Training
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Get deeper insights into your training data with advanced analytics, 
            personalized trends, and performance metrics tailored just for you.
          </p>
          <div className="mt-10">
            <ConnectButton />
          </div>
        </div>

        {/* Feature Section */}
        <div className="py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Performance Analytics
              </h3>
              <p className="text-gray-600">
                Deep dive into your training data with advanced metrics and analytics.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gear Maintenance Tracking
              </h3>
              <p className="text-gray-600">
                Monitor your gears lifetime with maintenance tracking.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Activity Breakdown
              </h3>
              <p className="text-gray-600">
                View multiple activities at a time to compare.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Not affiliated with Strava. Created for educational purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}