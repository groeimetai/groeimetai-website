import React, { useState } from 'react';
import { WorkflowExecution, WorkflowLog } from '@/types/workflow';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Activity,
  FileText,
} from 'lucide-react';

interface WorkflowExecutionHistoryProps {
  executions: WorkflowExecution[];
  workflowName?: string;
}

export const WorkflowExecutionHistory: React.FC<WorkflowExecutionHistoryProps> = ({
  executions,
  workflowName,
}) => {
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);

  const getStatusIcon = (status: WorkflowExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: WorkflowExecution['status']) => {
    const variants: Record<
      WorkflowExecution['status'],
      'default' | 'destructive' | 'secondary' | 'outline'
    > = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const getDuration = (execution: WorkflowExecution) => {
    if (!execution.completedAt) return 'In Progress';
    const duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getLogIcon = (status: WorkflowLog['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {workflowName && (
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold">Execution History: {workflowName}</h3>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Execution ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Current Node</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  No executions found
                </TableCell>
              </TableRow>
            ) : (
              executions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell className="font-mono text-sm">{execution.id.slice(0, 8)}...</TableCell>
                  <TableCell>{getStatusBadge(execution.status)}</TableCell>
                  <TableCell>{format(execution.startedAt, 'MMM d, HH:mm:ss')}</TableCell>
                  <TableCell>{getDuration(execution)}</TableCell>
                  <TableCell>
                    {execution.currentNodeId ||
                      (execution.status === 'completed' ? 'Finished' : '-')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedExecution(execution)}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription>Execution ID: {selectedExecution?.id}</DialogDescription>
          </DialogHeader>

          {selectedExecution && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedExecution.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="mt-1 font-medium">{getDuration(selectedExecution)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Started At</p>
                  <p className="mt-1 font-medium">{format(selectedExecution.startedAt, 'PPpp')}</p>
                </div>
                {selectedExecution.completedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Completed At</p>
                    <p className="mt-1 font-medium">
                      {format(selectedExecution.completedAt, 'PPpp')}
                    </p>
                  </div>
                )}
              </div>

              {selectedExecution.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600 mt-1">{selectedExecution.error}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Execution Logs
                </h4>
                <ScrollArea className="h-[300px] border rounded-lg p-3">
                  <div className="space-y-2">
                    {selectedExecution.logs.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 text-sm p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="mt-0.5">{getLogIcon(log.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-gray-500">
                              {format(log.timestamp, 'HH:mm:ss.SSS')}
                            </span>
                            <span className="font-medium">{log.action}</span>
                          </div>
                          <p className="text-gray-600 mt-0.5">{log.message}</p>
                          {log.data && (
                            <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h4 className="font-medium mb-2">Variables</h4>
                <ScrollArea className="h-[150px] border rounded-lg p-3">
                  <pre className="text-sm">
                    {JSON.stringify(selectedExecution.variables, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
