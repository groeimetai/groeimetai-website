# Unified Communication Center

A comprehensive React component that combines Messages and Notifications functionality into a single, unified interface for the GroeimetAI platform.

## Features

### 🚀 Core Functionality
- **Unified Interface**: Single component for both messages and notifications
- **Real-time Updates**: Firebase Firestore real-time listeners for instant updates
- **Tab-based Navigation**: Clean separation between Messages, Notifications, and Settings
- **Combined Badge**: Unified unread count showing total unread items

### 💬 Messages Features
- **Conversation Management**: Support for both project and support chats
- **Real-time Messaging**: Instant message delivery and receipt
- **File Attachments**: Upload and share files with 10MB limit
- **Quick Reply**: Pre-defined quick response buttons
- **Message Threading**: Organized conversation view with timestamps
- **Export Conversations**: Download conversation history as JSON

### 🔔 Enhanced Notifications
- **Priority Sorting**: High, medium, low priority notifications
- **Action Buttons**: Mark read, archive, delete individual notifications
- **Bulk Actions**: Mark all as read, export all notifications
- **Rich Notifications**: Support for different notification types (message, quote, project, payment, meeting, system)
- **Visual Indicators**: Priority badges, action required indicators

### 🔍 Advanced Search & Filtering
- **Universal Search**: Search across both messages and notifications
- **Smart Filtering**: Filter by unread, starred, archived, action required
- **Real-time Results**: Instant search results as you type

### ⚙️ Comprehensive Settings
- **Email Notifications**: Granular control over email preferences
- **Push Notifications**: Browser notification controls with permission handling
- **Message Settings**: Quick reply, threading, sound notifications, preview options

### 🎨 Professional Design
- **GroeimetAI Theme**: Matches the existing dark theme with orange accents
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Framer Motion animations for better UX
- **Loading States**: Proper loading indicators and error handling

## Installation & Usage

### 1. Import the Component

```tsx
import UnifiedCommunicationCenter from '@/components/UnifiedCommunicationCenter';
```

### 2. Add to Your Layout

```tsx
// In your navigation or header component
<UnifiedCommunicationCenter />
```

### 3. Required Dependencies

The component uses these existing dependencies:
- `@/contexts/AuthContext` - For user authentication
- `@/components/ui/*` - Shadcn UI components
- `firebase/firestore` - For data management
- `@/utils/fileUpload` - For file handling
- `framer-motion` - For animations
- `date-fns` - For date formatting
- `react-hot-toast` - For notifications
- `lucide-react` - For icons

## Firebase Collections

The component expects these Firestore collections:

### Notifications Collection (`notifications`)
```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'quote' | 'project' | 'payment' | 'system' | 'meeting';
  title: string;
  description: string;
  read: boolean;
  createdAt: Timestamp;
  link?: string;
  priority?: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}
```

### Support Chats Collection (`supportChats`)
```typescript
interface SupportChat {
  id: string; // format: support_${userId}
  userId: string;
  userName: string;
  userEmail?: string;
  lastMessage?: string;
  lastMessageAt: Timestamp | null;
  isStarred?: boolean;
  isArchived?: boolean;
  status: 'active' | 'closed';
  createdAt: Timestamp;
}
```

### Project Chats Collection (`projectChats`)
```typescript
interface ProjectChat {
  id: string; // format: project_${projectId}
  projectId: string;
  projectName: string;
  lastMessage?: string;
  lastMessageAt: Timestamp | null;
  isStarred?: boolean;
  isArchived?: boolean;
  status: 'active' | 'closed';
  createdAt: Timestamp;
}
```

### Messages Subcollection (`messages`)
```typescript
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  content: string;
  createdAt: Timestamp;
  attachments?: FileAttachment[];
}
```

## Component Architecture

### State Management
The component uses a centralized state object that manages:
- Notifications list and unread count
- Conversations list and selected conversation
- Messages for the active conversation
- Search and filter states
- UI state (active tab, loading states)

### Real-time Updates
- **Notifications**: Real-time listener on user's notifications
- **Messages**: Real-time listener on selected conversation's messages
- **Sound Notifications**: Plays sound for new notifications (when enabled)
- **Browser Notifications**: Shows native browser notifications (with permission)

### File Upload Integration
- Uses existing `uploadFile` utility
- Supports multiple file types (images, PDFs, documents)
- 10MB file size limit
- Files are stored in Firebase Storage and referenced in Firestore

## Customization

### Theme Customization
The component uses CSS classes that can be customized:
- `bg-black/95` - Background colors
- `text-white`, `text-white/60`, `text-white/40` - Text colors
- `bg-orange`, `border-orange` - Accent colors
- `bg-white/5`, `bg-white/10` - Surface colors

### Notification Types
Add new notification types by:
1. Extending the `Notification['type']` union type
2. Adding icon mapping in `getNotificationIcon()`
3. Adding color mapping in `getNotificationColor()`

### Quick Reply Messages
Customize quick reply options in the `sendQuickReply` function calls:
```tsx
<Button onClick={() => sendQuickReply('Custom reply message')}>
  Custom Reply
</Button>
```

## Performance Considerations

### Optimizations Included
- **Memoized Filtering**: Uses `useMemo` for expensive filter operations
- **Pagination**: Limits notifications to 50 recent items
- **Efficient Queries**: Firestore queries are optimized with proper indexing
- **Debounced Search**: Search is responsive but not overwhelming
- **Component Lazy Loading**: Can be code-split if needed

### Firestore Security Rules
Ensure your Firestore security rules allow:
- Users to read/write their own notifications
- Users to read/write their own support chats
- Project participants to access project chats
- Admins to access all chats (for admin users)

## Error Handling

The component includes comprehensive error handling:
- **Network Errors**: Graceful handling of offline states
- **Permission Errors**: Proper handling of Firestore permission errors
- **File Upload Errors**: User-friendly error messages for file issues
- **Authentication Errors**: Handles unauthenticated states

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Logical focus flow throughout the component
- **Color Contrast**: Meets WCAG AA standards for contrast

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Features**: Uses modern APIs with fallbacks (Notification API, File API)

## Migration from Existing Components

### From NotificationCenter
1. Replace `<NotificationCenter />` with `<UnifiedCommunicationCenter />`
2. Remove old notification center imports
3. Update any direct notification center references

### From MessagesPageFirebase
1. Use the unified component instead of the standalone messages page
2. Update navigation links to open the unified component
3. Maintain existing chat functionality seamlessly

## Testing

### Unit Tests
Test files should cover:
- Component rendering with different user roles
- State management and updates
- Firebase integration (with mocked services)
- User interactions and event handlers

### Integration Tests
- End-to-end message sending and receiving
- Notification creation and management
- File upload functionality
- Real-time updates

## Future Enhancements

### Planned Features
- **Message Reactions**: Emoji reactions to messages
- **Message Threads**: Reply-to-message threading
- **Voice Messages**: Audio message support
- **Read Receipts**: Message read status indicators
- **Typing Indicators**: Show when someone is typing
- **Message Search**: Search within conversation history
- **Dark/Light Theme**: Theme switching support

### Performance Improvements
- **Virtual Scrolling**: For very long conversation lists
- **Message Caching**: Client-side message caching
- **Offline Support**: Better offline functionality
- **Push Notifications**: Server-side push notifications

## Support

For issues or questions about the Unified Communication Center:
1. Check the existing Firebase setup and permissions
2. Verify all required dependencies are installed
3. Ensure Firestore collections are properly structured
4. Check browser console for any JavaScript errors
5. Verify user authentication is working correctly

## Changelog

### Version 1.0.0 (Current)
- Initial implementation with full feature set
- Messages and notifications unified interface
- Real-time Firebase integration
- File upload support
- Comprehensive settings panel
- Export functionality
- Mobile-responsive design