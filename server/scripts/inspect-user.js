/* Script de solo lectura: inspecciona usuarios en la DB de QA.
   Uso: node scripts/inspect-user.js
   Carga DATABASE_URI desde .env.qa. NO modifica nada. */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.qa') });

const mongoose = require('mongoose');

async function main() {
  const uri = process.env.DATABASE_URI;
  if (!uri) throw new Error('No hay DATABASE_URI en .env.qa');
  await mongoose.connect(uri);
  const db = mongoose.connection.db; // usa la db de la URI (default: "test")
  console.log('DB activa:', db.databaseName);

  const users = db.collection('users');

  const renato = await users
    .find({ $or: [{ name: /renato/i }, { lastName: /renato/i }, { username: /renato/i }] })
    .toArray();
  console.log('\n=== Coincidencias "Renato" (' + renato.length + ') ===');
  console.log(JSON.stringify(renato, null, 2));

  const yo = await users.find({ email: 'cveticmaxi97@gmail.com' }).toArray();
  console.log('\n=== Usuarios con email cveticmaxi97@gmail.com (' + yo.length + ') ===');
  console.log(JSON.stringify(yo, null, 2));

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
