export default function LogsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Activity Logs</h1>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">User</th>
            <th className="px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white dark:bg-gray-800">
            <td className="px-4 py-2">2025-10-01</td>
            <td className="px-4 py-2">John Doe</td>
            <td className="px-4 py-2">Created a new capsule</td>
          </tr>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <td className="px-4 py-2">2025-10-02</td>
            <td className="px-4 py-2">Jane Smith</td>
            <td className="px-4 py-2">Uploaded a photo</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
