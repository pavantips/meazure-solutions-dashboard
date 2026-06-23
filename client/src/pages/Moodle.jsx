import { useEffect } from 'react';

export default function Moodle() {
  useEffect(() => {
    window.location.href = 'https://staging-moodle-4-5-5.proctoru.com/login/index.php';
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Redirecting to Moodle...</p>
    </div>
  );
}
