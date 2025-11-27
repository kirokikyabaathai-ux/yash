/**
 * Status History Component
 * Shows customer the history of status changes with office team comments
 */

'use client';

import { useState, useEffect } from 'react';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';

interface StatusChange {
  id: string;
  timestamp: string;
  user_name: string;
  old_status?: string;
  new_status: string;
  remarks?: string;
}

interface StatusHistoryProps {
  leadId: string;
}

export function StatusHistory({ leadId }: StatusHistoryProps) {
  const [history, setHistory] = useState<StatusChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [leadId]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/leads/${leadId}/status-history`);
      
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No status updates yet.
      </div>
    );
  }

  const latestUpdate = history[0];
  const olderUpdates = history.slice(1);

  return (
    <div className="space-y-4">
      {/* Latest Update */}
      <div className="border-l-4 border-blue-500 pl-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <LeadStatusBadge status={latestUpdate.new_status as any} />
          <span className="text-xs text-gray-500">
            {new Date(latestUpdate.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        {latestUpdate.remarks && (
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-medium">Update:</span> {latestUpdate.remarks}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Updated by {latestUpdate.user_name}
        </p>
      </div>

      {/* Show More Button */}
      {olderUpdates.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {isExpanded ? '− Hide' : '+ Show'} previous updates ({olderUpdates.length})
        </button>
      )}

      {/* Older Updates */}
      {isExpanded && olderUpdates.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-gray-200">
          {olderUpdates.map((update) => (
            <div key={update.id} className="border-l-2 border-gray-300 pl-4 py-1">
              <div className="flex items-center justify-between mb-1">
                <LeadStatusBadge status={update.new_status as any} />
                <span className="text-xs text-gray-500">
                  {new Date(update.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {update.remarks && (
                <p className="text-sm text-gray-600 mt-1">{update.remarks}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                by {update.user_name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
