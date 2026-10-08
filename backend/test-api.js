async function run() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'recruiter@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    const token = loginData.token;
    console.log('Login success');
    
    const endpoints = [
      '/api/recruiter/dashboard-stats',
      '/api/recruiter/profile',
      '/api/recruiter/company',
      '/api/recruiter/jobs',
      '/api/recruiter/notifications'
    ];
    
    for (const ep of endpoints) {
      try {
        const res = await fetch(`http://localhost:5000${ep}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          console.log(`GET ${ep} - ERROR - Status: ${res.status} - ${JSON.stringify(data)}`);
        } else {
          console.log(`GET ${ep} - SUCCESS - ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.log(`GET ${ep} - FATAL ERROR - ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Login failed:', err.message);
  }
}
run();
