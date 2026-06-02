/* Solo lectura: para cada CLERK_SECRET_KEY (backend y front), consulta el JWKS
   de Clerk y muestra el kid (= id de instancia) al que pertenece la key. */
const fs = require('fs');
const path = require('path');

function readSecret(file) {
  const txt = fs.readFileSync(file, 'utf8');
  const m = txt.match(/^CLERK_SECRET_KEY=(sk_test_[A-Za-z0-9]+)/m);
  return m ? m[1] : null;
}

async function instanceOf(secret) {
  const res = await fetch('https://api.clerk.com/v1/jwks', {
    headers: { Authorization: `Bearer ${secret}` },
  });
  if (!res.ok) return `ERROR ${res.status}: ${await res.text()}`;
  const j = await res.json();
  return (j.keys || []).map((k) => k.kid).join(', ');
}

async function main() {
  const back = readSecret(path.join(__dirname, '..', '.env.qa'));
  const front = readSecret(path.join(__dirname, '..', '..', 'client', '.env.local'));
  console.log('BACKEND (.env.qa) secret -> instancia:', back ? await instanceOf(back) : 'no encontrada');
  console.log('FRONT (.env.local) secret -> instancia:', front ? await instanceOf(front) : 'no encontrada');
  console.log('Son iguales:', back && front ? (back === front) : false);
}
main().catch((e) => { console.error(e); process.exit(1); });
