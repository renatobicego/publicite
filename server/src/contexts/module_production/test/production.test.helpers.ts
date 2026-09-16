import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { TestingModule } from '@nestjs/testing';
import { Connection, Model, Types } from 'mongoose';

import { createPersonalUser } from '../../../../test/functions_unit_testing/user/create.user';

export interface ProductionTestModels {
  connection: Connection;
  user: Model<any>;
  userRelation: Model<any>;
  group: Model<any>;
  plan: Model<any>;
  subscription: Model<any>;
  production: Model<any>;
  item: Model<any>;
}

export function getProductionTestModels(
  moduleRef: TestingModule,
): ProductionTestModels {
  return {
    connection: moduleRef.get<Connection>(getConnectionToken()),
    user: moduleRef.get(getModelToken('User')),
    userRelation: moduleRef.get(getModelToken('UserRelation')),
    group: moduleRef.get(getModelToken('Group')),
    plan: moduleRef.get(getModelToken('SubscriptionPlan')),
    subscription: moduleRef.get(getModelToken('Subscription')),
    production: moduleRef.get(getModelToken('Production')),
    item: moduleRef.get(getModelToken('ProductionItem')),
  };
}

/** Documento plano por id (tipado laxo para las aserciones de los tests). */
export async function findDoc(model: Model<any>, id: string): Promise<any> {
  return model.findById(id).lean();
}

/** Borra sólo lo que crean los tests de MP en la base descartable. */
export async function cleanProductionTestData(models: ProductionTestModels) {
  const { connection } = models;
  const collections = [
    'productions',
    'productionitems',
    'productiontickets',
    'productionticketpurchases',
    'productionaccessgrants',
    'productionfans',
    'productionreviews',
    'productioncomments',
    'productionreports',
    'productionauditlogs',
  ];
  await Promise.all(
    collections.map((name) =>
      connection.collection(name).deleteMany({}).catch(() => undefined),
    ),
  );
  await Promise.all([
    models.user.deleteMany({}),
    models.userRelation.deleteMany({}),
    models.group.deleteMany({}),
    models.plan.deleteMany({}),
    models.subscription.deleteMany({}),
  ]);
}

let counter = 0;

export async function createTestUser(
  models: ProductionTestModels,
  overrides: { subscriptions?: Types.ObjectId[] } = {},
): Promise<string> {
  counter++;
  const _id = new Types.ObjectId();
  await createPersonalUser(models.user, {
    _id,
    email: `mp-test-${counter}-${_id}@email.com`,
    username: `mp_test_${counter}_${_id}`,
    // Valor del discriminator de UserPerson (no el del enum UserType).
    userType: 'Person',
    subscriptions: overrides.subscriptions ?? [],
  });
  return _id.toString();
}

/**
 * Crea un plan con las dimensiones de MP y lo asigna al usuario como
 * suscripción activa.
 */
export async function givePlanToUser(
  models: ProductionTestModels,
  userId: string,
  plan: {
    personalBlogsCount?: number;
    groupBlogsCount?: number;
    filesPerBlogCount?: number;
    isFree?: boolean;
    isPack?: boolean;
  },
): Promise<void> {
  const planId = new Types.ObjectId();
  const subscriptionId = new Types.ObjectId();
  await models.plan.create({
    _id: planId,
    mpPreapprovalPlanId: `mp-plan-${planId}`,
    isActive: true,
    reason: 'Plan de test MP',
    description: 'Plan de test',
    features: [],
    intervalTime: 30,
    price: plan.isFree ? 0 : 1000,
    isFree: plan.isFree ?? false,
    isPack: plan.isPack ?? false,
    postsLibresCount: 0,
    postsAgendaCount: 0,
    maxContacts: 0,
    personalBlogsCount: plan.personalBlogsCount,
    groupBlogsCount: plan.groupBlogsCount,
    filesPerBlogCount: plan.filesPerBlogCount,
  });
  await models.subscription.create({
    _id: subscriptionId,
    mpPreapprovalId: `mp-sub-${subscriptionId}`,
    payerId: 'TEST',
    status: 'authorized',
    subscriptionPlan: planId,
    startDate: 'test',
    endDate: 'test',
    external_reference: userId,
    timeOfUpdate: 'test',
    nextPaymentDate: 'test',
    paymentMethodId: 'test',
    cardId: 'test',
  });
  await models.user.updateOne(
    { _id: userId },
    { $push: { subscriptions: subscriptionId } },
  );
}

/**
 * Relación activa del visitante con el dueño (agenda de contactos), tal como
 * la usa la visibilidad de Anuncios.
 */
export async function relateUsers(
  models: ProductionTestModels,
  viewerId: string,
  ownerId: string,
  type: 'contacts' | 'friends' | 'topfriends',
): Promise<void> {
  const relationId = new Types.ObjectId();
  await models.userRelation.create({
    _id: relationId,
    userA: new Types.ObjectId(viewerId),
    userB: new Types.ObjectId(ownerId),
    typeRelationA: type,
    typeRelationB: type,
  });
  await models.user.updateOne(
    { _id: viewerId },
    { $push: { activeRelations: relationId } },
  );
}

export async function createTestGroup(
  models: ProductionTestModels,
  roster: { creator: string; admins?: string[]; members?: string[] },
): Promise<string> {
  const _id = new Types.ObjectId();
  await models.group.create({
    _id,
    name: `Grupo ${_id}`,
    alias: `grupo_${_id}`,
    creator: new Types.ObjectId(roster.creator),
    admins: (roster.admins ?? []).map((id) => new Types.ObjectId(id)),
    members: (roster.members ?? []).map((id) => new Types.ObjectId(id)),
  });
  return _id.toString();
}

export const ARTICLE_BLOCKS = [
  { type: 'header', data: JSON.stringify({ text: 'Hola', level: 2 }) },
  { type: 'paragraph', data: JSON.stringify({ text: 'Primer párrafo' }) },
];
