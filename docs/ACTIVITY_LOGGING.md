# Activity Logging System

## Overview

The activity logging system provides comprehensive tracking of all important user actions and system events in the GroeiMetAI platform. It includes automatic logging, batch processing for performance, and an admin dashboard for monitoring and analysis.

## Features

### 1. Automatic Activity Logging
- **Authentication Events**: Login, logout, registration, password reset, email verification, 2FA changes
- **Project Operations**: Create, update, delete, status changes
- **Quote Management**: Create, update, delete, status changes
- **File Operations**: Upload, download, delete
- **User Management**: Create, update, delete, role changes
- **Admin Actions**: All administrative operations
- **API Calls**: External API interactions
- **Errors**: System errors and failures

### 2. Batch Processing
- Logs are batched for performance (50 logs per batch)
- 5-second delay for batch processing
- Critical activities are logged immediately
- Automatic flush on application shutdown

### 3. Admin Dashboard
- Real-time activity feed with filtering
- Search by user, action type, resource, date range
- Activity analytics and insights
- Suspicious activity detection
- Export to CSV functionality
- Activity timeline visualization
- User activity heatmap

### 4. Data Retention
- 30-day automatic retention policy
- Manual cleanup utility available
- Configurable retention period

## Implementation

### Activity Logger Service
Located at `/src/services/activityLogger.ts`

```typescript
// Log a simple activity
await logAuthActivity('auth.login', userId, userEmail, {
  method: 'google',
  timestamp: new Date().toISOString(),
});

// Log resource activity
await logResourceActivity(
  'project.create',
  'project',
  projectId,
  projectName,
  user,
  metadata
);

// Log errors
await logErrorActivity(
  'file.upload',
  error,
  user,
  context
);
```

### Activity Types
- `auth.*`: Authentication related activities
- `project.*`: Project management activities
- `quote.*`: Quote management activities
- `user.*`: User management activities
- `file.*`: File operations
- `consultation.*`: Consultation bookings
- `message.*`: Messaging activities
- `notification.*`: Notification activities
- `admin.*`: Administrative actions
- `api.*`: API calls
- `error.*`: Error events

### Severity Levels
- `info`: Normal operations
- `warning`: Actions requiring attention
- `error`: Failed operations or errors

## Admin Dashboard

Access the activity logs dashboard at `/dashboard/admin/activity`

### Features:
1. **Activity Feed**: Real-time list of all activities
2. **Filters**: 
   - User search
   - Action type filter
   - Severity filter
   - Date range picker
   - Resource type filter
3. **Analytics Tab**:
   - Total activity count
   - Activities by type
   - Most active users
   - Peak usage hours
   - Activity trends
4. **Export**: Download filtered logs as CSV
5. **Details View**: Click any log entry for full details

## Security Considerations

1. **Access Control**: Only admin users can view activity logs
2. **Data Privacy**: Sensitive data is not logged (passwords, tokens, etc.)
3. **IP Tracking**: Client IP addresses are logged when available
4. **User Agent**: Browser information is captured for security analysis

## Maintenance

### Automatic Cleanup
Old logs are automatically cleaned up after 30 days to manage storage.

### Manual Cleanup
Run the cleanup utility:
```bash
node src/utils/cleanupActivityLogs.ts
```

### Monitoring
- Check for suspicious activities regularly
- Monitor storage usage
- Review error logs for system issues

## Integration Guide

### Adding Activity Logging to New Features

1. Import the logging functions:
```typescript
import { logResourceActivity, logErrorActivity } from '@/services/activityLogger';
```

2. Add logging to your operations:
```typescript
try {
  // Your operation
  const result = await createResource(data);
  
  // Log success
  await logResourceActivity(
    'resource.create',
    'resource',
    result.id,
    result.name,
    currentUser,
    { additionalData }
  );
  
  return result;
} catch (error) {
  // Log error
  await logErrorActivity(
    'resource.create',
    error,
    currentUser,
    { attemptedData: data }
  );
  throw error;
}
```

## Performance Considerations

1. **Batching**: Logs are batched to reduce database writes
2. **Async Processing**: Logging doesn't block main operations
3. **Indexing**: Firestore indexes are configured for efficient queries
4. **Pagination**: Large result sets are paginated

## Future Enhancements

1. **Real-time Alerts**: Immediate notifications for critical events
2. **Advanced Analytics**: Machine learning for anomaly detection
3. **Integration**: Webhook support for external monitoring tools
4. **Compliance**: GDPR-compliant data export and deletion
5. **Audit Trail**: Cryptographic signatures for tamper-proof logs