import { MpWebhookAdapter } from '../infastructure/adapters/in/mp-webhook.adapter';
import { MercadopagoController } from '../infastructure/controllers/main.controller.mp/mercadopago.controller';

/*
Regresión del incidente del 15/10/2026: el webhook se disparaba sin await y se le
contestaba OK a Meli al instante. En Firebase la instancia se congela al responder,
así que el procesamiento quedaba trunco y se perdían altas de suscripción ya cobradas
(un cliente pagó Publicité Gold y nunca se le activó el plan).

Lo que se cubre acá es el contrato: NO se le responde a Meli hasta que el evento
terminó de procesarse, y si falló se devuelve error para que lo reintente.
*/

const loggerMock: any = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

// Response de Express, anotando en qué momento se mandó la respuesta
function makeResponseMock() {
  const estado: { status?: number; enviada: boolean } = { enviada: false };
  const res: any = {
    status(code: number) {
      estado.status = code;
      return this;
    },
    send() {
      estado.enviada = true;
      return this;
    },
  };
  return { res, estado };
}

function makeRequestMock(body: any): any {
  return { url: '/webhook/mp?data.id=123', body };
}

describe('Webhook de Mercado Pago - no se responde antes de terminar de procesar', () => {
  const validationsOk: any = { isHashValid: () => true };

  beforeEach(() => jest.clearAllMocks());

  it('espera a que termine el alta de suscripción antes de contestarle a Meli', async () => {
    let altaTerminada = false;

    const handlerMock: any = {
      create_subscription_preapproval: jest.fn(async () => {
        // Simula el trabajo real: fetch a Meli + buscar plan + transacción
        await new Promise((r) => setTimeout(r, 20));
        altaTerminada = true;
        return true;
      }),
    };

    const adapter = new MpWebhookAdapter(handlerMock, validationsOk, loggerMock);
    const controller = new MercadopagoController(adapter, loggerMock);
    const { res, estado } = makeResponseMock();

    await controller.handleWebhookMp(
      {} as any,
      res,
      makeRequestMock({
        data: { id: 'ddd183af9f364400bf5b84dea3a1d978' },
        type: 'subscription_preapproval',
        action: 'created',
      }),
    );

    expect(handlerMock.create_subscription_preapproval).toHaveBeenCalledWith(
      'ddd183af9f364400bf5b84dea3a1d978',
    );
    // El corazón de la regresión: al momento de responder, el alta YA tiene que estar hecha
    expect(altaTerminada).toBe(true);
    expect(estado.enviada).toBe(true);
    expect(estado.status).toBe(200);
  });

  it('devuelve error cuando el procesamiento falla, para que Meli reintente', async () => {
    const handlerMock: any = {
      create_subscription_preapproval: jest.fn(async () => {
        throw new Error('se cayó la DB');
      }),
    };

    const adapter = new MpWebhookAdapter(handlerMock, validationsOk, loggerMock);
    const controller = new MercadopagoController(adapter, loggerMock);
    const { res, estado } = makeResponseMock();

    await controller.handleWebhookMp(
      {} as any,
      res,
      makeRequestMock({
        data: { id: 'abc' },
        type: 'subscription_preapproval',
        action: 'created',
      }),
    );

    expect(estado.status).toBe(500);
  });

  it('confirma con OK los eventos que no procesamos, para que no queden reintentándose', async () => {
    const handlerMock: any = {};

    const adapter = new MpWebhookAdapter(handlerMock, validationsOk, loggerMock);
    const controller = new MercadopagoController(adapter, loggerMock);
    const { res, estado } = makeResponseMock();

    await controller.handleWebhookMp(
      {} as any,
      res,
      makeRequestMock({
        data: { id: 'xyz' },
        type: 'un_tipo_que_no_manejamos',
        action: 'created',
      }),
    );

    expect(estado.status).toBe(200);
  });

  it('rechaza con 401 cuando la firma no es válida', async () => {
    const validationsFail: any = {
      isHashValid: () => {
        const { UnauthorizedException } = require('@nestjs/common');
        throw new UnauthorizedException('Invalid webhook headers');
      },
    };
    const handlerMock: any = { create_payment: jest.fn() };

    const adapter = new MpWebhookAdapter(handlerMock, validationsFail, loggerMock);
    const controller = new MercadopagoController(adapter, loggerMock);
    const { res, estado } = makeResponseMock();

    await controller.handleWebhookMp(
      {} as any,
      res,
      makeRequestMock({
        data: { id: '1' },
        type: 'payment',
        action: 'payment.created',
      }),
    );

    expect(estado.status).toBe(401);
    expect(handlerMock.create_payment).not.toHaveBeenCalled();
  });
});
