// Global TypeScript Type Definitions for GroeimetAI

// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  bio?: string;
  title?: string;
  jobTitle?: string;
  company?: string;
  linkedinUrl?: string;
  website?: string;
  accountType?: 'customer' | 'guest' | 'admin';
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  isVerified: boolean;
  organizationId?: string;
  organizationRole?: OrganizationRole;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  lastActivityAt: Date;
  subscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  stats: UserStats;
  isDeleted?: boolean;
  // Team & Consultant specific fields
  skills?: string[];
  specializations?: string[];
  hourlyRate?: number;
  availability?: UserAvailability;
  workload?: number; // 0-100 percentage
  isAvailable?: boolean;
}

export type UserRole = 'admin' | 'consultant' | 'client' | 'guest';
export type OrganizationRole = 'owner' | 'admin' | 'member';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface UserStats {
  projectsCount: number;
  consultationsCount: number;
  messagesCount: number;
  totalSpent: number;
}

export interface UserAvailability {
  status: 'available' | 'busy' | 'away' | 'offline';
  lastSeen?: Date;
  currentProject?: string;
  scheduledUntil?: Date;
  notes?: string;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'enterprise';
  email: string;
  phoneNumber?: string;
  address?: Address;
  billingEmail?: string;
  vatNumber?: string;
  billingAddress?: Address;
  ownerId: string;
  memberIds: string[];
  pendingInvites: PendingInvite[];
  subscriptionId?: string;
  subscriptionPlan: 'team' | 'business' | 'enterprise';
  subscriptionStatus: string;
  seats: number;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface PendingInvite {
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: Date;
  token: string;
}

export interface OrganizationSettings {
  allowedDomains: string[];
  ssoEnabled: boolean;
  twoFactorRequired: boolean;
  dataRetentionDays: number;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress?: number;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  organizationId?: string;
  consultantId: string;
  teamIds: string[];
  assignedTo?: string[];
  startDate: Date;
  endDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimatedHours: number;
  actualHours: number;
  budget: ProjectBudget;
  milestones: Milestone[];
  tags: string[];
  categories: string[];
  technologies: string[];
  documentIds: string[];
  conversationId?: string;
  meetingIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  completedAt?: Date;
  originalQuoteStatus?: string;
  quoteData?: any;
  isFromQuote?: boolean;
}

export type ProjectType = 'consultation' | 'implementation' | 'support' | 'training';
export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'pending_approval';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ProjectBudget {
  amount: number;
  currency: string;
  type: 'fixed' | 'hourly' | 'milestone';
  hourlyRate?: number;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
  deliverables: string[];
  payment?: MilestonePayment;
}

export interface MilestonePayment {
  amount: number;
  status: 'pending' | 'paid';
  invoiceId?: string;
}

// Consultation Types
export interface Consultation {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  type: ConsultationType;
  status: ConsultationStatus;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  context: ConsultationContext;
  messages: ConsultationMessage[];
  summary?: string;
  keyPoints?: string[];
  actionItems?: string[];
  usage: ConsultationUsage;
  feedback?: ConsultationFeedback;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  duration: number;
}

export type ConsultationType = 'chat' | 'document_analysis' | 'code_review' | 'strategy';
export type ConsultationStatus = 'active' | 'completed' | 'archived';
export type AIModel = 'gemini-pro' | 'gemini-pro-vision' | 'gemini-code';

export interface ConsultationContext {
  documents: string[];
  previousSessions: string[];
  knowledgeBase: string[];
}

export interface ConsultationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  model?: string;
  tokens?: number;
  processingTime?: number;
  citations?: string[];
}

export interface ConsultationUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}

export interface ConsultationFeedback {
  rating: number;
  comment?: string;
  helpful: boolean;
}

// Messaging Types
export interface Conversation {
  id: string;
  participantIds: string[];
  participants: { [userId: string]: ConversationParticipant };
  type: ConversationType;
  name?: string;
  description?: string;
  avatar?: string;
  projectId?: string;
  consultationId?: string;
  lastMessage?: LastMessage;
  settings: ConversationSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
}

export type ConversationType = 'direct' | 'group' | 'project' | 'support';

export interface ConversationParticipant {
  displayName: string;
  photoURL?: string;
  role: string;
  joinedAt: Date;
  lastReadAt: Date;
  unreadCount: number;
}

export interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  type: MessageType;
}

export interface ConversationSettings {
  muted: { [userId: string]: boolean };
  archived: { [userId: string]: boolean };
  notifications: { [userId: string]: boolean };
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  attachments?: MessageAttachment[];
  mentions?: string[];
  replyTo?: string;
  forwarded?: boolean;
  reactions?: { [emoji: string]: string[] };
  status: MessageStatus;
  readBy: { [userId: string]: Date };
  edited?: boolean;
  editedAt?: Date;
  editHistory?: EditHistory[];
  conversationId: string;
  timestamp: Date;
  deletedAt?: Date;
  deletedBy?: string;
}

export type MessageType = 'text' | 'file' | 'image' | 'video' | 'audio' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  thumbnailUrl?: string;
}

export interface EditHistory {
  content: string;
  editedAt: Date;
}

// Quote Types
export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  organizationId?: string;
  contactPerson: ContactPerson;
  title: string;
  description: string;
  type: QuoteType;
  status: QuoteStatus;
  items: QuoteItem[];
  pricing: QuotePricing;
  terms: QuoteTerms;
  attachments: string[];
  sentAt?: Date;
  viewedAt?: Date;
  respondedAt?: Date;
  convertedToProject?: string;
  conversionRate?: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type QuoteType = 'project' | 'retainer' | 'hourly' | 'support';
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface ContactPerson {
  name: string;
  email: string;
  phone?: string;
}

export interface QuoteItem {
  id: string;
  serviceId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
}

export interface QuotePricing {
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
}

export interface QuoteTerms {
  paymentTerms: string;
  validUntil: Date;
  deliveryTime: string;
  warranty?: string;
  notes?: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  organizationId?: string;
  billingAddress: Address;
  projectId?: string;
  quoteId?: string;
  milestoneId?: string;
  status: InvoiceStatus;
  type: InvoiceType;
  items: InvoiceItem[];
  financial: InvoiceFinancial;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: PaymentMethod;
  paymentDetails?: PaymentDetails;
  reminders: InvoiceReminder[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  pdfUrl?: string;
  pdfGeneratedAt?: Date;
}

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'viewed'
  | 'paid'
  | 'partial'
  | 'overdue'
  | 'cancelled';
export type InvoiceType = 'standard' | 'recurring' | 'credit_note';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'paypal' | 'stripe';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  projectId?: string;
  timeEntryIds?: string[];
}

export interface InvoiceFinancial {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  currency: string;
}

export interface PaymentDetails {
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface InvoiceReminder {
  sentAt: Date;
  type: 'due_soon' | 'overdue' | 'final_notice';
}

// Company Settings Types (for Dutch compliance)
export interface CompanySettings {
  id: string;
  // Company Details
  name: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  // Dutch Registration
  kvkNumber: string;       // Chamber of Commerce (KvK)
  btwNumber: string;       // VAT Number (BTW)
  // Address
  street: string;
  postalCode: string;
  city: string;
  country: string;
  // Banking
  bankName: string;
  iban: string;
  bic: string;
  // Invoice Settings
  defaultPaymentTermsDays: number;  // Default 30
  defaultTaxRate: number;           // Default 21
  invoicePrefix: string;            // Default 'INV'
  // Timestamps
  updatedAt: Date;
  updatedBy: string;
}

// Extended billing details for invoices (with Dutch compliance fields)
export interface InvoiceBillingDetails {
  // Client Info
  companyName?: string;
  contactName?: string;
  kvkNumber?: string;      // Client's KvK
  btwNumber?: string;      // Client's BTW
  // Address
  street: string;
  postalCode: string;
  city: string;
  country: string;
  // Contact
  email?: string;
}

// Service Types
export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: ServiceCategory;
  pricing: ServicePricing;
  features: string[];
  deliverables: string[];
  prerequisites?: string[];
  estimatedDuration?: ServiceDuration;
  isActive: boolean;
  isPublic: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  icon?: string;
  images?: string[];
  brochureUrl?: string;
  seo: SEOMetadata;
  stats: ServiceStats;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type ServiceCategory =
  | 'ai_consulting'
  | 'development'
  | 'servicenow'
  | 'training'
  | 'support';

export interface ServicePricing {
  model: 'fixed' | 'hourly' | 'subscription' | 'custom';
  price?: number;
  currency: string;
  billingPeriod?: 'one_time' | 'monthly' | 'quarterly' | 'yearly';
  customPricing?: boolean;
}

export interface ServiceDuration {
  min: number;
  max: number;
  unit: 'hours' | 'days' | 'weeks' | 'months';
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface ServiceStats {
  projectsCount: number;
  revenue: number;
  averageRating: number;
  completionRate: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ApiMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiMetadata {
  timestamp: string;
  version: string;
  requestId: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Document Types
export interface Document {
  id: string;
  userId: string;
  projectId?: string;
  name: string;
  description?: string;
  type: DocumentType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  status: DocumentStatus;
  version: number;
  versions?: DocumentVersion[];
  tags: string[];
  category?: DocumentCategory;
  metadata?: DocumentMetadata;
  permissions: DocumentPermissions;
  sharedWith: DocumentShare[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export type DocumentType =
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'archive'
  | 'other';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type DocumentCategory =
  | 'contract'
  | 'proposal'
  | 'report'
  | 'invoice'
  | 'presentation'
  | 'specification'
  | 'other';

export interface DocumentVersion {
  id: string;
  version: number;
  url: string;
  size: number;
  createdAt: Date;
  createdBy: string;
  comment?: string;
  changes?: string[];
}

export interface DocumentMetadata {
  author?: string;
  keywords?: string[];
  expiresAt?: Date;
  isConfidential?: boolean;
  customFields?: { [key: string]: any };
}

export interface DocumentPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canShare: string[];
  isPublic: boolean;
}

export interface DocumentShare {
  userId?: string;
  email?: string;
  permission: 'view' | 'edit' | 'comment';
  sharedAt: Date;
  sharedBy: string;
  expiresAt?: Date;
}

// Meeting Types
export interface Meeting {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description?: string;
  type: MeetingType;
  status: MeetingStatus;
  startTime: Date;
  endTime: Date;
  duration: number;
  location?: MeetingLocation;
  participantIds: string[];
  participants: MeetingParticipant[];
  agenda?: MeetingAgenda[];
  notes?: string;
  actionItems?: ActionItem[];
  attachments?: string[];
  recordingUrl?: string;
  meetingLink?: string;
  platform?: MeetingPlatform;
  recurring?: RecurringSettings;
  reminders: MeetingReminder[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
}

export type MeetingType =
  | 'consultation'
  | 'project_review'
  | 'standup'
  | 'workshop'
  | 'presentation'
  | 'interview'
  | 'other';
export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
export type MeetingPlatform = 'zoom' | 'teams' | 'meet' | 'in_person' | 'phone' | 'video' | 'other';

export interface MeetingLocation {
  type: 'physical' | 'virtual';
  address?: string;
  roomName?: string;
  link?: string;
  instructions?: string;
}

export interface MeetingParticipant {
  userId: string;
  name: string;
  email: string;
  role: 'organizer' | 'required' | 'optional';
  status: 'pending' | 'accepted' | 'declined' | 'tentative';
  responseTime?: Date;
  attendance?: 'attended' | 'no_show' | 'partial';
  notes?: string;
}

export interface MeetingAgenda {
  id: string;
  topic: string;
  duration: number;
  presenter?: string;
  notes?: string;
  order: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: Date;
}

export interface RecurringSettings {
  pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  occurrences?: number;
  exceptions?: Date[];
}

export interface MeetingReminder {
  id: string;
  type: 'email' | 'push' | 'sms';
  minutesBefore: number;
  sent: boolean;
  sentAt?: Date;
}

// UserSettings Types
export interface UserSettings {
  userId: string;
  preferences: UserDetailedPreferences;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
  integrations: IntegrationSettings;
  shortcuts: KeyboardShortcuts;
  security?: SecuritySettings;
  dashboardLayout?: DashboardLayout;
  emailSignature?: string;
  autoReply?: AutoReplySettings;
  workingHours?: WorkingHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDetailedPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  startOfWeek: 'sunday' | 'monday';
  defaultView: 'dashboard' | 'projects' | 'calendar' | 'messages';
  theme: 'light' | 'dark' | 'system' | 'custom';
  customTheme?: CustomTheme;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
    types: NotificationTypes;
  };
  push: {
    enabled: boolean;
    types: NotificationTypes;
  };
  sms: {
    enabled: boolean;
    types: NotificationTypes;
  };
  inApp: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    types: NotificationTypes;
  };
}

export interface NotificationTypes {
  messages: boolean;
  projectUpdates: boolean;
  taskAssignments: boolean;
  mentions: boolean;
  deadlines: boolean;
  systemAlerts: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'team' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  activityStatus: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
}

export interface DisplaySettings {
  density: 'comfortable' | 'compact' | 'spacious';
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reduceMotion: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  sidebarCollapsed: boolean;
  showAvatars: boolean;
}

export interface IntegrationSettings {
  google?: {
    connected: boolean;
    calendarSync: boolean;
    driveSync: boolean;
    lastSync?: Date;
  };
  slack?: {
    connected: boolean;
    workspaceId?: string;
    channelIds?: string[];
    notifications: boolean;
  };
  github?: {
    connected: boolean;
    username?: string;
    repositories?: string[];
  };
}

export interface KeyboardShortcuts {
  enabled: boolean;
  customShortcuts?: { [action: string]: string };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethods?: string[];
  backupCodes?: string[];
  backupCodesGeneratedAt?: Date;
  lastBackupCodeUsedAt?: Date;
  lastPasswordChangeAt?: Date;
  passwordExpiresAt?: Date;
  sessionTimeout?: number;
  trustedDevices?: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  name: string;
  lastUsedAt: Date;
  addedAt: Date;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
}

export interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings?: { [key: string]: any };
}

export interface AutoReplySettings {
  enabled: boolean;
  message: string;
  startDate?: Date;
  endDate?: Date;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  holidays: boolean;
}

export interface DaySchedule {
  isWorkingDay: boolean;
  start?: string;
  end?: string;
  breaks?: { start: string; end: string }[];
}

export interface CustomTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
}

// =============================================================================
// Task Management Types
// =============================================================================

export interface Task {
  id: string;
  projectId: string;
  projectName?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  reporterId: string;
  reporterName: string;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  order: number;
  tags: string[];
  subtasks: Subtask[];
  attachments: TaskAttachment[];
  watchers: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'feature' | 'bug' | 'improvement' | 'task' | 'documentation';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions: string[];
  createdAt: Date;
  updatedAt?: Date;
  edited?: boolean;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  limit?: number;
  color: string;
}

export interface TaskFilter {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
}

// =============================================================================
// Timesheet / Urenregistratie Types
// =============================================================================

export interface TimeEntry {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  projectId: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  date: Date;
  hours: number;
  minutes: number;
  description: string;
  billable: boolean;
  hourlyRate?: number;
  status: TimeEntryStatus;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  invoiceId?: string;
  invoicedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type TimeEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'invoiced';

export interface TimesheetWeek {
  id: string;
  userId: string;
  userName?: string;
  weekNumber: number;
  year: number;
  startDate: Date;
  endDate: Date;
  totalHours: number;
  billableHours: number;
  status: TimesheetWeekStatus;
  entries: TimeEntry[];
  submittedAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

export type TimesheetWeekStatus = 'draft' | 'submitted' | 'partially_approved' | 'approved' | 'rejected';

export interface TimesheetSummary {
  userId: string;
  period: 'week' | 'month';
  startDate: Date;
  endDate: Date;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
  projectBreakdown: ProjectHours[];
  pendingApproval: number;
  approved: number;
  rejected: number;
}

export interface ProjectHours {
  projectId: string;
  projectName: string;
  hours: number;
  billableHours: number;
  revenue: number;
}

// =============================================================================
// Client Portal Types
// =============================================================================

export interface ClientPortalAccess {
  id: string;
  userId: string;
  clientId: string;
  organizationId?: string;
  accessLevel: ClientAccessLevel;
  permissions: ClientPermission[];
  projectIds: string[];
  documentAccess: DocumentAccessRule[];
  notificationPreferences: ClientNotificationPrefs;
  lastAccess?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ClientAccessLevel = 'basic' | 'standard' | 'premium';

export type ClientPermission =
  | 'view_projects'
  | 'view_milestones'
  | 'view_invoices'
  | 'pay_invoices'
  | 'view_documents'
  | 'download_documents'
  | 'view_progress'
  | 'send_messages'
  | 'request_changes';

export interface DocumentAccessRule {
  documentId?: string;
  category?: string;
  canView: boolean;
  canDownload: boolean;
}

export interface ClientNotificationPrefs {
  milestoneUpdates: boolean;
  invoiceCreated: boolean;
  paymentReminder: boolean;
  documentShared: boolean;
  projectStatusChange: boolean;
}

export interface ClientDashboardData {
  activeProjects: number;
  completedProjects: number;
  upcomingMilestones: Milestone[];
  pendingInvoices: Invoice[];
  totalOutstanding: number;
  recentDocuments: Document[];
  projectProgress: ProjectProgressSummary[];
}

export interface ProjectProgressSummary {
  projectId: string;
  projectName: string;
  status: ProjectStatus;
  progress: number;
  currentMilestone?: string;
  nextMilestone?: {
    name: string;
    dueDate: Date;
  };
  lastUpdate: Date;
}

// =============================================================================
// Contract Management Types
// =============================================================================

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: ContractType;
  status: ContractStatus;
  templateId?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  organizationId?: string;
  projectId?: string;
  quoteId?: string;
  content: ContractContent;
  financials: ContractFinancials;
  dates: ContractDates;
  signatories: ContractSignatory[];
  attachments: ContractAttachment[];
  history: ContractHistoryEntry[];
  reminders: ContractReminder[];
  metadata: ContractMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export type ContractType =
  | 'service_agreement'
  | 'nda'
  | 'sow'
  | 'master_agreement'
  | 'amendment'
  | 'renewal';

export type ContractStatus =
  | 'draft'
  | 'pending_review'
  | 'sent'
  | 'viewed'
  | 'signed'
  | 'active'
  | 'expired'
  | 'terminated'
  | 'cancelled';

export interface ContractContent {
  body: string;
  variables: { [key: string]: string };
  sections: ContractSection[];
}

export interface ContractSection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
}

export interface ContractFinancials {
  totalValue: number;
  currency: string;
  paymentTerms: string;
  billingSchedule?: BillingScheduleItem[];
}

export interface BillingScheduleItem {
  description: string;
  amount: number;
  dueDate: Date;
  invoiceId?: string;
}

export interface ContractDates {
  effectiveDate?: Date;
  expirationDate?: Date;
  signedDate?: Date;
  sentDate?: Date;
  renewalDate?: Date;
  terminationDate?: Date;
  noticePeriodDays: number;
}

export interface ContractSignatory {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'company' | 'witness';
  signatureUrl?: string;
  signedAt?: Date;
  ipAddress?: string;
  order: number;
}

export interface ContractAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ContractHistoryEntry {
  id: string;
  action: ContractAction;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: { [key: string]: any };
}

export type ContractAction =
  | 'created'
  | 'updated'
  | 'sent'
  | 'viewed'
  | 'signed'
  | 'approved'
  | 'rejected'
  | 'activated'
  | 'expired'
  | 'renewed'
  | 'terminated';

export interface ContractReminder {
  id: string;
  type: 'expiration' | 'renewal' | 'signature_pending';
  dueDate: Date;
  sent: boolean;
  sentAt?: Date;
  recipients: string[];
}

export interface ContractMetadata {
  version: number;
  parentContractId?: string;
  tags: string[];
  customFields: { [key: string]: any };
}

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: ContractType;
  content: ContractContent;
  defaultFinancials?: Partial<ContractFinancials>;
  defaultDates?: {
    validityDays: number;
    noticePeriodDays: number;
  };
  variables: TemplateVariable[];
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  defaultValue?: string;
  options?: string[];
}
