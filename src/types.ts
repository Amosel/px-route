export interface Transaction {
  id: string;
  sourceChain: string;
  destinationChain: string;
  status: "SUCCESS" | "FAILURE" | "PENDING";
  timestamp: string;
  error?: string;
  hasHotkeys: boolean;
  owner?: string;
  comments?: string;
  linearIssueId?: string;
} 