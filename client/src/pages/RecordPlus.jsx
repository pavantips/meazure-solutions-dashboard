import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { pageHeader, sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn, resetBtn, grid2 } from '../styles/shared';
import { randomRecordPlus } from '../utils/randomize';

const TIMEZONES = [
  'Central Standard Time','Eastern Standard Time','Pacific Standard Time',
  'Mountain Standard Time','New Zealand Standard Time','India Standard Time',
  'UTC','GMT','Australia Eastern Standard Time',
];
const PRESETS = ['medium','low','high'];

export default function RecordPlus() {
  const [form, setForm]       = useState(randomRecordPlus);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/recordPlus', {
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
          <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>go.proctoru.com/api/exams/add_record_plus_exams</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Record+</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Creates a Record+ (automated proctoring) exam. Sent to <strong>go.proctoru.com</strong> as a JSON request.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Student */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Student</div>
              <div style={grid2}>
                <F label="First Name"    value={form.first_name}    onChange={v => set('first_name', v)} />
                <F label="Last Name"     value={form.last_name}     onChange={v => set('last_name', v)} />
                <F label="Student ID"    value={form.student_id}    onChange={v => set('student_id', v)} />
                <F label="Email"         value={form.email}         onChange={v => set('email', v)} type="email" />
                <F label="Phone"         value={form.phone1}        onChange={v => set('phone1', v)} />
                <F label="Password"      value={form.user_password} onChange={v => set('user_password', v)} />
                <F label="Country (2-letter)" value={form.country}  onChange={v => set('country', v)} maxLength={2} />
                <div style={{ gridColumn: 'span 1' }}>
                  <label style={labelStyle}>Time Zone</label>
                  <select value={form.time_zone_id} onChange={e => set('time_zone_id', e.target.value)} style={inputStyle}>
                    {TIMEZONES.map(tz => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Address (optional) */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Address <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></div>
              <div style={grid2}>
                <F label="Address1" value={form.Address1} onChange={v => set('Address1', v)} span={2} />
                <F label="City"     value={form.City}     onChange={v => set('City', v)} />
                <F label="State"    value={form.State}    onChange={v => set('State', v)} />
                <F label="ZipCode"  value={form.ZipCode}  onChange={v => set('ZipCode', v)} />
              </div>
            </div>

            {/* Exam */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Exam</div>
              <div style={grid2}>
                <F label="Exam ID"        value={form.exam_id}     onChange={v => set('exam_id', v)} />
                <F label="Duration (min)" value={form.duration}    onChange={v => set('duration', v)} type="number" />
                <F label="Description (Exam Name)" value={form.description} onChange={v => set('description', v)} span={2} />
                <F label="Exam URL"       value={form.exam_url}    onChange={v => set('exam_url', v)} type="url" span={2} />
                <div>
                  <label style={labelStyle}>Preset</label>
                  <select value={form.preset} onChange={e => set('preset', e.target.value)} style={inputStyle}>
                    {PRESETS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <F label="Exam Password" value={form.exam_password} onChange={v => set('exam_password', v)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? <><Spin /> Sending...</> : '⚡ Send Request'}
              </button>
              <button type="button" onClick={() => { setForm(randomRecordPlus()); setResult(null); }} style={resetBtn}>
                ↺ New Test Data
              </button>
            </div>
          </div>

          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

function F({ label, value, onChange, type = 'text', span, ...rest }) {
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
