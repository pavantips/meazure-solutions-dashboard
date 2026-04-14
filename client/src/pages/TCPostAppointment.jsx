import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn, resetBtn, grid2 } from '../styles/shared';

function init() {
  return {
    // Path params
    institution_uuid: '0d68013f-6a45-40a7-b690-d3c85a30a461',
    exam_uuid:        'fde1eebd-3826-45de-8ae8-ebef62747fc7',
    // Query param
    start_url:        'https://app.testrac.com/cgc/delivery/Launch/Release?partner=PCERT-V1',
    // time_slot
    ts_vendor_uuid:            '347202b7-aa08-4aab-bbaf-a2a84d0880ae',
    ts_vendor_time_slot_id:    '4955962',
    ts_test_center_location_id:'9940',
    ts_start_time:             '2026-06-25T17:00:00.000Z',
    ts_end_time:               '2026-06-25T21:00:00.000Z',
    ts_delivery_window_uuid:   '1d3637c1-c338-49b3-9b41-f5f4724ad8bf',
    // user
    u_email:        'pumeica-80091@yopmail.com',
    u_external_id:  '174a8',
    u_first_name:   'Geff',
    u_last_name:    'Bold',
    u_timezone:     'America/Chicago',
    u_country:      'US',
    u_phone_mobile: '847-877-1214',
  };
}

export default function TCPostAppointment() {
  const [form, setForm]       = useState(init);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);

    const payload = {
      institution_uuid: form.institution_uuid,
      exam_uuid:        form.exam_uuid,
      start_url:        form.start_url,
      time_slot: {
        vendor_uuid:             form.ts_vendor_uuid,
        vendor_time_slot_id:     form.ts_vendor_time_slot_id,
        test_center_location_id: form.ts_test_center_location_id,
        start_time:              form.ts_start_time,
        end_time:                form.ts_end_time,
        delivery_window_uuid:    form.ts_delivery_window_uuid,
      },
      user: {
        email:        form.u_email,
        external_id:  form.u_external_id,
        first_name:   form.u_first_name,
        last_name:    form.u_last_name,
        timezone:     form.u_timezone,
        country:      form.u_country,
        phone_mobile: form.u_phone_mobile,
      },
    };

    try {
      const res = await fetch('/api/proxy/tc/postAppointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/v2/institutions/:institution_uuid/exams/:exam_uuid/appointments</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Post Appointment</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>Books a test center appointment for a student. Use time slot details from Get Availability.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Path + query */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Path & Query Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <F label="institution_uuid" value={form.institution_uuid} onChange={v => set('institution_uuid', v)} mono />
                <F label="exam_uuid"        value={form.exam_uuid}        onChange={v => set('exam_uuid', v)} mono />
                <F label="start_url (query param)" value={form.start_url} onChange={v => set('start_url', v)} />
              </div>
            </div>

            {/* time_slot */}
            <div style={sectionCard}>
              <div style={sectionLabel}>time_slot</div>
              <div style={grid2}>
                <F label="vendor_uuid"            value={form.ts_vendor_uuid}            onChange={v => set('ts_vendor_uuid', v)} mono span={2} />
                <F label="vendor_time_slot_id"    value={form.ts_vendor_time_slot_id}    onChange={v => set('ts_vendor_time_slot_id', v)} />
                <F label="test_center_location_id"value={form.ts_test_center_location_id}onChange={v => set('ts_test_center_location_id', v)} />
                <F label="delivery_window_uuid"   value={form.ts_delivery_window_uuid}   onChange={v => set('ts_delivery_window_uuid', v)} mono span={2} />
                <F label="start_time"             value={form.ts_start_time}             onChange={v => set('ts_start_time', v)} mono />
                <F label="end_time"               value={form.ts_end_time}               onChange={v => set('ts_end_time', v)} mono />
              </div>
            </div>

            {/* user */}
            <div style={sectionCard}>
              <div style={sectionLabel}>user</div>
              <div style={grid2}>
                <F label="first_name"   value={form.u_first_name}   onChange={v => set('u_first_name', v)} />
                <F label="last_name"    value={form.u_last_name}    onChange={v => set('u_last_name', v)} />
                <F label="email"        value={form.u_email}        onChange={v => set('u_email', v)} span={2} />
                <F label="external_id"  value={form.u_external_id}  onChange={v => set('u_external_id', v)} />
                <F label="phone_mobile" value={form.u_phone_mobile} onChange={v => set('u_phone_mobile', v)} />
                <F label="timezone"     value={form.u_timezone}     onChange={v => set('u_timezone', v)} />
                <F label="country"      value={form.u_country}      onChange={v => set('u_country', v)} maxLength={2} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? <><Spin /> Sending...</> : '⚡ Send Request'}
              </button>
              <button type="button" onClick={() => { setForm(init()); setResult(null); }} style={resetBtn}>Reset</button>
            </div>
          </div>
          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

function F({ label, value, onChange, mono, span, maxLength }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength}
        style={{ ...inputStyle, ...(mono ? { fontFamily: 'monospace', fontSize: '12px' } : {}) }} />
    </div>
  );
}

function Spin() {
  return <span style={{ display:'inline-block', width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:'6px', verticalAlign:'middle' }} />;
}
