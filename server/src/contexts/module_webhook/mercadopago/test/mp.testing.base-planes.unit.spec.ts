import {
  activeSubscriptionMatch,
  isPaidPlanSubscription,
  isSubscriptionActive,
} from 'src/contexts/module_shared/subscriptions/active-subscription.match';
import {
  payerOfSubscription,
  resolveExternalReference,
} from 'src/contexts/module_shared/subscriptions/external-reference';
import { subscriptionKindOf } from 'src/contexts/module_shared/subscriptions/subscription.kind';
import { getPlanGrossPubliciteTokens } from 'src/contexts/module_shared/chatbot-tokens/chatbot.tokens.config';
import {
  calculateContactLimitFromUser,
  calculatePostLimitFromUser,
} from 'src/contexts/module_user/user/application/functions/calculatePostLimitAndContactLimit';
import makeReponsePlanFunction from '../application/service/function/makeResponsePlan';

/*
Base común de Hacete Amigo, cambio de plan, packs y regalos (Fase 1 del plan):
suscripción activa con vencimiento, referencias de MP, tokens por plan y límites
que no se rompen con packs que sólo traen lo que suman.
*/

const loggerMock: any = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('Suscripción activa (activeSubscriptionMatch / isSubscriptionActive)', () => {
  const now = new Date('2026-11-13T12:00:00Z');

  it('arma el filtro con el estado y el vencimiento', () => {
    expect(activeSubscriptionMatch(now)).toEqual({
      status: 'authorized',
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    });
  });

  it('una authorized sin vencimiento está activa', () => {
    expect(isSubscriptionActive({ status: 'authorized' }, now)).toBe(true);
  });

  it('una temporal está activa hasta su vencimiento', () => {
    expect(
      isSubscriptionActive({ status: 'authorized', expiresAt: '2026-11-14T00:00:00Z' }, now),
    ).toBe(true);
    expect(
      isSubscriptionActive({ status: 'authorized', expiresAt: '2026-11-13T11:59:59Z' }, now),
    ).toBe(false);
  });

  it('una pausada o cancelada no está activa', () => {
    expect(isSubscriptionActive({ status: 'paused' }, now)).toBe(false);
    expect(isSubscriptionActive({ status: 'cancelled' }, now)).toBe(false);
  });
});

describe('¿Es un plan pago? (isPaidPlanSubscription)', () => {
  it('cuenta un plan pago de MP, compartido o regalado', () => {
    const plan = { isFree: false, isPack: false };
    expect(isPaidPlanSubscription({ subscriptionPlan: plan })).toBe(true);
    expect(isPaidPlanSubscription({ kind: 'friendGroup', subscriptionPlan: plan })).toBe(true);
    expect(isPaidPlanSubscription({ kind: 'gift', subscriptionPlan: plan })).toBe(true);
  });

  it('no cuenta el gratuito, los packs ni el extra temporal de cambio de plan', () => {
    expect(isPaidPlanSubscription({ subscriptionPlan: { isFree: true } })).toBe(false);
    expect(isPaidPlanSubscription({ subscriptionPlan: { isPack: true } })).toBe(false);
    expect(
      isPaidPlanSubscription({ kind: 'carryover', subscriptionPlan: { isFree: false } }),
    ).toBe(false);
  });

  it('sin plan populado no cuenta', () => {
    expect(isPaidPlanSubscription({ subscriptionPlan: '66c49508e80296e90ec637d6' })).toBe(false);
    expect(isPaidPlanSubscription(null)).toBe(false);
  });

  it('un documento sin kind se trata como mp', () => {
    expect(subscriptionKindOf({})).toBe('mp');
    expect(subscriptionKindOf({ kind: 'cualquiera' })).toBe('mp');
  });
});

describe('external_reference de MercadoPago', () => {
  it('reconoce usuario, regalo, Hacete Amigo y pruebas', () => {
    expect(resolveExternalReference('67f9c700a05be75639e0f73e')).toEqual({
      type: 'user',
      userId: '67f9c700a05be75639e0f73e',
    });
    expect(resolveExternalReference('gift:abc')).toEqual({ type: 'gift', id: 'abc' });
    expect(resolveExternalReference('friendGroup:xyz')).toEqual({
      type: 'friendGroup',
      id: 'xyz',
    });
    expect(resolveExternalReference('mptest:123')).toEqual({ type: 'test', id: '123' });
  });

  it('lo que no es un mongoId ni tiene prefijo queda como desconocido', () => {
    expect(resolveExternalReference('usuario@mail.com').type).toBe('unknown');
    expect(resolveExternalReference(undefined).type).toBe('unknown');
  });

  it('quien paga: payerUser y, en las viejas, el external_reference', () => {
    expect(payerOfSubscription({ payerUser: '67f9c700a05be75639e0f73e' })).toBe(
      '67f9c700a05be75639e0f73e',
    );
    expect(payerOfSubscription({ external_reference: '67f9c700a05be75639e0f73f' })).toBe(
      '67f9c700a05be75639e0f73f',
    );
    expect(payerOfSubscription({ external_reference: 'friendGroup:xyz' })).toBeNull();
  });
});

describe('Tokens por plan (tokensCount)', () => {
  const originalMap = process.env.CHATBOT_TOKENS_PLAN_MAP;
  afterEach(() => {
    process.env.CHATBOT_TOKENS_PLAN_MAP = originalMap;
  });

  it('usa tokensCount del plan antes que el mapping de la env', () => {
    process.env.CHATBOT_TOKENS_PLAN_MAP = JSON.stringify({ plan_x: 2000 });
    expect(
      getPlanGrossPubliciteTokens({ mpPreapprovalPlanId: 'plan_x', tokensCount: 5000 }),
    ).toBe(5000);
  });

  it('un pack de tokens da lo que tiene cargado', () => {
    expect(getPlanGrossPubliciteTokens({ isPack: true, tokensCount: 10000 })).toBe(10000);
  });

  it('sin tokensCount sigue usando el mapping y, si no, el default', () => {
    process.env.CHATBOT_TOKENS_PLAN_MAP = JSON.stringify({ plan_x: 2000 });
    expect(getPlanGrossPubliciteTokens({ mpPreapprovalPlanId: 'plan_x' })).toBe(2000);
    expect(getPlanGrossPubliciteTokens({ isPack: true })).toBe(0);
  });

  it('el plan gratuito no da tokens propios aunque tenga tokensCount', () => {
    expect(getPlanGrossPubliciteTokens({ isFree: true, tokensCount: 500 })).toBe(0);
  });
});

describe('Límites con packs que sólo traen lo que suman', () => {
  it('un pack de tokens sin campos de anuncios ni contactos cuenta 0 (antes daba NaN)', () => {
    const user: any = {
      posts: [{ postBehaviourType: 'libre' }],
      activeRelations: [1, 2],
      subscriptions: [
        { subscriptionPlan: { postsLibresCount: 5, postsAgendaCount: 5, maxContacts: 20 } },
        { subscriptionPlan: { isPack: true, tokensCount: 5000 } },
        { subscriptionPlan: null },
      ],
    };

    const posts = calculatePostLimitFromUser(user, loggerMock);
    expect(posts.totalLibrePostLimit).toBe(5);
    expect(posts.totalAgendaPostLimit).toBe(5);
    expect(posts.libreAvailable).toBe(4);

    const contacts = calculateContactLimitFromUser(user, loggerMock);
    expect(contacts.contactLimit).toBe(20);
    expect(contacts.contactAvailable).toBe(18);
  });
});

describe('Historial de suscripciones con el extra temporal', () => {
  it('el extra temporal nunca compite por plan principal y va al final', () => {
    const main = { kind: 'mp', subscriptionPlan: { isFree: false, isPack: false } };
    const free = { subscriptionPlan: { isFree: true, isPack: false } };
    const carryover = { kind: 'carryover', subscriptionPlan: { isFree: false, isPack: false } };

    expect(makeReponsePlanFunction([carryover, free, main])).toEqual([main, carryover]);
    // Con sólo el gratuito + el extra, el principal sigue siendo el gratuito
    expect(makeReponsePlanFunction([carryover, free])).toEqual([free, carryover]);
  });
});
