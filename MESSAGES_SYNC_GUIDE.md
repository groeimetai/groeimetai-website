# Messages Synchronization Guide

## Overview

The messages functionality is now synchronized between:

1. Dashboard widget (compact view)
2. Full messages page (/dashboard/messages)

Both use the same Firebase collections and real-time sync.

## Data Structure

### Collections Used

- `supportChats`: Support conversations between users and GroeimetAI team
- `projectChats`: Project-specific conversations
- `notifications`: For unread count tracking

### Chat Document Structure

```javascript
{
  id: string,              // Format: "support_${userId}" or "project_${projectId}"
  userId: string,          // User who owns the chat
  userName: string,
  userEmail?: string,
  projectId?: string,      // For project chats only
  projectName?: string,    // For project chats only
  lastMessage: string,
  lastMessageAt: Timestamp,
  lastMessageBy: string,
  isStarred?: boolean,     // Full page feature
  isArchived?: boolean,    // Full page feature
  status: 'active'
}
```

### Message Subcollection Structure

```javascript
{
  id: string,
  senderId: string,
  senderName: string,
  senderRole: 'user' | 'admin',
  content: string,
  createdAt: Timestamp,
  isRead?: boolean
}
```

## Features

### Dashboard Widget

- Compact chat list (1/3 width)
- Real-time message updates
- Unread count indicators
- Quick message sending
- Link to full messages page

### Full Messages Page

- Complete chat management
- Star conversations
- Archive functionality
- Search and filters
- Attachment support (prepared for future)
- Better mobile layout

## Implementation Details

### Real-time Sync

Both interfaces use Firestore `onSnapshot` listeners for real-time updates:

- New messages appear instantly
- Unread counts update automatically
- Last message updates in both views

### Notifications

When a message is sent:

1. Message added to appropriate chat subcollection
2. Notification created for recipient(s)
3. Last message info updated on chat document
4. Both interfaces reflect changes immediately

### Admin vs User Experience

**Users see:**

- Their support chat
- Their project chats

**Admins see:**

- All support chats from all users
- All project chats
- Can respond to any conversation

## Testing

1. Open dashboard in one browser tab
2. Open /dashboard/messages in another tab
3. Send a message in either location
4. Verify it appears in both places
5. Check unread counts update correctly
6. Test star/archive in full page

## Future Enhancements

1. **File Attachments**: Backend structure ready, UI needs implementation
2. **Typing Indicators**: Show when other party is typing
3. **Read Receipts**: Track when messages are read
4. **Push Notifications**: Browser/mobile notifications for new messages
5. **Message Search**: Search within conversation history
