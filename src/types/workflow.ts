export type TriggerType = 'time-based' | 'event-based' | 'conditional' | 'manual';

export type ActionType = 
  | 'send-email'
  | 'send-notification'
  | 'create-task'
  | 'create-project'
  | 'update-status'
  | 'assign-to-user'
  | 'create-document'
  | 'schedule-meeting'
  | 'wait-condition'
  | 'delay';

export interface WorkflowTrigger {
  type: TriggerType;
  config: {
    schedule?: string; // cron expression for time-based
    event?: string; // event name for event-based
    condition?: string; // condition expression
    delay?: number; // delay in milliseconds
  };
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  name: string;
  config: Record<string, any>;
  nextActions?: string[]; // IDs of next actions
}

export interface WorkflowCondition {
  id: string;
  expression: string;
  trueAction?: string;
  falseAction?: string;
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'end';
  position: { x: number; y: number };
  data: {
    label: string;
    trigger?: WorkflowTrigger;
    action?: WorkflowAction;
    condition?: WorkflowCondition;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastExecutedAt?: Date;
  executionCount: number;
  errorCount: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  currentNodeId?: string;
  variables: Record<string, any>;
  logs: WorkflowLog[];
  error?: string;
}

export interface WorkflowLog {
  timestamp: Date;
  nodeId: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}