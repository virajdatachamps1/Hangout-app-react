# Diagnostic Checklist for Announcements & SOPs Issues

## 1. Check Browser Console
Open your browser's Developer Tools (F12) and check the Console tab for errors:

### Look for these specific errors:
- ❌ **Firestore Index Error**: "The query requires an index"
- ❌ **Permission Denied**: "Missing or insufficient permissions"
- ❌ **Storage Error**: "Firebase Storage: User does not have permission"
- ❌ **Network Error**: Failed to fetch or CORS errors

## 2. Verify Firebase Console Setup

### Firestore Indexes:
1. Go to Firebase Console → Firestore Database → Indexes
2. Check if these indexes exist:
   - Collection: `announcements`, Field: `createdAt`, Order: Descending
   - Collection: `sops`, Field: `lastUpdated`, Order: Descending

### If missing, create them:
```
Collection ID: announcements
Fields indexed: createdAt (Descending)
Query scope: Collection

Collection ID: sops  
Fields indexed: lastUpdated (Descending)
Query scope: Collection
```

### Firestore Rules:
Go to Firebase Console → Firestore Database → Rules
Ensure you have proper rules (for testing, you can use):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Rules:
Go to Firebase Console → Storage → Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sops/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 3. Check Authentication
In browser console, type:
```javascript
console.log('User:', auth.currentUser);
console.log('Is Admin:', /* check your auth context */);
```

## 4. Test Firestore Connection
Open browser console and run:
```javascript
// Test if you can read from Firestore
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

getDocs(collection(db, 'announcements'))
  .then(snapshot => console.log('✅ Announcements:', snapshot.size))
  .catch(err => console.error('❌ Error:', err));
```

## 5. Check Network Tab
1. Open Developer Tools → Network tab
2. Try to create an announcement or SOP
3. Look for failed requests (red status codes)
4. Check the response for error messages

## 6. Verify User Role
The plus buttons only show for admin users. Check:
- Is `isAdmin` true in your AuthContext?
- Does your user document in Firestore have `role: 'admin'`?

## Common Solutions:

### Solution 1: Create Missing Indexes
When you see "requires an index" error, Firebase will provide a direct link to create it. Click that link!

### Solution 2: Update Firestore Rules (Development Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ ONLY FOR TESTING
    }
  }
}
```

### Solution 3: Check .env File
Ensure your `.env` file has all Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Solution 4: Clear Cache and Restart
```bash
# Stop the dev server
# Clear browser cache
# Restart dev server
npm run dev
```

## What to Report Back:
1. Any error messages from browser console
2. Whether the plus buttons are visible (but not working) or completely hidden
3. Your user role from Firestore
4. Any failed network requests
