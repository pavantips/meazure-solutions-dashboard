import { useEffect } from 'react';

export default function CandidateLoginMeazure() {
  useEffect(() => {
    window.location.href = 'https://meazurelearning.ysasecure.com';
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>Redirecting to Candidate Login...</p>
    </div>
  );
}
