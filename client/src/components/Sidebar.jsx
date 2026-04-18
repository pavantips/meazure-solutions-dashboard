import { NavLink } from 'react-router-dom';

const userEvents = [
  { label: 'Create User',      path: '/create-user',     method: 'POST' },
  { label: 'Auto Login',       path: '/auto-login',      method: 'POST' },
  { label: 'Add Bluebird',     path: '/add-bluebird',    method: 'POST' },
  { label: 'Add Adhoc',        path: '/add-adhoc',       method: 'POST' },
  { label: 'Record+',          path: '/record-plus',         method: 'POST' },
  { label: 'Fulfill Record+',  path: '/record-plus-fulfill', method: 'POST' },
  { label: 'Record+ New',      path: '/record-plus-new',     method: 'POST' },
  { label: 'Get Terms',        path: '/get-terms',       method: 'GET'  },
  { label: 'Get Departments',  path: '/get-departments', method: 'GET'  },
  { label: 'Create Exams',     path: '/create-exams',    method: 'POST' },
  { label: 'Get Exams',        path: '/get-exams',       method: 'GET'  },
  { label: 'Begin Reservation',  path: '/begin-reservation',  method: 'POST' },
  { label: 'Cancel Reservation', path: '/cancel-reservation', method: 'POST' },
  { label: 'Get Availability',   path: '/get-availability',   method: 'GET'  },
];

const reports = [
  { label: 'Get Reservations', path: '/get-reservations', method: 'GET' },
];

const ltiLinks = [
  { label: 'Canvas',         url: 'https://proctoru.instructure.com',                          color: '#e8320a' },
  { label: 'Moodle',         url: 'https://staging-moodle-4-5-5.proctoru.com/login/index.php', color: '#f98012' },
  { label: 'D2L Brightspace',url: 'https://proctoru.brightspacedemo.com',                      color: '#e3001b' },
];

const meazureEvents = [
  { label: 'Create User', path: '/meazure-create-user', method: 'POST' },
];

const testCenterEvents = [
  { label: 'Get Institution ID', path: '/tc-get-institution',  method: 'GET'  },
  { label: 'Get Exams',          path: '/tc-get-exams',         method: 'GET'  },
  { label: 'Get Delivery Windows',path: '/tc-delivery-windows', method: 'GET'  },
  { label: 'Get Test Locations',  path: '/tc-test-locations',   method: 'GET'  },
  { label: 'Get Availability',    path: '/tc-availability',     method: 'GET'  },
  { label: 'Post Appointment',    path: '/tc-create-reservation', method: 'POST'   },
  { label: 'Delete Appointment',  path: '/tc-cancel-reservation', method: 'DELETE' },
];

const methodColors = {
  POST:   { bg: '#fef3c7', text: '#92400e' },
  GET:    { bg: '#dbeafe', text: '#1e40af' },
  DELETE: { bg: '#fee2e2', text: '#991b1b' },
};

const sectionHeading = {
  fontSize: '10px', fontWeight: '700', color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  padding: '0 8px', marginBottom: '6px',
};

function NavItem({ item }) {
  const mc = methodColors[item.method] || methodColors.POST;
  return (
    <NavLink
      to={item.path}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 16px', borderRadius: '8px', textDecoration: 'none',
        fontSize: '13px', fontWeight: isActive ? '600' : '400',
        color: isActive ? '#ffffff' : '#cbd5e1',
        background: isActive ? '#2563eb' : 'transparent',
        transition: 'all 0.15s',
      })}
      onMouseEnter={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = '#2d3f55'; }}
      onMouseLeave={e => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 6px', borderRadius:'4px', background: mc.bg, color: mc.text, letterSpacing:'0.03em', flexShrink: 0 }}>
        {item.method}
      </span>
      {item.label}
    </NavLink>
  );
}

function Section({ title, items }) {
  return (
    <div style={{ padding: '0 8px', marginBottom: '20px' }}>
      <div style={sectionHeading}>{title}</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map(item => <NavItem key={item.path} item={item} />)}
      </nav>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside style={{
      width: '240px', minWidth: '240px', background: '#1e293b',
      display: 'flex', flexDirection: 'column',
      height: '100vh', overflowY: 'auto', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          ProctorU
        </div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9', lineHeight: 1.3 }}>
          API Launch Dashboard
        </div>
      </div>

      <div style={{ height: '1px', background: '#334155', margin: '0 16px 16px', flexShrink: 0 }} />

      <Section title="User Events"  items={userEvents} />
      <Section title="Reports"      items={reports} />

      {/* LTI */}
      <div style={{ padding: '0 8px', marginBottom: '20px' }}>
        <div style={sectionHeading}>LTI</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {ltiLinks.map(item => (
            <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 16px', borderRadius:'8px', textDecoration:'none', fontSize:'13px', color:'#cbd5e1', background:'transparent', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d3f55'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background: item.color, flexShrink:0 }} />
              {item.label}
              <span style={{ marginLeft:'auto', fontSize:'11px', color:'#475569' }}>↗</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#334155', margin: '0 16px 16px', flexShrink: 0 }} />

      <Section title="Meazure Exam Platform" items={meazureEvents} />

      {/* Divider */}
      <div style={{ height: '1px', background: '#334155', margin: '0 16px 16px', flexShrink: 0 }} />

      <Section title="Test Center API" items={testCenterEvents} />

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #334155', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', color: '#475569' }}>Base URL</div>
        <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
          api.proctoru.com/api
        </div>
      </div>
    </aside>
  );
}
