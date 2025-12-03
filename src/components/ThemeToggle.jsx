import { Sun, Moon, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle({ style = 'button' }) {
  const { isDarkMode, autoMode, toggleTheme, enableAutoMode, setTheme } = useTheme();

  // Simple button style (for sidebar)
  if (style === 'button') {
    return (
      <button
        onClick={toggleTheme}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    );
  }

  // Full dropdown style (for settings)
  return (
    <div style={{
      background: 'white',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
            Theme
          </h3>
          <p style={{ fontSize: '13px', color: '#666' }}>
            Choose your appearance preference
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Light Mode */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: !isDarkMode && !autoMode ? '#f0f0ff' : '#fafafa',
          border: !isDarkMode && !autoMode ? '2px solid #4f46e5' : '2px solid transparent',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (isDarkMode || autoMode) {
            e.currentTarget.style.background = '#f5f5f5';
          }
        }}
        onMouseOut={(e) => {
          if (isDarkMode || autoMode) {
            e.currentTarget.style.background = '#fafafa';
          }
        }}>
          <input
            type="radio"
            name="theme"
            checked={!isDarkMode && !autoMode}
            onChange={() => setTheme(false)}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#4f46e5',
              cursor: 'pointer'
            }}
          />
          <Sun size={20} color={!isDarkMode && !autoMode ? '#4f46e5' : '#666'} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '2px',
              color: !isDarkMode && !autoMode ? '#4f46e5' : '#333'
            }}>
              Light Mode
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Bright and clear interface
            </div>
          </div>
        </label>

        {/* Dark Mode */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: isDarkMode && !autoMode ? '#f0f0ff' : '#fafafa',
          border: isDarkMode && !autoMode ? '2px solid #4f46e5' : '2px solid transparent',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (!isDarkMode || autoMode) {
            e.currentTarget.style.background = '#f5f5f5';
          }
        }}
        onMouseOut={(e) => {
          if (!isDarkMode || autoMode) {
            e.currentTarget.style.background = '#fafafa';
          }
        }}>
          <input
            type="radio"
            name="theme"
            checked={isDarkMode && !autoMode}
            onChange={() => setTheme(true)}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#4f46e5',
              cursor: 'pointer'
            }}
          />
          <Moon size={20} color={isDarkMode && !autoMode ? '#4f46e5' : '#666'} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '2px',
              color: isDarkMode && !autoMode ? '#4f46e5' : '#333'
            }}>
              Dark Mode
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Easy on the eyes in low light
            </div>
          </div>
        </label>

        {/* Auto Mode */}
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: autoMode ? '#f0f0ff' : '#fafafa',
          border: autoMode ? '2px solid #4f46e5' : '2px solid transparent',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (!autoMode) {
            e.currentTarget.style.background = '#f5f5f5';
          }
        }}
        onMouseOut={(e) => {
          if (!autoMode) {
            e.currentTarget.style.background = '#fafafa';
          }
        }}>
          <input
            type="radio"
            name="theme"
            checked={autoMode}
            onChange={enableAutoMode}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#4f46e5',
              cursor: 'pointer'
            }}
          />
          <Clock size={20} color={autoMode ? '#4f46e5' : '#666'} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: '600', 
              marginBottom: '2px',
              color: autoMode ? '#4f46e5' : '#333'
            }}>
              Auto Mode
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Dark from 9 PM - 6 AM
            </div>
          </div>
        </label>
      </div>

      {/* Preview */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        borderRadius: '12px',
        border: '2px solid',
        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
        transition: 'all 0.3s'
      }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: isDarkMode ? '#f1f5f9' : '#111827'
        }}>
          Preview
        </div>
        <div style={{ 
          fontSize: '12px',
          color: isDarkMode ? '#cbd5e1' : '#6b7280'
        }}>
          This is how your interface will look
        </div>
      </div>
    </div>
  );
}

export default ThemeToggle;