# GroeimetAI API Specification

## API Overview

### Base URLs

- Development: `http://localhost:3000/api/v1`
- Staging: `https://staging-api.groeimetai.io/v1`
- Production: `https://api.groeimetai.io/v1`

### Authentication

All API requests require authentication using Firebase ID tokens.

```http
Authorization: Bearer <firebase-id-token>
```

### Common Headers

```http
Content-Type: application/json
Accept: application/json
X-API-Version: 1.0
X-Request-ID: <unique-request-id>
```

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}
```

## Authentication Endpoints

### POST /auth/login

Authenticate user and get tokens.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "uid": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "client"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/logout

Logout user and invalidate tokens.

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Successfully logged out"
  }
}
```

### POST /auth/refresh

Refresh access token.

**Request:**

```json
{
  "refreshToken": "eyJ..."
}
```

### POST /auth/forgot-password

Send password reset email.

**Request:**

```json
{
  "email": "user@example.com"
}
```

### POST /auth/verify-email

Send email verification.

**Request:**

```json
{
  "email": "user@example.com"
}
```

## User Management Endpoints

### GET /users/profile

Get current user profile.

**Response:**

```json
{
  "success": true,
  "data": {
    "uid": "user123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "photoURL": "https://...",
    "role": "client",
    "organizationId": "org123",
    "preferences": {
      "language": "en",
      "timezone": "Europe/Amsterdam",
      "theme": "light"
    },
    "stats": {
      "projectsCount": 5,
      "consultationsCount": 23,
      "totalSpent": 15000
    }
  }
}
```

### PUT /users/profile

Update user profile.

**Request:**

```json
{
  "displayName": "John Smith",
  "bio": "AI Consultant",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

### POST /users/upload-avatar

Upload user avatar.

**Request:**

```
Content-Type: multipart/form-data
avatar: <file>
```

### GET /users

List users (admin only).

**Query Parameters:**

- `role`: Filter by role
- `organizationId`: Filter by organization
- `search`: Search query
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc)

## Project Management Endpoints

### GET /projects

List user's projects.

**Query Parameters:**

- `status`: Filter by status (active, completed, etc.)
- `type`: Filter by type
- `consultantId`: Filter by consultant
- `search`: Search in name/description
- `startDate`: Filter by start date
- `endDate`: Filter by end date

**Response:**

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj123",
        "name": "AI Implementation",
        "description": "Implement AI chatbot",
        "status": "active",
        "type": "implementation",
        "startDate": "2024-01-15T00:00:00Z",
        "budget": {
          "amount": 50000,
          "currency": "EUR",
          "type": "fixed"
        },
        "progress": 65,
        "consultant": {
          "id": "consultant123",
          "name": "Jane Consultant",
          "avatar": "https://..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### POST /projects

Create new project.

**Request:**

```json
{
  "name": "New AI Project",
  "description": "Implement conversational AI",
  "type": "implementation",
  "startDate": "2024-02-01",
  "estimatedHours": 160,
  "budget": {
    "amount": 50000,
    "currency": "EUR",
    "type": "fixed"
  },
  "milestones": [
    {
      "name": "Phase 1: Requirements",
      "description": "Gather and document requirements",
      "dueDate": "2024-02-15",
      "deliverables": ["Requirements document", "Technical specification"]
    }
  ]
}
```

### GET /projects/:id

Get project details.

### PUT /projects/:id

Update project.

### DELETE /projects/:id

Delete project (soft delete).

### POST /projects/:id/milestones

Add milestone to project.

### PUT /projects/:id/milestones/:milestoneId

Update milestone.

### POST /projects/:id/complete

Mark project as completed.

## Consultation Endpoints

### GET /consultations

List user's consultations.

**Query Parameters:**

- `projectId`: Filter by project
- `type`: Filter by consultation type
- `status`: Filter by status
- `dateFrom`: Start date filter
- `dateTo`: End date filter

### POST /consultations

Start new consultation.

**Request:**

```json
{
  "title": "Architecture Review",
  "type": "chat",
  "projectId": "proj123",
  "context": {
    "documents": ["doc123", "doc456"],
    "previousSessions": ["session789"]
  },
  "model": "gemini-pro",
  "temperature": 0.7
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "consultationId": "consult123",
    "status": "active",
    "websocketUrl": "wss://api.groeimetai.io/consultations/consult123"
  }
}
```

### GET /consultations/:id

Get consultation details with full history.

### POST /consultations/:id/messages

Send message in consultation.

**Request:**

```json
{
  "content": "How should I structure my microservices?",
  "attachments": ["file123"]
}
```

### POST /consultations/:id/complete

Complete consultation and generate summary.

### GET /consultations/:id/export

Export consultation as PDF/Markdown.

**Query Parameters:**

- `format`: pdf, markdown, docx

## Messaging Endpoints

### GET /conversations

List user's conversations.

**Query Parameters:**

- `type`: Filter by type (direct, group, project)
- `projectId`: Filter by project
- `archived`: Include archived (true/false)
- `unread`: Only unread conversations

### POST /conversations

Create new conversation.

**Request:**

```json
{
  "type": "direct",
  "participantIds": ["user123", "user456"],
  "name": "Project Discussion",
  "projectId": "proj123"
}
```

### GET /conversations/:id

Get conversation with recent messages.

**Query Parameters:**

- `limit`: Number of messages (default: 50)
- `before`: Get messages before this ID
- `after`: Get messages after this ID

### POST /conversations/:id/messages

Send message in conversation.

**Request:**

```json
{
  "content": "Hello, here's the update",
  "type": "text",
  "attachments": [
    {
      "id": "attach123",
      "name": "document.pdf",
      "url": "https://...",
      "type": "application/pdf",
      "size": 1048576
    }
  ],
  "mentions": ["user789"]
}
```

### PUT /conversations/:id/read

Mark conversation as read.

### POST /conversations/:id/typing

Send typing indicator.

### DELETE /conversations/:id/messages/:messageId

Delete message.

## Quote Management Endpoints

### GET /quotes

List quotes.

**Query Parameters:**

- `status`: Filter by status
- `clientId`: Filter by client
- `dateFrom`: Created from date
- `dateTo`: Created to date

### POST /quotes

Create new quote.

**Request:**

```json
{
  "clientId": "client123",
  "title": "AI Consultation Services",
  "description": "Monthly AI consultation and support",
  "items": [
    {
      "serviceId": "service123",
      "name": "AI Consultation",
      "description": "8 hours of consultation per month",
      "quantity": 1,
      "unitPrice": 2000,
      "tax": 21
    }
  ],
  "terms": {
    "paymentTerms": "Net 30",
    "validUntil": "2024-02-28",
    "deliveryTime": "Immediate"
  }
}
```

### GET /quotes/:id

Get quote details.

### PUT /quotes/:id

Update quote.

### POST /quotes/:id/send

Send quote to client.

**Request:**

```json
{
  "email": "client@company.com",
  "cc": ["manager@company.com"],
  "message": "Please find attached our quote for AI services."
}
```

### POST /quotes/:id/accept

Accept quote (client action).

### POST /quotes/:id/convert

Convert quote to project.

## Invoice Endpoints

### GET /invoices

List invoices.

**Query Parameters:**

- `status`: Filter by status (paid, unpaid, overdue)
- `clientId`: Filter by client
- `projectId`: Filter by project
- `dateFrom`: Issue date from
- `dateTo`: Issue date to

### POST /invoices

Create new invoice.

**Request:**

```json
{
  "clientId": "client123",
  "projectId": "proj123",
  "items": [
    {
      "description": "AI Consultation - January 2024",
      "quantity": 8,
      "unitPrice": 250,
      "tax": 21
    }
  ],
  "dueDate": "2024-02-15",
  "notes": "Thank you for your business"
}
```

### GET /invoices/:id

Get invoice details.

### PUT /invoices/:id

Update invoice (draft only).

### POST /invoices/:id/send

Send invoice to client.

### POST /invoices/:id/payments

Record payment.

**Request:**

```json
{
  "amount": 2420,
  "paymentMethod": "bank_transfer",
  "reference": "TRX123456",
  "paidDate": "2024-01-20"
}
```

### GET /invoices/:id/pdf

Download invoice as PDF.

## Service Catalog Endpoints

### GET /services

List available services.

**Query Parameters:**

- `category`: Filter by category
- `isActive`: Active services only
- `public`: Public services only

### GET /services/:id

Get service details.

### POST /services

Create new service (admin only).

### PUT /services/:id

Update service (admin only).

## Knowledge Base Endpoints

### GET /knowledge

Search knowledge base.

**Query Parameters:**

- `q`: Search query (required)
- `category`: Filter by category
- `type`: Filter by type
- `tags`: Filter by tags (comma-separated)

**Response:**

```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "kb123",
        "title": "Getting Started with AI Implementation",
        "excerpt": "Learn the basics of implementing AI in your organization",
        "category": "AI Implementation",
        "type": "guide",
        "tags": ["ai", "implementation", "beginner"],
        "relevanceScore": 0.95
      }
    ],
    "totalResults": 15
  }
}
```

### GET /knowledge/:id

Get article details.

### POST /knowledge/:id/feedback

Submit article feedback.

**Request:**

```json
{
  "helpful": true,
  "comment": "Very clear explanation"
}
```

## Analytics Endpoints

### GET /analytics/dashboard

Get dashboard analytics.

**Query Parameters:**

- `period`: Period (7d, 30d, 90d, 1y)
- `timezone`: User timezone

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "activeProjects": 5,
      "completedProjects": 12,
      "totalRevenue": 125000,
      "totalHours": 480,
      "averageRating": 4.8
    },
    "trends": {
      "revenue": [
        { "date": "2024-01-01", "value": 15000 },
        { "date": "2024-01-08", "value": 18000 }
      ],
      "consultations": [
        { "date": "2024-01-01", "value": 5 },
        { "date": "2024-01-08", "value": 8 }
      ]
    },
    "topServices": [
      {
        "serviceId": "service123",
        "name": "AI Consultation",
        "revenue": 45000,
        "count": 23
      }
    ]
  }
}
```

### GET /analytics/projects/:id

Get project analytics.

### GET /analytics/revenue

Get revenue analytics.

## File Management Endpoints

### POST /files/upload

Upload file.

**Request:**

```
Content-Type: multipart/form-data
file: <file>
projectId: proj123 (optional)
type: document|image|video
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fileId": "file123",
    "name": "document.pdf",
    "url": "https://storage.groeimetai.io/files/file123",
    "type": "application/pdf",
    "size": 1048576,
    "uploadedAt": "2024-01-15T10:00:00Z"
  }
}
```

### GET /files/:id

Get file metadata.

### DELETE /files/:id

Delete file.

## Webhook Endpoints

### POST /webhooks/stripe

Stripe webhook handler.

**Headers:**

```
Stripe-Signature: t=timestamp,v1=signature
```

### POST /webhooks/calendar

Calendar webhook handler.

## WebSocket Events

### Connection

```javascript
const ws = new WebSocket('wss://api.groeimetai.io/ws');
ws.send(
  JSON.stringify({
    type: 'auth',
    token: 'firebase-id-token',
  })
);
```

### Consultation Events

- `consultation:message` - New message in consultation
- `consultation:thinking` - AI is processing
- `consultation:complete` - Consultation completed

### Messaging Events

- `message:new` - New message received
- `message:updated` - Message edited
- `message:deleted` - Message deleted
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `presence:online` - User came online
- `presence:offline` - User went offline

### Project Events

- `project:updated` - Project updated
- `project:milestone:completed` - Milestone completed
- `project:comment` - New comment on project

## Error Codes

### Standard Error Codes

- `AUTH_REQUIRED` - Authentication required
- `AUTH_INVALID` - Invalid authentication token
- `AUTH_EXPIRED` - Authentication token expired
- `PERMISSION_DENIED` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

### Business Logic Errors

- `PROJECT_COMPLETED` - Cannot modify completed project
- `QUOTE_EXPIRED` - Quote has expired
- `INVOICE_PAID` - Cannot modify paid invoice
- `INSUFFICIENT_CREDITS` - Not enough credits for operation
- `SUBSCRIPTION_EXPIRED` - Subscription has expired

## Rate Limiting

### Default Limits

- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Premium: 1000 requests/minute
- Enterprise: Custom limits

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642444800
```

## Pagination

### Request Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field
- `order`: Sort order (asc/desc)

### Response Format

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## API Versioning

### Version Header

```http
X-API-Version: 1.0
```

### Deprecated Endpoints

Deprecated endpoints include:

```http
X-API-Deprecated: true
X-API-Sunset: 2024-12-31
```

## SDK Support

### JavaScript/TypeScript

```typescript
import { GroeimetAI } from '@groeimetai/sdk';

const client = new GroeimetAI({
  apiKey: 'your-api-key',
  environment: 'production',
});

const projects = await client.projects.list({
  status: 'active',
});
```

### Python

```python
from groeimetai import Client

client = Client(
    api_key="your-api-key",
    environment="production"
)

projects = client.projects.list(status="active")
```
