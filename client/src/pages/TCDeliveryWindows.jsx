import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function TCDeliveryWindows() {
  const [form, setForm] = useState({
    exam_uuid:        'fde1eebd-3826-45de-8ae8-ebef62747fc7',
    institution_uuid: '0d68013f-6a45-40a7-b690-d3c85a30a461',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/tc/deliveryWindows', {
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/v2/delivery_windows</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Delivery Windows</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Returns available delivery windows for an exam. The <strong>delivery_window_uuid</strong> is required for Test Locations and Availability.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Query Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>exam_uuid</label>
                  <input value={form.exam_uuid} onChange={e => set('exam_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                  <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>From Get Exams response</p>
                </div>
                <div>
                  <label style={labelStyle}>institution_uuid</label>
                  <input value={form.institution_uuid} onChange={e => set('institution_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
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
