// Export all services from a single entry point
export * from './api';
export * from './projects';
export * from './documentService';
export * from './meetingService';
export * from './userSettingsService';

// Re-export specific services with cleaner names
export { projectService } from './projects';
export { documentService } from './documentService';
export { meetingService } from './meetingService';
export { userSettingsService } from './userSettingsService';