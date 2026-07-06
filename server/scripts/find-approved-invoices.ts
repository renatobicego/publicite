import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Uso: ts-node scripts/find-approved-invoices.ts <.env-file>
const envFile = process.argv[2] ?? '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

(async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    console.error('No DATABASE_URI en ' + envFile);
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;

  console.log('=== ENV: ' + envFile + ' | DB: ' + db.databaseName + ' ===');

  const totalInvoices = await db.collection('invoices').countDocuments();
  const approved = await db
    .collection('invoices')
    .find({ paymentStatus: 'approved' })
    .sort({ _id: -1 })
    .limit(15)
    .toArray();

  console.log('Total invoices: ' + totalInvoices);
  console.log('Invoices con paymentStatus=approved (hasta 15): ' + approved.length);
  console.log('');

  for (const inv of approved) {
    let userInfo = '<usuario no encontrado>';
    try {
      const user = await db.collection('users').findOne(
        { _id: new mongoose.Types.ObjectId(inv.external_reference) },
        { projection: { email: 1, username: 1, name: 1, lastName: 1 } },
      );
      if (user) {
        userInfo = `${user.email ?? '-'} (${user.username ?? '-'})`;
      }
    } catch {
      userInfo = '<external_reference no es ObjectId: ' + inv.external_reference + '>';
    }
    console.log('---------------------------------------------------');
    console.log('invoice _id (para la URL): ' + inv._id);
    console.log('  paymentStatus      : ' + inv.paymentStatus);
    console.log('  monto              : ' + inv.transactionAmount + ' ' + inv.currencyId);
    console.log('  reason/plan        : ' + inv.reason);
    console.log('  external_reference : ' + inv.external_reference);
    console.log('  -> usuario dueño   : ' + userInfo);
  }

  await mongoose.disconnect();
})();
