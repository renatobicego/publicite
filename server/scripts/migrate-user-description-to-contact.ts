/**
 * Migración one-shot: mueve `users.description` (string legacy)
 * a `contacts.description = { text, visibility: 'public' }`.
 *
 * Uso:
 *   MONGO_URI="mongodb+srv://..." DRY_RUN=true \
 *     npx ts-node scripts/migrate-user-description-to-contact.ts
 *
 * Variables:
 *   MONGO_URI   (obligatoria) — connection string a la base destino.
 *   DRY_RUN     (opcional, default 'true') — si es 'false', escribe.
 *   UNSET_USER  (opcional, default 'false') — si es 'true', además
 *               hace $unset de users.description luego de migrar.
 *               Recomendado: correr primero sin UNSET, validar, y luego
 *               correr una segunda vez con UNSET=true.
 */

import mongoose from 'mongoose';

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: definir MONGO_URI en el entorno.');
    process.exit(1);
  }

  const dryRun = (process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false';
  const unsetUser = (process.env.UNSET_USER ?? 'false').toLowerCase() === 'true';

  console.log(`DRY_RUN=${dryRun} UNSET_USER=${unsetUser}`);
  console.log('Conectando a Mongo...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('No db handle disponible');

  const users = db.collection('users');
  const contacts = db.collection('contacts');

  const filter = {
    description: { $exists: true, $nin: [null, ''] },
    contact: { $exists: true, $ne: null },
  };

  const total = await users.countDocuments(filter);
  console.log(`Users con description legacy a migrar: ${total}`);

  const cursor = users.find(filter, {
    projection: { _id: 1, contact: 1, description: 1 },
  });

  let migrated = 0;
  let skipped = 0;
  let alreadyHadContactDescription = 0;

  for await (const user of cursor) {
    const contactId = user.contact;
    const text = user.description;

    if (!contactId || typeof text !== 'string' || text.length === 0) {
      skipped++;
      continue;
    }

    const contactDoc = await contacts.findOne(
      { _id: contactId },
      { projection: { 'description.text': 1 } },
    );

    if (!contactDoc) {
      console.warn(
        `  [skip] contact no encontrado para user=${user._id} contactId=${contactId}`,
      );
      skipped++;
      continue;
    }

    const existingText = contactDoc?.description?.text;
    if (existingText && existingText.length > 0) {
      alreadyHadContactDescription++;
      continue;
    }

    if (!dryRun) {
      await contacts.updateOne(
        { _id: contactId },
        {
          $set: {
            description: { text, visibility: 'public' },
          },
        },
      );
    }
    migrated++;
  }

  console.log('---');
  console.log(`Migrados:                 ${migrated}`);
  console.log(`Saltados (sin data):      ${skipped}`);
  console.log(`Ya tenían description:    ${alreadyHadContactDescription}`);

  if (unsetUser && !dryRun) {
    console.log('Ejecutando $unset de users.description...');
    const res = await users.updateMany(
      { description: { $exists: true } },
      { $unset: { description: '' } },
    );
    console.log(`$unset matched=${res.matchedCount} modified=${res.modifiedCount}`);
  } else if (unsetUser && dryRun) {
    console.log('UNSET_USER=true pero DRY_RUN=true → no se ejecuta $unset.');
  }

  await mongoose.disconnect();
  console.log('Listo.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
