# GroeimetAI Firestore Database Schema

## Overview

This document defines the complete Firestore database schema for GroeimetAI platform, including collections, documents, fields, relationships, and security rules.

## Collections Schema

### 1. users

User profiles and authentication data.

```typescript
interface User {
  // Document ID: Firebase Auth UID
  uid: string;

  // Basic Information
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;

  // Profile Details
  firstName: string;
  lastName: string;
  bio?: string;
  title?: string;
  company?: string;
  linkedinUrl?: string;
  website?: string;

  // Role & Permissions
  role: 'admin' | 'consultant' | 'client' | 'guest';
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;

  // Organization
  organizationId?: string;
  organizationRole?: 'owner' | 'admin' | 'member';

  // Preferences
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      inApp: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  lastActivityAt: Timestamp;

  // Subscription
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  subscriptionPlan?: 'free' | 'starter' | 'professional' | 'enterprise';

  // Stats
  stats: {
    projectsCount: number;
    consultationsCount: number;
    messagesCount: number;
    totalSpent: number;
  };
}

// Subcollections
users / { uid } / sessions; // Login sessions
users / { uid } / devices; // Registered devices
users / { uid } / apiKeys; // Personal API keys
```

### 2. organizations

Company/organization accounts for team collaboration.

```typescript
interface Organization {
  // Document ID: Auto-generated
  id: string;

  // Basic Information
  name: string;
  displayName: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'enterprise';

  // Contact Information
  email: string;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // Billing Information
  billingEmail?: string;
  vatNumber?: string;
  billingAddress?: Address;

  // Members
  ownerId: string;
  memberIds: string[];
  pendingInvites: {
    email: string;
    role: string;
    invitedBy: string;
    invitedAt: Timestamp;
    token: string;
  }[];

  // Subscription
  subscriptionId?: string;
  subscriptionPlan: 'team' | 'business' | 'enterprise';
  subscriptionStatus: string;
  seats: number;

  // Settings
  settings: {
    allowedDomains: string[];
    ssoEnabled: boolean;
    twoFactorRequired: boolean;
    dataRetentionDays: number;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Subcollections
organizations / { id } / audit_logs; // Organization activity logs
organizations / { id } / integrations; // Third-party integrations
```

### 3. projects

Client projects and engagements.

```typescript
interface Project {
  // Document ID: Auto-generated
  id: string;

  // Basic Information
  name: string;
  description: string;
  type: 'consultation' | 'implementation' | 'support' | 'training';
  status: 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // Ownership
  clientId: string; // User ID
  organizationId?: string; // Organization ID
  consultantId: string; // Assigned consultant
  teamIds: string[]; // Team members

  // Timeline
  startDate: Timestamp;
  endDate?: Timestamp;
  actualStartDate?: Timestamp;
  actualEndDate?: Timestamp;
  estimatedHours: number;
  actualHours: number;

  // Budget
  budget: {
    amount: number;
    currency: string;
    type: 'fixed' | 'hourly' | 'milestone';
    hourlyRate?: number;
  };

  // Milestones
  milestones: {
    id: string;
    name: string;
    description: string;
    dueDate: Timestamp;
    status: 'pending' | 'in_progress' | 'completed';
    completedAt?: Timestamp;
    deliverables: string[];
    payment?: {
      amount: number;
      status: 'pending' | 'paid';
      invoiceId?: string;
    };
  }[];

  // Tags & Categories
  tags: string[];
  categories: string[];
  technologies: string[];

  // Files & Documents
  documentIds: string[];

  // Communication
  conversationId?: string;
  meetingIds: string[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  completedAt?: Timestamp;
}

// Subcollections
projects / { id } / tasks; // Project tasks
projects / { id } / documents; // Project documents
projects / { id } / time_entries; // Time tracking
projects / { id } / notes; // Project notes
```

### 4. consultations

AI consultation sessions and history.

```typescript
interface Consultation {
  // Document ID: Auto-generated
  id: string;

  // Session Information
  userId: string;
  projectId?: string;
  title: string;
  type: 'chat' | 'document_analysis' | 'code_review' | 'strategy';
  status: 'active' | 'completed' | 'archived';

  // AI Configuration
  model: 'gemini-pro' | 'gemini-pro-vision' | 'gemini-code';
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;

  // Context
  context: {
    documents: string[]; // Document IDs
    previousSessions: string[]; // Related consultation IDs
    knowledgeBase: string[]; // KB article IDs
  };

  // Messages
  messages: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Timestamp;
    metadata?: {
      model?: string;
      tokens?: number;
      processingTime?: number;
      citations?: string[];
    };
  }[];

  // Summary
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];

  // Usage & Billing
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  };

  // Feedback
  feedback?: {
    rating: number;
    comment?: string;
    helpful: boolean;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  duration: number; // in seconds
}

// Subcollections
consultations / { id } / attachments; // Uploaded files
consultations / { id } / exports; // Exported versions
```

### 5. conversations

Real-time messaging conversations.

```typescript
interface Conversation {
  // Document ID: Auto-generated
  id: string;

  // Participants
  participantIds: string[];
  participants: {
    [userId: string]: {
      displayName: string;
      photoURL?: string;
      role: string;
      joinedAt: Timestamp;
      lastReadAt: Timestamp;
      unreadCount: number;
    };
  };

  // Conversation Details
  type: 'direct' | 'group' | 'project' | 'support';
  name?: string; // For group chats
  description?: string;
  avatar?: string;

  // Related Entities
  projectId?: string;
  consultationId?: string;

  // Last Message Preview
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    timestamp: Timestamp;
    type: 'text' | 'file' | 'image';
  };

  // Settings
  settings: {
    muted: { [userId: string]: boolean };
    archived: { [userId: string]: boolean };
    notifications: { [userId: string]: boolean };
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  isActive: boolean;
}

// Subcollections
conversations / { id } / messages; // Chat messages
conversations / { id } / typing; // Typing indicators
```

### 6. messages

Individual chat messages.

```typescript
interface Message {
  // Document ID: Auto-generated with timestamp prefix
  id: string;

  // Message Content
  content: string;
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'system';

  // Sender Information
  senderId: string;
  senderName: string;
  senderAvatar?: string;

  // Rich Content
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    thumbnailUrl?: string;
  }[];

  // Mentions & References
  mentions?: string[]; // User IDs
  replyTo?: string; // Message ID
  forwarded?: boolean;

  // Reactions
  reactions?: {
    [emoji: string]: string[]; // emoji -> user IDs
  };

  // Status
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  readBy: {
    [userId: string]: Timestamp;
  };

  // Edit History
  edited?: boolean;
  editedAt?: Timestamp;
  editHistory?: {
    content: string;
    editedAt: Timestamp;
  }[];

  // Metadata
  conversationId: string;
  timestamp: Timestamp;
  deletedAt?: Timestamp;
  deletedBy?: string;
}
```

### 7. quotes

Quote requests and proposals.

```typescript
interface Quote {
  // Document ID: Auto-generated with prefix QT-
  id: string;
  quoteNumber: string;

  // Client Information
  clientId: string;
  organizationId?: string;
  contactPerson: {
    name: string;
    email: string;
    phone?: string;
  };

  // Quote Details
  title: string;
  description: string;
  type: 'project' | 'retainer' | 'hourly' | 'support';
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

  // Services
  items: {
    id: string;
    serviceId?: string;
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
    total: number;
  }[];

  // Pricing
  pricing: {
    subtotal: number;
    discount: number;
    discountType: 'percentage' | 'fixed';
    tax: number;
    taxRate: number;
    total: number;
    currency: string;
  };

  // Terms
  terms: {
    paymentTerms: string;
    validUntil: Timestamp;
    deliveryTime: string;
    warranty?: string;
    notes?: string;
  };

  // Attachments
  attachments: string[];

  // Tracking
  sentAt?: Timestamp;
  viewedAt?: Timestamp;
  respondedAt?: Timestamp;

  // Conversion
  convertedToProject?: string;
  conversionRate?: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Subcollections
quotes / { id } / versions; // Quote version history
quotes / { id } / activities; // Quote activity log
```

### 8. invoices

Generated invoices and payment records.

```typescript
interface Invoice {
  // Document ID: Auto-generated with prefix INV-
  id: string;
  invoiceNumber: string;

  // Billing Information
  clientId: string;
  organizationId?: string;
  billingAddress: Address;

  // Related Entities
  projectId?: string;
  quoteId?: string;
  milestoneId?: string;

  // Invoice Details
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  type: 'standard' | 'recurring' | 'credit_note';

  // Line Items
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    total: number;
    projectId?: string;
    timeEntryIds?: string[];
  }[];

  // Financial Details
  financial: {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    paid: number;
    balance: number;
    currency: string;
  };

  // Dates
  issueDate: Timestamp;
  dueDate: Timestamp;
  paidDate?: Timestamp;

  // Payment Information
  paymentMethod?: 'bank_transfer' | 'credit_card' | 'paypal' | 'stripe';
  paymentDetails?: {
    transactionId?: string;
    reference?: string;
    notes?: string;
  };

  // Reminders
  reminders: {
    sentAt: Timestamp;
    type: 'due_soon' | 'overdue' | 'final_notice';
  }[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;

  // PDF
  pdfUrl?: string;
  pdfGeneratedAt?: Timestamp;
}

// Subcollections
invoices / { id } / payments; // Payment history
invoices / { id } / activities; // Invoice activity log
```

### 9. services

Service catalog and offerings.

```typescript
interface Service {
  // Document ID: Auto-generated
  id: string;

  // Service Information
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: 'ai_consulting' | 'development' | 'servicenow' | 'training' | 'support';

  // Pricing
  pricing: {
    model: 'fixed' | 'hourly' | 'subscription' | 'custom';
    price?: number;
    currency: string;
    billingPeriod?: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
    customPricing?: boolean;
  };

  // Features
  features: string[];
  deliverables: string[];
  prerequisites?: string[];

  // Duration
  estimatedDuration?: {
    min: number;
    max: number;
    unit: 'hours' | 'days' | 'weeks' | 'months';
  };

  // Availability
  isActive: boolean;
  isPublic: boolean;
  availableFrom?: Timestamp;
  availableUntil?: Timestamp;

  // Media
  icon?: string;
  images?: string[];
  brochureUrl?: string;

  // SEO
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };

  // Stats
  stats: {
    projectsCount: number;
    revenue: number;
    averageRating: number;
    completionRate: number;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Subcollections
services / { id } / reviews; // Service reviews
services / { id } / faqs; // Frequently asked questions
```

### 10. knowledge_base

Documentation and knowledge articles.

```typescript
interface KnowledgeArticle {
  // Document ID: Auto-generated
  id: string;

  // Article Information
  title: string;
  slug: string;
  content: string; // Markdown content
  excerpt: string;

  // Categorization
  category: string;
  subcategory?: string;
  tags: string[];
  type: 'guide' | 'tutorial' | 'faq' | 'troubleshooting' | 'reference';

  // Access Control
  visibility: 'public' | 'authenticated' | 'private';
  allowedRoles?: string[];
  allowedUsers?: string[];

  // SEO & Search
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  searchKeywords: string[];

  // Versioning
  version: number;
  isDraft: boolean;
  publishedAt?: Timestamp;

  // Related Content
  relatedArticles: string[];
  relatedProjects?: string[];
  prerequisites?: string[];

  // Media
  featuredImage?: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];

  // Analytics
  views: number;
  helpful: number;
  notHelpful: number;

  // AI Enhancement
  embedding?: number[]; // Vector embedding for similarity search
  summary?: string; // AI-generated summary

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  lastEditedBy: string;
}

// Subcollections
knowledge_base / { id } / revisions; // Article version history
knowledge_base / { id } / feedback; // User feedback
```

### 11. transactions

Payment and financial transactions.

```typescript
interface Transaction {
  // Document ID: Auto-generated
  id: string;

  // Transaction Details
  type: 'payment' | 'refund' | 'charge' | 'subscription' | 'fee';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  // Financial Information
  amount: number;
  currency: string;
  fee?: number;
  netAmount?: number;

  // Related Entities
  userId: string;
  organizationId?: string;
  invoiceId?: string;
  projectId?: string;
  subscriptionId?: string;

  // Payment Details
  paymentMethod: {
    type: 'card' | 'bank' | 'paypal' | 'stripe';
    last4?: string;
    brand?: string;
    funding?: string;
  };

  // Gateway Information
  gateway: 'stripe' | 'paypal' | 'bank';
  gatewayTransactionId: string;
  gatewayResponse?: any;

  // Description
  description: string;
  metadata?: Record<string, any>;

  // Dates
  createdAt: Timestamp;
  processedAt?: Timestamp;
  failedAt?: Timestamp;

  // Error Handling
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  // Reconciliation
  reconciled: boolean;
  reconciledAt?: Timestamp;
  reconciledBy?: string;
}
```

### 12. activity_logs

System-wide audit trail.

```typescript
interface ActivityLog {
  // Document ID: Auto-generated with timestamp
  id: string;

  // Actor Information
  userId?: string;
  userEmail?: string;
  userRole?: string;
  impersonatedBy?: string;

  // Activity Details
  action: string; // e.g., 'user.login', 'project.create'
  category: 'auth' | 'user' | 'project' | 'billing' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';

  // Target Entity
  targetType?: string; // e.g., 'user', 'project', 'invoice'
  targetId?: string;
  targetName?: string;

  // Changes
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];

  // Context
  context: {
    ip?: string;
    userAgent?: string;
    location?: string;
    device?: string;
    sessionId?: string;
  };

  // Request Information
  request?: {
    method: string;
    path: string;
    query?: Record<string, any>;
    body?: Record<string, any>;
  };

  // Response
  response?: {
    status: number;
    duration: number;
    error?: string;
  };

  // Metadata
  timestamp: Timestamp;
  environment: 'development' | 'staging' | 'production';
}
```

### 13. system_config

Platform configuration and settings.

```typescript
interface SystemConfig {
  // Document ID: Setting key
  key: string;

  // Configuration Value
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';

  // Metadata
  description?: string;
  category: string;
  isPublic: boolean;
  isEditable: boolean;

  // Validation
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };

  // Audit
  updatedAt: Timestamp;
  updatedBy: string;
  version: number;
}
```

## Indexes

### Composite Indexes

```
# Users
- users: (role, isActive, createdAt DESC)
- users: (organizationId, role, isActive)

# Projects
- projects: (clientId, status, createdAt DESC)
- projects: (consultantId, status, priority DESC)
- projects: (organizationId, status, updatedAt DESC)

# Consultations
- consultations: (userId, status, createdAt DESC)
- consultations: (projectId, createdAt DESC)

# Messages
- messages: (conversationId, timestamp DESC)
- messages: (senderId, conversationId, timestamp DESC)

# Invoices
- invoices: (clientId, status, dueDate ASC)
- invoices: (organizationId, status, issueDate DESC)

# Activity Logs
- activity_logs: (userId, category, timestamp DESC)
- activity_logs: (targetType, targetId, timestamp DESC)
```

## Security Rules

### Example Security Rules

```javascript
// Users can read their own profile
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow update: if request.auth != null && request.auth.uid == userId
    && !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['role', 'permissions', 'isActive']);
}

// Project access based on participation
match /projects/{projectId} {
  allow read: if request.auth != null && (
    resource.data.clientId == request.auth.uid ||
    resource.data.consultantId == request.auth.uid ||
    request.auth.uid in resource.data.teamIds ||
    request.auth.token.role == 'admin'
  );
}

// Organization-based access
match /organizations/{orgId} {
  allow read: if request.auth != null && (
    request.auth.uid in resource.data.memberIds ||
    request.auth.token.organizationId == orgId
  );
}
```

## Data Relationships

### Entity Relationship Diagram

```
users (1) ----< (N) projects
users (1) ----< (N) consultations
users (1) ----< (N) conversations
users (N) >----< (N) organizations

projects (1) ----< (N) consultations
projects (1) ----< (N) invoices
projects (1) ----< (N) quotes

conversations (1) ----< (N) messages
invoices (1) ----< (N) transactions

organizations (1) ----< (N) projects
organizations (1) ----< (N) users
```

## Migration Strategy

### Data Migration Plan

1. Export existing data from current system
2. Transform data to match new schema
3. Validate data integrity
4. Import in batches with error handling
5. Verify data consistency
6. Update references and relationships
7. Test application functionality
8. Implement rollback procedures
