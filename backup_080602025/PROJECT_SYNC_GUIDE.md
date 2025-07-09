# Real-Time Project Synchronization Guide

## Overview

Projects are now synchronized in real-time between admin and user dashboards using Firebase onSnapshot listeners.

## How It Works

### 1. Data Sources

Projects can exist in two collections:

- **quotes** collection: Approved quotes become projects
- **projects** collection: Direct project entries

### 2. Real-Time Updates

All project-related pages use onSnapshot listeners:

- `/dashboard/projects` - User's project list
- `/dashboard/projects/[id]` - Individual project details
- `/dashboard/admin/projects` - Admin project management
- Dashboard widgets - Project timeline widget

### 3. Admin Actions

When an admin updates a project:

1. Changes are written to Firebase
2. All active listeners receive the update
3. UI updates automatically without refresh

### 4. User Experience

Users see real-time updates for:

- Project status changes
- Timeline progress updates
- Milestone completions
- Project details modifications

## Key Features

### Automatic Sync

- No manual refresh needed
- Updates appear within milliseconds
- Works across multiple browser tabs

### Data Consistency

- Both quotes and projects collections are monitored
- Timeline data syncs separately via projectTimelines collection
- All dates are properly converted from Firestore Timestamps

### Performance

- Listeners are cleaned up on component unmount
- Queries are optimized with proper indexes
- Only relevant data is synchronized

## Technical Details

### Firebase Listeners

```javascript
// Example from project detail page
const unsubscribe = onSnapshot(doc(db, 'quotes', projectId), (doc) => {
  // Handle real-time updates
});
```

### Cleanup

```javascript
useEffect(() => {
  // Set up listeners
  return () => {
    // Clean up all listeners
    unsubscribes.forEach((unsub) => unsub());
  };
}, [dependencies]);
```

## Testing

1. Open admin dashboard in one browser
2. Open user dashboard in another browser
3. Admin updates project status/progress
4. User sees changes immediately

## Notes

- Firestore indexes are configured for optimal query performance
- Security rules ensure users only see their own projects
- Admins have full access to all projects
