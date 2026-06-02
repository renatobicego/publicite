import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.qa') });

(async () => {
  const uri = process.env.DATABASE_URI;
  if (!uri) {
    console.error('No DATABASE_URI');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const user = await db.collection('users').findOne(
    { email: 'cveticmaxi97@gmail.com' },
    {
      projection: {
        _id: 1,
        username: 1,
        email: 1,
        name: 1,
        lastName: 1,
        businessName: 1,
        description: 1,
        contact: 1,
        userType: 1,
      },
    },
  );
  if (!user) {
    console.log('NOT FOUND');
    process.exit(0);
  }
  console.log('USER:', JSON.stringify(user, null, 2));
  if (user.contact) {
    const contact = await db.collection('contacts').findOne({ _id: user.contact });
    console.log('CONTACT:', JSON.stringify(contact, null, 2));
  } else {
    console.log('CONTACT: <none>');
  }
  await mongoose.disconnect();
})();
