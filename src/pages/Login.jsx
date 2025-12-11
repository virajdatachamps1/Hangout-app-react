import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import {
  registerUser,
  loginUser,
  resetPassword,
  resendVerificationEmail
} from '../utils/authUtils';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (currentUser && !needsVerification) {
    navigate('/');
    return null;
  }

  // Handle Email/Password Authentication
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignup && !displayName) {
      setError('Please enter your full name');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      if (isSignup) {
        // Sign up
        const result = await registerUser(email, password, displayName);
        setSuccess(result.message);
        setNeedsVerification(true);
      } else {
        // Sign in
        const result = await loginUser(email, password);
        
        if (result.needsVerification) {
          setNeedsVerification(true);
          setSuccess('Please verify your email before accessing the app.');
        } else {
          navigate('/');
        }
      }
      
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const result = await resetPassword(email);
      setSuccess(result.message);
      setIsForgotPassword(false);

    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setSuccess('');
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

  // Resend Verification Email
  const handleResendVerification = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const result = await resendVerificationEmail();
      setSuccess(result.message);

    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  // Render Forgot Password Form
  if (isForgotPassword) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>🔐 Reset Password</h1>
            <p>Enter your email to receive a password reset link</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handlePasswordReset}>
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

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="login-footer">
            <button onClick={() => {
              setIsForgotPassword(false);
              setError('');
              setSuccess('');
            }} disabled={loading}>
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Email Verification Notice
  if (needsVerification) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>📧 Verify Your Email</h1>
            <p>We've sent a verification link to <strong>{email}</strong></p>
          </div>

          {success && <div className="success-message">{success}</div>}
          {error && <div className="error-message">{error}</div>}

          <div className="verification-info">
            <p>Please check your email and click the verification link to activate your account.</p>
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
              Didn't receive the email? Check your spam folder or click the button below to resend.
            </p>
          </div>

          <button 
            onClick={handleResendVerification} 
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <div className="login-footer" style={{ marginTop: '20px' }}>
            Already verified?{' '}
            <button onClick={() => {
              setNeedsVerification(false);
              navigate('/');
            }} disabled={loading}>
              Continue to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Main Login/Signup Form
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎉 DataChamps Hangout</h1>
          <p>{isSignup ? 'Create your account' : 'Welcome back!'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
          {isSignup && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
                autoComplete="name"
              />
            </div>
          )}

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
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          {!isSignup && (
            <div className="forgot-password">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
          )}

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
            setSuccess('');
          }} disabled={loading}>
            {isSignup ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;