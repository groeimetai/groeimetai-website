import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Clock, 
  Zap, 
  GitBranch, 
  Mail, 
  Bell, 
  CheckSquare,
  FolderPlus,
  Calendar,
  User,
  FileText,
  Timer,
  Play,
  Square
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'time-based': <Clock className="w-4 h-4" />,
  'event-based': <Zap className="w-4 h-4" />,
  'conditional': <GitBranch className="w-4 h-4" />,
  'send-email': <Mail className="w-4 h-4" />,
  'send-notification': <Bell className="w-4 h-4" />,
  'create-task': <CheckSquare className="w-4 h-4" />,
  'create-project': <FolderPlus className="w-4 h-4" />,
  'schedule-meeting': <Calendar className="w-4 h-4" />,
  'assign-to-user': <User className="w-4 h-4" />,
  'create-document': <FileText className="w-4 h-4" />,
  'delay': <Timer className="w-4 h-4" />,
  'trigger': <Play className="w-4 h-4" />,
  'end': <Square className="w-4 h-4" />,
};

export const TriggerNode: React.FC<NodeProps> = ({ data, selected }) => {
  const icon = data.trigger?.type ? iconMap[data.trigger.type] : iconMap['trigger'];
  
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
      selected ? 'border-blue-500' : 'border-green-500'
    } bg-green-50 min-w-[150px]`}>
      <div className="flex items-center gap-2">
        <div className="text-green-600">{icon}</div>
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      {data.trigger?.type && (
        <div className="text-xs text-gray-500 mt-1">
          {data.trigger.type}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
    </div>
  );
};

export const ActionNode: React.FC<NodeProps> = ({ data, selected }) => {
  const icon = data.action?.type ? iconMap[data.action.type] : <Zap className="w-4 h-4" />;
  
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
      selected ? 'border-blue-500' : 'border-blue-400'
    } bg-blue-50 min-w-[150px]`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <div className="text-blue-600">{icon}</div>
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      {data.action?.type && (
        <div className="text-xs text-gray-500 mt-1">
          {data.action.type.split('-').join(' ')}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </div>
  );
};

export const ConditionNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
      selected ? 'border-blue-500' : 'border-yellow-500'
    } bg-yellow-50 min-w-[150px]`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-yellow-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-yellow-600" />
        <div className="text-sm font-medium">{data.label}</div>
      </div>
      {data.condition?.expression && (
        <div className="text-xs text-gray-500 mt-1 font-mono">
          {data.condition.expression}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '30%' }}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '70%' }}
        className="w-3 h-3 bg-red-500 border-2 border-white"
      />
    </div>
  );
};

export const EndNode: React.FC<NodeProps> = ({ data, selected }) => {
  return (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
      selected ? 'border-blue-500' : 'border-gray-500'
    } bg-gray-50 min-w-[100px]`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />
      <div className="flex items-center gap-2">
        <Square className="w-4 h-4 text-gray-600" />
        <div className="text-sm font-medium">{data.label || 'End'}</div>
      </div>
    </div>
  );
};

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  end: EndNode,
};