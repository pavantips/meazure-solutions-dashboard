import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn } from '../styles/shared';

const TZ_OPTIONS = [
  'Central Standard Time', 'Eastern Standard Time', 'Pacific Standard Time',
  'Mountain Standard Time', 'UTC', 'GMT', 'India Standard Time',
  'New Zealand Standard Time', 'Australia Eastern Standard Time',
];

const DEFAULT_START = '2026-09-02T00:00:00Z';

export default function AddAdhoc() {
  /* ── Step 1 state ── */
  const [slotForm, setSlotForm] = useState({
    start_date:   DEFAULT_START,
    duration:     '60',
    time_zone_id: 'Central Standard Time',
    takeitnow:    'Y',
  });
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsResult,  setSlotsResult]  = useState(null);
  const [slotList,     setSlotList]     = useState([]);
  const setS = (k, v) => setSlotForm(p => ({ ...p, [k]: v }));

  /* ── Step 2 state ── */
  const [form, setForm] = useState({
    student_id:    '13592',
    user_password: 'a678487e89C8',
    first_name:    'Jane',
    last_name:     'Does',
    email:         'indijones72@yopmail.com',
    time_zone_id:  'Central Standard Time',
    description:   'test',
    duration:      '120',
    notes:         '',
    start_date:    DEFAULT_START,
    reservation_id:'13592',
    reservation_no:'',
    takeitnow:     'Y',
    exam_url:      'http://proctoru.com',
    exam_password: '10f7455adf2d',
    department_id: '740364540',
    url_return:    '',
  });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── Step 1 handler ── */
  async function handleGetSlots(e) {
    e.preventDefault();
    setSlotsLoading(true); setSlotsResult(null); setSlotList([]);
    try {
      const res = await fetch('/api/proxy/getAdhocSlots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...slotForm, time_sent: new Date().toISOString() }),
      });
      const data = await res.json();
      setSlotsResult(data);
      // Parse common slot array patterns from the response
      const inner = data?.data;
      const candidates = [inner?.data, inner?.slots, inner?.available_times, inner?.times];
      const found = candidates.find(c => Array.isArray(c) && c.length > 0);
      if (found) setSlotList(found);
    } catch (err) {
      setSlotsResult({ success: false, status: 0, data: { error: err.message } });
    }
    setSlotsLoading(false);
  }

  /* ── Step 2 handler ── */
  async function handleBook(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/addAdhoc', {
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

  function selectSlot(slot) {
    const time = slot.start_date || slot.start_time || slot.time || slot.reservation_start;
    if (time) {
      set('start_date', time);
      set('duration', slot.duration ? String(slot.duration) : form.duration);
    }
  }

  const slotSelected = form.start_date !== DEFAULT_START;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>

      {/* Page title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Add Adhoc</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Two-step flow — first fetch available slots, then book the session with a selected slot time.
        </p>
      </div>

      {/* ═══════════════════════════════════════════
          STEP 1 — Get Available Slots
      ═══════════════════════════════════════════ */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <StepBadge n="1" color="#7c3aed" bg="#ede9fe" />
          <MethodBadge>POST</MethodBadge>
          <code style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
            api.proctoru.com/api/getScheduleInfoAvailableTimesList
          </code>
        </div>

        <form onSubmit={handleGetSlots}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

            {/* Left — inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={sectionCard}>
                <div style={sectionLabel}>Query Parameters</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>start_date</label>
                    <input value={slotForm.start_date} onChange={e => setS('start_date', e.target.value)}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>duration (min)</label>
                      <input value={slotForm.duration} onChange={e => setS('duration', e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>takeitnow</label>
                      <select value={slotForm.takeitnow} onChange={e => setS('takeitnow', e.target.value)} style={inputStyle}>
                        <option value="Y">Y — Take It Now</option>
                        <option value="N">N — Schedule later</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>time_zone_id</label>
                    <select value={slotForm.time_zone_id} onChange={e => setS('time_zone_id', e.target.value)} style={inputStyle}>
                      {TZ_OPTIONS.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', paddingTop: '2px' }}>
                    <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: '3px' }}>isadhoc=Y</code> is always appended automatically.
                  </div>
                </div>
              </div>
              <button type="submit" disabled={slotsLoading} style={{ ...submitBtn, background: '#7c3aed' }}>
                {slotsLoading ? <><Spin /> Fetching...</> : '🔍 Get Available Slots'}
              </button>
            </div>

            {/* Right — slot picker or response */}
            <div>
              {slotsResult && (
                <SlotPicker
                  result={slotsResult}
                  slotList={slotList}
                  selectedStart={form.start_date}
                  onSelect={selectSlot}
                />
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#e5e7eb', margin: '0 0 32px' }} />

      {/* ═══════════════════════════════════════════
          STEP 2 — Book the Adhoc Exam
      ═══════════════════════════════════════════ */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <StepBadge n="2" color="#166534" bg="#dcfce7" />
          <MethodBadge>POST</MethodBadge>
          <code style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
            api.proctoru.com/api/addAdHocProcess
          </code>
        </div>

        <form onSubmit={handleBook}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Student */}
              <div style={sectionCard}>
                <div style={sectionLabel}>Student</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>first_name</label>
                      <input value={form.first_name} onChange={e => set('first_name', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>last_name</label>
                      <input value={form.last_name} onChange={e => set('last_name', e.target.value)} style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>email</label>
                    <input value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>student_id</label>
                      <input value={form.student_id} onChange={e => set('student_id', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>user_password</label>
                      <input value={form.user_password} onChange={e => set('user_password', e.target.value)} style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>time_zone_id</label>
                    <select value={form.time_zone_id} onChange={e => set('time_zone_id', e.target.value)} style={inputStyle}>
                      {TZ_OPTIONS.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Exam */}
              <div style={sectionCard}>
                <div style={sectionLabel}>Exam</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><label style={labelStyle}>description</label>
                    <input value={form.description} onChange={e => set('description', e.target.value)} style={inputStyle} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>duration (min)</label>
                      <input value={form.duration} onChange={e => set('duration', e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>department_id</label>
                      <input value={form.department_id} onChange={e => set('department_id', e.target.value)} style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>exam_url</label>
                    <input value={form.exam_url} onChange={e => set('exam_url', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>exam_password</label>
                    <input value={form.exam_password} onChange={e => set('exam_password', e.target.value)} style={inputStyle} /></div>
                </div>
              </div>

              {/* Scheduling */}
              <div style={sectionCard}>
                <div style={sectionLabel}>Scheduling</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>
                      start_date
                      {slotSelected && (
                        <span style={{ marginLeft: '7px', fontSize: '10px', fontWeight: '700', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '3px' }}>
                          ✓ from slot
                        </span>
                      )}
                    </label>
                    <input value={form.start_date} onChange={e => set('start_date', e.target.value)}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px', borderColor: slotSelected ? '#86efac' : undefined }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label style={labelStyle}>takeitnow</label>
                      <select value={form.takeitnow} onChange={e => set('takeitnow', e.target.value)} style={inputStyle}>
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    </div>
                    <div><label style={labelStyle}>reservation_id</label>
                      <input value={form.reservation_id} onChange={e => set('reservation_id', e.target.value)} style={inputStyle} /></div>
                  </div>
                  <div><label style={labelStyle}>reservation_no</label>
                    <input value={form.reservation_no} onChange={e => set('reservation_no', e.target.value)} style={inputStyle} placeholder="Optional" /></div>
                  <div><label style={labelStyle}>notes</label>
                    <input value={form.notes} onChange={e => set('notes', e.target.value)} style={inputStyle} placeholder="Optional" /></div>
                  <div><label style={labelStyle}>url_return</label>
                    <input value={form.url_return} onChange={e => set('url_return', e.target.value)} style={inputStyle} placeholder="Optional" /></div>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ ...submitBtn, background: '#059669' }}>
                {loading ? <><Spin /> Booking...</> : '📅 Book Adhoc Exam'}
              </button>
            </div>

            <ResponseViewer result={result} loading={loading} />
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Slot Picker ───────────────────────────────────────── */
function SlotPicker({ result, slotList, selectedStart, onSelect }) {
  if (!result.success || slotList.length === 0) {
    return <ResponseViewer result={result} loading={false} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ ...sectionCard, padding: '14px 16px' }}>
        <div style={{ ...sectionLabel, marginBottom: '10px' }}>
          Available Slots — click to use in Step 2
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '260px', overflowY: 'auto' }}>
          {slotList.map((slot, i) => {
            const time = slot.start_date || slot.start_time || slot.time || slot.reservation_start || JSON.stringify(slot);
            const isSelected = selectedStart === time;
            return (
              <button key={i} type="button" onClick={() => onSelect(slot)} style={{
                textAlign: 'left', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                border: `1.5px solid ${isSelected ? '#2563eb' : '#e5e7eb'}`,
                background: isSelected ? '#eff6ff' : '#f9fafb',
                fontSize: '12px', fontFamily: 'monospace',
                color: isSelected ? '#1d4ed8' : '#374151',
                transition: 'all 0.1s',
              }}>
                {isSelected ? '✓ ' : ''}{time}
              </button>
            );
          })}
        </div>
      </div>
      <ResponseViewer result={result} loading={false} />
    </div>
  );
}

/* ── Small helpers ─────────────────────────────────────── */
function StepBadge({ n, color, bg }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
      width:'22px', height:'22px', borderRadius:'50%', background: bg, color, fontSize:'11px', fontWeight:'800', flexShrink:0 }}>
      {n}
    </span>
  );
}

function MethodBadge({ children }) {
  return (
    <span style={{ display:'inline-block', background:'#fef3c7', color:'#92400e', fontSize:'11px', fontWeight:'700', padding:'3px 8px', borderRadius:'5px' }}>
      {children}
    </span>
  );
}

function Spin() {
  return <span style={{ display:'inline-block', width:'13px', height:'13px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:'6px', verticalAlign:'middle' }} />;
}
