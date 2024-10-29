'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
// import { LinearClient } from '@linear/sdk';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// const linearClient = new LinearClient({
//   apiKey: process.env.NEXT_PUBLIC_LINEAR_API_KEY || ''
// });

/** Mapping from database chain indices to labels. */
export enum ChainType {
  /** Should not be used. */
  // Unknown = 0,
  Cosmos = 1,
  Evm = 2,
  /** i.e. Bitcoin */
  // Utxo = 3,
  Solana = 4,
}

export interface Chain {
  chain_id: string
  chain_name: string
  chain_type: ChainType
  chain_img: string
}

type TraceData = {
  sourceChain: Chain
  destinationChain: Chain
  sourceCoin: string
  destinationCoin: string
  amount: string
  hasHotkeys: boolean
  timestamp: string
  status: 'Failed' | 'RetryableError' | 'Success'
  error: string
  failedTask?:
    | 'step'
    | 'hotkeyInitialization'
    | 'gasFunding'
    | 'hotkeyFundTransfer'
    | 'nextStepDetermination'
    | 'destinationFundTransfer'
  duration?: number
}

interface AggregatedData {
  withHotkeys: CategoryData;
  withoutHotkeys: CategoryData;
}

export interface CategoryData {
  success: number;
  failure: number;
  lastUpdate: string | null;
  error: string | null;
  failedTask: string | null;
  duration: number | null;
  amount: string | null;
  sourceCoin: string | null;
  destinationCoin: string | null;
  timestamp: string | null;
  comments: string | null;
  owner: string | null;
}

const CHAINS = ["Cosmos", "SVM", "Arbitrum", "Base", "Optimism", "Polygon"];

export function useTransactionData() {
  const [transactionData, setTransactionData] = useState<Map<string, AggregatedData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getRouteKey = (source: Chain, destination: Chain) => 
    `${source.chain_name} to ${destination.chain_name}`;

  const aggregateTransactions = (traces: TraceData[]) => {
    const aggregated = new Map<string, AggregatedData>();

    // Initialize routes
    for (const source of CHAINS) {
      for (const dest of CHAINS) {
        if (source !== dest) {
          const key = `${source} to ${dest}`;
          aggregated.set(key, {
            withHotkeys: {
              success: 0,
              failure: 0,
              lastUpdate: null,
              error: null,
              failedTask: null,
              duration: null,
              amount: null,
              sourceCoin: null,
              destinationCoin: null,
              timestamp: null,
              comments: null,
              owner: null
            },
            withoutHotkeys: {
              success: 0,
              failure: 0,
              lastUpdate: null,
              error: null,
              failedTask: null,
              duration: null,
              amount: null,
              sourceCoin: null,
              destinationCoin: null,
              timestamp: null,
              comments: null,
              owner: null
            }
          });
        }
      }
    }

    // Aggregate data
    for (const trace of traces) {
      const route = getRouteKey(trace.sourceChain, trace.destinationChain);
      const data = aggregated.get(route);
      if (data) {
        const category = trace.hasHotkeys ? "withHotkeys" : "withoutHotkeys";
        if (trace.status === "Success") data[category].success++;
        else data[category].failure++;

        const traceTimestamp = new Date(trace.timestamp).getTime();
        const currentLastUpdate = data[category].lastUpdate ? new Date(data[category].lastUpdate).getTime() : 0;

        if (!data[category].lastUpdate || traceTimestamp > currentLastUpdate) {
          data[category].lastUpdate = trace.timestamp;
          data[category].error = trace.error;
          data[category].failedTask = trace.failedTask || null;
          data[category].duration = trace.duration || null;
          data[category].amount = trace.amount;
          data[category].sourceCoin = trace.sourceCoin;
          data[category].destinationCoin = trace.destinationCoin;
          data[category].timestamp = trace.timestamp;
        }
      }
    }

    return aggregated;
  };

  const fetchInitialData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('dataTraces')
        .select('*')
        .order('timestamp', { ascending: false });

      if (fetchError) throw fetchError;

      const aggregated = aggregateTransactions(data);
      setTransactionData(aggregated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch initial data');
    } finally {
      setLoading(false);
    }
  };

  // Add new trace
  const logTrace = async (trace: TraceData) => {
    try {
      const { error: insertError } = await supabase
        .from('traces')
        .insert([trace]);

      if (insertError) throw insertError;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log trace');
      throw err;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchInitialData();

    // Subscribe to changes
    const subscription = supabase
      .channel('traces_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'traces' 
        }, 
        async () => {
          // Fetch all data again when there's any change
          // You could optimize this by only fetching recent data
          // or by applying the change directly to the state
          const { data, error: fetchError } = await supabase
            .from('traces')
            .select('*')
            .order('timestamp', { ascending: false });

          if (!fetchError && data) {
            const aggregated = aggregateTransactions(data);
            setTransactionData(aggregated);
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [
  fetchInitialData, aggregateTransactions
  ]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return {
    transactionData,
    logTrace,
    loading,
    error,
    formatTimestamp
  };
}