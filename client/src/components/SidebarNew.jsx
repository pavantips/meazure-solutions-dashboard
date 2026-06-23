import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navigation = {
  'Proctoru': {
    color: '#3b82f6',
    items: [
      {
        name: 'Customer LMS or CMS App',
        type: 'section',
        children: [
          {
            name: 'Admin Interface',
            type: 'subsection',
            children: [
              { label: 'Create User', path: '/create-user', method: 'POST' },
              { label: 'Add Bluebird', path: '/add-bluebird', method: 'POST' },
              { label: 'Fulfill Record+', path: '/record-plus-fulfill', method: 'POST' },
              { label: 'Create Exam', path: '/create-exams', method: 'POST' },
              { label: 'Get Terms', path: '/get-terms', method: 'GET' },
              { label: 'Get Departments', path: '/get-departments', method: 'GET' },
              { label: 'Get Reservations', path: '/get-reservations', method: 'GET' },
              { label: 'Cancel Reservation', path: '/cancel-reservation', method: 'POST' },
              {
                name: 'Reports',
                type: 'subgroup',
                children: [
                  { label: 'Bluebird Client Activity', path: '/bluebird-client-activity', method: 'POST' },
                  { label: 'Client Activity Report', path: '/client-activity-report', method: 'POST' },
                  { label: 'Pending Exam Report', path: '/pending-exam-report', method: 'POST' },
                ]
              }
            ]
          },
          {
            name: 'Candidate Interface',
            type: 'subsection',
            children: [
              { label: 'Add Adhoc', path: '/add-adhoc', method: 'POST' },
              { label: 'Record+', path: '/record-plus', method: 'POST' },
              { label: 'Auto Login', path: '/auto-login', method: 'POST' },
            ]
          }
        ]
      },
      {
        name: 'Go to Proctoru.com',
        type: 'link',
        url: 'https://go.proctoru.com',
      }
    ]
  },
  'Meazure Exam Platform': {
    color: '#10b981',
    items: [
      {
        name: 'Admin Interface',
        type: 'subsection',
        children: [
          { label: 'Admin Login', path: '/admin-login-meazure', method: 'LTI' },
          { label: 'Create User', path: '/meazure-create-user', method: 'POST' },
        ]
      },
      {
        name: 'Candidate Interface',
        type: 'subsection',
        children: [
          { label: 'Candidate Login', path: '/candidate-login-meazure', method: 'LTI' },
        ]
      }
    ]
  },
  'LTI LMS Apps': {
    color: '#f59e0b',
    items: [
      { label: 'Canvas', path: '/canvas', method: 'LTI' },
      { label: 'Moodle', path: '/moodle', method: 'LTI' },
      { label: 'D2L Brightspace', path: '/d2l', method: 'LTI' },
    ]
  },
  'Test Center Apps': {
    color: '#ef4444',
    items: [
      {
        name: 'Customer LMS or CMS App',
        type: 'section',
        children: [
          {
            name: 'Admin Interface',
            type: 'subsection',
            children: [
              { label: 'Get Institution', path: '/tc-get-institution', method: 'GET' },
              { label: 'Get Exams', path: '/tc-get-exams', method: 'GET' },
              { label: 'Delivery Windows', path: '/tc-delivery-windows', method: 'GET' },
              { label: 'Test Locations', path: '/tc-test-locations', method: 'GET' },
              { label: 'Availability', path: '/tc-availability', method: 'GET' },
              { label: 'Post Appointment', path: '/tc-create-reservation', method: 'POST' },
              { label: 'Delete Appointment', path: '/tc-cancel-reservation', method: 'DELETE' },
            ]
          },
          {
            name: 'Candidate Interface',
            type: 'subsection',
            children: [
              {
                name: 'Go to Proctoru.com',
                type: 'link',
                url: 'https://go.proctoru.com',
              }
            ]
          }
        ]
      }
    ]
  }
};

const methodColors = {
  POST:   { bg: '#fef3c7', text: '#92400e' },
  GET:    { bg: '#dbeafe', text: '#1e40af' },
  DELETE: { bg: '#fee2e2', text: '#991b1b' },
  LTI:    { bg: '#e0e7ff', text: '#4f46e5' },
};

function NavItem({ item }) {
  const mc = methodColors[item.method] || methodColors.GET;
  return (
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px', borderRadius: '6px', textDecoration: 'none',
        fontSize: '12px', fontWeight: isActive ? '600' : '400',
        color: isActive ? '#ffffff' : '#cbd5e1',
        background: isActive ? '#2563eb' : 'transparent',
        transition: 'all 0.15s',
        marginLeft: '8px',
      })}
      onMouseEnter={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = '#2d3f55'; }}
      onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize:'9px', fontWeight:'700', padding:'1px 4px', borderRadius:'3px', background: mc.bg, color: mc.text, letterSpacing:'0.02em', flexShrink: 0 }}>
        {item.method}
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
    </NavLink>
  );
}

function CollapsibleSection({ title, items, color, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  // Auto-expand if any child is active
  useEffect(() => {
    const hasActiveChild = items.some(item => {
      if (item.path) return location.pathname === item.path;
      if (item.children) {
        const hasActive = item.children.some(child =>
          child.path ? location.pathname === child.path : false
        );
        return hasActive;
      }
      return false;
    });
    if (hasActiveChild) setExpanded(true);
  }, [location.pathname, items]);

  const fontSize = level === 0 ? '13px' : level === 1 ? '12px' : '11px';
  const fontWeight = level === 0 ? '700' : '600';

  return (
    <div style={{ marginBottom: level === 0 ? '12px' : '0' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          all: 'unset',
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: `${level === 0 ? '8px 8px' : '6px 12px'}`,
          width: '100%', cursor: 'pointer',
          fontSize, fontWeight,
          color: level === 0 ? color : '#cbd5e1',
          background: 'transparent',
          borderRadius: '6px',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#2d3f55'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ transform: `rotate(${expanded ? 0 : -90}deg)`, transition: 'transform 0.2s', display: 'inline-block' }}>
          ▼
        </span>
        {title}
      </button>
      {expanded && (
        <div style={{ marginLeft: level === 0 ? '8px' : '0', marginTop: '4px' }}>
          {items.map((item, idx) => (
            <div key={idx}>
              {item.type === 'subsection' || item.type === 'subgroup' ? (
                <CollapsibleSection title={item.name} items={item.children} color={color} level={level + 1} />
              ) : item.type === 'link' ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '6px', textDecoration: 'none',
                    fontSize: '12px', color: '#cbd5e1',
                    background: 'transparent', transition: 'background 0.15s',
                    marginLeft: '8px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d3f55'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ marginLeft: 'auto', fontSize: '10px' }}>↗</span>
                  {item.name}
                </a>
              ) : (
                <NavItem item={item} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside style={{
      width: '280px', minWidth: '280px', background: '#1e293b',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'scroll', flexShrink: 0,
      scrollbarWidth: 'auto',
      scrollbarColor: '#ffffff #1e293b',
    }}>
      <style>{`
        aside::-webkit-scrollbar {
          width: 8px;
        }
        aside::-webkit-scrollbar-track {
          background: #1e293b;
        }
        aside::-webkit-scrollbar-thumb {
          background: #ffffff;
          border-radius: 4px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>

      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          ProctorU
        </div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', lineHeight: 1.3 }}>
          Customer LMS or CMS application
        </div>
      </div>

      <div style={{ height: '1px', background: '#334155', margin: '0 16px 16px', flexShrink: 0 }} />

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 8px 16px', overflowY: 'auto' }}>
        {Object.entries(navigation).map(([title, { color, items }]) => (
          <CollapsibleSection key={title} title={title} items={items} color={color} level={0} />
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid #334155', flexShrink: 0 }}>
        <div style={{ fontSize: '10px', color: '#475569' }}>Base URL</div>
        <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
          api.proctoru.com/api
        </div>
      </div>
    </aside>
  );
}
