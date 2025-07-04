# Admin Setup Guide

This guide explains how to set up and manage admin accounts for GroeimetAI.

## Admin Email Addresses

The following email addresses are configured as admin accounts:
- info@groeimetai.io
- niels@groeimetai.io
- admin@groeimetai.io

## Initial Setup

To set up admin accounts for existing users:

```bash
npm run setup-admin
```

This script will:
- Look for existing users with the admin email addresses
- Update their role to 'admin' in Firestore
- Create user documents if they don't exist

## How It Works

1. **Automatic Role Assignment**: When a user signs up with one of the admin email addresses, they are automatically assigned the 'admin' role.

2. **Admin Check**: The system checks if a user is an admin by:
   - Checking if their email is in the admin email list
   - Checking if their role in Firestore is 'admin'

## Admin Features

Admins have access to:

### 1. Admin Dashboard (`/dashboard/admin`)
- View all project requests (quotes)
- Filter by status: pending, reviewed, approved, rejected
- Update request status
- See statistics overview

### 2. Enhanced Permissions
- Read all project requests
- Update any project request status
- Access to all user projects
- Manage system-wide settings

## Firebase Security Rules

The Firebase security rules are configured to:
- Allow admins to read all quotes
- Allow admins to update any quote
- Only allow admins to delete quotes
- Give admins access to all projects

## Adding New Admin Users

To add a new admin email:

1. Update `/src/lib/constants/adminEmails.ts`:
```typescript
export const ADMIN_EMAILS = [
  'info@groeimetai.io',
  'niels@groeimetai.io',
  'admin@groeimetai.io',
  'new-admin@groeimetai.io', // Add new email here
] as const;
```

2. Run the setup script:
```bash
npm run setup-admin
```

3. Deploy the updated code

## Security Considerations

- Admin emails are hardcoded for security
- Admin role is automatically assigned on registration
- Firebase rules enforce admin permissions
- All admin actions are logged

## Troubleshooting

If an admin user can't access the admin panel:

1. Check if they're logged in with the correct email
2. Verify their role in Firestore: 
   - Go to Firebase Console > Firestore
   - Check the `users` collection
   - Find the user by email
   - Ensure `role` field is set to 'admin'

3. If needed, manually update their role in Firestore or run:
```bash
npm run setup-admin
```