export default function ControlRoomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Control Room</h1>
        <p className="text-gray-600">System control and monitoring center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">System Status</h3>
          <p className="text-gray-600">Monitor system health and performance</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Active Sessions</h3>
          <p className="text-gray-600">View and manage active user sessions</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">System Logs</h3>
          <p className="text-gray-600">Access system logs and diagnostics</p>
        </div>
      </div>
    </div>
  );
}
