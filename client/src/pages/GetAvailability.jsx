import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

const TZ_OPTIONS = [
  'Central Standard Time', 'Eastern Standard Time', 'Pacific Standard Time',
  'Mountain Standard Time', 'UTC', 'GMT', 'India Standard Time',
  'New Zealand Standard Time', 'Australia Eastern Standard Time',
];

export default function GetAvailability() {
  const [form, setForm] = useState({
    start_date:   new Date(Date.now() + 7 * 86400000).toISOString().replace(/\.\d{3}Z$/, 'Z'),
    duration:     '60',
    time_zone_id: 'Central Standard Time',
    takeitnow:    'N',
    isadhoc:      'N',
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [slotList, setSlotList] = useState([]);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null); setSlotList([]);
    try {
      const res = await fetch('/api/proxy/getAvailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, time_sent: new Date().toISOString() }),
      });
      const data = await res.json();
      setResult(data);
      const inner = data?.data;
      const found = [inner?.data, inner?.slots, inner?.available_times, inner?.times]
        .find(c => Array.isArray(c) && c.length > 0);
      if (found) setSlotList(found);
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.proctoru.com/api/getScheduleInfoAvailableTimesList</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Get Availability</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Returns available proctoring time slots for a given date, timezone, and duration.
          Also used as Step 1 in the <strong>Add Adhoc</strong> flow.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={sectionCard}>
              <div style={sectionLabel}>Query Parameters</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>start_date</label>
                  <input value={form.start_date} onChange={e => set('start_date', e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>duration (min)</label>
                    <input value={form.duration} onChange={e => set('duration', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>isadhoc</label>
                    <select value={form.isadhoc} onChange={e => set('isadhoc', e.target.value)} style={inputStyle}>
                      <option value="N">N — Standard</option>
                      <option value="Y">Y — Adhoc</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>takeitnow</label>
                  <select value={form.takeitnow} onChange={e => set('takeitnow', e.target.value)} style={inputStyle}>
                    <option value="N">N — Schedule for later</option>
                    <option value="Y">Y — Take It Now</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>time_zone_id</label>
                  <select value={form.time_zone_id} onChange={e => set('time_zone_id', e.target.value)} style={inputStyle}>
                    {TZ_OPTIONS.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} style={submitBtn}>
              {loading ? <><Spin /> Fetching...</> : '⚡ Get Available Slots'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {slotList.length > 0 && (
              <div style={{ ...sectionCard, padding: '14px 16px' }}>
                <div style={{ ...sectionLabel, marginBottom: '10px' }}>
                  Available Slots ({slotList.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '220px', overflowY: 'auto' }}>
                  {slotList.map((slot, i) => {
                    const time = slot.start_date || slot.start_time || slot.time || slot.reservation_start || JSON.stringify(slot);
                    return (
                      <div key={i} style={{ padding: '7px 11px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '5px', fontSize: '12px', fontFamily: 'monospace', color: '#166534' }}>
                        {time}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <ResponseViewer result={result} loading={loading} />
          </div>
        </div>
      </form>
    </div>
  );
}

function Spin() {
  return <span style={{ display:'inline-block', width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:'6px', verticalAlign:'middle' }} />;
}
