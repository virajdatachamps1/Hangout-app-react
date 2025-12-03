// ============================================
// FIREBASE UTILITIES
// Real-time listeners, storage, and helpers
// ============================================

import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs,
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { db } from '../firebase';

// ==========================================
// ACTIVITY FEED
// ==========================================

/**
 * Add activity to feed
 * @param {string} type - 'kudos', 'birthday_wish', 'task_complete', 'timesheet_filled', etc.
 * @param {object} data - Activity specific data
 * @param {string} userId - User performing action
 * @param {string} userName - User's display name
 */
export const addActivity = async (type, data, userId, userName) => {
  try {
    const activityRef = collection(db, 'activities');
    await addDoc(activityRef, {
      type,
      data,
      userId,
      userName,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    console.log('✅ Activity added:', type);
  } catch (error) {
    console.error('❌ Error adding activity:', error);
    throw error;
  }
};

/**
 * Listen to recent activities
 * @param {function} callback - Called with activities array
 * @param {number} limitCount - Number of activities to fetch
 */
export const subscribeToActivities = (callback, limitCount = 20) => {
  const activitiesRef = collection(db, 'activities');
  const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(limitCount));
  
  return onSnapshot(q, (snapshot) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(activities);
  }, (error) => {
    console.error('❌ Error listening to activities:', error);
  });
};

// ==========================================
// NOTIFICATIONS
// ==========================================

/**
 * Create notification for user
 * @param {string} userId - Target user
 * @param {string} type - Notification type
 * @param {object} data - Notification data
 */
export const createNotification = async (userId, type, data) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      type,
      data,
      read: false,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    console.log('✅ Notification created for user:', userId);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

/**
 * Listen to user notifications
 * @param {string} userId - User ID
 * @param {function} callback - Called with notifications array
 */
export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef, 
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notifications);
  }, (error) => {
    console.error('❌ Error listening to notifications:', error);
  });
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
  }
};

/**
 * Mark all notifications as read for user
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), where('read', '==', false));
    const snapshot = await getDocs(q);
    
    const updates = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updates);
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
  }
};

// ==========================================
// KUDOS REACTIONS
// ==========================================

/**
 * Add reaction to kudos
 * @param {string} kudosId - Kudos document ID
 * @param {string} userId - User adding reaction
 * @param {string} emoji - Emoji reaction
 */
export const addKudosReaction = async (kudosId, userId, emoji) => {
  try {
    const kudosRef = doc(db, 'kudos', kudosId);
    await updateDoc(kudosRef, {
      [`reactions.${emoji}`]: arrayUnion(userId)
    });
    
    // Add activity
    const kudosDoc = await getDocs(query(collection(db, 'kudos'), where('__name__', '==', kudosId)));
    if (!kudosDoc.empty) {
      const kudosData = kudosDoc.docs[0].data();
      await addActivity('kudos_reaction', {
        kudosId,
        emoji,
        kudosTo: kudosData.to
      }, userId, '');
    }
    
    console.log('✅ Reaction added');
  } catch (error) {
    console.error('❌ Error adding reaction:', error);
    throw error;
  }
};

/**
 * Remove reaction from kudos
 */
export const removeKudosReaction = async (kudosId, userId, emoji) => {
  try {
    const kudosRef = doc(db, 'kudos', kudosId);
    await updateDoc(kudosRef, {
      [`reactions.${emoji}`]: arrayRemove(userId)
    });
    console.log('✅ Reaction removed');
  } catch (error) {
    console.error('❌ Error removing reaction:', error);
    throw error;
  }
};

/**
 * Subscribe to kudos (real-time)
 */
export const subscribeToKudos = (callback, limitCount = 20) => {
  const kudosRef = collection(db, 'kudos');
  const q = query(kudosRef, orderBy('timestamp', 'desc'), limit(limitCount));
  
  return onSnapshot(q, (snapshot) => {
    const kudosList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(kudosList);
  });
};

/**
 * Create new kudos
 */
export const createKudos = async (fromUserId, fromUserName, toUserName, message, badge = 'Team Player', voiceNoteUrl = null) => {
  try {
    const kudosRef = collection(db, 'kudos');
    const newKudos = await addDoc(kudosRef, {
      from: fromUserName,
      fromUserId,
      to: toUserName,
      message,
      badge,
      voiceNoteUrl,
      reactions: {},
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Add activity
    await addActivity('kudos_given', {
      from: fromUserName,
      to: toUserName,
      badge
    }, fromUserId, fromUserName);
    
    // Create notification for recipient
    // Note: You'll need to fetch the recipient's userId from their name/email
    
    console.log('✅ Kudos created:', newKudos.id);
    return newKudos.id;
  } catch (error) {
    console.error('❌ Error creating kudos:', error);
    throw error;
  }
};

// ==========================================
// VOICE NOTES (Firebase Storage)
// ==========================================

/**
 * Upload voice note to Firebase Storage
 * @param {Blob} audioBlob - Audio blob from recording
 * @param {string} userId - User ID
 * @returns {string} Download URL
 */
export const uploadVoiceNote = async (audioBlob, userId) => {
  try {
    const storage = getStorage();
    const timestamp = Date.now();
    const fileName = `voice-notes/${userId}/${timestamp}.webm`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, audioBlob);
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Voice note uploaded:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading voice note:', error);
    throw error;
  }
};

// ==========================================
// CELEBRATIONS
// ==========================================

/**
 * Add birthday wish
 */
export const addBirthdayWish = async (fromUserId, fromUserName, toUserName, toUserEmail) => {
  try {
    const wishesRef = collection(db, 'birthday_wishes');
    await addDoc(wishesRef, {
      from: fromUserName,
      fromUserId,
      to: toUserName,
      toEmail: toUserEmail,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });
    
    // Add activity
    await addActivity('birthday_wish', {
      from: fromUserName,
      to: toUserName
    }, fromUserId, fromUserName);
    
    console.log('✅ Birthday wish added');
  } catch (error) {
    console.error('❌ Error adding birthday wish:', error);
    throw error;
  }
};

/**
 * Get birthday wishes for user
 */
export const getBirthdayWishes = async (userEmail) => {
  try {
    const wishesRef = collection(db, 'birthday_wishes');
    const q = query(wishesRef, where('toEmail', '==', userEmail));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('❌ Error getting birthday wishes:', error);
    return [];
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get activity icon based on type
 */
export const getActivityIcon = (type) => {
  const icons = {
    'kudos_given': '❤️',
    'birthday_wish': '🎂',
    'task_complete': '✅',
    'timesheet_filled': '⏰',
    'training_enrolled': '📚',
    'kudos_reaction': '👏',
    'sop_uploaded': '📄',
    'announcement_posted': '📢'
  };
  return icons[type] || '📌';
};

/**
 * Get activity message
 */
export const getActivityMessage = (activity) => {
  const { type, data, userName } = activity;
  
  switch (type) {
    case 'kudos_given':
      return `${data.from} gave kudos to ${data.to}`;
    case 'birthday_wish':
      return `${data.from} wished ${data.to} Happy Birthday`;
    case 'task_complete':
      return `${userName} completed a task`;
    case 'timesheet_filled':
      return `${userName} filled their timesheet`;
    case 'training_enrolled':
      return `${userName} enrolled in ${data.trainingName}`;
    case 'kudos_reaction':
      return `${userName} reacted ${data.emoji} to kudos`;
    case 'sop_uploaded':
      return `${userName} uploaded ${data.title}`;
    case 'announcement_posted':
      return `New announcement: ${data.title}`;
    default:
      return `${userName} did something`;
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'just now';
  
  const now = new Date();
  const past = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
};

export default {
  addActivity,
  subscribeToActivities,
  createNotification,
  subscribeToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addKudosReaction,
  removeKudosReaction,
  subscribeToKudos,
  createKudos,
  uploadVoiceNote,
  addBirthdayWish,
  getBirthdayWishes,
  getActivityIcon,
  getActivityMessage,
  getRelativeTime
};