'use client'
import { Transaction } from '@/types';

// Storage helpers
export const getStoredTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("transactions");
  return stored ? JSON.parse(stored) : [];
};

export const saveTransaction = (transaction: Transaction) => {
  const transactions = getStoredTransactions();
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

// Linear API helper
export const fetchLinearIssue = async (issueId: string) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_LINEAR_API_KEY;
    if (!apiKey) {
      console.error('Linear API key not found');
      return null;
    }

    const response = await fetch("https://api.linear.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: `
          query Issue($id: String!) {
            issue(id: $id) {
              title
              description
            }
          }
        `,
        variables: { id: issueId },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data.issue;
  } catch (error) {
    console.error("Error fetching Linear issue:", error);
    return null;
  }
}; 