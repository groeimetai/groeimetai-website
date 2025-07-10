'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  Archive,
  Download,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Check,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Types
export type BulkActionType = 'delete' | 'archive' | 'export' | 'assign' | 'updateStatus';

export interface BulkActionItem {
  id: string;
  [key: string]: any;
}

export interface BulkActionsProps {
  items: BulkActionItem[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onAction: (action: BulkActionType, data?: any) => Promise<void>;
  actions?: BulkActionType[];
  statusOptions?: { value: string; label: string }[];
  assigneeOptions?: { value: string; label: string }[];
  className?: string;
}

interface ActionProgress {
  total: number;
  completed: number;
  failed: number;
  message: string;
}

const defaultActions: BulkActionType[] = ['delete', 'archive', 'export', 'assign', 'updateStatus'];

export function BulkActions({
  items,
  selectedIds,
  onSelectionChange,
  onAction,
  actions = defaultActions,
  statusOptions = [],
  assigneeOptions = [],
  className,
}: BulkActionsProps) {
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkActionType | null>(null);
  const [actionData, setActionData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ActionProgress | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const actionBarRef = useRef<HTMLDivElement>(null);

  // Calculate selection state
  const selectedCount = selectedIds.size;
  const isAllSelected = items.length > 0 && selectedCount === items.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < items.length;

  // Handle select all/none
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(items.map((item) => item.id)));
    }
  }, [isAllSelected, items, onSelectionChange]);

  // Handle individual selection
  const handleSelectItem = useCallback(
    (id: string) => {
      const newSelection = new Set(selectedIds);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      onSelectionChange(newSelection);
    },
    [selectedIds, onSelectionChange]
  );

  // Execute action
  const executeAction = useCallback(
    async (action: BulkActionType, data?: any) => {
      setIsProcessing(true);
      setProgress({
        total: selectedIds.size,
        completed: 0,
        failed: 0,
        message: `Processing ${action}...`,
      });

      try {
        // Simulate progress for demo
        const updateInterval = setInterval(() => {
          setProgress((prev) => {
            if (!prev || prev.completed >= prev.total) return prev;
            return {
              ...prev,
              completed: Math.min(prev.completed + 1, prev.total),
            };
          });
        }, 100);

        await onAction(action, { ids: Array.from(selectedIds), ...data });

        clearInterval(updateInterval);
        setProgress(null);

        toast({
          title: 'Success',
          description: `${action} completed for ${selectedIds.size} items`,
        });

        onSelectionChange(new Set());
      } catch (error) {
        setProgress((prev) => ({
          ...prev!,
          failed: prev!.total - prev!.completed,
          message: 'Operation failed',
        }));

        toast({
          title: 'Error',
          description: `Failed to ${action} items: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      } finally {
        setIsProcessing(false);
        setIsConfirmOpen(false);
        setPendingAction(null);
        setActionData(null);
        setTimeout(() => setProgress(null), 2000);
      }
    },
    [selectedIds, onAction, onSelectionChange, toast]
  );

  // Handle actions
  const handleAction = useCallback(
    async (action: BulkActionType, data?: any) => {
      if (action === 'delete' || action === 'archive') {
        setPendingAction(action);
        setActionData(data);
        setIsConfirmOpen(true);
      } else {
        await executeAction(action, data);
      }
    },
    [executeAction]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCount) return;

      // Ctrl/Cmd + A to select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        handleSelectAll();
      }

      // Delete key for delete action
      if (e.key === 'Delete' && actions.includes('delete')) {
        e.preventDefault();
        handleAction('delete');
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        e.preventDefault();
        onSelectionChange(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCount, handleSelectAll, handleAction, onSelectionChange, actions]);

  // Action bar visibility
  const showActionBar = selectedCount > 0 || progress !== null;

  return (
    <>
      {/* Selection Checkbox */}
      <div className="flex items-center space-x-2 p-2">
        <input
          type="checkbox"
          checked={isAllSelected}
          ref={(input) => {
            if (input) {
              input.indeterminate = isPartiallySelected;
            }
          }}
          onChange={handleSelectAll}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label="Select all items"
        />
        <span className="text-sm text-gray-600">
          {selectedCount > 0 ? `${selectedCount} selected` : 'Select all'}
        </span>
      </div>

      {/* Floating Action Bar */}
      <AnimatePresence>
        {showActionBar && (
          <motion.div
            ref={actionBarRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
              'bg-white dark:bg-gray-800 rounded-lg shadow-lg border',
              'min-w-[400px] max-w-[90vw]',
              className
            )}
          >
            {/* Progress Bar */}
            {progress && (
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{progress.message}</span>
                  <span className="text-sm text-gray-500">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
                <Progress value={(progress.completed / progress.total) * 100} className="h-2" />
                {progress.failed > 0 && (
                  <p className="text-sm text-red-600 mt-1">{progress.failed} items failed</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!progress && (
              <div className={cn('transition-all', isExpanded ? 'p-4' : 'p-2')}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{selectedCount} items selected</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-6 w-6 p-0"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isExpanded && (
                  <div className="flex flex-wrap gap-2">
                    {actions.includes('updateStatus') && statusOptions.length > 0 && (
                      <Select
                        onValueChange={(value) => handleAction('updateStatus', { status: value })}
                      >
                        <SelectTrigger className="w-[140px]" disabled={isProcessing}>
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {actions.includes('assign') && assigneeOptions.length > 0 && (
                      <Select
                        onValueChange={(value) => handleAction('assign', { assigneeId: value })}
                      >
                        <SelectTrigger className="w-[140px]" disabled={isProcessing}>
                          <SelectValue placeholder="Assign to" />
                        </SelectTrigger>
                        <SelectContent>
                          {assigneeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {actions.includes('export') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('export')}
                        disabled={isProcessing}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}

                    {actions.includes('archive') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction('archive')}
                        disabled={isProcessing}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    )}

                    {actions.includes('delete') && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction('delete')}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectionChange(new Set())}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'delete' && 'Delete Items'}
              {pendingAction === 'archive' && 'Archive Items'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'delete' && (
                <>
                  <AlertCircle className="inline-block h-4 w-4 mr-2 text-red-600" />
                  Are you sure you want to delete {selectedCount} items? This action cannot be
                  undone.
                </>
              )}
              {pendingAction === 'archive' && (
                <>
                  Are you sure you want to archive {selectedCount} items? You can restore them
                  later.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={pendingAction === 'delete' ? 'destructive' : 'default'}
              onClick={() => pendingAction && executeAction(pendingAction, actionData)}
            >
              {isProcessing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {pendingAction === 'delete' ? 'Delete' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper component for list items with selection
interface SelectableListItemProps {
  id: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function SelectableListItem({
  id,
  isSelected,
  onSelect,
  children,
  className,
}: SelectableListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800',
        isSelected && 'bg-blue-50 dark:bg-blue-900/20',
        className
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(id)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        aria-label={`Select item ${id}`}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

// Hook for managing bulk selection state
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return items.filter((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  return {
    selectedIds,
    setSelectedIds,
    toggleSelection,
    selectAll,
    clearSelection,
    getSelectedItems,
    selectedCount: selectedIds.size,
    isAllSelected: items.length > 0 && selectedIds.size === items.length,
    isPartiallySelected: selectedIds.size > 0 && selectedIds.size < items.length,
  };
}
