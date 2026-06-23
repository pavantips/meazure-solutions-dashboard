import { useNavigate } from 'react-router-dom';

const categories = [
  {
    id: 'proctoru-admin',
    title: 'Proctoru',
    subtitle: 'Admin Interface',
    icon: '🔧',
    color: '#3b82f6',
    description: 'Manage users and exams',
    path: '/proctoru-admin',
  },
  {
    id: 'proctoru-candidate',
    title: 'Proctoru',
    subtitle: 'Candidate Interface',
    icon: '👤',
    color: '#8b5cf6',
    description: 'Schedule and take exams',
    path: '/proctoru-candidate',
  },
  {
    id: 'meazure-admin',
    title: 'Meazure Exam Platform',
    subtitle: 'Admin Interface',
    icon: '⚙️',
    color: '#10b981',
    description: 'Manage Meazure users',
    path: '/meazure-admin',
  },
  {
    id: 'meazure-candidate',
    title: 'Meazure Exam Platform',
    subtitle: 'Candidate Interface',
    icon: '📚',
    color: '#06b6d4',
    description: 'Access Meazure platform',
    path: '/meazure-candidate',
  },
  {
    id: 'lti',
    title: 'LTI LMS Apps',
    subtitle: 'Learning Management Systems',
    icon: '🏫',
    color: '#f59e0b',
    description: 'Canvas, Moodle, D2L Brightspace',
    path: '/lti',
  },
  {
    id: 'test-center-admin',
    title: 'Test Center Apps',
    subtitle: 'Admin Interface',
    icon: '🏛️',
    color: '#ef4444',
    description: 'Manage test center locations',
    path: '/test-center-admin',
  },
  {
    id: 'test-center-candidate',
    title: 'Test Center Apps',
    subtitle: 'Candidate Interface',
    icon: '🎯',
    color: '#ec4899',
    description: 'Schedule test center exams',
    path: '/test-center-candidate',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          Customer LMS or CMS Application
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>
          Select a role and interface to get started
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(cat.path)}
            style={{
              all: 'unset',
              padding: '32px',
              borderRadius: '12px',
              border: `2px solid ${cat.color}`,
              background: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0,0,0,0.1), 0 0 0 3px ${cat.color}33`;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>{cat.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>
              {cat.title}
            </div>
            <div style={{ fontSize: '13px', color: cat.color, fontWeight: '600', marginBottom: '12px' }}>
              {cat.subtitle}
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
              {cat.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
