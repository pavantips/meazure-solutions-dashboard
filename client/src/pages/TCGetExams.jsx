import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn, grid2 } from '../styles/shared';

export default function TCGetExams() {
  const [form, setForm] = useState({
    institution_uuid: '0d68013f-6a45-40a7-b690-d3c85a30a461',
    modality: 'in_person',
    active: 'true',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/tc/getExams', {
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/v2/institutions/:institution_uuid/exams</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Exams</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Returns exams for an institution. The <strong>exam_uuid</strong> values in the response are used by Delivery Windows, Test Locations, and Availability.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Path Parameter</div>
              <label style={labelStyle}>institution_uuid</label>
              <input value={form.institution_uuid} onChange={e => set('institution_uuid', e.target.value)}
                style={{ ...inputStyle, fontFamily: 'monospace' }} required />
            </div>
            <div style={sectionCard}>
              <div style={sectionLabel}>Query Parameters</div>
              <div style={grid2}>
                <div>
                  <label style={labelStyle}>modality</label>
                  <select value={form.modality} onChange={e => set('modality', e.target.value)} style={inputStyle}>
                    <option value="in_person">in_person</option>
                    <option value="online">online</option>
                    <option value="hybrid">hybrid</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>active</label>
                  <select value={form.active} onChange={e => set('active', e.target.value)} style={inputStyle}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
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
