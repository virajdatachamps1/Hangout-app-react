import { createContext, useContext, useEffect, useState } from 'react';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  function logout() {
    return signOut(auth);
  }

  function hasPermission(requiredRoles) {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('🔐 User logged in:', user.email);
        
        try {
          // IMPORTANT: Use EMAIL as document ID (not UID)
          // This prevents duplicates when CSV import also uses email
          const userDocRef = doc(db, 'users', user.email);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            console.log('✅ Found user data from Firestore');
            const data = userDoc.data();
            setUserRole(data.role || 'employee');
            
            // Update last login and store UID for reference
            await setDoc(userDocRef, {
              uid: user.uid,  // Store UID as field (not as document ID)
              lastLogin: Timestamp.now(),
              displayName: user.displayName || data.displayName || user.email.split('@')[0]
            }, { merge: true });
            
            console.log('👤 Role:', data.role);
            console.log('👑 isAdmin:', data.role === 'admin');
            
          } else {
            console.log('⚠️ No user data found, creating default employee record');
            
            // First time login - create default user document
            const userData = {
              email: user.email,
              uid: user.uid,
              name: user.displayName || user.email.split('@')[0],
              displayName: user.displayName?.split(' ')[0] || user.email.split('@')[0],
              role: 'employee',  // Default role
              createdAt: Timestamp.now(),
              lastLogin: Timestamp.now()
            };
            
            await setDoc(userDocRef, userData);
            setUserRole('employee');
            
            console.log('📝 Created new user with employee role');
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setUserRole('employee');  // Fallback
        }
      } else {
        console.log('❌ No user logged in');
        setUserRole(null);
      }
      
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Debug log when role changes
  useEffect(() => {
    if (userRole) {
      console.log('🎭 Current role:', userRole);
      console.log('👑 isAdmin:', userRole === 'admin');
      console.log('🎖️ isSenior:', userRole === 'senior' || userRole === 'admin');
    }
  }, [userRole]);

  const value = {
    currentUser,
    userRole,
    logout,
    loading,
    hasPermission,
    isAdmin: userRole === 'admin',
    isSenior: userRole === 'senior' || userRole === 'admin',
    isEmployee: userRole === 'employee'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}