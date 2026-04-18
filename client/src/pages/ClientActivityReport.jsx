import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function ClientActivityReport() {
  const [form, setForm] = useState({
    student_id: '365',
    start_date: '2018-08-30T10:30:00Z',
    end_date:   '2018-08-30T11:30:00Z',
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/clientActivityReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, time_sent: new Date().toISOString() }),
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
          <span style={{ display:'inline-block', background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'5px' }}>POST</span>
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/clientActivityReport/</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Client Activity Report</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Returns overall client activity for a student within a date range.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>student_id</label>
                  <input value={form.student_id} onChange={e => set('student_id', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>start_date</label>
                  <input value={form.start_date} onChange={e => set('start_date', e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} required />
                </div>
                <div>
                  <label style={labelStyle}>end_date</label>
                  <input value={form.end_date} onChange={e => set('end_date', e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} required />
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  <code style={{ background: '#f3f4f6', padding: '1px 3px', borderRadius: '3px' }}>time_sent</code> is auto-generated at submit time.
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><Spin /> Running...</> : '📊 Run Report'}
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
