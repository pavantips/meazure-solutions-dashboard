import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { pageHeader, sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn, resetBtn, grid2 } from '../styles/shared';
import { randomAutoLogin } from '../utils/randomize';

const TIMEZONES = [
  'Central Standard Time', 'Eastern Standard Time', 'Pacific Standard Time',
  'Mountain Standard Time', 'UTC', 'GMT', 'India Standard Time',
];

export default function AutoLogin() {
  const [form, setForm] = useState(randomAutoLogin);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/autoLogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setResult(await res.json());
    } catch (err) {
      setResult({ success: false, status: 0, data: { error: err.message } });
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>
      <div style={pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ display:'inline-block', background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'5px' }}>POST</span>
          <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>demo.proctoru.com/api/autoLogin</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Auto Login</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Generates a one-time login URL for a student. The response typically includes a <strong>redirect URL</strong> — click it to experience the SSO flow.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Student</div>
              <div style={grid2}>
                <F label="Student ID"  value={form.student_id} onChange={v => set('student_id', v)} />
                <F label="Email"       value={form.email}      onChange={v => set('email', v)} type="email" />
                <F label="First Name"  value={form.first_name} onChange={v => set('first_name', v)} />
                <F label="Last Name"   value={form.last_name}  onChange={v => set('last_name', v)} />
              </div>
            </div>

            <div style={sectionCard}>
              <div style={sectionLabel}>Settings</div>
              <div style={grid2}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Time Zone</label>
                  <select value={form.time_zone_id} onChange={e => set('time_zone_id', e.target.value)} style={inputStyle}>
                    {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <F label="Return URL" value={form.url_return} onChange={v => set('url_return', v)} type="url" span={2} />
                <div>
                  <label style={labelStyle}>Update</label>
                  <select value={form.update} onChange={e => set('update', e.target.value)} style={inputStyle}>
                    <option value="Y">Y — Update if exists</option>
                    <option value="N">N — Do not update</option>
                  </select>
                </div>
                <F label="time_sent" value={form.time_sent} onChange={v => set('time_sent', v)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? <><Spin /> Sending...</> : '⚡ Send Request'}
              </button>
              <button type="button" onClick={() => { setForm(randomAutoLogin()); setResult(null); }} style={resetBtn}>↺ New Test Data</button>
            </div>
          </div>
          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

function F({ label, value, onChange, type='text', span, ...rest }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} {...rest} />
    </div>
  );
}

function Spin() {
  return <span style={{ display:'inline-block', width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:'6px', verticalAlign:'middle' }} />;
}
