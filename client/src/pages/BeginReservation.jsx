import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function BeginReservation() {
  const [form, setForm] = useState({
    student_id:     '365',
    reservation_id: '456456456',
    reservation_no: '',
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/beginReservation', {
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/beginReservation</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Begin Reservation</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Initiates an existing reservation for a student. Requires the <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>reservation_id</code> from a previously created booking.
        </p>
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
                  <label style={labelStyle}>reservation_id</label>
                  <input value={form.reservation_id} onChange={e => set('reservation_id', e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>reservation_no</label>
                  <input value={form.reservation_no} onChange={e => set('reservation_no', e.target.value)} style={inputStyle} placeholder="Optional" />
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  <code style={{ background: '#f3f4f6', padding: '1px 3px', borderRadius: '3px' }}>time_sent</code> is auto-generated at submit time.
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><Spin /> Starting...</> : '▶ Begin Reservation'}
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
