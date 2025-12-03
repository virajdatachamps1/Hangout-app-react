import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';

function VoiceNoteRecorder({ onRecordComplete, onCancel }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const deleteRecording = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onRecordComplete(audioBlob);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      border: '2px solid #667eea',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <Mic size={24} color="#667eea" />
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
            Voice Kudos
          </h4>
          <p style={{ fontSize: '13px', color: '#999' }}>
            {isRecording ? 'Recording...' : audioURL ? 'Review your message' : 'Record a voice message (max 60s)'}
          </p>
        </div>
      </div>

      {/* Waveform Visualization (Visual Feedback) */}
      <div style={{
        height: '80px',
        background: '#fafafa',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {isRecording ? (
          // Animated bars during recording
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: `${Math.random() * 60 + 20}px`,
                  background: isPaused ? '#999' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '2px',
                  animation: isPaused ? 'none' : `wave 0.8s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        ) : audioURL ? (
          // Audio player
          <div style={{ textAlign: 'center', width: '100%', padding: '0 20px' }}>
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }}
            />
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#667eea',
              fontFamily: 'monospace'
            }}>
              {formatTime(recordingTime)}
            </div>
          </div>
        ) : (
          // Idle state
          <div style={{ textAlign: 'center', color: '#999' }}>
            <Mic size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <p style={{ fontSize: '13px' }}>Click record to start</p>
          </div>
        )}
      </div>

      {/* Timer Display */}
      {isRecording && (
        <div style={{
          textAlign: 'center',
          fontSize: '32px',
          fontWeight: '800',
          color: isPaused ? '#999' : '#ef4444',
          fontFamily: 'monospace',
          marginBottom: '16px',
          animation: isPaused ? 'none' : 'pulse 1s infinite'
        }}>
          {formatTime(recordingTime)}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {!audioURL ? (
          // Recording controls
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Mic size={28} />
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f59e0b',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {isPaused ? <Play size={24} /> : <Pause size={24} />}
                </button>
                
                <button
                  onClick={stopRecording}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Square size={28} />
                </button>
              </>
            )}
          </>
        ) : (
          // Playback controls
          <>
            <button
              onClick={togglePlayback}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={deleteRecording}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: '#fee2e2',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fecaca'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
            >
              <Trash2 size={24} />
            </button>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {audioURL && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '14px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Send size={18} />
            Send Voice Kudos
          </button>
        </div>
      )}

      {/* Tip */}
      <p style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center'
      }}>
        💡 Tip: Keep it under 60 seconds for best results
      </p>
    </div>
  );
}

export default VoiceNoteRecorder;