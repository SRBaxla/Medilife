const url = 'https://ylnorywjugrdxyzehvwc.supabase.co';
const key = 'sb_publishable_DS_np7uAgh4hqG48i9RNow_vsVlk220';

async function main() {
  console.log("=== Attempting Supabase Auth Login & Database Status Update ===");

  const authRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@medilife.com',
      password: 'Password123!'
    })
  });

  const authData = await authRes.json();
  let token = key;

  if (authData.access_token) {
    console.log("Logged in successfully as admin! Token acquired.");
    token = authData.access_token;
  } else {
    console.log("Admin auth response:", authData);
  }

  const authHeaders = {
    'apikey': key,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // Update status to 'purged' across all bookings
  const bRes = await fetch(`${url}/rest/v1/bookings?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'purged' })
  });
  console.log("Bookings patch status:", bRes.status, await bRes.text());

  // Update status to 'purged' across all patient_reports
  const prRes = await fetch(`${url}/rest/v1/patient_reports?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'purged' })
  });
  console.log("Patient Reports patch status:", prRes.status, await prRes.text());
}

main();
