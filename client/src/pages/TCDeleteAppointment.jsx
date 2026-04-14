import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

export default function TCDeleteAppointment() {
  const [form, setForm] = useState({
    institution_uuid: '693d73f9-3f61-4980-bb79-053371df67a5',
    exam_uuid:        '80e3dce8-35c1-4be9-8f54-05903c84ae4b',
    appointment_uuid: '7164ca62-856c-4622-bd6f-8b00866d1ceb',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/tc/deleteAppointment', {
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
          <span style={{ display:'inline-block', background:'#fee2e2', color:'#991b1b', fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'5px' }}>DELETE</span>
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>go.proctoru.com/api/v2/institutions/:institution_uuid/exams/:exam_uuid/appointments/:appointment_uuid</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Delete Appointment</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Cancels a booked test center appointment. The <strong>appointment_uuid</strong> is returned in the Post Appointment response.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Path Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>institution_uuid</label>
                  <input value={form.institution_uuid} onChange={e => set('institution_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                </div>
                <div>
                  <label style={labelStyle}>exam_uuid</label>
                  <input value={form.exam_uuid} onChange={e => set('exam_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                </div>
                <div>
                  <label style={labelStyle}>appointment_uuid</label>
                  <input value={form.appointment_uuid} onChange={e => set('appointment_uuid', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }} required />
                  <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'4px' }}>From Post Appointment response</p>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading}
              style={{ ...submitBtn, background: '#dc2626' }}>
              {loading ? <><Spin /> Deleting...</> : '🗑 Delete Appointment'}
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
