# GroeimetAI Component Hierarchy

## Component Architecture Overview

### Design Principles
- **Atomic Design Pattern**: Components organized as Atoms → Molecules → Organisms → Templates → Pages
- **Server/Client Separation**: Clear distinction between Server Components (SC) and Client Components (CC)
- **Composition over Inheritance**: Favor component composition for flexibility
- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: Strong TypeScript typing for all props

## Root Component Structure

```
app/
├── layout.tsx (SC) - Root layout with providers
├── (auth)/layout.tsx (SC) - Authenticated layout
├── (public)/layout.tsx (SC) - Public layout
└── providers.tsx (CC) - Client-side providers wrapper
```

## Component Hierarchy

### 1. Layout Components

```
layouts/
├── RootLayout (SC)
│   ├── ThemeProvider (CC)
│   ├── AuthProvider (CC)
│   ├── AnalyticsProvider (CC)
│   └── ToastProvider (CC)
├── AuthLayout (SC)
│   ├── Sidebar (CC)
│   │   ├── Logo
│   │   ├── Navigation
│   │   │   ├── NavItem
│   │   │   └── NavGroup
│   │   ├── UserMenu
│   │   └── ThemeToggle
│   ├── Header (CC)
│   │   ├── Breadcrumbs
│   │   ├── SearchBar
│   │   ├── NotificationBell
│   │   └── UserAvatar
│   └── MobileNav (CC)
└── PublicLayout (SC)
    ├── PublicHeader (CC)
    │   ├── Logo
    │   ├── MainNav
    │   └── CTAButton
    └── PublicFooter (SC)
```

### 2. Page Components

```
pages/
├── Dashboard (SC)
│   ├── DashboardHeader (CC)
│   ├── StatsGrid (SC)
│   │   └── StatCard (SC)
│   ├── RecentProjects (SC)
│   │   └── ProjectCard (CC)
│   ├── UpcomingConsultations (SC)
│   │   └── ConsultationItem (CC)
│   ├── RevenueChart (CC)
│   └── ActivityFeed (SC)
│       └── ActivityItem (SC)
├── Projects
│   ├── ProjectList (SC)
│   │   ├── ProjectFilters (CC)
│   │   ├── ProjectTable (SC)
│   │   │   └── ProjectRow (CC)
│   │   └── Pagination (CC)
│   ├── ProjectDetail (SC)
│   │   ├── ProjectHeader (CC)
│   │   ├── ProjectTabs (CC)
│   │   ├── ProjectOverview (SC)
│   │   ├── ProjectMilestones (CC)
│   │   │   └── MilestoneCard (CC)
│   │   ├── ProjectDocuments (SC)
│   │   │   └── DocumentList (CC)
│   │   ├── ProjectTeam (SC)
│   │   │   └── TeamMember (CC)
│   │   └── ProjectActivity (SC)
│   └── ProjectCreate (CC)
│       ├── ProjectForm (CC)
│       │   ├── BasicInfoStep
│       │   ├── BudgetStep
│       │   ├── MilestonesStep
│       │   └── ReviewStep
│       └── FormNavigation (CC)
├── Consultations
│   ├── ConsultationList (SC)
│   │   ├── ConsultationFilters (CC)
│   │   └── ConsultationGrid (SC)
│   │       └── ConsultationCard (CC)
│   ├── ConsultationDetail (CC)
│   │   ├── ChatInterface (CC)
│   │   │   ├── MessageList (CC)
│   │   │   │   ├── MessageItem (CC)
│   │   │   │   └── TypingIndicator (CC)
│   │   │   ├── MessageInput (CC)
│   │   │   │   ├── TextEditor (CC)
│   │   │   │   ├── FileUpload (CC)
│   │   │   │   └── EmojiPicker (CC)
│   │   │   └── ChatSidebar (CC)
│   │   │       ├── ParticipantList
│   │   │       └── ChatSettings
│   │   └── ConsultationSummary (SC)
│   └── ConsultationStart (CC)
│       ├── ModelSelector (CC)
│       ├── ContextSelector (CC)
│       └── StartButton (CC)
├── Messages
│   ├── ConversationList (SC)
│   │   ├── ConversationSearch (CC)
│   │   └── ConversationItem (CC)
│   │       ├── Avatar
│   │       ├── LastMessage
│   │       └── UnreadBadge
│   └── MessageThread (CC)
│       ├── ThreadHeader (CC)
│       ├── MessageList (CC)
│       └── MessageComposer (CC)
├── Billing
│   ├── BillingOverview (SC)
│   │   ├── CurrentPlan (SC)
│   │   ├── UsageStats (SC)
│   │   └── PaymentMethods (CC)
│   ├── InvoiceList (SC)
│   │   └── InvoiceRow (CC)
│   ├── InvoiceDetail (SC)
│   │   ├── InvoiceHeader (SC)
│   │   ├── InvoiceItems (SC)
│   │   └── InvoiceActions (CC)
│   └── QuoteList (SC)
│       └── QuoteCard (CC)
└── Settings
    ├── ProfileSettings (CC)
    │   ├── AvatarUpload (CC)
    │   ├── ProfileForm (CC)
    │   └── PasswordChange (CC)
    ├── NotificationSettings (CC)
    │   └── NotificationToggle (CC)
    ├── SecuritySettings (CC)
    │   ├── TwoFactorAuth (CC)
    │   └── SessionList (SC)
    └── TeamSettings (CC)
        ├── MemberList (SC)
        └── InviteForm (CC)
```

### 3. Feature Components

```
features/
├── auth/
│   ├── LoginForm (CC)
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── RememberMe
│   │   └── SubmitButton
│   ├── RegisterForm (CC)
│   │   ├── StepIndicator
│   │   ├── AccountStep
│   │   ├── ProfileStep
│   │   └── VerificationStep
│   ├── ForgotPasswordForm (CC)
│   ├── ResetPasswordForm (CC)
│   ├── SocialLogin (CC)
│   │   ├── GoogleButton
│   │   └── LinkedInButton
│   └── AuthGuard (CC)
├── projects/
│   ├── ProjectStatusBadge (SC)
│   ├── ProjectProgress (CC)
│   ├── MilestoneTimeline (CC)
│   ├── ProjectBudgetChart (CC)
│   ├── TaskList (CC)
│   │   ├── TaskItem (CC)
│   │   └── TaskForm (CC)
│   └── ProjectComments (CC)
│       ├── CommentList (SC)
│       └── CommentForm (CC)
├── consultations/
│   ├── AIModelSelector (CC)
│   ├── ContextBuilder (CC)
│   │   ├── DocumentPicker
│   │   └── SessionPicker
│   ├── StreamingResponse (CC)
│   ├── CodeBlock (CC)
│   ├── MarkdownRenderer (SC)
│   └── ConsultationExport (CC)
├── messaging/
│   ├── MessageBubble (CC)
│   ├── AttachmentPreview (CC)
│   ├── ReactionPicker (CC)
│   ├── MessageActions (CC)
│   ├── OnlineStatus (CC)
│   └── ReadReceipts (CC)
├── billing/
│   ├── PricingCard (SC)
│   ├── PaymentForm (CC)
│   │   ├── CardElement
│   │   └── BillingAddress
│   ├── SubscriptionManager (CC)
│   ├── UsageChart (CC)
│   └── InvoiceGenerator (CC)
└── analytics/
    ├── RevenueChart (CC)
    ├── ProjectMetrics (CC)
    ├── ClientInsights (CC)
    └── PerformanceGraph (CC)
```

### 4. Common UI Components

```
ui/
├── primitives/
│   ├── Button (CC)
│   ├── Input (CC)
│   ├── Select (CC)
│   ├── Checkbox (CC)
│   ├── Radio (CC)
│   ├── Switch (CC)
│   ├── Textarea (CC)
│   ├── Label (SC)
│   └── Badge (SC)
├── feedback/
│   ├── Alert (SC)
│   ├── Toast (CC)
│   ├── Progress (CC)
│   ├── Spinner (CC)
│   ├── Skeleton (SC)
│   └── EmptyState (SC)
├── layout/
│   ├── Card (SC)
│   ├── Container (SC)
│   ├── Grid (SC)
│   ├── Stack (SC)
│   ├── Divider (SC)
│   └── Spacer (SC)
├── navigation/
│   ├── Tabs (CC)
│   ├── Breadcrumb (SC)
│   ├── Pagination (CC)
│   ├── Stepper (CC)
│   └── Menu (CC)
├── overlay/
│   ├── Modal (CC)
│   ├── Dialog (CC)
│   ├── Drawer (CC)
│   ├── Popover (CC)
│   ├── Tooltip (CC)
│   └── ContextMenu (CC)
├── data-display/
│   ├── Table (SC)
│   │   ├── TableHeader
│   │   ├── TableBody
│   │   ├── TableRow
│   │   └── TableCell
│   ├── DataGrid (CC)
│   ├── List (SC)
│   ├── Timeline (CC)
│   └── Avatar (SC)
└── forms/
    ├── Form (CC)
    ├── FormField (CC)
    ├── FormError (SC)
    ├── DatePicker (CC)
    ├── TimePicker (CC)
    ├── FileUpload (CC)
    └── RichTextEditor (CC)
```

### 5. Utility Components

```
utils/
├── ErrorBoundary (CC)
├── Suspense (SC)
├── LazyLoad (CC)
├── InfiniteScroll (CC)
├── VirtualList (CC)
├── Portal (CC)
├── SEO (SC)
└── Analytics (CC)
```

## Component Communication Patterns

### 1. Props Flow
```
Dashboard
  ├─→ StatsGrid (data)
  │     └─→ StatCard (title, value, trend)
  ├─→ RecentProjects (projects)
  │     └─→ ProjectCard (project, onEdit, onDelete)
  └─→ ActivityFeed (activities)
        └─→ ActivityItem (activity)
```

### 2. Context Providers
```
AuthContext
  ├── user: User | null
  ├── loading: boolean
  ├── login: (credentials) => Promise<void>
  ├── logout: () => Promise<void>
  └── updateProfile: (data) => Promise<void>

ThemeContext
  ├── theme: 'light' | 'dark' | 'system'
  ├── setTheme: (theme) => void
  └── resolvedTheme: 'light' | 'dark'

NotificationContext
  ├── notifications: Notification[]
  ├── addNotification: (notification) => void
  ├── removeNotification: (id) => void
  └── clearAll: () => void
```

### 3. State Management (Zustand)
```
useProjectStore
  ├── projects: Project[]
  ├── currentProject: Project | null
  ├── loading: boolean
  ├── fetchProjects: () => Promise<void>
  ├── createProject: (data) => Promise<void>
  ├── updateProject: (id, data) => Promise<void>
  └── deleteProject: (id) => Promise<void>

useConsultationStore
  ├── consultations: Consultation[]
  ├── activeConsultation: Consultation | null
  ├── messages: Message[]
  ├── sendMessage: (message) => Promise<void>
  └── endConsultation: () => Promise<void>
```

## Performance Optimization

### 1. Code Splitting
```typescript
// Lazy load heavy components
const RichTextEditor = lazy(() => import('@/components/forms/RichTextEditor'));
const DataGrid = lazy(() => import('@/components/ui/DataGrid'));
const Analytics = lazy(() => import('@/components/features/analytics'));
```

### 2. Memoization
```typescript
// Memoize expensive computations
const ProjectStats = memo(({ projects }) => {
  const stats = useMemo(() => calculateProjectStats(projects), [projects]);
  return <StatsDisplay stats={stats} />;
});
```

### 3. Suspense Boundaries
```typescript
// Progressive loading with Suspense
<Suspense fallback={<ProjectListSkeleton />}>
  <ProjectList />
</Suspense>
```

## Accessibility Considerations

### 1. ARIA Labels
```typescript
<Button aria-label="Create new project" onClick={handleCreate}>
  <PlusIcon aria-hidden="true" />
</Button>
```

### 2. Keyboard Navigation
```typescript
<NavigationMenu onKeyDown={handleKeyboardNavigation}>
  {/* Tab-able items with proper focus management */}
</NavigationMenu>
```

### 3. Screen Reader Support
```typescript
<Alert role="alert" aria-live="polite">
  Project created successfully
</Alert>
```

## Testing Strategy

### 1. Unit Tests
- Test individual components in isolation
- Mock dependencies and API calls
- Test user interactions and state changes

### 2. Integration Tests
- Test component interactions
- Test data flow between components
- Test context provider behavior

### 3. E2E Tests
- Test complete user flows
- Test critical business paths
- Test error scenarios

## Component Documentation

Each component should include:
1. **JSDoc comments** describing purpose and usage
2. **Props interface** with TypeScript types
3. **Usage examples** in Storybook
4. **Accessibility notes**
5. **Performance considerations**