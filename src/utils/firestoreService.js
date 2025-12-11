// firestoreService.js
// Central service for all Firestore database operations
// Replace the old dataManager.js with this

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// ==========================================
// EMPLOYEES COLLECTION
// ==========================================

export const employeesService = {
  // Get all employees
  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, 'employees'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  },

  // Get employee by email
  async getByEmail(email) {
    try {
      const q = query(collection(db, 'employees'), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  },

  // Get upcoming birthdays (next 30 days)
  async getUpcomingBirthdays(days = 30) {
    try {
      const employees = await this.getAll();
      const today = new Date();
      const upcoming = [];

      employees.forEach(emp => {
        if (!emp.birthday) return;
        
        const birthday = emp.birthday.toDate ? emp.birthday.toDate() : new Date(emp.birthday);
        const thisYear = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
        const nextYear = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
        
        const daysUntilThisYear = Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));
        const daysUntilNextYear = Math.ceil((nextYear - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilThisYear >= 0 && daysUntilThisYear <= days) {
          upcoming.push({ 
            ...emp, 
            upcomingDate: thisYear, 
            daysUntil: daysUntilThisYear 
          });
        } else if (daysUntilNextYear >= 0 && daysUntilNextYear <= days) {
          upcoming.push({ 
            ...emp, 
            upcomingDate: nextYear, 
            daysUntil: daysUntilNextYear 
          });
        }
      });

      return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    } catch (error) {
      console.error('Error getting birthdays:', error);
      throw error;
    }
  },

  // Get upcoming work anniversaries
  async getUpcomingAnniversaries(days = 30) {
    try {
      const employees = await this.getAll();
      const today = new Date();
      const upcoming = [];

      employees.forEach(emp => {
        if (!emp.workAnniversary) return;
        
        const anniversary = emp.workAnniversary.toDate ? emp.workAnniversary.toDate() : new Date(emp.workAnniversary);
        const thisYear = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
        const nextYear = new Date(today.getFullYear() + 1, anniversary.getMonth(), anniversary.getDate());
        
        const years = today.getFullYear() - anniversary.getFullYear();
        const daysUntilThisYear = Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));
        const daysUntilNextYear = Math.ceil((nextYear - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilThisYear >= 0 && daysUntilThisYear <= days) {
          upcoming.push({ 
            ...emp, 
            upcomingDate: thisYear, 
            daysUntil: daysUntilThisYear,
            years: years 
          });
        } else if (daysUntilNextYear >= 0 && daysUntilNextYear <= days) {
          upcoming.push({ 
            ...emp, 
            upcomingDate: nextYear, 
            daysUntil: daysUntilNextYear,
            years: years + 1
          });
        }
      });

      return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    } catch (error) {
      console.error('Error getting anniversaries:', error);
      throw error;
    }
  }
};

// ==========================================
// ANNOUNCEMENTS COLLECTION
// ==========================================

export const announcementsService = {
  // Get all announcements (sorted by pinned and date)
  async getAll() {
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const announcements = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          readBy: data.readBy || []
        };
      });
      
      // Sort: pinned first, then by date
      return announcements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt - a.createdAt;
      });
    } catch (error) {
      console.error('Error getting announcements:', error);
      throw error;
    }
  },

  // Create new announcement (admin only)
  async create(announcement) {
    try {
      const newAnnouncement = {
        ...announcement,
        createdAt: serverTimestamp(),
        readBy: [],
        totalReads: 0
      };
      const docRef = await addDoc(collection(db, 'announcements'), newAnnouncement);
      return { id: docRef.id, ...newAnnouncement };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  // Mark announcement as read
  async markAsRead(announcementId, userId) {
    try {
      const docRef = doc(db, 'announcements', announcementId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const readBy = data.readBy || [];
        
        if (!readBy.includes(userId)) {
          await updateDoc(docRef, {
            readBy: [...readBy, userId],
            totalReads: (data.totalReads || 0) + 1
          });
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  // Pin/Unpin announcement
  async togglePin(announcementId) {
    try {
      const docRef = doc(db, 'announcements', announcementId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          isPinned: !docSnap.data().isPinned
        });
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      throw error;
    }
  },

  // Delete announcement
  async delete(announcementId) {
    try {
      await deleteDoc(doc(db, 'announcements', announcementId));
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
};

// ==========================================
// KUDOS COLLECTION
// ==========================================

export const kudosService = {
  // Get all kudos (sorted by date)
  async getAll() {
    try {
      const q = query(
        collection(db, 'kudos'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        };
      });
    } catch (error) {
      console.error('Error getting kudos:', error);
      throw error;
    }
  },

  // Get recent kudos (limit)
  async getRecent(limitCount = 10) {
    try {
      const q = query(
        collection(db, 'kudos'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt
        };
      });
    } catch (error) {
      console.error('Error getting recent kudos:', error);
      throw error;
    }
  },

  // Create new kudos
  async create(kudosData) {
    try {
      const newKudos = {
        ...kudosData,
        createdAt: serverTimestamp(),
        likes: 0,
        likedBy: []
      };
      const docRef = await addDoc(collection(db, 'kudos'), newKudos);
      return { id: docRef.id, ...newKudos };
    } catch (error) {
      console.error('Error creating kudos:', error);
      throw error;
    }
  },

  // Like kudos
  async toggleLike(kudosId, userId) {
    try {
      const docRef = doc(db, 'kudos', kudosId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const likedBy = data.likedBy || [];
        
        if (likedBy.includes(userId)) {
          // Unlike
          await updateDoc(docRef, {
            likedBy: likedBy.filter(id => id !== userId),
            likes: Math.max(0, (data.likes || 0) - 1)
          });
        } else {
          // Like
          await updateDoc(docRef, {
            likedBy: [...likedBy, userId],
            likes: (data.likes || 0) + 1
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }
};

// ==========================================
// SOPS & POLICIES COLLECTION
// ==========================================

export const sopsService = {
  // Get all SOPs
  async getAll() {
    try {
      const q = query(
        collection(db, 'sops'),
        orderBy('lastUpdated', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : data.lastUpdated
        };
      });
    } catch (error) {
      console.error('Error getting SOPs:', error);
      throw error;
    }
  },

  // Get SOPs by category
  async getByCategory(category) {
    try {
      const q = query(
        collection(db, 'sops'),
        where('category', '==', category),
        orderBy('lastUpdated', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          lastUpdated: data.lastUpdated?.toDate ? data.lastUpdated.toDate() : data.lastUpdated
        };
      });
    } catch (error) {
      console.error('Error getting SOPs by category:', error);
      throw error;
    }
  },

  // Create new SOP
  async create(sopData) {
    try {
      const newSOP = {
        ...sopData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        views: 0
      };
      const docRef = await addDoc(collection(db, 'sops'), newSOP);
      return { id: docRef.id, ...newSOP };
    } catch (error) {
      console.error('Error creating SOP:', error);
      throw error;
    }
  },

  // Update SOP
  async update(sopId, updates) {
    try {
      const docRef = doc(db, 'sops', sopId);
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating SOP:', error);
      throw error;
    }
  },

  // Delete SOP
  async delete(sopId) {
    try {
      await deleteDoc(doc(db, 'sops', sopId));
    } catch (error) {
      console.error('Error deleting SOP:', error);
      throw error;
    }
  },

  // Increment view count
  async incrementViews(sopId) {
    try {
      const docRef = doc(db, 'sops', sopId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          views: (docSnap.data().views || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
      throw error;
    }
  }
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Format date for display
export function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

// Calculate days until date
export function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = date instanceof Date ? date : date.toDate();
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

// Get time ago string
export function timeAgo(date) {
  const d = date instanceof Date ? date : date.toDate();
  const seconds = Math.floor((new Date() - d) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'just now';
}

export default {
  employees: employeesService,
  announcements: announcementsService,
  kudos: kudosService,
  sops: sopsService,
  formatDate,
  daysUntil,
  timeAgo
};