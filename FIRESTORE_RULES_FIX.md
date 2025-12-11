# Fix Firestore Permission Errors

## Problem
You're getting "Missing or insufficient permissions" errors because your Firestore security rules are blocking access.

## Solution - Deploy Security Rules

### Option 1: Deploy via Firebase CLI (Recommended)
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Option 2: Update Manually in Firebase Console

#### For Firestore:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

#### For Storage:
1. Go to **Storage** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## What These Rules Do
- Allow any authenticated user to read/write all documents
- ⚠️ **Note**: These are permissive rules for development
- For production, implement role-based access control

## Verify It Works
After deploying, refresh your app and the errors should be gone!
