'use client';

import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  ReactFlowProvider,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { nodeTypes } from './CustomNodes';
import { ActionType, TriggerType, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import {
  Plus,
  Save,
  Play,
  Download,
  Upload,
  Trash2,
  Settings,
  Copy,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface WorkflowBuilderProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const triggerTypes: { value: TriggerType; label: string }[] = [
  { value: 'time-based', label: 'Time-based (Schedule)' },
  { value: 'event-based', label: 'Event-based' },
  { value: 'conditional', label: 'Conditional' },
  { value: 'manual', label: 'Manual' },
];

const actionTypes: { value: ActionType; label: string }[] = [
  { value: 'send-email', label: 'Send Email' },
  { value: 'send-notification', label: 'Send Notification' },
  { value: 'create-task', label: 'Create Task' },
  { value: 'create-project', label: 'Create Project' },
  { value: 'update-status', label: 'Update Status' },
  { value: 'assign-to-user', label: 'Assign to User' },
  { value: 'create-document', label: 'Create Document' },
  { value: 'schedule-meeting', label: 'Schedule Meeting' },
  { value: 'wait-condition', label: 'Wait for Condition' },
  { value: 'delay', label: 'Delay' },
];

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  initialNodes = [],
  initialEdges = [],
  onSave,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [nodeDialogType, setNodeDialogType] = useState<'trigger' | 'action' | 'condition' | 'end'>('action');

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNode = (type: 'trigger' | 'action' | 'condition' | 'end') => {
    setNodeDialogType(type);
    setShowNodeDialog(true);
  };

  const createNode = (nodeData: any) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeDialogType,
      position: { x: 250, y: 250 },
      data: nodeData,
    };
    setNodes((nds) => [...nds, newNode]);
    setShowNodeDialog(false);
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const duplicateSelectedNode = () => {
    if (selectedNode) {
      const newNode: Node = {
        ...selectedNode,
        id: `node-${Date.now()}`,
        position: {
          x: selectedNode.position.x + 50,
          y: selectedNode.position.y + 50,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(nodes, edges);
    }
  };

  const exportWorkflow = () => {
    const workflow = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importWorkflow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workflow = JSON.parse(e.target?.result as string);
          setNodes(workflow.nodes || []);
          setEdges(workflow.edges || []);
        } catch (error) {
          console.error('Failed to import workflow:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Add Nodes</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addNode('trigger')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Trigger
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addNode('action')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Action
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addNode('condition')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Condition
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addNode('end')}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                End
              </Button>
            </div>
          </div>
        </Panel>

        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={exportWorkflow}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={importWorkflow}
                className="hidden"
              />
              <Button size="sm" variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </span>
              </Button>
            </label>
          </div>
        </Panel>

        {selectedNode && (
          <Panel position="bottom-right" className="bg-white p-4 rounded-lg shadow-lg">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Selected Node</h3>
              <p className="text-xs text-gray-600">{selectedNode.data.label}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={duplicateSelectedNode}>
                  <Copy className="w-3 h-3 mr-1" />
                  Duplicate
                </Button>
                <Button size="sm" variant="destructive" onClick={deleteSelectedNode}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </Panel>
        )}

        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {nodeDialogType} Node</DialogTitle>
            <DialogDescription>
              Configure the {nodeDialogType} node properties
            </DialogDescription>
          </DialogHeader>
          <NodeConfigForm
            type={nodeDialogType}
            onSubmit={createNode}
            onCancel={() => setShowNodeDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface NodeConfigFormProps {
  type: 'trigger' | 'action' | 'condition' | 'end';
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const NodeConfigForm: React.FC<NodeConfigFormProps> = ({ type, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<any>({
    label: '',
    trigger: { type: 'event-based', config: {} },
    action: { type: 'send-email', config: {} },
    condition: { expression: '' },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="label">Node Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Enter node label"
          required
        />
      </div>

      {type === 'trigger' && (
        <>
          <div>
            <Label htmlFor="triggerType">Trigger Type</Label>
            <Select
              value={formData.trigger.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  trigger: { ...formData.trigger, type: value },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {formData.trigger.type === 'time-based' && (
            <div>
              <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
              <Input
                id="schedule"
                placeholder="0 9 * * * (Every day at 9 AM)"
                value={formData.trigger.config.schedule || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trigger: {
                      ...formData.trigger,
                      config: { ...formData.trigger.config, schedule: e.target.value },
                    },
                  })
                }
              />
            </div>
          )}
          {formData.trigger.type === 'event-based' && (
            <div>
              <Label htmlFor="event">Event Name</Label>
              <Input
                id="event"
                placeholder="e.g., client.created, project.started"
                value={formData.trigger.config.event || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    trigger: {
                      ...formData.trigger,
                      config: { ...formData.trigger.config, event: e.target.value },
                    },
                  })
                }
              />
            </div>
          )}
        </>
      )}

      {type === 'action' && (
        <div>
          <Label htmlFor="actionType">Action Type</Label>
          <Select
            value={formData.action.type}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                action: { ...formData.action, type: value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === 'condition' && (
        <div>
          <Label htmlFor="expression">Condition Expression</Label>
          <Textarea
            id="expression"
            placeholder="e.g., project.budget > 10000"
            value={formData.condition.expression}
            onChange={(e) =>
              setFormData({
                ...formData,
                condition: { expression: e.target.value },
              })
            }
            required
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Node</Button>
      </div>
    </form>
  );
};