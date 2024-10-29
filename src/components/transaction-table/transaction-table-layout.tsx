import { TransactionTableContent } from "./transaction-table-content";

// Server Component
export function TransactionTableLayout() {
  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Ecosystem To Ecosystem
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Status: No Hotkeys
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Comments: No Hotkeys
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Last Update
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Status: With Hotkeys
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Comments: With Hotkeys
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Last Update
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                Owner
              </th>
            </tr>
          </thead>
          <TransactionTableContent />
        </table>
      </div>
    </div>
  );
}

export default TransactionTableLayout; 