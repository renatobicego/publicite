import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Usa el mismo .env (prod) que los otros scripts del repo
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;
  const plans = await db.collection('subscriptionplans').find({}).toArray();

  console.log('=== ESTADO DE PLANES (subscriptionplans) ===');
  console.log('Total de planes en DB:', plans.length);

  const activos = plans.filter((p) => p.isActive === true);
  console.log('Planes con isActive:true (los que ve el frontend):', activos.length);
  console.log('');

  for (const p of plans) {
    console.log('---');
    console.log('description        :', p.description);
    console.log('reason             :', p.reason);
    console.log('isActive           :', p.isActive);
    console.log('isFree             :', p.isFree);
    console.log('isPack             :', p.isPack);
    console.log('price              :', p.price);
    console.log('intervalTime       :', p.intervalTime);
    console.log('mpPreapprovalPlanId :', p.mpPreapprovalPlanId);
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
