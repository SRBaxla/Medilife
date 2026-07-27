const url = 'https://ylnorywjugrdxyzehvwc.supabase.co';
const key = 'sb_publishable_DS_np7uAgh4hqG48i9RNow_vsVlk220';

async function purgeAllReports() {
  console.log("=== EXECUTING COMPLETE PURGE OF ALL PAST GENERATED REPORTS ===");

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  // Update status to 'purged' for all rows in patient_reports
  const res1 = await fetch(`${url}/rest/v1/patient_reports?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'purged' })
  });
  console.log("PATCH patient_reports status:", res1.status, await res1.text());

  // Also update status to 'purged' for all rows in bookings
  const res2 = await fetch(`${url}/rest/v1/bookings?id=neq.00000000-0000-0000-0000-000000000000`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'purged' })
  });
  console.log("PATCH bookings status:", res2.status, await res2.text());
}

purgeAllReports();
