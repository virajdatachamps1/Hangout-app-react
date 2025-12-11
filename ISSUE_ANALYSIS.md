# Issue Analysis: Plus Buttons Not Showing in Announcements & SOPs

## Summary
You've added plus buttons for creating announcements and uploading SOPs, but they're not appearing in the UI. Here's what's likely wrong:

## Most Likely Issues (in order of probability):

### 🔴 Issue #1: Firestore Indexes Missing (90% likely)
**Problem**: Your Firestore queries use `orderBy()` which requires composite indexes.

**Symptoms**:
- Data doesn't load
- Console shows: "The query requires an index"
- Plus buttons might be visible but data doesn't appear

**Solution**:
1. Open browser console (F12)
2. Look for error message with a link
3. Click the link to auto-create the index in Firebase Console
4. OR manually create indexes:
   - Go to Firebase Console → Firestore → Indexes
   - Create index for `announcements` collection, field `createdAt`, descending
   - Create index for `sops` collection, field `lastUpdated`, descending

**Quick Fix**:
```javascript
// In firestoreService.js, temporarily remove orderBy to test:

// BEFORE:
const q = query(
  collection(db, 'announcements'),
  orderBy('createdAt', 'desc')  // ← This requires an index
);

// AFTER (temporary test):
const q = query(
  collection(db, 'announcements')
  // orderBy removed for testing
);
```

---

### 🟡 Issue #2: User Role Not Set to Admin (70% likely)
**Problem**: The plus buttons only show when `isAdmin` is true.

**Symptoms**:
- You're logged in but buttons don't appear
- No console errors
- Data loads fine

**Check**:
```javascript
// In browser console:
console.log('Is Admin:', /* your isAdmin value */);
```

**Solution**:
1. Go to Firebase Console → Firestore → users collection
2. Find your user document (by email or UID)
3. Ensure the `role` field is set to `'admin'`
4. If missing, add: `role: "admin"`

**Your AuthContext already handles this** - it auto-creates admin users, but check Firestore to confirm.

---

### 🟡 Issue #3: Firestore Security Rules Blocking Access (60% likely)
**Problem**: Firestore rules might be denying read/write access.

**Symptoms**:
- Console shows: "Missing or insufficient permissions"
- Data doesn't load
- Create operations fail silently

**Solution**:
Go to Firebase Console → Firestore → Rules and use this (for development):
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

⚠️ **Note**: This allows all authenticated users to read/write. For production, use proper role-based rules.

---

### 🟢 Issue #4: Firebase Storage Rules (for SOPs only)
**Problem**: Storage rules might block file uploads.

**Symptoms**:
- Announcements work but SOPs upload fails
- Console shows: "User does not have permission"

**Solution**:
Go to Firebase Console → Storage → Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /sops/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## How to Diagnose:

### Step 1: Use the Debug Panel
I've added a debug panel to your app. After restarting your dev server:
1. Look for a red "🐛 Debug" button in the bottom-right corner
2. Click it to see:
   - Your authentication status
   - Whether you're an admin
   - If Firestore queries are working
   - Any error messages

### Step 2: Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for red error messages
4. Common errors to look for:
   - "The query requires an index" → Issue #1
   - "Missing or insufficient permissions" → Issue #3
   - "User does not have permission" → Issue #4

### Step 3: Check Network Tab
1. Open Developer Tools → Network tab
2. Try to load the Announcements or SOPs page
3. Look for failed requests (red status)
4. Click on failed requests to see error details

---

## Quick Test Checklist:

- [ ] Open browser console and check for errors
- [ ] Click the Debug Panel button (bottom-right)
- [ ] Verify `isAdmin: true` in debug panel
- [ ] Check if announcements/SOPs data loads
- [ ] Look for "requires an index" error
- [ ] Verify Firebase Console has proper rules
- [ ] Check if user document has `role: "admin"`

---

## Expected Behavior:

### When Working Correctly:
1. **Announcements Page**:
   - Blue "New Announcement" button in top-right (if admin)
   - Clicking opens a modal to create announcements
   - Announcements appear in a feed below

2. **SOPs Page**:
   - Purple "Upload Document" button in top-right (if admin or senior)
   - Clicking opens a modal to upload PDF/DOCX files
   - Documents appear in a grid below

### Current Behavior:
- Buttons might be hidden (role issue)
- OR buttons visible but nothing happens (Firestore issue)
- OR page is blank (index/rules issue)

---

## Next Steps:

1. **Restart your dev server** to load the debug panel
2. **Open the app** and click the debug button
3. **Report back** with:
   - What the debug panel shows
   - Any console errors
   - Whether buttons are visible or not
   - Your user role from Firestore

---

## Files Modified:
- ✅ `src/components/DebugPanel.jsx` - New debug tool
- ✅ `src/components/Layout.jsx` - Added debug panel
- ✅ `DIAGNOSTIC_CHECKLIST.md` - Detailed troubleshooting guide
- ✅ `ISSUE_ANALYSIS.md` - This file

## Files to Check:
- `src/pages/Announcements.jsx` - Has the plus button code
- `src/pages/SOPs.jsx` - Has the upload button code
- `src/contexts/AuthContext.jsx` - Manages admin role
- `src/utils/firestoreService.js` - Database operations
