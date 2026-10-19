import { MpHandlerEvents } from '../infastructure/adapters/handler/mpHandlerFETCHEvents';
import {
  downgrade_plan_contact,
  downgrade_plan_post,
} from 'src/contexts/module_shared/event-emmiter/events';

/*
Un pago rechazado no tiene que bajarle el plan a quien conserva otra suscripción paga.

Los límites de posts y contactos son acumulativos entre las suscripciones `authorized`
del usuario, así que ante un rechazo sólo corresponde recortar si efectivamente no le
queda ninguna otra activa. La del plan gratuito no cuenta: es un documento compartido
con external_reference "--", y getActiveSubscriptions filtra por el del usuario.
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
    getActiveSubscriptions: jest.fn(
      async () => overrides.activeSubscriptions ?? [],
    ),
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

  it('ante un error consultando las suscripciones, no baja el plan por las dudas', async () => {
    const { handler, emmiterMock } = construirHandler({});
    (handler as any).subscriptionService.getActiveSubscriptions = jest.fn(async () => {
      throw new Error('se cayó la DB');
    });

    await handler.update_subscription_authorized_payment('99999');

    expect(eventosDeDowngrade(emmiterMock)).toEqual([]);
  });
});
