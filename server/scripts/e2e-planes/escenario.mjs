/*
Deja las cuentas de prueba en un estado para recorrer la app a mano (ver lib.mjs):

  - Ana y Bruno en un grupo de Hacete Amigo Premium activo, pagado por Bruno.
  - Carla con un regalo de Darío (2 meses de Premium) esperando que lo active.

  node scripts/e2e-planes/escenario.mjs
*/
import { login, gql, logoutAll, closeDb, emailOf } from './lib.mjs';

const OK = 'mock_APRO';
const id = {};
for (const key of ['ana', 'bruno', 'carla', 'dario']) id[key] = (await login(key)).mongoId;

const must = async (key, query, variables) => {
  const r = await gql(key, query, variables);
  if (r.error) throw new Error(`${key}: ${r.error}`);
  return r.data;
};

try {
  // Grupo: si Ana o Bruno ya están en uno vivo, se respeta.
  const anaGroup = (await must('ana', `query { myFriendGroup { group { _id status } } }`)).myFriendGroup.group;
  const brunoGroup = (await must('bruno', `query { myFriendGroup { group { _id status } } }`)).myFriendGroup.group;
  if (anaGroup || brunoGroup) {
    console.log(`Grupo ya existente: ${(anaGroup ?? brunoGroup).status} (no lo toco)`);
  } else {
    const g = (await must('ana', `mutation { createFriendGroup(mpPreapprovalPlanId: "mock_premium") { _id } }`)).createFriendGroup;
    await must('ana', `mutation { inviteToFriendGroup(groupId: "${g._id}", userId: "${id.bruno}") { _id } }`);
    await must('bruno', `mutation { respondFriendGroupInvitation(groupId: "${g._id}", accept: true) { group { _id } } }`);
    const r = (await must('bruno', `mutation($input: PayFriendGroupInput!) { payFriendGroup(input: $input) { status } }`,
      { input: { groupId: g._id, cardTokenId: OK, payerEmail: emailOf('bruno') } })).payFriendGroup;
    console.log(`Grupo de Ana y Bruno: ${r.status} (pagó Bruno)`);
  }

  // Regalo pendiente para Carla.
  const pending = (await must('carla', `query { myPlanGifts { received { status } } }`)).myPlanGifts.received;
  if (pending.some((g) => g.status === 'paid' || g.status === 'active')) {
    console.log('Carla ya tiene un regalo (no lo toco)');
  } else {
    const r = await gql('dario', `mutation($input: BuyPlanGiftInput!) { buyPlanGift(input: $input) { status } }`, {
      input: {
        mpPreapprovalPlanId: 'mock_premium', months: 2, recipientUserId: id.carla,
        cardTokenId: OK, paymentMethodId: 'visa', payerEmail: emailOf('dario'),
      },
    });
    console.log(r.error ? `Regalo para Carla: ${r.error}` : `Regalo de Darío para Carla: ${r.data.buyPlanGift.status}`);
  }
} finally {
  await logoutAll();
  await closeDb();
}
