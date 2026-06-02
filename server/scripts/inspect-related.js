/* Solo lectura: muestra el contact y la subscription de Renato. */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env.qa') });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.DATABASE_URI);
  const db = mongoose.connection.db;
  const { ObjectId } = mongoose.mongo;

  const contact = await db.collection('contacts')
    .findOne({ _id: new ObjectId('69f8c882a8bbeb2f2bc70ad0') });
  console.log('=== contact de Renato ===');
  console.log(JSON.stringify(contact, null, 2));

  const sub = await db.collection('subscriptions')
    .findOne({ _id: new ObjectId('66c49508e80296e90ec637d6') });
  console.log('\n=== subscription referenciada ===');
  console.log(JSON.stringify(sub, null, 2));

  console.log('\n=== colecciones existentes ===');
  const cols = await db.listCollections().toArray();
  console.log(cols.map((c) => c.name).sort().join(', '));

  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
