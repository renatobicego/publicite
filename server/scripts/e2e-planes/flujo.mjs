/*
Recorrido completo de regalos y Hacete Amigo con las cuentas de prueba, contra
el server local con MercadoPago simulado (ver lib.mjs).

  1. server/.env.qa con MP_MOCK=true y el server corriendo (npm run dev, :3002)
  2. npx ts-node scripts/seed-test-accounts.ts
  3. node scripts/e2e-planes/flujo.mjs          # recorre y controla cada paso
  4. node scripts/e2e-planes/escenario.mjs      # deja las cuentas para mirarlas

Arranca de cualquier estado: si Ana no tiene grupo, lo arma. Deja los grupos
cancelados y los regalos devueltos.
*/
import {
  login, gql, check, section, assert, summary, logoutAll, db, closeDb, mongoose, emailOf,
} from './lib.mjs';

const { ObjectId } = mongoose.Types;
const OK = 'mock_APRO';
const REJECT = 'mock_OTHE';
const PREMIUM = 'mock_premium';
const GOLD = 'mock_gold';

const id = {};
for (const key of ['ana', 'bruno', 'carla', 'dario']) id[key] = (await login(key)).mongoId;

// ---------------------------------------------------------------- helpers
const GROUP = `_id status isCreator isPayer inviteCode canPay payBlockedReason payerName cancelReason
  members { userId name status isCreator isPayer }
  pricing { memberCount discountPercent planAmount pricePerMember totalAmount }`;
const GIFT = `_id code planReason months amount status giverName recipientName recipientEmail canActivate activatedAt expiresAt`;

const must = async (key, query, variables) => {
  const r = await gql(key, query, variables);
  if (r.error) throw new Error(`error inesperado: ${r.error}`);
  return r.data;
};
const mustFail = async (key, query, variables, pattern) => {
  const r = await gql(key, query, variables);
  assert(r.error, `debía fallar y respondió ${JSON.stringify(r.data)}`);
  assert(!pattern || pattern.test(r.error), `otro error: ${r.error}`);
  return r.error;
};

const myGroup = async (key) =>
  (await must(key, `query { myFriendGroup { group { ${GROUP} } invitations { groupId invitedByName acceptedCount tierIfJoins { members discountPercent pricePerMember } } } }`)).myFriendGroup;

const stamp = () => ObjectId.createFromTime(Math.floor(Date.now() / 1000) - 1);
async function eventsSince(key, since) {
  const d = await db();
  const docs = await d.collection('Notifications')
    .find({ 'backData.userIdTo': id[key], _id: { $gte: since } }).sort({ _id: 1 }).toArray();
  return docs.map((n) => n.event.replace('notification_plan_', ''));
}
async function activeSubs(key) {
  const d = await db();
  const user = await d.collection('users').findOne({ _id: new ObjectId(id[key]) });
  const now = new Date();
  const subs = await d.collection('subscriptions').find({ _id: { $in: user.subscriptions ?? [] } }).toArray();
  return subs
    .filter((s) => s.status === 'authorized' && (!s.expiresAt || new Date(s.expiresAt) > now))
    .map((s) => s.kind ?? 'mp');
}
const limits = async (key) =>
  (await must(key, `query { getPostAndContactLimit { totalLibrePostLimit totalAgendaPostLimit contactLimit } }`)).getPostAndContactLimit;

const buyGift = (key, input) =>
  gql(key, `mutation($input: BuyPlanGiftInput!) { buyPlanGift(input: $input) { giftId code status recipientHasAccount link message } }`, {
    input: { mpPreapprovalPlanId: PREMIUM, months: 2, cardTokenId: OK, paymentMethodId: 'visa', payerEmail: emailOf(key), ...input },
  });

// Si quedó el grupo pagado de escenario.mjs, se cancela: los regalos y el grupo
// arrancan con Ana y Bruno sin plan.
for (const key of ['ana', 'bruno']) {
  const live = (await myGroup(key)).group;
  if (live && live.status !== 'forming') await must(key, `mutation { leaveFriendGroup(groupId: "${live._id}") }`);
}

// ============================================================== REGALOS
section('REGALOS');
let gift1; // Darío le regala a Carla (cuenta)
let gift2; // Ana le regala a un email sin cuenta

await check('Cotización: 2 meses de Premium', async () => {
  const q = (await must('dario', `query { planGiftQuote(mpPreapprovalPlanId: "${PREMIUM}", months: 2) { amount months monthOptions } }`)).planGiftQuote;
  assert(q.amount === 2000, `monto ${q.amount}`);
  return `$${q.amount}, meses posibles ${q.monthOptions.join('/')}`;
});
await check('No deja regalar 4 meses', async () =>
  mustFail('dario', `query { planGiftQuote(mpPreapprovalPlanId: "${PREMIUM}", months: 4) { amount } }`, {}, /meses/));
await check('No deja regalarse a uno mismo', async () =>
  (await buyGift('ana', { recipientUserId: id.ana })).error ?? assert(false, 'lo dejó'));
await check('No deja regalar a quien ya tiene plan (Darío)', async () => {
  const r = await buyGift('ana', { recipientUserId: id.dario });
  assert(r.error && /plan/i.test(r.error), r.error ?? 'lo dejó');
  return r.error;
});
await check('Tarjeta rechazada: no crea el regalo', async () => {
  const r = await buyGift('dario', { recipientUserId: id.carla, cardTokenId: REJECT });
  assert(r.error, 'no falló');
  return r.error;
});
await check('Darío le regala 2 meses de Premium a Carla', async () => {
  const since = stamp();
  const r = await buyGift('dario', { recipientUserId: id.carla });
  assert(!r.error, r.error);
  gift1 = r.data.buyPlanGift;
  assert(gift1.status === 'paid' && gift1.recipientHasAccount, JSON.stringify(gift1));
  const ev = await eventsSince('carla', since);
  assert(ev.includes('gift_received'), `notificaciones de Carla: ${ev}`);
  return `${gift1.message} | Carla recibió: ${ev.join(', ')}`;
});
await check('Carla lo ve en "Mis regalos" y puede activarlo', async () => {
  const mine = (await must('carla', `query { myPlanGifts { received { ${GIFT} } } }`)).myPlanGifts.received;
  const g = mine.find((x) => x._id === gift1.giftId);
  assert(g?.canActivate, JSON.stringify(g));
  return `${g.planReason}, ${g.months} meses, de ${g.giverName}`;
});
await check('Otra cuenta no puede activarlo', async () =>
  mustFail('bruno', `mutation { activatePlanGift(giftId: "${gift1.giftId}") { _id } }`, {}, /No encontramos/));
await check('Carla lo activa: tiene plan hasta dentro de 2 meses', async () => {
  const since = stamp();
  const g = (await must('carla', `mutation { activatePlanGift(giftId: "${gift1.giftId}") { ${GIFT} } }`)).activatePlanGift;
  assert(g.status === 'active', g.status);
  const subs = await activeSubs('carla');
  assert(subs.includes('gift'), `suscripciones activas ${subs}`);
  const ev = await eventsSince('dario', since);
  assert(ev.includes('gift_activated'), `notificaciones de Darío: ${ev}`);
  const l = await limits('carla');
  return `vence ${String(g.expiresAt).slice(0, 10)} | suscripciones: ${subs} | contactos ${l.contactLimit} | a Darío: ${ev}`;
});
await check('Ana regala 1 mes a un email sin cuenta', async () => {
  const r = await buyGift('ana', { recipientEmail: 'eva+clerk_test@example.com', months: 1 });
  assert(!r.error, r.error);
  gift2 = r.data.buyPlanGift;
  assert(gift2.status === 'paid' && !gift2.recipientHasAccount, JSON.stringify(gift2));
  return `link ${gift2.link}`;
});
await check('El link del regalo se ve sin sesión (email tapado)', async () => {
  const r = await gql(null, `query { planGiftByCode(code: "${gift2.code}") { availability reservedForEmail isForViewer giverName } }`);
  assert(!r.error, r.error);
  const v = r.data.planGiftByCode;
  assert(v.availability === 'available' && !v.isForViewer, JSON.stringify(v));
  return `${v.availability}, reservado para ${v.reservedForEmail}, de ${v.giverName}`;
});
await check('Bruno no puede tomar un regalo de otro email', async () =>
  mustFail('bruno', `mutation { claimPlanGift(code: "${gift2.code}") { _id } }`, {}, /otro email/));
await check('Ana no puede cambiar el email a alguien con plan (Carla ya activó)', async () =>
  mustFail('ana', `mutation { updatePlanGiftEmail(giftId: "${gift2.giftId}", email: "${emailOf('carla')}") { _id } }`, {}, /plan/i));
await check('Ana corrige el email a Bruno y Bruno lo toma desde el link', async () => {
  await must('ana', `mutation { updatePlanGiftEmail(giftId: "${gift2.giftId}", email: "${emailOf('bruno')}") { _id } }`);
  const since = stamp();
  const g = (await must('bruno', `mutation { claimPlanGift(code: "${gift2.code}") { ${GIFT} } }`)).claimPlanGift;
  assert(g.canActivate && g.recipientName, JSON.stringify(g));
  const ev = await eventsSince('bruno', since);
  return `queda en la cuenta de ${g.recipientName} | avisos: ${ev}`;
});
await check('Devolución de un regalo sin activar (Ana → Bruno): queda devuelto', async () => {
  await must('ana', `mutation { mpMockRefundGift(giftId: "${gift2.giftId}") }`);
  const given = (await must('ana', `query { myPlanGifts { given { ${GIFT} } } }`)).myPlanGifts.given.find((x) => x._id === gift2.giftId);
  assert(given.status === 'refunded', JSON.stringify(given));
  const received = (await must('bruno', `query { myPlanGifts { received { _id } } }`)).myPlanGifts.received;
  assert(!received.some((x) => x._id === gift2.giftId), 'Bruno lo sigue viendo');
  await mustFail('bruno', `mutation { activatePlanGift(giftId: "${gift2.giftId}") { _id } }`, {}, /todavía no se puede/);
  return 'Ana lo ve "refunded"; a Bruno se le va de la lista y no lo puede activar';
});
await check('Devolución de un regalo activado (Darío → Carla): Carla pierde el plan', async () => {
  await must('dario', `mutation { mpMockRefundGift(giftId: "${gift1.giftId}") }`);
  const subs = await activeSubs('carla');
  assert(!subs.includes('gift'), `sigue con ${subs}`);
  return `suscripciones activas de Carla: [${subs}]`;
});

// ========================================================= HACETE AMIGO
section('HACETE AMIGO — armar el grupo');
let group = (await myGroup('ana')).group;
let code;

await check('Ana arma un grupo Premium e invita a Bruno y a Carla', async () => {
  if (!group) {
    const since = stamp();
    const g = (await must('ana', `mutation { createFriendGroup(mpPreapprovalPlanId: "${PREMIUM}") { _id } }`)).createFriendGroup;
    await must('ana', `mutation { inviteToFriendGroup(groupId: "${g._id}", userId: "${id.bruno}") { _id } }`);
    await must('ana', `mutation { inviteToFriendGroup(groupId: "${g._id}", userId: "${id.carla}") { _id } }`);
    const ev = await eventsSince('bruno', since);
    assert(ev.includes('friend_invited'), `avisos de Bruno: ${ev}`);
    group = (await myGroup('ana')).group;
  }
  assert(group && group.status === 'forming', JSON.stringify(group));
  code = group.inviteCode;
  return `${group.members.map((m) => `${m.name}: ${m.status}`).join(', ')}`;
});
await check('No puede crear un segundo grupo mientras tiene uno', async () =>
  mustFail('ana', `mutation { createFriendGroup(mpPreapprovalPlanId: "${GOLD}") { _id } }`, {}, /grupo/));
await check('Con invitados sin aceptar no se puede pagar (y dice por qué)', async () => {
  assert(!group.canPay && /acepten/.test(group.payBlockedReason), group.payBlockedReason);
  return group.payBlockedReason;
});
await check('Darío (con plan) recibe la invitación, pero al aceptar le pide cancelar su plan', async () => {
  await must('ana', `mutation { inviteToFriendGroup(groupId: "${group._id}", userId: "${id.dario}") { _id } }`);
  const error = await mustFail('dario', `mutation { respondFriendGroupInvitation(groupId: "${group._id}", accept: true) { group { _id } } }`, {}, /plan/i);
  await must('dario', `mutation { respondFriendGroupInvitation(groupId: "${group._id}", accept: false) { group { _id } } }`);
  return `"${error}" (después la rechaza)`;
});
await check('No se puede invitar a alguien que no existe', async () =>
  mustFail('ana', `mutation { inviteToFriendGroup(groupId: "${group._id}", userId: "${'0'.repeat(24)}") { _id } }`, {}, /No encontramos/));
await check('No se puede invitar dos veces a Bruno', async () =>
  mustFail('ana', `mutation { inviteToFriendGroup(groupId: "${group._id}", userId: "${id.bruno}") { _id } }`, {}, /ya está/));
await check('Bruno ve la invitación con su precio si entra', async () => {
  const inv = (await myGroup('bruno')).invitations.find((i) => i.groupId === group._id);
  assert(inv, 'no la ve');
  return `de ${inv.invitedByName}; con él serían ${inv.tierIfJoins.members}: -${inv.tierIfJoins.discountPercent}% → $${inv.tierIfJoins.pricePerMember} c/u`;
});
await check('Carla rechaza: sale del grupo y Ana recibe el aviso', async () => {
  const since = stamp();
  await must('carla', `mutation { respondFriendGroupInvitation(groupId: "${group._id}", accept: false) { group { _id } } }`);
  group = (await myGroup('ana')).group;
  assert(!group.members.some((m) => m.userId === id.carla), 'Carla sigue');
  return `avisos a Ana: ${await eventsSince('ana', since)}`;
});
await check('Bruno acepta: ya se puede pagar y avisa a los dos', async () => {
  const since = stamp();
  await must('bruno', `mutation { respondFriendGroupInvitation(groupId: "${group._id}", accept: true) { group { _id } } }`);
  group = (await myGroup('ana')).group;
  assert(group.canPay, `no se puede pagar: ${group.payBlockedReason}`);
  return `Ana: ${await eventsSince('ana', since)} | Bruno: ${await eventsSince('bruno', since)} | ${group.pricing.memberCount} miembros, -${group.pricing.discountPercent}%, $${group.pricing.pricePerMember} c/u`;
});

section('HACETE AMIGO — link de invitación');
await check('El link se ve sin sesión', async () => {
  const r = await gql(null, `query { friendGroupByInviteCode(code: "${code}") { creatorName acceptedCount availability tierIfJoins { members discountPercent } } }`);
  assert(!r.error, r.error);
  const v = r.data.friendGroupByInviteCode;
  return `de ${v.creatorName}, ${v.acceptedCount} adentro, ${v.availability}; entrando serían ${v.tierIfJoins.members} con -${v.tierIfJoins.discountPercent}%`;
});
await check('Darío (con plan) no puede entrar por el link', async () =>
  mustFail('dario', `mutation { joinFriendGroupByInviteCode(code: "${code}") { _id } }`, {}, /plan/i));
await check('Carla entra por el link; como no publicó nada, se frena el pago', async () => {
  await must('carla', `mutation { joinFriendGroupByInviteCode(code: "${code}") { _id } }`);
  group = (await myGroup('ana')).group;
  assert(group.members.length === 3 && !group.canPay, JSON.stringify(group.members));
  return group.payBlockedReason;
});
await check('Sólo Ana puede cambiar el link o sacar gente', async () => {
  await mustFail('bruno', `mutation { regenerateFriendGroupInviteCode(groupId: "${group._id}") { _id } }`, {}, /Sólo quien armó/);
  await mustFail('bruno', `mutation { removeFriendGroupMember(groupId: "${group._id}", userId: "${id.carla}") { _id } }`, {}, /Sólo quien armó/);
});
await check('Ana cambia el link: el viejo deja de andar', async () => {
  const g = (await must('ana', `mutation { regenerateFriendGroupInviteCode(groupId: "${group._id}") { inviteCode } }`)).regenerateFriendGroupInviteCode;
  assert(g.inviteCode !== code, 'mismo código');
  await mustFail(null, `query { friendGroupByInviteCode(code: "${code}") { availability } }`, {}, /no existe/);
  code = g.inviteCode;
  return `nuevo ${code}`;
});
await check('Ana saca a Carla: vuelve a poder pagarse', async () => {
  await must('ana', `mutation { removeFriendGroupMember(groupId: "${group._id}", userId: "${id.carla}") { _id } }`);
  group = (await myGroup('ana')).group;
  assert(group.canPay && group.members.length === 2, JSON.stringify(group));
});

section('HACETE AMIGO — pago');
await check('Resumen del cobro: 2 × Premium con 15%', async () => {
  const c = (await must('bruno', `query { friendGroupCheckout(groupId: "${group._id}") { memberCount discountPercent planAmount pricePerMember totalAmount } }`)).friendGroupCheckout;
  assert(c.totalAmount === 1700 && c.pricePerMember === 850, JSON.stringify(c));
  return `$${c.planAmount} → $${c.pricePerMember} c/u, total $${c.totalAmount}/mes`;
});
await check('Tarjeta rechazada: el grupo vuelve a armarse, sin cobro', async () => {
  const r = await gql('bruno', `mutation($input: PayFriendGroupInput!) { payFriendGroup(input: $input) { status } }`,
    { input: { groupId: group._id, cardTokenId: REJECT, payerEmail: emailOf('bruno') } });
  assert(r.error, 'no falló');
  group = (await myGroup('ana')).group;
  assert(group.status === 'forming' && !group.isPayer && group.canPay, JSON.stringify(group));
  return `"${r.error}" → sigue ${group.status}`;
});
await check('Bruno paga por los dos: el plan queda activo para ambos', async () => {
  const since = stamp();
  const r = (await must('bruno', `mutation($input: PayFriendGroupInput!) { payFriendGroup(input: $input) { status message } }`,
    { input: { groupId: group._id, cardTokenId: OK, payerEmail: emailOf('bruno') } })).payFriendGroup;
  assert(r.status === 'active', JSON.stringify(r));
  const [a, b] = [await activeSubs('ana'), await activeSubs('bruno')];
  assert(a.includes('friendGroup') && b.includes('friendGroup'), `${a} / ${b}`);
  group = (await myGroup('ana')).group;
  assert(!group.isPayer && group.payerName, JSON.stringify(group));
  const l = await limits('ana');
  return `${r.message} | paga ${group.payerName} | Ana contactos ${l.contactLimit} | avisos Ana: ${await eventsSince('ana', since)}`;
});
await check('Ya pagado, nadie más entra por el link', async () =>
  mustFail('carla', `mutation { joinFriendGroupByInviteCode(code: "${code}") { _id } }`, {}, /cerrado|no existe/));
await check('A Bruno no se le puede regalar un plan (ya tiene)', async () => {
  const r = await buyGift('dario', { recipientUserId: id.bruno });
  assert(r.error && /plan/i.test(r.error), r.error ?? 'lo dejó');
});
await check('Ana no puede contratar un plan propio estando en el grupo', async () =>
  mustFail('ana', `mutation($input: StartSubscriptionCheckoutInput!) { startSubscriptionCheckout(input: $input) { status } }`,
    { input: { mpPreapprovalPlanId: GOLD, cardTokenId: OK, payerEmail: emailOf('ana') } }, /grupo|Amigo/i));
await check('Pero sí un pack (y después lo da de baja)', async () => {
  const r = (await must('ana', `mutation($input: StartSubscriptionCheckoutInput!) { startSubscriptionCheckout(input: $input) { mpPreapprovalId status } }`,
    { input: { mpPreapprovalPlanId: 'mock_pack_posts', cardTokenId: OK, payerEmail: emailOf('ana') } })).startSubscriptionCheckout;
  await must('ana', `mutation { cancelMySubscription(mpPreapprovalId: "${r.mpPreapprovalId}") }`);
  return `pack ${r.status}, después cancelado`;
});

section('HACETE AMIGO — avisos de MercadoPago');
// Ana queda un rato sin el plan Gratis (límite 0): el rechazo le apaga el anuncio.
// Bruno lo conserva (en QA el Gratis permite miles): el suyo sigue activo.
const d0 = await db();
const freeSub = await d0.collection('subscriptions').findOne({ mpPreapprovalId: 'FREE SUBSCRIPTION' });
const activePosts = async (key) =>
  d0.collection('posts').countDocuments({ author: new ObjectId(id[key]), isActive: true });
const anaPostsBefore = await activePosts('ana');
if (freeSub) await d0.collection('users').updateOne({ _id: new ObjectId(id.ana) }, { $pull: { subscriptions: freeSub._id } });
try {
  await check('Cobro rechazado: grupo en pausa; a quien no tiene el Gratis se le apagan los anuncios', async () => {
    const since = stamp();
    await must('bruno', `mutation { mpMockFriendGroupEvent(groupId: "${group._id}", event: "charge_failed") }`);
    group = (await myGroup('ana')).group;
    assert(group.status === 'paymentFailed', group.status);
    const a = await activeSubs('ana');
    assert(!a.includes('friendGroup'), `Ana sigue con ${a}`);
    assert(anaPostsBefore > 0 && (await activePosts('ana')) === 0, `Ana tiene ${await activePosts('ana')} activos`);
    assert((await activePosts('bruno')) > 0, 'a Bruno (con Gratis) se le apagó el anuncio');
    return `Ana: ${anaPostsBefore} → 0 activos; Bruno sigue | avisos Ana: ${await eventsSince('ana', since)}`;
  });
  await check('Cobro recuperado: vuelve el plan y se reactivan los anuncios apagados', async () => {
    const since = stamp();
    await must('ana', `mutation { mpMockFriendGroupEvent(groupId: "${group._id}", event: "charge_recovered") }`);
    group = (await myGroup('ana')).group;
    assert(group.status === 'active', group.status);
    assert((await activeSubs('ana')).includes('friendGroup'), 'Ana sin plan');
    assert((await activePosts('ana')) === anaPostsBefore, `Ana tiene ${await activePosts('ana')} activos`);
    return `Ana vuelve a ${anaPostsBefore} activos | avisos Ana: ${await eventsSince('ana', since)}`;
  });
} finally {
  if (freeSub) await d0.collection('users').updateOne({ _id: new ObjectId(id.ana) }, { $addToSet: { subscriptions: freeSub._id } });
}
await check('Ana se baja: se cancela el débito y el grupo para todos', async () => {
  const since = stamp();
  await must('ana', `mutation { leaveFriendGroup(groupId: "${group._id}") }`);
  const [a, b] = [await activeSubs('ana'), await activeSubs('bruno')];
  assert(!a.includes('friendGroup') && !b.includes('friendGroup'), `${a} / ${b}`);
  assert((await myGroup('bruno')).group === null, 'Bruno sigue viendo el grupo');
  const d = await db();
  const saved = await d.collection('friendgroups').findOne({ _id: new ObjectId(group._id) });
  return `${saved.status}: "${saved.cancelReason}" | avisos Bruno: ${await eventsSince('bruno', since)}`;
});

section('HACETE AMIGO — otros finales');
async function paidGroup(plan) {
  const g = (await must('ana', `mutation { createFriendGroup(mpPreapprovalPlanId: "${plan}") { _id inviteCode } }`)).createFriendGroup;
  await must('bruno', `mutation { joinFriendGroupByInviteCode(code: "${g.inviteCode}") { _id } }`);
  const r = (await must('ana', `mutation($input: PayFriendGroupInput!) { payFriendGroup(input: $input) { status } }`,
    { input: { groupId: g._id, cardTokenId: OK, payerEmail: emailOf('ana') } })).payFriendGroup;
  assert(r.status === 'active', r.status);
  return g._id;
}
await check('Débito cancelado desde MercadoPago: se cancela el grupo', async () => {
  const gid = await paidGroup(GOLD);
  await must('ana', `mutation { mpMockFriendGroupEvent(groupId: "${gid}", event: "cancelled_in_mp") }`);
  assert((await myGroup('ana')).group === null, 'sigue vivo');
  assert(!(await activeSubs('bruno')).includes('friendGroup'), 'Bruno sigue con plan');
  return 'grupo Gold cancelado, sin plan para los dos';
});
await check('Cobro rechazado y pasan 10 días sin pagar: se cancela solo', async () => {
  const gid = await paidGroup(PREMIUM);
  await must('ana', `mutation { mpMockFriendGroupEvent(groupId: "${gid}", event: "charge_failed") }`);
  await must('ana', `mutation { mpMockFriendGroupEvent(groupId: "${gid}", event: "payment_failed_expired") }`);
  assert((await myGroup('ana')).group === null, 'sigue vivo');
  const d = await db();
  const saved = await d.collection('friendgroups').findOne({ _id: new ObjectId(gid) });
  assert(saved.status === 'cancelled', saved.status);
  return `"${saved.cancelReason}"`;
});
await check('Quien armó el grupo lo cierra antes de pagar', async () => {
  const g = (await must('ana', `mutation { createFriendGroup(mpPreapprovalPlanId: "${PREMIUM}") { _id } }`)).createFriendGroup;
  await must('ana', `mutation { inviteToFriendGroup(groupId: "${g._id}", userId: "${id.carla}") { _id } }`);
  await must('ana', `mutation { leaveFriendGroup(groupId: "${g._id}") }`);
  assert((await myGroup('carla')).invitations.length === 0, 'a Carla le sigue la invitación');
  return 'cerrado; a Carla se le fue la invitación';
});

const failed = summary();
await logoutAll();
await closeDb();
process.exit(failed ? 1 : 0);
