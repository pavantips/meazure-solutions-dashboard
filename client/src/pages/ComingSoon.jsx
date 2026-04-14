export default function ComingSoon({ title, endpoint }) {
  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '5px' }}>
          POST
        </span>
        <code style={{ fontSize: '14px', color: '#6b7280', fontFamily: 'monospace' }}>{endpoint}</code>
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>{title}</h1>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1.5px dashed #e5e7eb',
        padding: '56px 40px',
        textAlign: 'center',
        maxWidth: '520px',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔧</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          Coming Soon
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
          This endpoint page is being built. Share the API curl or Postman details and it'll be wired up next.
        </div>
      </div>
    </div>
  );
}
