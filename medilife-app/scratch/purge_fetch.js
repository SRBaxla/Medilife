const url = 'https://ylnorywjugrdxyzehvwc.supabase.co';
const key = 'sb_publishable_DS_np7uAgh4hqG48i9RNow_vsVlk220';

async function main() {
  console.log("=== Fetching current bookings & patient_reports ===");

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  };

  const bRes = await fetch(`${url}/rest/v1/bookings?select=*`, { headers });
  const bData = await bRes.json();
  console.log("Current bookings count:", Array.isArray(bData) ? bData.length : bData);
  if (Array.isArray(bData)) {
    console.log("Bookings statuses:", bData.map(b => ({ id: b.id.slice(0, 8), status: b.status, name: b.patient_name })));
  }

  const rRes = await fetch(`${url}/rest/v1/patient_reports?select=*`, { headers });
  const rData = await rRes.json();
  console.log("Current patient_reports count:", Array.isArray(rData) ? rData.length : rData);
  if (Array.isArray(rData)) {
    console.log("Reports statuses:", rData.map(r => ({ id: r.id.slice(0, 8), status: r.status, name: r.patient_name })));
  }
}

main();
