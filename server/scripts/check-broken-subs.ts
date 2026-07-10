import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;
  const subs = await db.collection('subscriptions').find({}).toArray();
  const planIds = new Set(
    (await db.collection('subscriptionplans').find({}, { projection: { _id: 1 } }).toArray()).map((p) =>
      p._id.toString(),
    ),
  );
  let broken = 0;
  for (const s of subs) {
    const pid = s.subscriptionPlan ? s.subscriptionPlan.toString() : null;
    if (!pid || !planIds.has(pid)) {
      broken++;
      let userInfo = '?';
      try {
        const u = await db.collection('users').findOne(
          { _id: new mongoose.Types.ObjectId(s.external_reference) },
          { projection: { email: 1 } },
        );
        userInfo = u ? (u.email as string) : '<sin user>';
      } catch {
        userInfo = '<extref no objectid>';
      }
      console.log(
        'ROTA sub _id:', s._id.toString(),
        '| plan:', pid,
        '| status:', s.status,
        '| user:', userInfo,
      );
    }
  }
  console.log('Total subs:', subs.length, '| con subscriptionPlan roto/nulo:', broken);
  await mongoose.disconnect();
})();
