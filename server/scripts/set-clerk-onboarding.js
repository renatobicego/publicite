/* Marca onboardingComplete en el publicMetadata del usuario de Clerk,
   replicando lo que hace el front al terminar el onboarding (Person).
   Uso: node scripts/set-clerk-onboarding.js */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.qa') });

const CLERK_ID = 'user_3EYu5jMuZL0VzjTsGk3au3W2bC5';
const MONGO_ID = '6a1f29b563b5417200375834';

async function main() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error('No hay CLERK_SECRET_KEY en .env.qa');

  const url = `https://api.clerk.com/v1/users/${CLERK_ID}/metadata`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      public_metadata: {
        onboardingComplete: true,
        userType: 'Person',
        mongoId: MONGO_ID,
      },
    }),
  });

  if (!res.ok) {
    console.error('Clerk respondió', res.status, await res.text());
    process.exit(1);
  }
  const u = await res.json();
  console.log('✅ publicMetadata actualizado:');
  console.log(JSON.stringify(u.public_metadata, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
