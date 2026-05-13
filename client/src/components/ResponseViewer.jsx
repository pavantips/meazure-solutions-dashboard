import { useState } from 'react';

function isUrl(val) {
  try { return /^https?:\/\//i.test(val); } catch { return false; }
}

function extractUrls(obj, results = []) {
  if (!obj || typeof obj !== 'object') return results;
  for (const [key, val] of Object.entries(obj)) {
    if (typeof val === 'string' && isUrl(val)) results.push({ key, url: val });
    else if (typeof val === 'object') extractUrls(val, results);
  }
  return results;
}

function highlight(json) {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span style="color:#93c5fd">${match}</span>`;
          const val = match.slice(1, -1);
          if (isUrl(val)) return `<span style="color:#86efac;text-decoration:underline">${match}</span>`;
          return `<span style="color:#fde68a">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span style="color:#f9a8d4">${match}</span>`;
        if (/null/.test(match))       return `<span style="color:#94a3b8">${match}</span>`;
        return `<span style="color:#c4b5fd">${match}</span>`;
      }
    );
}

export default function ResponseViewer({ result, loading }) {
  const [tab, setTab]       = useState('response'); // 'response' | 'request'
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}><span>Response</span></div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, gap:'10px', color:'#64748b' }}>
          <Spinner /> Waiting for response...
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}><span>Response</span></div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'8px', color:'#64748b' }}>
          <div style={{ fontSize:'32px' }}>⚡</div>
          <div style={{ fontSize:'13px' }}>Hit <strong>Send</strong> to see the response</div>
        </div>
      </div>
    );
  }

  const { success, status, data, _request } = result;
  const apiMessage = (!success && data?.message) ? data.message : null;
  const launchUrl  = data?.data?.url ?? null;
  const otherUrls  = extractUrls(data).filter(({ url }) => url !== launchUrl);
  const activeJson = tab === 'response' ? JSON.stringify(data, null, 2) : JSON.stringify(_request, null, 2);

  function copy() {
    navigator.clipboard.writeText(activeJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ ...headerStyle, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px' }}>
          <Tab label="Response" active={tab === 'response'} onClick={() => setTab('response')} />
          <Tab label="Request Payload" active={tab === 'request'}  onClick={() => setTab('request')} />
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <StatusBadge success={success} status={status} />
          <button onClick={copy} style={copyBtnStyle}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      </div>

      {/* Request meta bar (url + content-type) */}
      {tab === 'request' && _request && (
        <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', flexWrap:'wrap', gap:'8px', alignItems:'center' }}>
          <span style={metaTag('#1e3a5f','#60a5fa')}>{_request.method}</span>
          <span style={metaTag('#1e293b','#94a3b8')}>{_request.contentType}</span>
          <code style={{ fontSize:'11px', color:'#64748b', wordBreak:'break-all' }}>{_request.url}</code>
        </div>
      )}

      {/* API error message banner */}
      {apiMessage && (
        <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'flex-start', gap:'10px', background:'#1c0a0a' }}>
          <span style={{ fontSize:'14px', flexShrink:0 }}>⚠️</span>
          <span style={{ fontSize:'12px', color:'#fca5a5', lineHeight:'1.5' }}><strong style={{ color:'#f87171' }}>API Error: </strong>{apiMessage}</span>
        </div>
      )}

      {/* Launch button — data.data.url */}
      {tab === 'response' && launchUrl && (
        <div style={{ padding:'12px 16px', borderBottom:'1px solid #1e293b', display:'flex', alignItems:'center', gap:'12px' }}>
          <a href={launchUrl} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:'7px', padding:'8px 20px', background:'#14532d', color:'#4ade80', borderRadius:'8px', fontSize:'13px', fontWeight:'700', textDecoration:'none', border:'1px solid #166534', transition:'background 0.15s', letterSpacing:'0.02em' }}
            onMouseEnter={e => e.currentTarget.style.background='#166534'}
            onMouseLeave={e => e.currentTarget.style.background='#14532d'}
          >Launch</a>
          <code style={{ fontSize:'11px', color:'#4b5563', wordBreak:'break-all', flex:1 }}>{launchUrl}</code>
        </div>
      )}

      {/* Other URLs found in response */}
      {tab === 'response' && otherUrls.length > 0 && (
        <div style={{ padding:'10px 16px', borderBottom:'1px solid #1e293b', display:'flex', flexWrap:'wrap', gap:'8px' }}>
          <span style={{ fontSize:'11px', color:'#64748b', alignSelf:'center', marginRight:'4px' }}>LINKS IN RESPONSE</span>
          {otherUrls.map(({ key, url }) => (
            <a key={key} href={url} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'5px 12px', background:'#1e3a5f', color:'#60a5fa', borderRadius:'6px', fontSize:'12px', fontWeight:'600', textDecoration:'none', border:'1px solid #2563eb', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#1e40af'}
              onMouseLeave={e => e.currentTarget.style.background='#1e3a5f'}
            >↗ {key}</a>
          ))}
        </div>
      )}

      {/* JSON body */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px' }}>
        <pre style={{ fontFamily:"'Menlo','Monaco','Courier New',monospace", fontSize:'12px', lineHeight:'1.7', color:'#e2e8f0', whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}
          dangerouslySetInnerHTML={{ __html: highlight(activeJson) }}
        />
      </div>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:'4px 10px', borderRadius:'5px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:'600',
      background: active ? '#2563eb' : 'transparent',
      color: active ? '#fff' : '#64748b',
      transition:'all 0.15s',
    }}>{label}</button>
  );
}

function StatusBadge({ success, status }) {
  const isOk = success && status >= 200 && status < 300;
  return (
    <span style={{ fontSize:'12px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', background: isOk ? '#052e16' : '#450a0a', color: isOk ? '#4ade80' : '#f87171', border:`1px solid ${isOk ? '#166534' : '#991b1b'}` }}>
      {status} {isOk ? 'OK' : 'ERROR'}
    </span>
  );
}

function Spinner() {
  return <span style={{ display:'inline-block', width:'16px', height:'16px', border:'2px solid #334155', borderTopColor:'#3b82f6', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />;
}

function metaTag(bg, color) {
  return { fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'4px', background:bg, color, letterSpacing:'0.05em', textTransform:'uppercase', flexShrink:0 };
}

const containerStyle = {
  background:'#0f172a', borderRadius:'10px', border:'1px solid #1e293b',
  display:'flex', flexDirection:'column', overflow:'hidden', minHeight:'400px',
};

const headerStyle = {
  padding:'10px 12px', fontSize:'12px', fontWeight:'700', color:'#94a3b8',
  borderBottom:'1px solid #1e293b', background:'#0a0f1e',
};

const copyBtnStyle = {
  fontSize:'11px', padding:'4px 10px', background:'#1e293b', color:'#94a3b8',
  border:'1px solid #334155', borderRadius:'6px', cursor:'pointer',
};
