import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  Workflow,
  WorkflowExecution,
  WorkflowLog,
  WorkflowNode,
  WorkflowAction,
  WorkflowCondition,
} from '@/types/workflow';

const WORKFLOWS_COLLECTION = 'workflows';
const EXECUTIONS_COLLECTION = 'workflow_executions';

export class WorkflowService {
  // Create a new workflow
  static async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'errorCount'>): Promise<string> {
    const workflowRef = doc(collection(db, WORKFLOWS_COLLECTION));
    const newWorkflow = {
      ...workflow,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      executionCount: 0,
      errorCount: 0,
    };
    
    await setDoc(workflowRef, newWorkflow);
    return workflowRef.id;
  }

  // Get all workflows
  static async getWorkflows(): Promise<Workflow[]> {
    const q = query(collection(db, WORKFLOWS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastExecutedAt: doc.data().lastExecutedAt?.toDate(),
    } as Workflow));
  }

  // Get a single workflow
  static async getWorkflow(workflowId: string): Promise<Workflow | null> {
    const workflowDoc = await getDoc(doc(db, WORKFLOWS_COLLECTION, workflowId));
    
    if (!workflowDoc.exists()) {
      return null;
    }
    
    const data = workflowDoc.data();
    return {
      id: workflowDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastExecutedAt: data.lastExecutedAt?.toDate(),
    } as Workflow;
  }

  // Update a workflow
  static async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
    const workflowRef = doc(db, WORKFLOWS_COLLECTION, workflowId);
    await updateDoc(workflowRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }

  // Delete a workflow
  static async deleteWorkflow(workflowId: string): Promise<void> {
    await deleteDoc(doc(db, WORKFLOWS_COLLECTION, workflowId));
  }

  // Enable/disable a workflow
  static async toggleWorkflow(workflowId: string, enabled: boolean): Promise<void> {
    await updateDoc(doc(db, WORKFLOWS_COLLECTION, workflowId), {
      enabled,
      updatedAt: serverTimestamp(),
    });
  }

  // Execute a workflow (mock implementation)
  static async executeWorkflow(workflowId: string, variables: Record<string, any> = {}): Promise<string> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (!workflow.enabled) {
      throw new Error('Workflow is disabled');
    }

    // Create execution record
    const executionRef = doc(collection(db, EXECUTIONS_COLLECTION));
    const execution: Omit<WorkflowExecution, 'id'> = {
      workflowId,
      status: 'running',
      startedAt: new Date(),
      variables: { ...workflow.variables, ...variables },
      logs: [],
    };

    await setDoc(executionRef, execution);

    // Update workflow last executed
    await updateDoc(doc(db, WORKFLOWS_COLLECTION, workflowId), {
      lastExecutedAt: serverTimestamp(),
      executionCount: (workflow.executionCount || 0) + 1,
    });

    // Mock execution - in real implementation, this would be handled by Cloud Functions
    setTimeout(async () => {
      await this.mockExecuteNodes(executionRef.id, workflow, variables);
    }, 100);

    return executionRef.id;
  }

  // Mock node execution
  private static async mockExecuteNodes(
    executionId: string,
    workflow: Workflow,
    variables: Record<string, any>
  ): Promise<void> {
    const logs: WorkflowLog[] = [];
    let currentNodeId = workflow.nodes.find(n => n.type === 'trigger')?.id;

    if (!currentNodeId) {
      await this.updateExecution(executionId, {
        status: 'failed',
        completedAt: new Date(),
        error: 'No trigger node found',
      });
      return;
    }

    try {
      while (currentNodeId) {
        const node = workflow.nodes.find(n => n.id === currentNodeId);
        if (!node) break;

        // Log execution
        logs.push({
          timestamp: new Date(),
          nodeId: node.id,
          action: node.data.label,
          status: 'success',
          message: `Executed ${node.type}: ${node.data.label}`,
        });

        // Update execution
        await this.updateExecution(executionId, {
          currentNodeId: node.id,
          logs,
        });

        // Find next node
        const edge = workflow.edges.find(e => e.source === currentNodeId);
        currentNodeId = edge?.target;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Complete execution
      await this.updateExecution(executionId, {
        status: 'completed',
        completedAt: new Date(),
        logs,
      });
    } catch (error) {
      await this.updateExecution(executionId, {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        logs,
      });

      // Update workflow error count
      await updateDoc(doc(db, WORKFLOWS_COLLECTION, workflow.id), {
        errorCount: (workflow.errorCount || 0) + 1,
      });
    }
  }

  // Update execution
  private static async updateExecution(executionId: string, updates: Partial<WorkflowExecution>): Promise<void> {
    await updateDoc(doc(db, EXECUTIONS_COLLECTION, executionId), updates);
  }

  // Get workflow executions
  static async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    let q;
    if (workflowId) {
      q = query(
        collection(db, EXECUTIONS_COLLECTION),
        where('workflowId', '==', workflowId),
        orderBy('startedAt', 'desc')
      );
    } else {
      q = query(collection(db, EXECUTIONS_COLLECTION), orderBy('startedAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startedAt: doc.data().startedAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      logs: doc.data().logs?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate(),
      })),
    } as WorkflowExecution));
  }

  // Get single execution
  static async getExecution(executionId: string): Promise<WorkflowExecution | null> {
    const executionDoc = await getDoc(doc(db, EXECUTIONS_COLLECTION, executionId));
    
    if (!executionDoc.exists()) {
      return null;
    }
    
    const data = executionDoc.data();
    return {
      id: executionDoc.id,
      ...data,
      startedAt: data.startedAt?.toDate(),
      completedAt: data.completedAt?.toDate(),
      logs: data.logs?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp?.toDate(),
      })),
    } as WorkflowExecution;
  }

  // Evaluate condition (mock implementation)
  static evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    try {
      // In a real implementation, use a safe expression evaluator
      // For now, just return a random boolean for demo
      return Math.random() > 0.5;
    } catch {
      return false;
    }
  }

  // Replace variables in string
  static replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const keys = key.trim().split('.');
      let value: any = variables;
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value !== undefined ? String(value) : match;
    });
  }
}