import { WorkflowTemplate } from '@/types/workflow';

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'new-client-onboarding',
    name: 'New Client Onboarding',
    description: 'Automated workflow for onboarding new clients',
    category: 'Client Management',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'New Client Created',
          trigger: {
            type: 'event-based',
            config: {
              event: 'client.created',
            },
          },
        },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          label: 'Send Welcome Email',
          action: {
            id: '2',
            type: 'send-email',
            name: 'Send Welcome Email',
            config: {
              template: 'welcome-client',
              to: '{{client.email}}',
              subject: 'Welcome to GroeiMetAI!',
            },
            nextActions: ['3'],
          },
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Create Onboarding Task',
          action: {
            id: '3',
            type: 'create-task',
            name: 'Create Onboarding Task',
            config: {
              title: 'Complete onboarding for {{client.name}}',
              assignTo: '{{accountManager}}',
              dueDate: '{{date.addDays(7)}}',
            },
            nextActions: ['4'],
          },
        },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 700, y: 100 },
        data: {
          label: 'Schedule Kickoff Meeting',
          action: {
            id: '4',
            type: 'schedule-meeting',
            name: 'Schedule Kickoff Meeting',
            config: {
              title: 'Kickoff Meeting - {{client.name}}',
              duration: 60,
              attendees: ['{{client.email}}', '{{accountManager.email}}'],
            },
            nextActions: ['5'],
          },
        },
      },
      {
        id: '5',
        type: 'action',
        position: { x: 900, y: 100 },
        data: {
          label: 'Notify Team',
          action: {
            id: '5',
            type: 'send-notification',
            name: 'Notify Team',
            config: {
              channel: 'new-clients',
              message: 'New client {{client.name}} has been onboarded!',
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
    ],
    variables: {
      client: {},
      accountManager: {},
      date: {},
    },
  },
  {
    id: 'project-kickoff',
    name: 'Project Kickoff',
    description: 'Automated workflow for starting new projects',
    category: 'Project Management',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Project Created',
          trigger: {
            type: 'event-based',
            config: {
              event: 'project.created',
            },
          },
        },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          label: 'Create Project Structure',
          action: {
            id: '2',
            type: 'create-document',
            name: 'Create Project Structure',
            config: {
              template: 'project-structure',
              folder: '{{project.id}}',
            },
            nextActions: ['3'],
          },
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Assign Team',
          action: {
            id: '3',
            type: 'assign-to-user',
            name: 'Assign Team Members',
            config: {
              users: '{{project.team}}',
              role: 'team-member',
            },
            nextActions: ['4'],
          },
        },
      },
      {
        id: '4',
        type: 'condition',
        position: { x: 700, y: 100 },
        data: {
          label: 'Check Budget',
          condition: {
            id: '4',
            expression: 'project.budget > 10000',
            trueAction: '5',
            falseAction: '6',
          },
        },
      },
      {
        id: '5',
        type: 'action',
        position: { x: 900, y: 50 },
        data: {
          label: 'Schedule Executive Review',
          action: {
            id: '5',
            type: 'schedule-meeting',
            name: 'Schedule Executive Review',
            config: {
              title: 'Executive Review - {{project.name}}',
              attendees: ['{{executives}}'],
            },
          },
        },
      },
      {
        id: '6',
        type: 'action',
        position: { x: 900, y: 150 },
        data: {
          label: 'Standard Kickoff',
          action: {
            id: '6',
            type: 'create-task',
            name: 'Create Kickoff Tasks',
            config: {
              tasks: ['Design Review', 'Technical Setup', 'Client Meeting'],
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', label: 'Budget > 10k' },
      { id: 'e4-6', source: '4', target: '6', label: 'Budget ≤ 10k' },
    ],
    variables: {
      project: {},
      executives: [],
    },
  },
  {
    id: 'quote-followup',
    name: 'Quote Follow-up',
    description: 'Automated follow-up for sent quotes',
    category: 'Sales',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Quote Sent',
          trigger: {
            type: 'event-based',
            config: {
              event: 'quote.sent',
            },
          },
        },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          label: 'Wait 3 Days',
          action: {
            id: '2',
            type: 'delay',
            name: 'Wait 3 Days',
            config: {
              delay: 259200000, // 3 days in milliseconds
            },
            nextActions: ['3'],
          },
        },
      },
      {
        id: '3',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: {
          label: 'Quote Viewed?',
          condition: {
            id: '3',
            expression: 'quote.viewed === true',
            trueAction: '4',
            falseAction: '5',
          },
        },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 700, y: 50 },
        data: {
          label: 'Send Follow-up Email',
          action: {
            id: '4',
            type: 'send-email',
            name: 'Send Follow-up Email',
            config: {
              template: 'quote-followup-viewed',
              to: '{{client.email}}',
            },
          },
        },
      },
      {
        id: '5',
        type: 'action',
        position: { x: 700, y: 150 },
        data: {
          label: 'Send Reminder Email',
          action: {
            id: '5',
            type: 'send-email',
            name: 'Send Reminder Email',
            config: {
              template: 'quote-reminder',
              to: '{{client.email}}',
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', label: 'Viewed' },
      { id: 'e3-5', source: '3', target: '5', label: 'Not Viewed' },
    ],
    variables: {
      quote: {},
      client: {},
    },
  },
  {
    id: 'task-escalation',
    name: 'Task Escalation',
    description: 'Escalate overdue tasks to managers',
    category: 'Task Management',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Daily Check',
          trigger: {
            type: 'time-based',
            config: {
              schedule: '0 9 * * *', // Every day at 9 AM
            },
          },
        },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          label: 'Check Overdue Tasks',
          action: {
            id: '2',
            type: 'wait-condition',
            name: 'Find Overdue Tasks',
            config: {
              condition: 'tasks.overdue.count > 0',
            },
            nextActions: ['3'],
          },
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Notify Assignees',
          action: {
            id: '3',
            type: 'send-notification',
            name: 'Notify Task Assignees',
            config: {
              to: '{{task.assignee}}',
              message: 'Task "{{task.title}}" is overdue',
            },
            nextActions: ['4'],
          },
        },
      },
      {
        id: '4',
        type: 'condition',
        position: { x: 700, y: 100 },
        data: {
          label: 'Overdue > 3 days?',
          condition: {
            id: '4',
            expression: 'task.daysOverdue > 3',
            trueAction: '5',
            falseAction: '6',
          },
        },
      },
      {
        id: '5',
        type: 'action',
        position: { x: 900, y: 50 },
        data: {
          label: 'Escalate to Manager',
          action: {
            id: '5',
            type: 'send-email',
            name: 'Escalate to Manager',
            config: {
              to: '{{task.assignee.manager}}',
              subject: 'Urgent: Task Escalation Required',
              template: 'task-escalation',
            },
          },
        },
      },
      {
        id: '6',
        type: 'end',
        position: { x: 900, y: 150 },
        data: {
          label: 'End',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', label: '> 3 days' },
      { id: 'e4-6', source: '4', target: '6', label: '≤ 3 days' },
    ],
    variables: {
      tasks: {},
      task: {},
    },
  },
  {
    id: 'monthly-reporting',
    name: 'Monthly Reporting',
    description: 'Generate and distribute monthly reports',
    category: 'Reporting',
    nodes: [
      {
        id: '1',
        type: 'trigger',
        position: { x: 100, y: 100 },
        data: {
          label: 'Monthly Schedule',
          trigger: {
            type: 'time-based',
            config: {
              schedule: '0 0 1 * *', // First day of each month
            },
          },
        },
      },
      {
        id: '2',
        type: 'action',
        position: { x: 300, y: 100 },
        data: {
          label: 'Generate Reports',
          action: {
            id: '2',
            type: 'create-document',
            name: 'Generate Monthly Reports',
            config: {
              templates: ['project-summary', 'financial-report', 'team-performance'],
              period: '{{lastMonth}}',
            },
            nextActions: ['3'],
          },
        },
      },
      {
        id: '3',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Review Period',
          action: {
            id: '3',
            type: 'delay',
            name: 'Wait for Review',
            config: {
              delay: 86400000, // 1 day
            },
            nextActions: ['4'],
          },
        },
      },
      {
        id: '4',
        type: 'action',
        position: { x: 700, y: 100 },
        data: {
          label: 'Distribute Reports',
          action: {
            id: '4',
            type: 'send-email',
            name: 'Send Reports to Stakeholders',
            config: {
              to: '{{stakeholders}}',
              subject: 'Monthly Reports - {{lastMonth.name}}',
              attachments: '{{reports}}',
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
    ],
    variables: {
      lastMonth: {},
      stakeholders: [],
      reports: [],
    },
  },
];