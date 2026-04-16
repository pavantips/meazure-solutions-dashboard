import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function TCAvailability() {
  const [form, setForm] = useState({
    vendor_uuid:    '347202b7-aa08-4aab-bbaf-a2a84d0880ae',
    tc_location_id: '9940',
    exam_uuid:                'fde1eebd-3826-45de-8ae8-ebef62747fc7',
    delivery_window_uuid:     '1d3637c1-c338-49b3-9b41-f5f4724ad8bf',
    start_time:               '2026-06-25T17:52:51Z',
    end_time:                 '2026-06-26T17:52:51Z',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/tc/availability', {
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/v2/test_center_locations/:vendor_uuid/:tc_location_id/time_slots</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Availability Slots</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Returns available time slots at a specific test center location. Get <strong>vendor_uuid</strong> and <strong>tc_location_id</strong> from Get Test Locations.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Path Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>vendor_uuid</label>
                  <input value={form.vendor_uuid} onChange={e => set('vendor_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                  <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>From Get Test Locations response</p>
                </div>
                <div>
                  <label style={labelStyle}>tc_location_id</label>
                  <input value={form.tc_location_id} onChange={e => set('tc_location_id', e.target.value)}
                    style={inputStyle} required />
                </div>
              </div>
            </div>
            <div style={sectionCard}>
              <div style={sectionLabel}>Query Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>exam_uuid</label>
                  <input value={form.exam_uuid} onChange={e => set('exam_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                </div>
                <div>
                  <label style={labelStyle}>delivery_window_uuid</label>
                  <input value={form.delivery_window_uuid} onChange={e => set('delivery_window_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                </div>
                <div>
                  <label style={labelStyle}>start_time</label>
                  <input value={form.start_time} onChange={e => set('start_time', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                </div>
                <div>
                  <label style={labelStyle}>end_time</label>
                  <input value={form.end_time} onChange={e => set('end_time', e.target.value)}
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
