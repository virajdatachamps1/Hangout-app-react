import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  // Logout function
  function logout() {
    return signOut(auth);
  }

  // Check if user has admin or senior role
  function hasPermission(requiredRoles) {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setUserRole(data.role || 'employee');
          setNeedsProfileSetup(!data.profileCompleted);
        } else {
          // Create new user document
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            role: 'employee',
            profileCompleted: false,
            createdAt: new Date()
          });
          setNeedsProfileSetup(true);
        }
      } else {
        setUserData(null);
        setUserRole(null);
        setNeedsProfileSetup(false);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    needsProfileSetup,
    loading,
    logout,
    hasPermission,
    isAdmin: userRole === 'admin',
    isHR: userRole === 'hr',
    isSenior: userRole === 'senior' || userRole === 'admin',
    isEmployee: userRole === 'employee',
    canUpload: userRole === 'admin' || userRole === 'hr'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}