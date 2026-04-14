import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn, resetBtn, grid2 } from '../styles/shared';

function randomUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const FIRST_NAMES = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella'];
const LAST_NAMES  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
const CITIES      = ['Schaumburg', 'Chicago', 'Austin', 'Denver', 'Phoenix', 'Atlanta', 'Boston', 'Seattle'];

function randomUser() {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const tag = Math.floor(Math.random() * 9000 + 1000);
  return {
    username:          randomUUID(),
    site_id:           '286',
    first_name:        fn,
    last_name:         ln,
    email:             `${fn.toLowerCase()}.${ln.toLowerCase()}${tag}@example.com`,
    alternate_email:   `${fn.toLowerCase()}.${ln.toLowerCase()}.bak@example.com`,
    address1:          `${Math.floor(Math.random() * 9000 + 100)} Main St`,
    address2:          Math.random() > 0.5 ? `Apt ${Math.floor(Math.random() * 200 + 1)}` : '',
    city,
    province:          '',
    country:           'US',
    postal_code:       String(Math.floor(Math.random() * 90000 + 10000)),
    preferred_language:'en',
    partner_id:        '19',
    send_email:        false,
  };
}

export default function MeazureCreateUser() {
  const [form, setForm] = useState(randomUser);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/proxy/meazureCreateUser', {
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
          <code style={{ fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>api.ysasecure.com/v2/users</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Create User — Meazure</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Creates a student account on the Meazure (YSA) platform. Auth token is injected server-side and never exposed to the browser.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Identity */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Identity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>username <span style={{ fontWeight:'400', color:'#9ca3af' }}>(UUID)</span></label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input value={form.username} onChange={e => set('username', e.target.value)}
                      style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '11px', flex: 1 }} required />
                    <button type="button" onClick={() => set('username', randomUUID())}
                      title="Generate new UUID"
                      style={{ padding: '0 10px', height: '36px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>
                      ↺
                    </button>
                  </div>
                </div>
                <div style={grid2}>
                  <div><label style={labelStyle}>first_name</label>
                    <input value={form.first_name} onChange={e => set('first_name', e.target.value)} style={inputStyle} required /></div>
                  <div><label style={labelStyle}>last_name</label>
                    <input value={form.last_name} onChange={e => set('last_name', e.target.value)} style={inputStyle} required /></div>
                </div>
                <div><label style={labelStyle}>email</label>
                  <input value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} type="email" required /></div>
                <div><label style={labelStyle}>alternate_email</label>
                  <input value={form.alternate_email} onChange={e => set('alternate_email', e.target.value)} style={inputStyle} type="email" /></div>
                <div style={grid2}>
                  <div><label style={labelStyle}>site_id</label>
                    <input value={form.site_id} onChange={e => set('site_id', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>partner_id</label>
                    <input value={form.partner_id} onChange={e => set('partner_id', e.target.value)} style={inputStyle} /></div>
                </div>
                <div style={grid2}>
                  <div>
                    <label style={labelStyle}>preferred_language</label>
                    <select value={form.preferred_language} onChange={e => set('preferred_language', e.target.value)} style={inputStyle}>
                      <option value="en">en</option>
                      <option value="es">es</option>
                      <option value="fr">fr</option>
                      <option value="de">de</option>
                      <option value="zh">zh</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <label style={{ ...labelStyle, marginBottom: '4px' }}>send_email</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingTop: '6px' }}>
                      <input type="checkbox" checked={form.send_email} onChange={e => set('send_email', e.target.checked)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '13px', color: '#374151' }}>Send welcome email</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Address</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><label style={labelStyle}>address1</label>
                  <input value={form.address1} onChange={e => set('address1', e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>address2</label>
                  <input value={form.address2} onChange={e => set('address2', e.target.value)} style={inputStyle} placeholder="Optional" /></div>
                <div style={grid2}>
                  <div><label style={labelStyle}>city</label>
                    <input value={form.city} onChange={e => set('city', e.target.value)} style={inputStyle} /></div>
                  <div><label style={labelStyle}>postal_code</label>
                    <input value={form.postal_code} onChange={e => set('postal_code', e.target.value)} style={inputStyle} /></div>
                </div>
                <div style={grid2}>
                  <div><label style={labelStyle}>country <span style={{ fontWeight:'400', color:'#9ca3af' }}>(2-letter)</span></label>
                    <input value={form.country} onChange={e => set('country', e.target.value)} style={inputStyle} maxLength={2} /></div>
                  <div><label style={labelStyle}>province / state</label>
                    <input value={form.province} onChange={e => set('province', e.target.value)} style={inputStyle} placeholder="Optional" /></div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? <><Spin /> Creating...</> : '👤 Create User'}
              </button>
              <button type="button" onClick={() => { setForm(randomUser()); setResult(null); }} style={resetBtn}>
                ↺ New Test Data
              </button>
            </div>
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
