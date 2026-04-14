import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function RecordPlusFulfill() {
  const [form, setForm] = useState({
    reservation_uuid: '421fb271-73c6-410d-8b61-2cdd91404e0e',
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/recordPlusFulfill', {
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
          <span style={{ display:'inline-block', background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'5px' }}>POST</span>
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>demo.proctoru.com/api/exams/add_record_plus_exams/fulfill</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Fulfill Record+</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Step 2 of the Record+ flow. Once the student completes the session via the URL returned by{' '}
          <strong>Add Record+</strong>, call this endpoint with the <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '3px' }}>reservation_uuid</code>{' '}
          to mark the exam as fulfilled and trigger automated scoring.
        </p>
      </div>

      <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '20px' }}>
        <strong>💡 Tip:</strong> Copy the <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: '3px' }}>reservation_uuid</code> from the Add Record+ response, paste it below, and submit.
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Parameters</div>
              <div>
                <label style={labelStyle}>reservation_uuid</label>
                <input
                  value={form.reservation_uuid}
                  onChange={e => setForm({ reservation_uuid: e.target.value })}
                  style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  required
                />
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                  Returned as <code style={{ background: '#f3f4f6', padding: '1px 3px', borderRadius: '3px' }}>uuid</code> or <code style={{ background: '#f3f4f6', padding: '1px 3px', borderRadius: '3px' }}>reservation_uuid</code> in the Add Record+ response.
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ ...submitBtn, background: '#0891b2' }}>
              {loading ? <><Spin /> Fulfilling...</> : '✅ Fulfill Record+ Exam'}
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
