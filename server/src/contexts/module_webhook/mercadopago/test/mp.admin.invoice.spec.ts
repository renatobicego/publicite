import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { MpInvoiceService } from '../application/service/mp-invoice.service';
import {
  AdminInvoiceFilters,
  AdminInvoicesPage,
} from '../domain/repository/mp-invoice.respository.interface';

const silentLogger: any = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

const invoiceDoc = (overrides: any = {}) => ({
  _id: { toString: () => overrides._id ?? 'invoice-1' },
  external_reference: 'user-1',
  invoice_id: 'INV-001',
  paymentStatus: 'approved',
  status: 'processed',
  transactionAmount: 5000,
  timeOfUpdate: '2026-08-15T10:00:00-03:00[America/Argentina/Buenos_Aires]',
  facturaUrl: null,
  facturaUploadedAt: null,
  facturaUploadedBy: null,
  ...overrides,
});

/** Repositorio falso: acá se testea el service, no las queries de Mongo. */
const makeRepository = (overrides: any = {}) => ({
  getAllInvoicesPaginated: jest.fn(
    async (): Promise<AdminInvoicesPage> => ({
      invoices: [],
      total: 0,
      hasMore: false,
    }),
  ),
  attachFactura: jest.fn(async () => invoiceDoc()),
  getUsersByIds: jest.fn(async () => []),
  getInvoiceByIdForTicket: jest.fn(async () => null),
  saveInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  getInvoicesByExternalReferenceId: jest.fn(),
  ...overrides,
});

const makeService = (repository: any) =>
  new MpInvoiceService(
    silentLogger,
    repository as any,
    {} as any,
    { findApprovedPaymentByReference: jest.fn() } as any,
  );

describe('MpInvoiceService - panel admin', () => {
  describe('getAllInvoicesAdmin', () => {
    it('resuelve nombre y email del dueño de cada ticket', async () => {
      const repository = makeRepository({
        getAllInvoicesPaginated: jest.fn(async () => ({
          invoices: [
            invoiceDoc({ _id: 'i1', external_reference: 'user-1' }),
            invoiceDoc({ _id: 'i2', external_reference: 'user-2' }),
          ],
          total: 2,
          hasMore: false,
        })),
        getUsersByIds: jest.fn(async () => [
          {
            _id: { toString: () => 'user-1' },
            name: 'Juan',
            lastName: 'Pérez',
            username: 'juanp',
            email: 'juan@mail.com',
          },
          {
            _id: { toString: () => 'user-2' },
            name: 'María',
            lastName: 'Gómez',
            username: 'mariag',
            email: 'maria@mail.com',
          },
        ]),
      });

      const result = await makeService(repository).getAllInvoicesAdmin(1, 20);

      expect(result.invoices[0].userName).toBe('Juan Pérez');
      expect(result.invoices[0].userEmail).toBe('juan@mail.com');
      expect(result.invoices[1].userName).toBe('María Gómez');
      expect(result.total).toBe(2);
    });

    it('pide los usuarios una sola vez aunque se repitan entre tickets', async () => {
      const repository = makeRepository({
        getAllInvoicesPaginated: jest.fn(async () => ({
          invoices: [
            invoiceDoc({ _id: 'i1', external_reference: 'user-1' }),
            invoiceDoc({ _id: 'i2', external_reference: 'user-1' }),
          ],
          total: 2,
          hasMore: false,
        })),
      });

      await makeService(repository).getAllInvoicesAdmin(1, 20);

      expect(repository.getUsersByIds).toHaveBeenCalledTimes(1);
      expect(repository.getUsersByIds).toHaveBeenCalledWith(['user-1']);
    });

    it('muestra "-" si el usuario del ticket ya no existe', async () => {
      const repository = makeRepository({
        getAllInvoicesPaginated: jest.fn(async () => ({
          invoices: [invoiceDoc({ external_reference: 'borrado' })],
          total: 1,
          hasMore: false,
        })),
      });

      const result = await makeService(repository).getAllInvoicesAdmin(1, 20);

      expect(result.invoices[0].userName).toBe('-');
      expect(result.invoices[0].userEmail).toBeNull();
    });

    it('normaliza página y límite fuera de rango', async () => {
      const repository = makeRepository();
      const service = makeService(repository);

      await service.getAllInvoicesAdmin(0, 0);
      expect(repository.getAllInvoicesPaginated).toHaveBeenCalledWith(
        1,
        20,
        undefined,
      );

      await service.getAllInvoicesAdmin(3, 5000);
      expect(repository.getAllInvoicesPaginated).toHaveBeenLastCalledWith(
        3,
        100,
        undefined,
      );
    });

    it('pasa los filtros tal cual al repositorio', async () => {
      const repository = makeRepository();
      const filters: AdminInvoiceFilters = {
        paymentStatus: 'approved',
        dateFrom: '2026-08-01',
        hasFactura: false,
      };

      await makeService(repository).getAllInvoicesAdmin(1, 20, filters);

      expect(repository.getAllInvoicesPaginated).toHaveBeenCalledWith(
        1,
        20,
        filters,
      );
    });

    it('serializa la fecha de carga de la factura como ISO', async () => {
      const uploadedAt = new Date('2026-08-18T12:30:00.000Z');
      const repository = makeRepository({
        getAllInvoicesPaginated: jest.fn(async () => ({
          invoices: [
            invoiceDoc({
              facturaUrl: 'https://utfs.io/f/abc',
              facturaUploadedAt: uploadedAt,
              facturaUploadedBy: 'admin-1',
            }),
          ],
          total: 1,
          hasMore: false,
        })),
      });

      const result = await makeService(repository).getAllInvoicesAdmin(1, 20);

      expect(result.invoices[0].facturaUrl).toBe('https://utfs.io/f/abc');
      expect(result.invoices[0].facturaUploadedAt).toBe(
        uploadedAt.toISOString(),
      );
    });
  });

  describe('attachFacturaToInvoice', () => {
    it('rechaza un invoiceId que no es un ObjectId', async () => {
      await expect(
        makeService(makeRepository()).attachFacturaToInvoice(
          'no-es-un-id',
          'https://utfs.io/f/abc',
          'admin-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('guarda la factura y devuelve el ticket con datos de usuario', async () => {
      const repository = makeRepository({
        attachFactura: jest.fn(async () =>
          invoiceDoc({ facturaUrl: 'https://utfs.io/f/abc' }),
        ),
        getUsersByIds: jest.fn(async () => [
          {
            _id: { toString: () => 'user-1' },
            name: 'Juan',
            lastName: 'Pérez',
            email: 'juan@mail.com',
          },
        ]),
      });

      const result = await makeService(repository).attachFacturaToInvoice(
        '68a1b2c3d4e5f60718293a4b',
        'https://utfs.io/f/abc',
        'admin-1',
      );

      expect(repository.attachFactura).toHaveBeenCalledWith(
        '68a1b2c3d4e5f60718293a4b',
        'https://utfs.io/f/abc',
        'admin-1',
      );
      expect(result.facturaUrl).toBe('https://utfs.io/f/abc');
      expect(result.userName).toBe('Juan Pérez');
    });
  });

  describe('generateInvoiceTicket', () => {
    const approvedInvoice = {
      _id: '68a1b2c3d4e5f60718293a4b',
      external_reference: 'user-1',
      paymentStatus: 'approved',
      invoice_id: 'INV-001',
      transactionAmount: 5000,
      currencyId: 'ARS',
      reason: 'Plan X',
      timeOfUpdate: '2026-08-15T10:00:00-03:00[America/Argentina/Buenos_Aires]',
      preapprovalId: 'pre-1',
      paymentId: { payerEmail: 'juan@mail.com', mpPaymentId: '123' },
      subscriptionId: {},
    };

    it('bloquea el comprobante de otro usuario', async () => {
      const repository = makeRepository({
        getInvoiceByIdForTicket: jest.fn(async () => approvedInvoice),
      });

      await expect(
        makeService(repository).generateInvoiceTicket(
          '68a1b2c3d4e5f60718293a4b',
          'otro-usuario',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('deja que un admin descargue el comprobante de cualquiera', async () => {
      const repository = makeRepository({
        getInvoiceByIdForTicket: jest.fn(async () => approvedInvoice),
      });

      const pdf = await makeService(repository).generateInvoiceTicket(
        '68a1b2c3d4e5f60718293a4b',
        'admin-1',
        true,
      );

      expect(Buffer.isBuffer(pdf)).toBe(true);
      expect(pdf.length).toBeGreaterThan(0);
    });
  });
});
