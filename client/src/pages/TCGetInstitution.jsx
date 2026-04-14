import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, submitBtn } from '../styles/shared';

export default function TCGetInstitution() {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/tc/whoami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/v2/whoami</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Institution ID</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Identifies the institution associated with the configured API key. No parameters needed — the <strong>Authorization-Token</strong> in the server config is the only identifier. The <strong>institution uuid</strong> in the response is used by all downstream Test Center endpoints.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Auth</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '7px', border: '1.5px solid #e5e7eb' }}>
                <span style={{ fontSize: '18px' }}>🔑</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>Authorization-Token</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>Configured in server .env — never exposed to the browser</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: '700', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>SET</span>
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
