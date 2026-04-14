import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { pageHeader, methodBadge, sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function GetDepartments() {
  const [timeSent, setTimeSent] = useState(() => new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/proxy/getDepartments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_sent: timeSent }),
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
          <span style={{ ...methodBadge, background: '#dbeafe', color: '#1e40af' }}>GET</span>
          <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>/api/getInstitutionDepartmentList</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Departments</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Returns the list of institution departments. The <code>time_sent</code> is auto-populated — just hit Send.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Query Parameters</div>
              <label style={labelStyle}>time_sent</label>
              <input
                type="text"
                value={timeSent}
                onChange={e => setTimeSent(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }}
              />
              <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                ISO 8601 timestamp. Auto-set to now — no changes needed.
              </p>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><Spinner /> Sending...</> : '⚡ Send Request'}
            </button>
          </div>
          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

function Spinner() {
  return <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: '6px', verticalAlign: 'middle' }} />;
}
