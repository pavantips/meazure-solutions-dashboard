import { useEffect } from 'react';

export default function D2L() {
  useEffect(() => {
    window.location.href = 'https://proctoru.brightspacedemo.com';
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Redirecting to D2L Brightspace...</p>
    </div>
  );
}
