// ============================================
// AUTHENTICATION UTILITIES
// Complete user management system
// ============================================

import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// ==========================================
// ADMIN CONFIGURATION
// ==========================================

// Default admin email
const INITIAL_ADMINS = ['viraj.s@datachamps.ai'];

/**
 * Check if email is an initial admin
 */
export function isInitialAdmin(email) {
  return INITIAL_ADMINS.includes(email?.toLowerCase());
}

// ==========================================
// USER REGISTRATION
// ==========================================

/**
 * Register new user with email verification
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's full name
 */
export async function registerUser(email, password, displayName) {
  try {
    // Step 1: Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Update display name
    await updateProfile(user, { displayName });

    // Step 3: Send verification email
    await sendEmailVerification(user);

    // Step 4: Determine user role
    const role = isInitialAdmin(email) ? 'admin' : 'employee';

    // Step 5: Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email.toLowerCase(),
      displayName,
      role,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      active: true,
      profileComplete: false
    });

    console.log('✅ User registered successfully:', email);

    return {
      success: true,
      user,
      message: 'Registration successful! Please check your email to verify your account.'
    };

  } catch (error) {
    console.error('❌ Registration error:', error);

    // Handle specific errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }

    throw new Error('Registration failed. Please try again.');
  }
}

// ==========================================
// USER LOGIN
// ==========================================

/**
 * Login user with email and password
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date().toISOString()
    });

    console.log('✅ User logged in:', email);

    return {
      success: true,
      user,
      needsVerification: !user.emailVerified
    };

  } catch (error) {
    console.error('❌ Login error:', error);

    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }

    throw new Error('Login failed. Please try again.');
  }
}

// ==========================================
// PASSWORD RESET
// ==========================================

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);

    console.log('✅ Password reset email sent to:', email);

    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    };

  } catch (error) {
    console.error('❌ Password reset error:', error);

    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email.');
    }

    throw new Error('Failed to send reset email. Please try again.');
  }
}

/**
 * Change user password (requires re-authentication)
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);

    console.log('✅ Password changed successfully');

    return {
      success: true,
      message: 'Password changed successfully!'
    };

  } catch (error) {
    console.error('❌ Change password error:', error);

    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Use at least 6 characters.');
    }

    throw new Error('Failed to change password. Please try again.');
  }
}

// ==========================================
// EMAIL VERIFICATION
// ==========================================

/**
 * Resend verification email
 */
export async function resendVerificationEmail() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    if (user.emailVerified) {
      return {
        success: false,
        message: 'Email already verified!'
      };
    }

    await sendEmailVerification(user);

    console.log('✅ Verification email resent');

    return {
      success: true,
      message: 'Verification email sent! Check your inbox.'
    };

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
}

/**
 * Check and update email verification status
 */
export async function checkEmailVerification() {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    await user.reload(); // Refresh user data

    if (user.emailVerified) {
      // Check if document exists before updating
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          emailVerified: true
        });
      }

      return true;
    }

    return false;

  } catch (error) {
    console.error('❌ Check verification error:', error);
    return false;
  }
}

// ==========================================
// PROFILE MANAGEMENT
// ==========================================

/**
 * Update user profile
 */
export async function updateUserProfile(updates) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Update Firebase Auth profile
    const authUpdates = {};
    if (updates.displayName) authUpdates.displayName = updates.displayName;
    if (updates.photoURL) authUpdates.photoURL = updates.photoURL;

    if (Object.keys(authUpdates).length > 0) {
      await updateProfile(user, authUpdates);
    }

    // Update Firestore profile
    const firestoreUpdates = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated
    delete firestoreUpdates.email;
    delete firestoreUpdates.uid;
    delete firestoreUpdates.role;

    await updateDoc(doc(db, 'users', user.uid), firestoreUpdates);

    console.log('✅ Profile updated successfully');

    return {
      success: true,
      message: 'Profile updated successfully!'
    };

  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
}

/**
 * Update user email (requires re-authentication)
 */
export async function changeUserEmail(newEmail, password) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Update email in Firebase Auth
    await updateEmail(user, newEmail);

    // Send verification to new email
    await sendEmailVerification(user);

    // Update Firestore
    await updateDoc(doc(db, 'users', user.uid), {
      email: newEmail.toLowerCase(),
      emailVerified: false,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ Email updated successfully');

    return {
      success: true,
      message: 'Email updated! Please verify your new email address.'
    };

  } catch (error) {
    console.error('❌ Change email error:', error);

    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already in use.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Password is incorrect.');
    }

    throw new Error('Failed to update email. Please try again.');
  }
}

// ==========================================
// ADMIN: ROLE MANAGEMENT
// ==========================================

/**
 * Update user role (Admin only)
 */
export async function updateUserRole(targetUserId, newRole) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Check if current user is admin
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (currentUserDoc.data()?.role !== 'admin') {
      throw new Error('Only admins can change user roles');
    }

    // Update target user role
    await updateDoc(doc(db, 'users', targetUserId), {
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    console.log('✅ User role updated:', targetUserId, newRole);

    return {
      success: true,
      message: 'User role updated successfully!'
    };

  } catch (error) {
    console.error('❌ Update role error:', error);
    throw error;
  }
}

/**
 * Get all users (Admin only)
 */
export async function getAllUsers() {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Check if current user is admin
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (currentUserDoc.data()?.role !== 'admin') {
      throw new Error('Only admins can view all users');
    }

    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];

    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return users;

  } catch (error) {
    console.error('❌ Get all users error:', error);
    throw error;
  }
}

// ==========================================
// ADMIN: USER DEACTIVATION
// ==========================================

/**
 * Deactivate user account (Admin only)
 */
export async function deactivateUser(targetUserId) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Check if current user is admin
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (currentUserDoc.data()?.role !== 'admin') {
      throw new Error('Only admins can deactivate users');
    }

    // Don't allow deactivating yourself
    if (targetUserId === currentUser.uid) {
      throw new Error('You cannot deactivate your own account');
    }

    await updateDoc(doc(db, 'users', targetUserId), {
      active: false,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: currentUser.uid
    });

    console.log('✅ User deactivated:', targetUserId);

    return {
      success: true,
      message: 'User account deactivated successfully!'
    };

  } catch (error) {
    console.error('❌ Deactivate user error:', error);
    throw error;
  }
}

/**
 * Reactivate user account (Admin only)
 */
export async function reactivateUser(targetUserId) {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Check if current user is admin
    const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (currentUserDoc.data()?.role !== 'admin') {
      throw new Error('Only admins can reactivate users');
    }

    await updateDoc(doc(db, 'users', targetUserId), {
      active: true,
      reactivatedAt: new Date().toISOString(),
      reactivatedBy: currentUser.uid
    });

    console.log('✅ User reactivated:', targetUserId);

    return {
      success: true,
      message: 'User account reactivated successfully!'
    };

  } catch (error) {
    console.error('❌ Reactivate user error:', error);
    throw error;
  }
}

// ==========================================
// USER ACCOUNT DELETION
// ==========================================

/**
 * Delete user account permanently
 */
export async function deleteUserAccount(password) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Delete Firestore data
    await deleteDoc(doc(db, 'users', user.uid));

    // Delete Firebase Auth account
    await deleteUser(user);

    console.log('✅ User account deleted');

    return {
      success: true,
      message: 'Account deleted successfully.'
    };

  } catch (error) {
    console.error('❌ Delete account error:', error);

    if (error.code === 'auth/wrong-password') {
      throw new Error('Password is incorrect.');
    }

    throw new Error('Failed to delete account. Please try again.');
  }
}

// ==========================================
// LOGOUT
// ==========================================

/**
 * Sign out current user
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    console.log('✅ User logged out');

    return {
      success: true,
      message: 'Logged out successfully!'
    };

  } catch (error) {
    console.error('❌ Logout error:', error);
    throw new Error('Failed to logout. Please try again.');
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get current user data from Firestore
 */
export async function getCurrentUserData() {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.warn('⚠️ User document not found in Firestore');
      return null;
    }

    return userDoc.data();

  } catch (error) {
    console.error('❌ Get user data error:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole) {
  const userData = await getCurrentUserData();
  return userData?.role === requiredRole;
}

/**
 * Check if user has any of the specified roles
 */
export async function hasAnyRole(roles) {
  const userData = await getCurrentUserData();
  return roles.includes(userData?.role);
}

const authUtils = {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  checkEmailVerification,
  updateUserProfile,
  changeUserEmail,
  updateUserRole,
  getAllUsers,
  deactivateUser,
  reactivateUser,
  deleteUserAccount,
  getCurrentUserData,
  hasRole,
  hasAnyRole,
  isInitialAdmin
};

export default authUtils;