import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser) {
    navigate('/');
    return null;
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      navigate('/');
    } catch (err) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please check your email and password.');
      } else {
        setError('Failed to ' + (isSignup ? 'sign up' : 'login') + '. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled');
      } else {
        setError('Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎉 DataChamps Hangout</h1>
          <p>{isSignup ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Google Sign-In Button */}
        <button 
          onClick={handleGoogleSignIn} 
          className="btn btn-google"
          disabled={loading}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '12px' }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button onClick={() => {
            setIsSignup(!isSignup);
            setError('');
          }} disabled={loading}>
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;