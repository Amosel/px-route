'use client'

import { saveTransaction } from '@/utils/transaction-client-utils';
import { fetchLinearIssue } from '@/utils/transaction-client-utils';
import { Transaction } from '@/types';
import { getStatusEmoji, formatDate } from '@/utils/formatting';


interface TableCellProps {
  route: string;
  hasHotkeys: boolean;
  data: {
    success: number;
    failure: number;
    lastUpdate: string | null;
    owner: string | null;
    comments: string | null;
    linearIssueId: string | null;
  };
  onUpdate: () => void;
}

export function TableCell({ route, hasHotkeys, data, onUpdate }: TableCellProps) {
  const handleCellClick = async (field: string) => {
    const newValue = prompt(`Update ${field}:`);
    if (newValue === null) return;

    const [sourceChain, destinationChain] = route.split(" to ");
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      sourceChain,
      destinationChain,
      status:
        field === "status"
          ? (newValue as "SUCCESS" | "FAILURE" | "PENDING")
          : "PENDING",
      timestamp: new Date().toISOString(),
      hasHotkeys,
      [field]: newValue,
    };

    saveTransaction(transaction);
    onUpdate();
  };

  const handleLinearIdChange = async () => {
    const linearId = prompt("Enter Linear issue ID:");
    if (!linearId) return;

    const issue = await fetchLinearIssue(linearId);
    if (!issue) {
      alert("Failed to fetch Linear issue");
      return;
    }

    const [sourceChain, destinationChain] = route.split(" to ");
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      sourceChain,
      destinationChain,
      status: "PENDING",
      timestamp: new Date().toISOString(),
      hasHotkeys,
      linearIssueId: linearId,
      comments: `${issue.title}\n${issue.description || ""}`,
    };

    saveTransaction(transaction);
    onUpdate();
  };

  return (
    <>
      <td
        className="px-4 py-3 text-sm text-gray-900 cursor-pointer"
        onClick={() => handleCellClick("status")}
      >
        {getStatusEmoji(data.success, data.failure)}
      </td>
      <td
        className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate cursor-pointer"
        onClick={handleLinearIdChange}
      >
        {data.comments || "Click to add Linear issue"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {formatDate(data.lastUpdate)}
      </td>
      <td
        className="px-4 py-3 text-sm text-gray-500 cursor-pointer"
        onClick={() => handleCellClick("owner")}
      >
        {data.owner || "Click to assign"}
      </td>
    </>
  );
} 