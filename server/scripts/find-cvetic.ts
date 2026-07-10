import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) { console.error('No DATABASE_URI'); process.exit(1); }
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log('DB:', db.databaseName);

  const users = await db.collection('users').find(
    { email: { $regex: 'cvet', $options: 'i' } },
    { projection: { email: 1, username: 1, name: 1, lastName: 1, subscription: 1, contact: 1 } },
  ).toArray();

  console.log('Usuarios que matchean "cvet":', users.length);
  for (const u of users) {
    console.log('-----------------------------------');
    console.log('  _id          :', u._id.toString());
    console.log('  email        :', u.email);
    console.log('  username     :', u.username);
    console.log('  subscription :', u.subscription ? u.subscription.toString() : '<none>');

    // ¿tiene invoices?
    const invCount = await db.collection('invoices').countDocuments({ external_reference: u._id.toString() });
    console.log('  invoices     :', invCount);
  }

  await mongoose.disconnect();
})();
