import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;

  // Fechas en el MISMO formato que usan las suscripciones reales de MercadoPago
  // (ISO con offset, SIN el sufijo [America/Buenos_Aires])
  const startDate = '2026-06-29';
  const nextPaymentDate = '2026-07-29T20:01:37.000-03:00';
  const endDate = '2026-07-29T20:01:37.000-03:00';

  const res = await db.collection('subscriptions').updateOne(
    { mpPreapprovalId: 'DEMO-PREAPPROVAL-CVETIC' },
    { $set: { startDate, nextPaymentDate, endDate } },
  );
  console.log('matched:', res.matchedCount, '| modified:', res.modifiedCount);

  const sub = await db.collection('subscriptions').findOne({ mpPreapprovalId: 'DEMO-PREAPPROVAL-CVETIC' });
  console.log('startDate      :', JSON.stringify(sub?.startDate));
  console.log('nextPaymentDate:', JSON.stringify(sub?.nextPaymentDate));
  console.log('endDate        :', JSON.stringify(sub?.endDate));

  await mongoose.disconnect();
})();
