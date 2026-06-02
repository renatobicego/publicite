/* Solo lectura: busca en Clerk el usuario por email y muestra su id (clerkId).
   Uso: node scripts/get-clerk-user.js [email] */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.qa') });

const email = process.argv[2] || 'cveticmaxi97@gmail.com';

async function main() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error('No hay CLERK_SECRET_KEY en .env.qa');
  const url = `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) {
    console.error('Clerk respondió', res.status, await res.text());
    process.exit(1);
  }
  const users = await res.json();
  console.log(`Coincidencias en Clerk para ${email}: ${users.length}`);
  for (const u of users) {
    console.log(JSON.stringify({
      id: u.id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      emails: (u.email_addresses || []).map((e) => e.email_address),
      created_at: u.created_at,
    }, null, 2));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
