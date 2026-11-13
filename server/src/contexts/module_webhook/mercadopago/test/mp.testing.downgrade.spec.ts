import { MpHandlerEvents } from '../infastructure/adapters/handler/mpHandlerFETCHEvents';
import {
  downgrade_plan_contact,
  downgrade_plan_post,
  mp_friend_group_charge_failed,
  mp_gift_payment,
} from 'src/contexts/module_shared/event-emmiter/events';

/*
Un pago rechazado no tiene que bajarle el plan a quien conserva otra suscripción paga.

Los límites de posts y contactos son acumulativos entre las suscripciones `authorized`
del usuario, así que ante un rechazo sólo corresponde recortar si efectivamente no le
queda ninguna otra activa. La del plan gratuito no cuenta: getActivePaidSubscriptions
la deja afuera.
*/

const USER_ID = '67f9c700a05be75639e0f73e';
const PREAPPROVAL_RECHAZADO = 'b34a3be5f46e45459ba92cea24c2d2d8';

const loggerMock: any = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

function authorizedPaymentRechazado() {
  return {
    id: '99999',
    preapproval_id: PREAPPROVAL_RECHAZADO,
    external_reference: USER_ID,
    status: 'rejected',
    payment: { status: 'rejected' },
    retry_attempt: 1,
    transaction_amount: 12500, // > 50 para que no lo tome como validación de tarjeta
    operation_type: 'recurring_payment',
    reason: 'Publicité Gold',
  };
}

function construirHandler(overrides: {
  activeSubscriptions?: any[];
  changeStatusImpl?: () => Promise<void>;
}) {
  const emmiterMock: any = { emitAsync: jest.fn(async () => [true]) };

  const subscriptionServiceMock: any = {
    changeStatusOfSubscription: jest.fn(
      overrides.changeStatusImpl ?? (async () => undefined),
    ),
    getActivePaidSubscriptions: jest.fn(
      async () => overrides.activeSubscriptions ?? [],
    ),
    verifyIfSubscriptionWasPused: jest.fn(async () => false),
  };

  const invoiceServiceMock: any = { updateInvoice: jest.fn(async () => null) };
  const paymentServiceMock: any = {};
  const errorServiceMock: any = { createNewError: jest.fn() };
  const fetchToMpMock: any = {
    getDataFromMp_fetch: jest.fn(async () => authorizedPaymentRechazado()),
  };
  const notificationServiceMock: any = { sendPaymentNotification: jest.fn() };

  const handler = new MpHandlerEvents(
    loggerMock,
    invoiceServiceMock,
    paymentServiceMock,
    subscriptionServiceMock,
    errorServiceMock,
    fetchToMpMock,
    notificationServiceMock,
    emmiterMock,
  );

  return { handler, emmiterMock, subscriptionServiceMock, invoiceServiceMock };
}

// Eventos de downgrade que efectivamente se emitieron
function eventosDeDowngrade(emmiterMock: any): string[] {
  return emmiterMock.emitAsync.mock.calls
    .map((c: any[]) => c[0])
    .filter((e: string) => e === downgrade_plan_contact || e === downgrade_plan_post);
}

describe('Pago rechazado - downgrade de plan', () => {
  beforeEach(() => jest.clearAllMocks());

  it('NO baja el plan si al usuario le queda otra suscripción activa', async () => {
    const { handler, emmiterMock, subscriptionServiceMock } = construirHandler({
      activeSubscriptions: [{ mpPreapprovalId: 'ddd183af9f364400bf5b84dea3a1d978' }],
    });

    const result = await handler.update_subscription_authorized_payment('99999');

    expect(result).toBe(true);
    // La rechazada sí se pausa
    expect(subscriptionServiceMock.changeStatusOfSubscription).toHaveBeenCalledWith(
      PREAPPROVAL_RECHAZADO,
      'paused',
    );
    // pero no se le toca ni un anuncio ni un contacto
    expect(eventosDeDowngrade(emmiterMock)).toEqual([]);
  });

  it('SÍ baja el plan cuando no le queda ninguna suscripción activa', async () => {
    const { handler, emmiterMock } = construirHandler({ activeSubscriptions: [] });

    await handler.update_subscription_authorized_payment('99999');

    expect(eventosDeDowngrade(emmiterMock)).toEqual([
      downgrade_plan_contact,
      downgrade_plan_post,
    ]);
  });

  it('no se cae si la suscripción del evento no está en nuestra base', async () => {
    const { handler, invoiceServiceMock } = construirHandler({
      activeSubscriptions: [],
      changeStatusImpl: async () => {
        throw new Error(`Subscription with id ${PREAPPROVAL_RECHAZADO} not found.`);
      },
    });

    // Antes esto cortaba el bloque entero y, al propagarse, dejaba a Meli
    // reintentando un evento que nunca iba a poder procesar.
    const result = await handler.update_subscription_authorized_payment('99999');

    expect(result).toBe(true);
    // el resto del procesamiento siguió su curso
    expect(invoiceServiceMock.updateInvoice).toHaveBeenCalled();
  });

  it('no le baja el plan a nadie si el preapproval no es de un usuario (friendGroup, gift)', async () => {
    const { handler, emmiterMock } = construirHandler({ activeSubscriptions: [] });
    (handler as any).fetchToMpAdapter.getDataFromMp_fetch = jest.fn(async () => ({
      ...authorizedPaymentRechazado(),
      external_reference: 'friendGroup:6730000000000000000000aa',
    }));

    await expect(handler.update_subscription_authorized_payment('99999')).resolves.toBe(true);
    expect(eventosDeDowngrade(emmiterMock)).toEqual([]);
    // Le avisa al módulo de Hacete Amigo, que baja el plan a cada miembro
    expect(emmiterMock.emitAsync).toHaveBeenCalledWith(
      mp_friend_group_charge_failed,
      expect.objectContaining({ groupId: '6730000000000000000000aa' }),
    );
  });

  it('ante un error consultando las suscripciones, no baja el plan por las dudas', async () => {
    const { handler, emmiterMock } = construirHandler({});
    (handler as any).subscriptionService.getActivePaidSubscriptions = jest.fn(async () => {
      throw new Error('se cayó la DB');
    });

    await handler.update_subscription_authorized_payment('99999');

    expect(eventosDeDowngrade(emmiterMock)).toEqual([]);
  });
});

/*
Pruebas de la Fase 0 (`mptest:`) y pagos de regalos (`gift:`): el webhook no los
trata como suscripciones de un usuario.
*/
describe('Eventos que no son de un usuario', () => {
  beforeEach(() => jest.clearAllMocks());

  it('un evento de prueba se guarda y no toca facturas, suscripciones ni planes', async () => {
    const { handler, emmiterMock, subscriptionServiceMock, invoiceServiceMock } =
      construirHandler({});
    const save = jest.fn(async () => undefined);
    (handler as any).testEvents = { save };
    (handler as any).fetchToMpAdapter.getDataFromMp_fetch = jest.fn(async () => ({
      ...authorizedPaymentRechazado(),
      external_reference: 'mptest:abc',
    }));

    await expect(handler.update_subscription_authorized_payment('99999')).resolves.toBe(true);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'subscription_authorized_payment', action: 'updated' }),
    );
    expect(invoiceServiceMock.updateInvoice).not.toHaveBeenCalled();
    expect(subscriptionServiceMock.changeStatusOfSubscription).not.toHaveBeenCalled();
    expect(eventosDeDowngrade(emmiterMock)).toEqual([]);
  });

  it('un pago de prueba también se guarda aparte', async () => {
    const { handler } = construirHandler({});
    const save = jest.fn(async () => undefined);
    (handler as any).testEvents = { save };
    (handler as any).mpPaymentService.createPayment = jest.fn();
    (handler as any).fetchToMpAdapter.getDataFromMp_fetch = jest.fn(async () => ({
      id: 123,
      status: 'approved',
      transaction_amount: 100,
      external_reference: 'mptest:xyz',
    }));

    await expect(handler.create_payment('123')).resolves.toBe(true);
    expect(save).toHaveBeenCalledWith(expect.objectContaining({ topic: 'payment' }));
    expect((handler as any).mpPaymentService.createPayment).not.toHaveBeenCalled();
  });

  it('un pago de regalo se lo pasa al módulo de regalos', async () => {
    const { handler, emmiterMock } = construirHandler({});
    (handler as any).mpPaymentService.createPayment = jest.fn();
    const payment = {
      id: 456,
      status: 'approved',
      transaction_amount: 3750,
      external_reference: 'gift:6730000000000000000000bb',
    };
    (handler as any).fetchToMpAdapter.getDataFromMp_fetch = jest.fn(async () => payment);

    await expect(handler.create_payment('456')).resolves.toBe(true);
    expect(emmiterMock.emitAsync).toHaveBeenCalledWith(mp_gift_payment, {
      giftId: '6730000000000000000000bb',
      payment,
    });
    expect((handler as any).mpPaymentService.createPayment).not.toHaveBeenCalled();
  });
});

/*
Un cobro aprobado tiene que reactivar la suscripción que pausamos por un rechazo.
Antes sólo pasaba con retry_attempt > 0: con retry_attempt 0 el usuario quedaba
pausado (sin plan) aunque había pagado.
*/
describe('Pago aprobado - reactivación de una suscripción pausada', () => {
  beforeEach(() => jest.clearAllMocks());

  function pagoAprobado(retry_attempt: number) {
    return {
      ...authorizedPaymentRechazado(),
      status: 'processed',
      payment: { status: 'approved' },
      retry_attempt,
    };
  }

  it('la reactiva aunque retry_attempt sea 0', async () => {
    const { handler, subscriptionServiceMock } = construirHandler({});
    subscriptionServiceMock.verifyIfSubscriptionWasPused = jest.fn(async () => true);
    (handler as any).fetchToMpAdapter.getDataFromMp_fetch = jest.fn(async () => pagoAprobado(0));

    await expect(handler.update_subscription_authorized_payment('99999')).resolves.toBe(true);

    expect(subscriptionServiceMock.changeStatusOfSubscription).toHaveBeenCalledWith(
      PREAPPROVAL_RECHAZADO,
      'authorized',
    );
  });

  it('no toca la suscripción si no estaba pausada', async () => {
    const { handler, subscriptionServiceMock, invoiceServiceMock } = construirHandler({});
    (handler as any).fetchToMpAdapter.getDataFromMp_fetch = jest.fn(async () => pagoAprobado(2));

    await handler.update_subscription_authorized_payment('99999');

    expect(invoiceServiceMock.updateInvoice).toHaveBeenCalled();
    expect(subscriptionServiceMock.changeStatusOfSubscription).not.toHaveBeenCalled();
  });
});
