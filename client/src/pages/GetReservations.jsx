import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

const STATUS_OPTIONS = ['pending', 'scheduled', 'cancelled', 'voided'];

export default function GetReservations() {
  const [form, setForm] = useState({
    student_id: 'fda84dc6-2449-47c4-b8f2-6bee5c34f50f',
    status:     'pending',
    time_sent:  new Date().toISOString(),
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/getReservations', {
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
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ display:'inline-block', background:'#dbeafe', color:'#1e40af', fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'5px' }}>GET</span>
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/getStudentReservationList</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Reservations</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Returns reservations for a student filtered by status.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Query Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>student_id</label>
                  <input value={form.student_id} onChange={e => set('student_id', e.target.value)}
                    style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={inputStyle}>
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>time_sent</label>
                  <input value={form.time_sent} onChange={e => set('time_sent', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><Spin /> Sending...</> : '⚡ Send Request'}
            </button>
          </div>
          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

function Spin() {
  return <span style={{ display:'inline-block', width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:'6px', verticalAlign:'middle' }} />;
}
