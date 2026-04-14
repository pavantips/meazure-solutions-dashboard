import { useState } from 'react';
import ResponseViewer from '../components/ResponseViewer';
import { pageHeader, methodBadge, sectionCard, sectionLabel, inputStyle, labelStyle, submitBtn, resetBtn, grid2 } from '../styles/shared';
import { randomTermExam } from '../utils/randomize';

export default function CreateExam() {
  const [form, setForm] = useState(randomTermExam);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  function set(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/proxy/createExam', {
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
      <div style={pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={methodBadge}>POST</span>
          <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>/api/editTermExam</code>
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Create Exam</h1>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Creates or updates an exam under a term. Get valid <strong>term_id</strong> and <strong>department_id</strong> values from <em>Get Terms</em> and <em>Get Departments</em> first.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Term & Department */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Term & Department</div>
              <div style={grid2}>
                <Field label="Term ID"        value={form.term_id}       onChange={v => set('term_id', v)} />
                <Field label="Term Name"      value={form.term_name}     onChange={v => set('term_name', v)} />
                <Field label="Department ID"  value={form.department_id} onChange={v => set('department_id', v)} />
                <Field label="Instructor"     value={form.instructor}    onChange={v => set('instructor', v)} />
              </div>
            </div>

            {/* Exam Details */}
            <div style={sectionCard}>
              <div style={sectionLabel}>Exam Details</div>
              <div style={grid2}>
                <Field label="Exam ID"      value={form.exam_id}     onChange={v => set('exam_id', v)} />
                <Field label="Exam No"      value={form.exam_no}     onChange={v => set('exam_no', v)} />
                <Field label="Description"  value={form.description} onChange={v => set('description', v)} span={2} />
                <Field label="Course No"    value={form.courseno}    onChange={v => set('courseno', v)} />
                <Field label="Exam URL"     value={form.exam_url}    onChange={v => set('exam_url', v)} type="url" />
                <Field label="Password"     value={form.password}    onChange={v => set('password', v)} />
                <Field label="Notes"        value={form.notes}       onChange={v => set('notes', v)} />
                <Field label="Duration (min)" value={form.duration}  onChange={v => set('duration', v)} type="number" />
                <Field label="Max Attempts" value={form.max_attempt} onChange={v => set('max_attempt', v)} type="number" />

                {/* Active select */}
                <div>
                  <label style={labelStyle}>Active</label>
                  <select value={form.active} onChange={e => set('active', e.target.value)} style={inputStyle}>
                    <option value="Y">Y — Active</option>
                    <option value="N">N — Inactive</option>
                  </select>
                </div>

                <Field label="Start Date" value={form.start_date} onChange={v => set('start_date', v)} type="datetime-local" />
                <Field label="End Date"   value={form.end_date}   onChange={v => set('end_date', v)}   type="datetime-local" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading} style={submitBtn}>
                {loading ? <><Spinner /> Sending...</> : '⚡ Send Request'}
              </button>
              <button type="button" onClick={() => { setForm(randomTermExam()); setResult(null); }} style={resetBtn}>
                Reset
              </button>
            </div>
          </div>

          <ResponseViewer result={result} loading={loading} />
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', span, ...rest }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : 'span 1' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} style={inputStyle} {...rest} />
    </div>
  );
}

function Spinner() {
  return <span style={{ display: 'inline-block', width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', marginRight: '6px', verticalAlign: 'middle' }} />;
}
