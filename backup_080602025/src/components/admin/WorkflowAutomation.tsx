'use client';

import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowBuilder } from './workflow/WorkflowBuilder';
import { WorkflowExecutionHistory } from './workflow/WorkflowExecutionHistory';
import { workflowTemplates } from '@/data/workflowTemplates';
import { WorkflowService } from '@/services/workflowService';
import {
  Workflow,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowNode,
  WorkflowEdge,
} from '@/types/workflow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Search,
  Filter,
  Settings,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function WorkflowAutomation() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    templateId: '',
  });

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await WorkflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      const data = await WorkflowService.getExecutions();
      setExecutions(data);
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  const createWorkflow = async () => {
    if (!user) return;

    try {
      const template = workflowTemplates.find((t) => t.id === newWorkflow.templateId);
      if (!template) {
        toast.error('Please select a template');
        return;
      }

      const workflowId = await WorkflowService.createWorkflow({
        name: newWorkflow.name,
        description: newWorkflow.description,
        templateId: template.id,
        nodes: template.nodes,
        edges: template.edges,
        variables: template.variables,
        enabled: true,
        createdBy: user.uid,
      });

      toast.success('Workflow created successfully');
      setShowCreateDialog(false);
      setNewWorkflow({ name: '', description: '', templateId: '' });
      loadWorkflows();
    } catch (error) {
      console.error('Failed to create workflow:', error);
      toast.error('Failed to create workflow');
    }
  };

  const updateWorkflow = async (workflowId: string, updates: Partial<Workflow>) => {
    try {
      await WorkflowService.updateWorkflow(workflowId, updates);
      toast.success('Workflow updated successfully');
      loadWorkflows();
    } catch (error) {
      console.error('Failed to update workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await WorkflowService.deleteWorkflow(workflowId);
      toast.success('Workflow deleted successfully');
      loadWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const toggleWorkflow = async (workflowId: string, enabled: boolean) => {
    try {
      await WorkflowService.toggleWorkflow(workflowId, enabled);
      toast.success(`Workflow ${enabled ? 'enabled' : 'disabled'}`);
      loadWorkflows();
    } catch (error) {
      console.error('Failed to toggle workflow:', error);
      toast.error('Failed to toggle workflow');
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      const executionId = await WorkflowService.executeWorkflow(workflowId);
      toast.success('Workflow execution started');
      // Refresh executions after a delay to show the new execution
      setTimeout(() => loadExecutions(), 1000);
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (workflow: Workflow) => {
    if (!workflow.enabled) {
      return <Badge variant="outline">Disabled</Badge>;
    }
    if (workflow.errorCount > 0) {
      return <Badge variant="destructive">Has Errors</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const categories = Array.from(new Set(workflowTemplates.map((t) => t.category)));

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-gray-600 mt-1">
            Create and manage automated workflows for your business processes
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </div>
                    {getStatusBadge(workflow)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Executions:</span>
                      <span>{workflow.executionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Errors:</span>
                      <span className={workflow.errorCount > 0 ? 'text-red-600' : ''}>
                        {workflow.errorCount}
                      </span>
                    </div>
                    {workflow.lastExecutedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Last Run:</span>
                        <span>{format(workflow.lastExecutedAt, 'MMM d, HH:mm')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Switch
                      checked={workflow.enabled}
                      onCheckedChange={(checked) => toggleWorkflow(workflow.id, checked)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={!workflow.enabled}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWorkflow(workflow);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex gap-4 items-center mb-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflowTemplates
              .filter(
                (template) => filterCategory === 'all' || template.category === filterCategory
              )
              .map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                    <Badge variant="secondary" className="w-fit">
                      {template.category}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-500" />
                        <span>{template.nodes.length} nodes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                        <span>{template.edges.length} connections</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowBuilderDialog(true);
                        }}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewWorkflow({ ...newWorkflow, templateId: template.id });
                          setShowCreateDialog(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="executions">
          <WorkflowExecutionHistory executions={executions} />
        </TabsContent>
      </Tabs>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create a new workflow from a template or start from scratch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="Describe what this workflow does"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="template">Template</Label>
              <Select
                value={newWorkflow.templateId}
                onValueChange={(value) => setNewWorkflow({ ...newWorkflow, templateId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {workflowTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createWorkflow}>Create Workflow</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Edit Workflow: {selectedWorkflow?.name}</DialogTitle>
            <DialogDescription>Modify the workflow using the visual builder</DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full">
            <ReactFlowProvider>
              <WorkflowBuilder
                initialNodes={selectedWorkflow?.nodes || []}
                initialEdges={selectedWorkflow?.edges || []}
                onSave={(nodes, edges) => {
                  if (selectedWorkflow) {
                    updateWorkflow(selectedWorkflow.id, {
                      nodes: nodes as WorkflowNode[],
                      edges: edges as WorkflowEdge[],
                    });
                    setShowEditDialog(false);
                  }
                }}
              />
            </ReactFlowProvider>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      <Dialog open={showBuilderDialog} onOpenChange={setShowBuilderDialog}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full">
            <ReactFlowProvider>
              <WorkflowBuilder
                initialNodes={selectedTemplate?.nodes || []}
                initialEdges={selectedTemplate?.edges || []}
                onSave={() => {
                  toast('This is a preview. Create a workflow to save changes.');
                }}
              />
            </ReactFlowProvider>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
