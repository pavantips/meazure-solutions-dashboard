import { useEffect } from 'react';

export default function Canvas() {
  useEffect(() => {
    window.location.href = 'https://proctoru.instructure.com';
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Redirecting to Canvas...</p>
    </div>
  );
}
