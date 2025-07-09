'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square, X, Loader2, Undo2, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toaster';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  handler: (selectedIds: string[]) => Promise<void>;
}

interface BulkActionsProps {
  items: any[];
  idField?: string;
  actions: BulkAction[];
  onSelectionChange?: (selectedIds: string[]) => void;
  renderItem: (item: any, isSelected: boolean, onToggle: () => void) => React.ReactNode;
  maxSelectable?: number;
  enableUndo?: boolean;
  undoDuration?: number;
}

interface UndoState {
  action: string;
  items: string[];
  timestamp: number;
  handler: () => Promise<void>;
}

export default function UserBulkActions({
  items,
  idField = 'id',
  actions,
  onSelectionChange,
  renderItem,
  maxSelectable,
  enableUndo = true,
  undoDuration = 5000,
}: BulkActionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
  const [undoStack, setUndoStack] = useState<UndoState[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds));
  }, [selectedIds, onSelectionChange]);

  // Clean up expired undo items
  useEffect(() => {
    const interval = setInterval(() => {
      setUndoStack((prev) => prev.filter((item) => Date.now() - item.timestamp < undoDuration));
    }, 1000);
    return () => clearInterval(interval);
  }, [undoDuration]);

  const toggleSelection = useCallback(
    (itemId: string) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          if (maxSelectable && newSet.size >= maxSelectable) {
            toast({
              title: 'Selection limit reached',
              description: `You can only select up to ${maxSelectable} items at once.`,
            });
            return prev;
          }
          newSet.add(itemId);
        }
        return newSet;
      });
    },
    [maxSelectable, toast]
  );

  const selectAll = useCallback(() => {
    const allIds = items.map((item) => item[idField]);
    const limitedIds = maxSelectable ? allIds.slice(0, maxSelectable) : allIds;
    setSelectedIds(new Set(limitedIds));

    if (maxSelectable && allIds.length > maxSelectable) {
      toast({
        title: 'Selection limited',
        description: `Selected first ${maxSelectable} items due to limit.`,
      });
    }
  }, [items, idField, maxSelectable, toast]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const executeAction = useCallback(
    async (action: BulkAction) => {
      const selectedArray = Array.from(selectedIds);
      if (selectedArray.length === 0) return;

      setIsProcessing(true);
      setProcessingProgress(0);
      setProcessingMessage(`Processing ${selectedArray.length} items...`);

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProcessingProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        await action.handler(selectedArray);

        clearInterval(progressInterval);
        setProcessingProgress(100);

        // Add to undo stack if enabled
        if (enableUndo) {
          setUndoStack((prev) => [
            ...prev,
            {
              action: action.label,
              items: selectedArray,
              timestamp: Date.now(),
              handler: async () => {
                // This should be implemented by the parent component
                toast({
                  title: 'Undo functionality',
                  description: 'Implement undo handler in parent component',
                });
              },
            },
          ]);
        }

        toast({
          title: 'Bulk action completed',
          description: `Successfully processed ${selectedArray.length} items.`,
        });

        // Clear selection after successful action
        deselectAll();
      } catch (error) {
        console.error('Bulk action error:', error);
        toast({
          title: 'Action failed',
          description: 'Failed to complete bulk action. Please try again.',
        });
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingMessage('');
        setShowConfirmDialog(false);
        setPendingAction(null);
      }
    },
    [selectedIds, enableUndo, deselectAll, toast]
  );

  const handleActionClick = useCallback(
    (action: BulkAction) => {
      if (action.requiresConfirmation) {
        setPendingAction(action);
        setShowConfirmDialog(true);
      } else {
        executeAction(action);
      }
    },
    [executeAction]
  );

  const handleUndo = useCallback(
    async (undoItem: UndoState) => {
      try {
        await undoItem.handler();
        setUndoStack((prev) => prev.filter((item) => item !== undoItem));
        toast({
          title: 'Action undone',
          description: `Reverted "${undoItem.action}" for ${undoItem.items.length} items.`,
        });
      } catch (error) {
        toast({
          title: 'Undo failed',
          description: 'Failed to undo action. Please try again.',
        });
      }
    },
    [toast]
  );

  const selectedCount = selectedIds.size;
  const isAllSelected = selectedCount === items.length && items.length > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < items.length;

  return (
    <div className="space-y-4">
      {/* Selection Bar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-0 z-20"
          >
            <Card className="bg-orange/10 border-orange/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    {selectedCount} selected
                  </Badge>
                  <div className="flex gap-2">
                    {actions.map((action) => (
                      <Button
                        key={action.id}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={() => handleActionClick(action)}
                        disabled={isProcessing}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={deselectAll} disabled={isProcessing}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">{processingMessage}</span>
                    <span className="text-sm text-white/60">{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select All Checkbox */}
      <div className="flex items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={isAllSelected ? deselectAll : selectAll}
          className="p-0 h-auto"
        >
          {isAllSelected ? (
            <CheckSquare className="w-5 h-5 text-orange" />
          ) : isPartiallySelected ? (
            <Square className="w-5 h-5 text-orange fill-orange/30" />
          ) : (
            <Square className="w-5 h-5 text-white/40" />
          )}
        </Button>
        <span className="text-sm text-white/60">
          {isAllSelected ? 'Deselect all' : 'Select all'}
          {maxSelectable && ` (max ${maxSelectable})`}
        </span>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item) => {
          const itemId = item[idField];
          const isSelected = selectedIds.has(itemId);
          return (
            <div key={itemId}>{renderItem(item, isSelected, () => toggleSelection(itemId))}</div>
          );
        })}
      </div>

      {/* Undo Stack */}
      {enableUndo && undoStack.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
          {undoStack.map((undoItem, index) => {
            const timeLeft = Math.ceil((undoDuration - (Date.now() - undoItem.timestamp)) / 1000);
            return (
              <motion.div
                key={`${undoItem.timestamp}-${index}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
              >
                <Card className="bg-black/90 border-white/20 p-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm text-white">{undoItem.action}</p>
                      <p className="text-xs text-white/60">
                        {undoItem.items.length} items • {timeLeft}s
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUndo(undoItem)}
                      className="text-orange hover:text-orange/80"
                    >
                      <Undo2 className="w-4 h-4 mr-1" />
                      Undo
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-black/95 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Bulk Action</DialogTitle>
            <DialogDescription className="text-white/60">
              {pendingAction?.confirmationMessage ||
                `Are you sure you want to ${pendingAction?.label.toLowerCase()} ${selectedCount} items?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={pendingAction?.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={() => pendingAction && executeAction(pendingAction)}
              disabled={isProcessing}
              className={
                pendingAction?.variant !== 'destructive' ? 'bg-orange hover:bg-orange/90' : ''
              }
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
