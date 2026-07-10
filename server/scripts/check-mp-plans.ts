import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

(async () => {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    console.error('No hay MP_ACCESS_TOKEN en .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.DATABASE_URI!);
  const db = mongoose.connection.db!;
  const plans = await db
    .collection('subscriptionplans')
    .find({ isActive: true })
    .toArray();

  // Detectar mpPreapprovalPlanId duplicados en la DB
  const byMpId = new Map<string, number>();
  for (const p of plans) {
    byMpId.set(p.mpPreapprovalPlanId, (byMpId.get(p.mpPreapprovalPlanId) || 0) + 1);
  }
  console.log('=== DUPLICADOS de mpPreapprovalPlanId (entre planes activos) ===');
  let hayDup = false;
  for (const [id, count] of byMpId) {
    if (count > 1) {
      hayDup = true;
      console.log('  DUPLICADO x' + count + ':', id);
    }
  }
  if (!hayDup) console.log('  (ninguno)');
  console.log('');

  console.log('=== ESTADO EN MERCADOPAGO (preapproval_plan) ===');
  for (const p of plans) {
    const mpId = p.mpPreapprovalPlanId;
    if (mpId === 'Free') {
      console.log(`[FREE ] ${p.reason} -> plan gratis, sin MP`);
      continue;
    }
    try {
      const res = await fetch(
        `https://api.mercadopago.com/preapproval_plan/${mpId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) {
        console.log(
          `[HTTP ${res.status}] ${p.reason} (${p.intervalTime}d, $${p.price}) mpId=${mpId} -> ${await res.text()}`,
        );
        continue;
      }
      const data: any = await res.json();
      console.log(
        `[${String(data.status).toUpperCase()}] ${p.reason} (${p.intervalTime}d, $${p.price}) mpId=${mpId}` +
          ` | mp_reason="${data.reason}" | mp_amount=${data?.auto_recurring?.transaction_amount}` +
          ` ${data?.auto_recurring?.currency_id || ''} cada ${data?.auto_recurring?.frequency} ${data?.auto_recurring?.frequency_type}`,
      );
    } catch (e: any) {
      console.log(`[ERROR] ${p.reason} mpId=${mpId} -> ${e.message}`);
    }
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
