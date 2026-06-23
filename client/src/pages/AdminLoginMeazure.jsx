import { useEffect } from 'react';

export default function AdminLoginMeazure() {
  useEffect(() => {
    window.location.href = 'https://yardstickadmin.com/en/login';
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Redirecting to Admin Login...</p>
    </div>
  );
}
