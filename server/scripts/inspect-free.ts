import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;

  console.log('=== Planes con isFree:true ===');
  const freePlans = await db.collection('subscriptionplans').find({ isFree: true }).toArray();
  for (const p of freePlans) {
    console.log(JSON.stringify({ _id: p._id.toString(), reason: p.reason, isFree: p.isFree, isPack: p.isPack, price: p.price }));
  }

  console.log('\n=== Suscripcion FREE real (66c49508e80296e90ec637d6) ===');
  const freeSub = await db.collection('subscriptions').findOne({ _id: new mongoose.Types.ObjectId('66c49508e80296e90ec637d6') });
  console.log(JSON.stringify(freeSub, null, 2));

  console.log('\n=== Plan al que apunta esa free sub ===');
  if (freeSub?.subscriptionPlan) {
    const plan = await db.collection('subscriptionplans').findOne({ _id: freeSub.subscriptionPlan });
    console.log(JSON.stringify({ _id: plan?._id?.toString(), reason: plan?.reason, isFree: plan?.isFree, isPack: plan?.isPack }));
  }

  await mongoose.disconnect();
})();
