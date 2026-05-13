import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { randomStudent, randomExam } from '../utils/randomize';

function randomBluebird() {
  return { ...randomStudent(), ...randomExam() };
}

const TIMEZONES = [
  'Central Standard Time', 'Eastern Standard Time', 'Pacific Standard Time',
  'Mountain Standard Time', 'UTC', 'GMT', 'India Standard Time',
  'Australia Eastern Standard Time', 'China Standard Time',
];

const defaultValues = {
  student_id:   'gf3e5053d45813',
  first_name:   'Jane',
  last_name:    'Smith',
  user_id:      'gf3e5053d45813',
  user_password:'SecurePass123',
  country:      'US',
  email:        'jane.smith@demo.com',
  duration:     '120',
  exam_id:      'DemoCertID',
  exam_name:    'DemoCert',
  description:  'Demo Exam',
  active_date:  '2025-01-01T00:00:00',
  end_date:     '2026-12-31T00:00:00',
  exam_url:     'https://exam-demo.streamlit.app/',
  exam_password:'testing',
  time_zone_id: 'Central Standard Time',
  course_no:    'c6408aff',
};

export default function AddBluebird() {
  const [form, setForm] = useState(randomBluebird);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const body = { ...form, duration: Number(form.duration) };
      const res = await fetch('/api/proxy/addBluebird', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, status: 0, data: { error: err.message } });
    }
    setLoading(false);
  }


  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={methodBadge}>POST</span>
          <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>
            /api/addBlueBirdExam
          </code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
          Add Bluebird Exam
        </h1>
        <p style={{ fontSize: '13px', color: '#6b7280', maxWidth: '560px' }}>
          Creates a Bluebird (live proctoring) exam session for a student. On success, the response
          includes a <strong>start URL</strong> — click it directly from the response panel to launch
          the proctoring session in a new tab.
        </p>
      </div>


      {/* Two-column layout: form | response */}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          {/* LEFT — Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Student Info */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Student Info</div>
              <div style={grid2}>
                <Field label="First Name"     value={form.first_name}    onChange={v => set('first_name', v)} />
                <Field label="Last Name"      value={form.last_name}     onChange={v => set('last_name', v)} />
                <Field label="Student ID"     value={form.student_id}    onChange={v => set('student_id', v)} />
                <Field label="User ID"        value={form.user_id}       onChange={v => set('user_id', v)} />
                <Field label="User Password"  value={form.user_password} onChange={v => set('user_password', v)} type="password" />
                <Field label="Country Code"   value={form.country}       onChange={v => set('country', v)} placeholder="US" maxLength={2} />
                <Field label="Email" value={form.email} onChange={v => set('email', v)} type="email" span={2} />
              </div>
            </div>

            {/* Exam Details */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Exam Details</div>
              <div style={grid2}>
                <Field label="Exam ID"          value={form.exam_id}       onChange={v => set('exam_id', v)} />
                <Field label="Exam Name"        value={form.exam_name}     onChange={v => set('exam_name', v)} />
                <Field label="Description"      value={form.description}   onChange={v => set('description', v)} span={2} />
                <Field label="Exam URL"         value={form.exam_url}      onChange={v => set('exam_url', v)} type="url" span={2} />
                <Field label="Exam Password"    value={form.exam_password} onChange={v => set('exam_password', v)} />
                <Field label="Duration (min)"   value={form.duration}      onChange={v => set('duration', v)} type="number" min="1" />
                <Field label="Course No"        value={form.course_no}     onChange={v => set('course_no', v)} />

                {/* Timezone select */}
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Time Zone</label>
                  <select
                    value={form.time_zone_id}
                    onChange={e => set('time_zone_id', e.target.value)}
                    style={inputStyle}
                  >
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>

                <Field label="Active Date"  value={form.active_date} onChange={v => set('active_date', v)} type="datetime-local" />
                <Field label="End Date"     value={form.end_date}    onChange={v => set('end_date', v)} type="datetime-local" />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? <><Spinner /> Sending...</> : '⚡ Send Request'}
              </button>
              <button type="button" onClick={() => { setForm(randomBluebird()); setResult(null); }} style={resetBtn}>
                ↺ New Test Data
              </button>
            </div>
          </div>

          {/* RIGHT — Response viewer */}
          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

// ── Reusable Field ────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder, span, ...rest }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder || ''}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
        {...rest}
      />
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: '13px', height: '13px',
      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      marginRight: '6px', verticalAlign: 'middle',
    }} />
  );
}

// ── Styles ────────────────────────────────────────────────────
const sectionCard = {
  background: 'white',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  padding: '16px 18px',
};

const sectionLabel = {
  fontSize: '11px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#9ca3af',
  marginBottom: '14px',
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '5px',
};

const inputStyle = {
  width: '100%',
  padding: '8px 11px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '7px',
  fontSize: '13px',
  color: '#111827',
  outline: 'none',
  background: '#fafafa',
  transition: 'border-color 0.15s',
};

const methodBadge = {
  display: 'inline-block',
  background: '#fef3c7',
  color: '#92400e',
  fontSize: '11px',
  fontWeight: '700',
  padding: '3px 8px',
  borderRadius: '5px',
  letterSpacing: '0.05em',
};

const submitBtn = {
  flex: 1,
  padding: '11px 20px',
  background: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const resetBtn = {
  padding: '11px 18px',
  background: 'white',
  color: '#374151',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
};

