import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;
  const subs = await db.collection('subscriptions').find({}).toArray();
  for (const s of subs) {
    console.log('---');
    console.log('sub _id        :', s._id.toString());
    console.log('mpPreapprovalId:', s.mpPreapprovalId);
    console.log('startDate      :', JSON.stringify(s.startDate));
    console.log('nextPaymentDate:', JSON.stringify(s.nextPaymentDate));
  }
  await mongoose.disconnect();
})();
