'use client';

import React from 'react';
import { BulkActions, SelectableListItem, useBulkSelection } from './BulkActions';
import type { BulkActionType } from './BulkActions';

// Example data type
interface Project {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  assignee?: string;
  createdAt: Date;
}

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    status: 'active',
    assignee: 'John Doe',
    createdAt: new Date(),
  },
  { id: '2', name: 'Mobile App', status: 'draft', createdAt: new Date() },
  {
    id: '3',
    name: 'API Development',
    status: 'completed',
    assignee: 'Jane Smith',
    createdAt: new Date(),
  },
  {
    id: '4',
    name: 'Database Migration',
    status: 'active',
    assignee: 'Bob Johnson',
    createdAt: new Date(),
  },
];

// Status options for bulk update
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

// Assignee options for bulk assign
const assigneeOptions = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'bob-johnson', label: 'Bob Johnson' },
  { value: 'unassigned', label: 'Unassigned' },
];

export function BulkActionsExample() {
  const [projects, setProjects] = React.useState(mockProjects);

  // Use the bulk selection hook
  const { selectedIds, setSelectedIds, toggleSelection, clearSelection } =
    useBulkSelection(projects);

  // Handle bulk actions
  const handleBulkAction = async (action: BulkActionType, data?: any) => {
    console.log('Executing bulk action:', action, data);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    switch (action) {
      case 'delete':
        // Remove selected projects
        setProjects((prev) => prev.filter((p) => !data.ids.includes(p.id)));
        break;

      case 'archive':
        // Archive selected projects
        setProjects((prev) =>
          prev.map((p) => (data.ids.includes(p.id) ? { ...p, status: 'archived' as const } : p))
        );
        break;

      case 'updateStatus':
        // Update status for selected projects
        setProjects((prev) =>
          prev.map((p) => (data.ids.includes(p.id) ? { ...p, status: data.status } : p))
        );
        break;

      case 'assign':
        // Assign selected projects
        setProjects((prev) =>
          prev.map((p) =>
            data.ids.includes(p.id)
              ? { ...p, assignee: data.assigneeId === 'unassigned' ? undefined : data.assigneeId }
              : p
          )
        );
        break;

      case 'export':
        // Export selected projects
        const selectedProjects = projects.filter((p) => data.ids.includes(p.id));
        const csv = [
          ['ID', 'Name', 'Status', 'Assignee', 'Created At'],
          ...selectedProjects.map((p) => [
            p.id,
            p.name,
            p.status,
            p.assignee || 'Unassigned',
            p.createdAt.toISOString(),
          ]),
        ]
          .map((row) => row.join(','))
          .join('\n');

        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'projects-export.csv';
        a.click();
        URL.revokeObjectURL(url);
        break;
    }

    // Clear selection after action
    clearSelection();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Projects with Bulk Actions</h2>

      {/* Bulk Actions Component */}
      <BulkActions
        items={projects}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onAction={handleBulkAction}
        statusOptions={statusOptions}
        assigneeOptions={assigneeOptions}
      />

      {/* List of projects with selection */}
      <div className="border rounded-lg divide-y">
        {projects.map((project) => (
          <SelectableListItem
            key={project.id}
            id={project.id}
            isSelected={selectedIds.has(project.id)}
            onSelect={toggleSelection}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm text-gray-500">
                  Status: <span className="capitalize">{project.status}</span>
                  {project.assignee && ` • Assigned to: ${project.assignee}`}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {project.createdAt.toLocaleDateString()}
              </span>
            </div>
          </SelectableListItem>
        ))}
      </div>

      {/* Integration with existing table component */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Table Integration Example</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 p-3">
                  <input
                    type="checkbox"
                    checked={projects.length > 0 && selectedIds.size === projects.length}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate =
                          selectedIds.size > 0 && selectedIds.size < projects.length;
                      }
                    }}
                    onChange={() => {
                      if (selectedIds.size === projects.length) {
                        clearSelection();
                      } else {
                        setSelectedIds(new Set(projects.map((p) => p.id)));
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Assignee</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className={selectedIds.has(project.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(project.id)}
                      onChange={() => toggleSelection(project.id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-3">{project.name}</td>
                  <td className="p-3">
                    <span className="capitalize px-2 py-1 text-xs rounded-full bg-gray-100">
                      {project.status}
                    </span>
                  </td>
                  <td className="p-3">{project.assignee || '-'}</td>
                  <td className="p-3">{project.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
