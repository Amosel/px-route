'use client'

import { useTransactionData } from "@/hooks/use-transaction-data";
import { TableCell } from "./table-cell";
import { TABLE_STRUCTURE } from "@/constants";

const refreshData = () => {
  console.log("refreshData");
};

export function TransactionTableContent() {
  const { transactionData } = useTransactionData();

  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {TABLE_STRUCTURE.map(({ sourceChain, destinationChain }) => {
        const route = `${sourceChain} to ${destinationChain}`;
        const data = transactionData.get(route) || {
          withHotkeys: {
            success: 0,
            failure: 0,
            lastUpdate: null,
            owner: null,
            comments: null,
            linearIssueId: null,
          },
          withoutHotkeys: {
            success: 0,
            failure: 0,
            lastUpdate: null,
            owner: null,
            comments: null,
            linearIssueId: null,
          }
        };

        return (
          <tr key={route} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-sm font-medium text-gray-900">
              {route}
            </td>
            <TableCell
              route={route}
              hasHotkeys={false}
              data={data.withoutHotkeys as {
                success: number;
                failure: number;
                lastUpdate: string | null;
                owner: string | null;
                comments: string | null;
                linearIssueId: string | null;
              }}
              onUpdate={refreshData}
            />
            <TableCell
              route={route}
              hasHotkeys={true}
              data={data.withHotkeys  as {
                success: number;
                failure: number;
                lastUpdate: string | null;
                owner: string | null;
                comments: string | null;
                linearIssueId: string | null;
              }}
              onUpdate={refreshData}
            />
          </tr>
        );
      })}
    </tbody>
  );
}