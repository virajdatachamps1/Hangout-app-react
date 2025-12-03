import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CalendarContext = createContext();

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider');
  }
  return context;
}

// Google Calendar API Configuration
const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  scope: 'https://www.googleapis.com/auth/calendar.events',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
};

export function CalendarProvider({ children }) {
  const { currentUser } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gapiReady, setGapiReady] = useState(false);
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Load Google API
  useEffect(() => {
    const loadGoogleAPI = () => {
      // Check if already loaded
      if (window.gapi) {
        initializeGAPI();
        return;
      }

      // Load script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = initializeGAPI;
      document.body.appendChild(script);
    };

    loadGoogleAPI();
  }, []);

  const initializeGAPI = () => {
    window.gapi.load('client:auth2', async () => {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_CONFIG.apiKey,
          clientId: GOOGLE_CONFIG.clientId,
          discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
          scope: GOOGLE_CONFIG.scope
        });

        setGapiReady(true);

        // Check if already signed in
        const authInstance = window.gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();
        
        setIsAuthorized(isSignedIn);
        setIsLoading(false);

        if (isSignedIn) {
          loadEvents();
        }

        // Listen for sign-in state changes
        authInstance.isSignedIn.listen(handleAuthChange);
      } catch (error) {
        console.error('Error initializing Google API:', error);
        setIsLoading(false);
      }
    });
  };

  const handleAuthChange = (isSignedIn) => {
    setIsAuthorized(isSignedIn);
    if (isSignedIn) {
      loadEvents();
    } else {
      setEvents([]);
      setUpcomingEvents([]);
    }
  };

  // Sign in to Google
  const signIn = async () => {
    if (!gapiReady) {
      throw new Error('Google API not ready');
    }

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      return true;
    } catch (error) {
      console.error('Error signing in to Google:', error);
      throw error;
    }
  };

  // Sign out from Google
  const signOut = async () => {
    if (!gapiReady) return;

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setEvents([]);
      setUpcomingEvents([]);
    } catch (error) {
      console.error('Error signing out from Google:', error);
      throw error;
    }
  };

  // Load calendar events
  const loadEvents = async (maxResults = 20) => {
    if (!gapiReady || !isAuthorized) return;

    try {
      const now = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: oneMonthFromNow.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: maxResults,
        orderBy: 'startTime'
      });

      const events = response.result.items || [];
      setEvents(events);

      // Get events for next 7 days
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcoming = events.filter(event => {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        return eventDate <= nextWeek;
      });
      
      setUpcomingEvents(upcoming);

      return events;
    } catch (error) {
      console.error('Error loading calendar events:', error);
      throw error;
    }
  };

  // Create calendar event
  const createEvent = async (eventData) => {
    if (!gapiReady || !isAuthorized) {
      throw new Error('Not authorized to create events');
    }

    try {
      const event = {
        summary: eventData.title,
        description: eventData.description || '',
        start: {
          dateTime: eventData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        attendees: eventData.attendees || [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 }
          ]
        }
      };

      if (eventData.location) {
        event.location = eventData.location;
      }

      if (eventData.meetLink) {
        event.conferenceData = {
          createRequest: {
            requestId: `${Date.now()}-${Math.random()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        };
      }

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: eventData.meetLink ? 1 : 0
      });

      // Reload events
      await loadEvents();

      return response.result;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  };

  // Create birthday event
  const createBirthdayEvent = async (person) => {
    const birthdayDate = new Date(person.birthday);
    const thisYear = new Date().getFullYear();
    
    // Set birthday for this year
    birthdayDate.setFullYear(thisYear);
    
    // If birthday already passed, set for next year
    if (birthdayDate < new Date()) {
      birthdayDate.setFullYear(thisYear + 1);
    }

    // Set time to 9 AM
    birthdayDate.setHours(9, 0, 0);
    
    const endTime = new Date(birthdayDate);
    endTime.setHours(10, 0, 0);

    return await createEvent({
      title: `🎂 ${person.name}'s Birthday`,
      description: `Wish ${person.name} a happy birthday!`,
      startTime: birthdayDate.toISOString(),
      endTime: endTime.toISOString()
    });
  };

  // Create training session event
  const createTrainingEvent = async (training) => {
    return await createEvent({
      title: `📚 ${training.title}`,
      description: `Training session: ${training.description || ''}\nInstructor: ${training.instructor || 'TBA'}`,
      startTime: training.startTime,
      endTime: training.endTime,
      location: training.location || 'Online',
      meetLink: training.virtual
    });
  };

  // Create 1-on-1 meeting
  const createOneOnOne = async (person, date, duration = 30) => {
    const startTime = new Date(date);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);

    return await createEvent({
      title: `1-on-1: ${person.name}`,
      description: `One-on-one meeting with ${person.name}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      attendees: person.email ? [{ email: person.email }] : [],
      meetLink: true
    });
  };

  // Check if event exists
  const hasEvent = async (title, date) => {
    if (!gapiReady || !isAuthorized) return false;

    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        q: title,
        singleEvents: true
      });

      return (response.result.items || []).length > 0;
    } catch (error) {
      console.error('Error checking event:', error);
      return false;
    }
  };

  const value = {
    isAuthorized,
    isLoading,
    gapiReady,
    events,
    upcomingEvents,
    signIn,
    signOut,
    loadEvents,
    createEvent,
    createBirthdayEvent,
    createTrainingEvent,
    createOneOnOne,
    hasEvent
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}