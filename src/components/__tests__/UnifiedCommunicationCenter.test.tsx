/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import UnifiedCommunicationCenter from '../UnifiedCommunicationCenter';
import '@testing-library/jest-dom';

// Mock the auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  writeBatch: jest.fn(),
  Timestamp: {
    now: () => ({ toDate: () => new Date() }),
  },
  serverTimestamp: jest.fn(),
  limit: jest.fn(),
}));

// Mock Firebase config
jest.mock('@/lib/firebase/config', () => ({
  db: {},
}));

// Mock file upload utility
jest.mock('@/utils/fileUpload', () => ({
  uploadFile: jest.fn(),
  formatFileSize: jest.fn((size) => `${size} bytes`),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 minutes ago'),
  format: jest.fn(() => '12:34 PM'),
  isToday: jest.fn(() => true),
  isYesterday: jest.fn(() => false),
}));

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('UnifiedCommunicationCenter', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAdmin: false,
      loading: false,
      firebaseUser: null,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      loginWithGoogle: jest.fn(),
      loginWithLinkedIn: jest.fn(),
      updateUserProfile: jest.fn(),
      sendVerificationEmail: jest.fn(),
      refreshUser: jest.fn(),
    });

    // Mock onSnapshot to return an unsubscribe function
    const mockOnSnapshot = require('firebase/firestore').onSnapshot;
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      // Simulate empty data
      callback({
        forEach: (fn: any) => {},
        docs: [],
        size: 0,
      });
      return jest.fn(); // Return unsubscribe function
    });

    // Mock getDocs to return empty data
    const mockGetDocs = require('firebase/firestore').getDocs;
    mockGetDocs.mockResolvedValue({
      forEach: (fn: any) => {},
      docs: [],
      size: 0,
    });

    // Mock getDoc to return non-existent document
    const mockGetDoc = require('firebase/firestore').getDoc;
    mockGetDoc.mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the communication center button', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('opens the communication center when button is clicked', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    // Should open the sheet
    await waitFor(() => {
      expect(screen.getByText('Messages & Notifications')).toBeInTheDocument();
    });
  });

  it('displays the correct tabs', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('shows search functionality', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('handles search input correctly', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      expect(searchInput).toHaveValue('test search');
    });
  });

  it('shows empty state when no conversations exist', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(screen.getByText('No conversations found')).toBeInTheDocument();
    });
  });

  it('shows empty state when no notifications exist', async () => {
    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    // Switch to notifications tab
    await waitFor(() => {
      const notificationsTab = screen.getByText('Notifications');
      fireEvent.click(notificationsTab);
    });

    await waitFor(() => {
      expect(screen.getByText('No notifications')).toBeInTheDocument();
    });
  });

  it('displays unread count when there are unread items', async () => {
    // Mock onSnapshot to return some unread notifications
    const mockOnSnapshot = require('firebase/firestore').onSnapshot;
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({
        forEach: (fn: any) => {
          fn({
            id: 'test-notification',
            data: () => ({
              id: 'test-notification',
              userId: 'test-user-id',
              type: 'message',
              title: 'Test Notification',
              description: 'Test Description',
              read: false,
              createdAt: { toDate: () => new Date() },
            }),
          });
        },
        docs: [
          {
            id: 'test-notification',
            data: () => ({
              id: 'test-notification',
              userId: 'test-user-id',
              type: 'message',
              title: 'Test Notification',
              description: 'Test Description',
              read: false,
              createdAt: { toDate: () => new Date() },
            }),
          },
        ],
        size: 1,
      });
      return jest.fn();
    });

    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      // Should show unread count badge
      const badge = screen.getByText('1');
      expect(badge).toBeInTheDocument();
    });
  });

  it('handles user not being logged in', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      loading: false,
      firebaseUser: null,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      loginWithGoogle: jest.fn(),
      loginWithLinkedIn: jest.fn(),
      updateUserProfile: jest.fn(),
      sendVerificationEmail: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<UnifiedCommunicationCenter />);

    // Should show loading state or disabled state
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows admin features for admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAdmin: true,
      loading: false,
      firebaseUser: null,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      loginWithGoogle: jest.fn(),
      loginWithLinkedIn: jest.fn(),
      updateUserProfile: jest.fn(),
      sendVerificationEmail: jest.fn(),
      refreshUser: jest.fn(),
    });

    render(<UnifiedCommunicationCenter />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    // Admin should see all conversations, regular users see only their own
    await waitFor(() => {
      expect(screen.getByText('Conversations')).toBeInTheDocument();
    });
  });
});

export {};