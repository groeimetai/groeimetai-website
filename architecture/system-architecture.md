# GroeimetAI System Architecture

## Overview

GroeimetAI is a modern GenAI consultancy platform built with a serverless architecture using Google Cloud Platform (GCP) services, with Firebase as the core backend infrastructure.

## Architecture Components

### 1. Frontend Layer

- **Next.js 14** - React-based framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - Component library
- **React Query** - Data fetching and caching
- **Vercel** - Deployment and edge functions

### 2. Authentication & Authorization

- **Firebase Auth** - Multi-provider authentication
  - Email/Password
  - Google OAuth
  - LinkedIn OAuth (for professional verification)
- **Custom Claims** - Role-based access control (RBAC)
  - `admin`, `consultant`, `client`, `guest`

### 3. Backend Services

#### Firebase Services

- **Firestore** - NoSQL database for real-time data
- **Cloud Functions** - Serverless compute
- **Cloud Storage** - File uploads (documents, avatars)
- **Firebase Hosting** - Static asset serving

#### API Layer

- **REST API** - Built with Express.js on Cloud Functions
- **GraphQL** - Apollo Server for complex queries
- **WebSockets** - Real-time messaging via Socket.io

### 4. AI Integration Layer

#### Gemini API Integration

- **Gemini Pro** - Main AI model for consultations
- **Gemini Vision** - Document analysis
- **Embeddings API** - Semantic search

#### RAG Architecture

- **Vertex AI** - Vector database for knowledge base
- **LangChain** - Orchestration framework
- **Document Processing Pipeline**
  - PDF extraction
  - Text chunking
  - Embedding generation
  - Vector storage

### 5. Communication Services

#### Real-time Messaging

- **Firebase Realtime Database** - Chat messages
- **Presence System** - Online/offline status
- **Push Notifications** - FCM integration

#### Video Consultations

- **Google Meet API** - Video conferencing
- **Calendar Integration** - Google Calendar API
- **Scheduling System** - Custom booking logic

### 6. Payment & Billing

- **Stripe** - Payment processing
  - Subscription management
  - Invoice generation
  - Usage-based billing
- **Firebase Extensions** - Stripe integration

### 7. Analytics & Monitoring

- **Google Analytics 4** - User behavior tracking
- **Firebase Performance Monitoring** - App performance
- **Cloud Logging** - Centralized logging
- **Cloud Monitoring** - System health metrics

### 8. Infrastructure

#### Security

- **Cloud Armor** - DDoS protection
- **Identity Platform** - Enhanced authentication
- **Secret Manager** - API key management
- **VPC** - Network isolation

#### CI/CD Pipeline

- **GitHub Actions** - Automated testing and deployment
- **Cloud Build** - Container building
- **Artifact Registry** - Container storage

## Data Flow

### User Journey

1. User visits website → Served by Vercel Edge
2. Authentication → Firebase Auth
3. Dashboard access → Next.js + Firestore
4. AI consultation → Cloud Function → Gemini API
5. Real-time chat → WebSocket → Firebase Realtime DB
6. Payment → Stripe webhook → Cloud Function → Firestore

### AI Consultation Flow

1. User submits query
2. Cloud Function triggered
3. RAG retrieval from Vertex AI
4. Context enhancement
5. Gemini API call
6. Response streaming
7. Conversation stored in Firestore

## Scalability Considerations

### Horizontal Scaling

- Cloud Functions auto-scale
- Firestore automatic sharding
- CDN for static assets

### Performance Optimization

- Edge caching with Vercel
- Firestore composite indexes
- Query optimization
- Image optimization with Next.js

### Cost Optimization

- Reserved capacity for predictable workloads
- Lifecycle policies for Cloud Storage
- Function concurrency limits
- Firestore usage monitoring

## Security Architecture

### Authentication Flow

```
User → Firebase Auth → ID Token → Cloud Function → Firestore
         ↓
    Custom Claims
         ↓
    Role Verification
```

### Data Security

- Firestore Security Rules
- Field-level encryption for sensitive data
- HTTPS everywhere
- CORS configuration

### Compliance

- GDPR compliance tools
- Data retention policies
- Audit logging
- Privacy-first design

## Disaster Recovery

- **Firestore** - Multi-region replication
- **Cloud Storage** - Cross-region backup
- **Database Export** - Scheduled backups
- **Infrastructure as Code** - Terraform scripts
