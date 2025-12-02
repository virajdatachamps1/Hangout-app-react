// useDataManager.js - React Hook for Firebase Data
import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export function useCelebrations() {
  const [celebrations, setCelebrations] = useState({
    birthdays: [],
    anniversaries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCelebrations();
  }, []);

  const loadCelebrations = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'celebrations'));
      const birthdays = [];
      const anniversaries = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.birthday) {
          birthdays.push({
            name: data.name,
            email: data.email,
            date: data.birthday,
            department: data.department
          });
        }
        if (data.workAnniversary) {
          anniversaries.push({
            name: data.name,
            email: data.email,
            date: data.workAnniversary,
            department: data.department
          });
        }
      });
      
      setCelebrations({ birthdays, anniversaries });
      setError(null);
    } catch (err) {
      console.error('Error loading celebrations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTodayCelebrations = () => {
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    const todayBirthdays = celebrations.birthdays.filter(b => {
      if (!b.date) return false;
      const date = new Date(b.date);
      return !isNaN(date) && date.getMonth() === todayMonth && date.getDate() === todayDay;
    });

    const todayAnniversaries = celebrations.anniversaries.filter(a => {
      if (!a.date) return false;
      const date = new Date(a.date);
      return !isNaN(date) && date.getMonth() === todayMonth && date.getDate() === todayDay;
    }).map(a => {
      const date = new Date(a.date);
      const years = today.getFullYear() - date.getFullYear();
      return { ...a, years };
    });

    return {
      birthdays: todayBirthdays,
      anniversaries: todayAnniversaries
    };
  };

  const getUpcomingCelebrations = (days = 30) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isUpcoming = (celebrationDate) => {
      if (!celebrationDate) return null;
      const date = new Date(celebrationDate);
      if (isNaN(date)) return null;
      
      // Get celebration date for this year and next year
      const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate());
      const nextYear = new Date(today.getFullYear() + 1, date.getMonth(), date.getDate());
      
      // Calculate days until celebration
      const daysUntilThisYear = Math.ceil((thisYear - today) / (1000 * 60 * 60 * 24));
      const daysUntilNextYear = Math.ceil((nextYear - today) / (1000 * 60 * 60 * 24));
      
      // Check if celebration falls within the upcoming period
      if (daysUntilThisYear > 0 && daysUntilThisYear <= days) {
        return { date: thisYear, year: today.getFullYear(), daysUntil: daysUntilThisYear };
      } else if (daysUntilNextYear > 0 && daysUntilNextYear <= days) {
        return { date: nextYear, year: today.getFullYear() + 1, daysUntil: daysUntilNextYear };
      }
      
      return null;
    };

    const upcomingBirthdays = celebrations.birthdays
      .map(birthday => {
        const upcomingInfo = isUpcoming(birthday.date);
        if (upcomingInfo) {
          return {
            ...birthday,
            upcomingDate: upcomingInfo.date,
            daysUntil: upcomingInfo.daysUntil
          };
        }
        return null;
      })
      .filter(b => b !== null)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    const upcomingAnniversaries = celebrations.anniversaries
      .map(anniversary => {
        const upcomingInfo = isUpcoming(anniversary.date);
        if (upcomingInfo) {
          const originalDate = new Date(anniversary.date);
          const years = upcomingInfo.year - originalDate.getFullYear();
          
          return {
            ...anniversary,
            upcomingDate: upcomingInfo.date,
            years: years,
            daysUntil: upcomingInfo.daysUntil
          };
        }
        return null;
      })
      .filter(a => a !== null)
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      birthdays: upcomingBirthdays,
      anniversaries: upcomingAnniversaries
    };
  };

  return {
    celebrations,
    loading,
    error,
    getTodayCelebrations,
    getUpcomingCelebrations,
    refresh: loadCelebrations
  };
}

export function useTimesheets(userEmail) {
  const [userTimesheet, setUserTimesheet] = useState(null);
  const [allTimesheets, setAllTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userEmail) {
      loadTimesheets();
    }
  }, [userEmail]);

  const loadTimesheets = async () => {
    try {
      setLoading(true);
      
      // Load all timesheets
      const snapshot = await getDocs(collection(db, 'timesheets'));
      const timesheets = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        timesheets.push({
          name: data.name,
          email: data.email,
          timesheetLink: data.link,
          department: data.department || ''
        });
      });
      
      setAllTimesheets(timesheets);
      
      // Find user's timesheet
      const userSheet = timesheets.find(ts => ts.email === userEmail);
      setUserTimesheet(userSheet || null);
      
      setError(null);
    } catch (err) {
      console.error('Error loading timesheets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchTimesheets = (query) => {
    if (!query) return allTimesheets;
    
    const lowerQuery = query.toLowerCase();
    return allTimesheets.filter(ts => 
      ts.name.toLowerCase().includes(lowerQuery) ||
      ts.email.toLowerCase().includes(lowerQuery) ||
      (ts.department && ts.department.toLowerCase().includes(lowerQuery))
    );
  };

  return {
    userTimesheet,
    allTimesheets,
    loading,
    error,
    searchTimesheets,
    refresh: loadTimesheets
  };
}

export function useDataStatus() {
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkData();
  }, []);

  const checkData = async () => {
    try {
      setLoading(true);
      const celebrationsSnapshot = await getDocs(collection(db, 'celebrations'));
      const timesheetsSnapshot = await getDocs(collection(db, 'timesheets'));
      
      const dataExists = !celebrationsSnapshot.empty || !timesheetsSnapshot.empty;
      setHasData(dataExists);
    } catch (error) {
      console.error('Error checking data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    hasData,
    loading,
    refresh: checkData
  };
}