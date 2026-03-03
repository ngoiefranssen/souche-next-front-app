'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName || user?.username || 'User'}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          Here&apos;s what&apos;s happening with your courses today.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Total Courses
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600">12</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Completed
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-700">8</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            In Progress
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-orange-600">4</p>
        </div>
      </div>
    </div>
  );
}
