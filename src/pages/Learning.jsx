import { GraduationCap, TrendingUp, Award, BookOpen, Clock, Target, ExternalLink, BarChart3, Zap } from 'lucide-react';

function Learning() {
  // External LMS URL - Replace with your actual LMS link
  const LMS_URL = 'https://your-lms-platform.com';

  // Mock analytics data
  const learningData = {
    coursesCompleted: 12,
    totalCourses: 20,
    certificates: 3,
    averageScore: 87,
    totalHours: 48,
    currentStreak: 7,
    improvement: 12
  };

  // Skill breakdown for radar chart visualization
  const skillBreakdown = [
    { skill: 'Technical', score: 85, color: '#667eea' },
    { skill: 'Leadership', score: 72, color: '#f093fb' },
    { skill: 'Communication', score: 90, color: '#4facfe' },
    { skill: 'Problem Solving', score: 78, color: '#10b981' },
    { skill: 'Collaboration', score: 82, color: '#f59e0b' }
  ];

  // Recent achievements
  const recentAchievements = [
    { title: 'JavaScript Advanced', score: 95, date: 'Nov 5, 2024', badge: '🥇' },
    { title: 'React Mastery', score: 88, date: 'Oct 28, 2024', badge: '🥈' },
    { title: 'Team Leadership', score: 82, date: 'Oct 15, 2024', badge: '🥉' }
  ];

  const completionPercentage = Math.round((learningData.coursesCompleted / learningData.totalCourses) * 100);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          fontSize: '180px',
          opacity: 0.08
        }}>
          🎓
        </div>

        <div style={{ position: 'relative', maxWidth: '800px' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: '700' }}>
            Learning Hub
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '28px', lineHeight: '1.6' }}>
            Track your learning progress, view analytics, and access comprehensive course materials through our Learning Management System.
          </p>

          <a
            href={LMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              background: 'white',
              color: '#667eea',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            <GraduationCap size={24} />
            Access Full LMS Platform
            <ExternalLink size={20} />
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <BookOpen size={26} color="white" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '6px', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {learningData.coursesCompleted}/{learningData.totalCourses}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '600', marginBottom: '12px' }}>
            Courses Completed
          </div>
          <div style={{
            height: '6px',
            background: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${completionPercentage}%`,
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              borderRadius: '10px'
            }} />
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #f093fb, #f5576c)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Award size={26} color="white" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '6px', color: '#f093fb' }}>
            {learningData.certificates}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
            Certifications Earned
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Target size={26} color="white" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '6px', color: '#4facfe' }}>
            {learningData.averageScore}%
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
            Average Score
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <TrendingUp size={26} color="white" />
          </div>
          <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '6px', color: '#10b981' }}>
            +{learningData.improvement}%
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
            This Quarter Growth
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Main Content - Skill Breakdown */}
        <div>
          {/* Skills Radar Chart (Visual Representation) */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={24} color="white" />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
                  Skill Assessment
                </h3>
                <p style={{ fontSize: '14px', color: '#999' }}>
                  Your competency across different areas
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {skillBreakdown.map((skill, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700' }}>
                      {skill.skill}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: skill.color }}>
                      {skill.score}%
                    </span>
                  </div>
                  <div style={{
                    height: '12px',
                    background: '#f0f0f0',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${skill.score}%`,
                      background: `linear-gradient(90deg, ${skill.color}, ${skill.color}dd)`,
                      borderRadius: '20px',
                      transition: 'width 1s ease-out',
                      boxShadow: `0 2px 8px ${skill.color}40`
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>
              🏆 Recent Achievements
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentAchievements.map((achievement, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '20px',
                    background: index === 0 ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : '#fafafa',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    border: index === 0 ? '2px solid #fbbf24' : 'none'
                  }}
                >
                  <div style={{
                    fontSize: '40px',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    flexShrink: 0
                  }}>
                    {achievement.badge}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
                      {achievement.title}
                    </h4>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                      {achievement.date}
                    </div>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: achievement.score >= 90 ? '#d1fae5' : achievement.score >= 80 ? '#dbeafe' : '#fef3c7',
                      color: achievement.score >= 90 ? '#059669' : achievement.score >= 80 ? '#2563eb' : '#d97706',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}>
                      Score: {achievement.score}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {/* Learning Stats */}
          <div style={{
            background: 'white',
            padding: '28px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>
              Quick Stats
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #667eea15, #764ba215)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Clock size={20} color="#667eea" />
                  <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Total Learning Time</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#667eea' }}>
                  {learningData.totalHours}h
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'linear-gradient(135deg, #10b98115, #05966915)',
                borderRadius: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Zap size={20} color="#10b981" />
                  <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>Current Streak</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
                  {learningData.currentStreak} days
                </div>
              </div>
            </div>
          </div>

          {/* CTA Box */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '28px',
            borderRadius: '20px',
            color: 'white',
            textAlign: 'center'
          }}>
            <GraduationCap size={48} style={{ marginBottom: '16px', opacity: 0.9 }} />
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>
              Continue Learning
            </h4>
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.6' }}>
              Access your courses, track progress, and earn certifications
            </p>
            
            <a
              href={LMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'white',
                color: '#667eea',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              Open LMS
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Learning;