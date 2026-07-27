const url = 'https://ylnorywjugrdxyzehvwc.supabase.co';
const key = 'sb_publishable_DS_np7uAgh4hqG48i9RNow_vsVlk220';

async function forcePurge() {
  console.log("=== Force Purging All Bookings & Reports in Supabase ===");

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // 1. Update all bookings status to 'purged'
  const bRes = await fetch(`${url}/rest/v1/bookings?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'purged' })
  });
  console.log("Bookings patch:", bRes.status, await bRes.text());

  // 2. Update all patient_reports status to 'purged'
  const prRes = await fetch(`${url}/rest/v1/patient_reports?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'purged' })
  });
  console.log("Patient Reports patch:", prRes.status, await prRes.text());
}

forcePurge();
