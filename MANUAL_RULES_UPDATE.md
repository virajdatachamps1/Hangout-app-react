# Manual Firebase Rules Update (CLI Not Working)

Since Firebase CLI authentication is failing, update the rules manually:

## Step 1: Update Firestore Rules

1. Open: https://console.firebase.google.com
2. Select your project
3. Click **Firestore Database** in left menu
4. Click **Rules** tab at the top
5. Delete everything and paste this:

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

6. Click **Publish** button

## Step 2: Update Storage Rules

1. Still in Firebase Console
2. Click **Storage** in left menu
3. Click **Rules** tab at the top
4. Delete everything and paste this:

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

5. Click **Publish** button

## Step 3: Verify

1. Go back to your app (http://localhost:5173)
2. Refresh the page
3. All "Missing or insufficient permissions" errors should be gone!

## ✅ That's it!

The rules are now updated and your app should work properly.
