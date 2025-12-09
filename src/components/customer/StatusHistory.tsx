/**
 * Status History Component
 * Shows customer the history of status changes with office team comments
 * Refactored to use Penpot design system components.
 */

'use client';

import { useState, useEffect } from 'react';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { Body, Small } from '@/components/ui/atoms';
import { Button } from '@/components/ui/button';

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
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Small color="secondary">
        No status updates yet.
      </Small>
    );
  }

  const latestUpdate = history[0];
  const olderUpdates = history.slice(1);

  return (
    <div className="space-y-4">
      {/* Latest Update */}
      <div className="border-l-4 border-primary pl-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <LeadStatusBadge status={latestUpdate.new_status as any} />
          <Small color="secondary">
            {new Date(latestUpdate.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Small>
        </div>
        {latestUpdate.remarks && (
          <Body className="mt-2">
            <span className="font-medium">Update:</span> {latestUpdate.remarks}
          </Body>
        )}
        <Small color="secondary" className="mt-1">
          Updated by {latestUpdate.user_name}
        </Small>
      </div>

      {/* Show More Button */}
      {olderUpdates.length > 0 && (
        <Button
          variant="link"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 h-auto font-medium"
        >
          {isExpanded ? '− Hide' : '+ Show'} previous updates ({olderUpdates.length})
        </Button>
      )}

      {/* Older Updates */}
      {isExpanded && olderUpdates.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border">
          {olderUpdates.map((update) => (
            <div key={update.id} className="border-l-2 border-muted pl-4 py-1">
              <div className="flex items-center justify-between mb-1">
                <LeadStatusBadge status={update.new_status as any} />
                <Small color="secondary">
                  {new Date(update.timestamp).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Small>
              </div>
              {update.remarks && (
                <Body className="mt-1">{update.remarks}</Body>
              )}
              <Small color="secondary" className="mt-1">
                by {update.user_name}
              </Small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
