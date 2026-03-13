export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and view reports</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Available Reports</h2>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">User Activity Report</h3>
                <p className="text-sm text-gray-600">
                  Monthly user activity and engagement metrics
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Financial Report</h3>
                <p className="text-sm text-gray-600">
                  Revenue and financial performance summary
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">System Performance Report</h3>
                <p className="text-sm text-gray-600">
                  System health and performance metrics
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Audit Report</h3>
                <p className="text-sm text-gray-600">
                  Security and compliance audit logs
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
