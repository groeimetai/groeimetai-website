# Firebase Deployment Guide

## Prerequisites
1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Firebase project created

## Step 1: Initialize Firebase in your project

```bash
firebase init
```

Select:
- Firestore
- Storage
- Hosting (optional)

## Step 2: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

This will deploy the rules from `firestore.rules` file.

## Step 3: Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

This will deploy the indexes from `firestore.indexes.json` file.

## Step 4: Deploy Storage Rules

```bash
firebase deploy --only storage:rules
```

This will deploy the rules from `storage.rules` file.

## Step 5: Deploy Everything at Once

```bash
firebase deploy
```

## Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Check:
   - Firestore > Rules
   - Firestore > Indexes
   - Storage > Rules

## Current Rules Summary

### Firestore Rules
- Authenticated users can read/write their own data
- Admin users have full access
- Public content is readable by all

### Storage Rules
- Authenticated users can upload to their own folders
- Max file size: 10MB
- Allowed types: images and documents

### Indexes
- User queries optimized
- Project queries with filters
- Message queries with pagination