# Ticket/Comprobante de Pago - Requerimientos Backend

## Objetivo

Implementar un endpoint que genere y devuelva un PDF (ticket/comprobante) de un pago específico realizado por el usuario. El PDF se genera bajo demanda cuando el usuario lo solicita desde la tabla de pagos en la sección de configuración.

---

## Endpoint requerido

### `GET /invoices/:invoiceId/ticket`

**Autenticación:** ClerkAuthGuard (igual que los endpoints existentes)

**Parámetros:**
- `invoiceId` (path param): ID de Mongo del invoice

**Validaciones:**
1. Verificar que el invoice existe
2. Verificar que el invoice pertenece al usuario autenticado (comparar `external_reference` con el `userRequestId`)
3. Si el invoice no tiene `paymentStatus: "approved"`, devolver error 400 (solo se generan tickets de pagos aprobados)

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="ticket-{invoiceId}.pdf"`
- Body: Buffer del PDF generado

**Errores:**
- 404: Invoice no encontrado
- 403: Invoice no pertenece al usuario
- 400: El pago no fue aprobado (no se puede generar ticket)

---

## Datos a incluir en el PDF

El PDF debe contener la siguiente información, obtenida de las colecciones `invoice`, `payment`, `subscription` y `subscriptionPlan`:

### Encabezado
- Logo de Publicité (opcional, si lo tienen como asset)
- Título: "Comprobante de Pago"
- Número de comprobante: `invoice_id`

### Datos del usuario/pagador
- Email del pagador: `payment.payerEmail`
- ID del pagador (MercadoPago): `payment.payerId`

### Datos de la suscripción
- Plan: `invoice.reason` (nombre del plan)
- Período de facturación: derivar del `subscription.startDate` / `subscription.nextPaymentDate`

### Detalle del pago
| Campo | Origen |
|-------|--------|
| Fecha de pago | `invoice.timeOfUpdate` (formateado) |
| Monto | `invoice.transactionAmount` |
| Moneda | `invoice.currencyId` |
| Método de pago | `payment.paymentMethodId` (Visa, Mastercard, etc.) |
| Tipo de pago | `payment.paymentTypeId` (credit_card / debit_card) |
| Estado | `invoice.paymentStatus` → "Aprobado" |
| Detalle de estado | `payment.status_detail` |
| ID de pago MP | `payment.mpPaymentId` |

### Pie del documento
- Fecha de emisión del comprobante (timestamp actual)
- Leyenda: "Este comprobante no tiene valor fiscal. Es un resumen informativo de la transacción."

---

## Implementación sugerida

### Librería para generar PDF
Recomendación: **PDFKit** (`npm install pdfkit`)
- Ligero, no requiere headless browser
- Permite crear PDFs programáticamente con buen control de layout

Alternativa: **@react-pdf/renderer** (si ya lo usan en algún lado) o **puppeteer** (más pesado, no recomendado para producción serverless).

### Estructura de archivos (siguiendo la arquitectura existente)

```
server/src/contexts/module_webhook/mercadopago/
├── application/
│   └── service/
│       └── mp-invoice.service.ts          # Agregar método generateTicket
├── domain/
│   └── service/
│       └── mp-invoice.service.interface.ts # Agregar firma del método
├── infastructure/
│   ├── controllers/
│   │   └── mp-invoice.controller.ts       # NUEVO - REST controller para el PDF
│   └── resolver/
│       └── mp-invoice.resolver.ts         # Alternativa: query GraphQL que devuelve URL
```

### Opción A: REST endpoint (recomendado para descarga directa de archivos)

Crear un nuevo controller REST:

```typescript
// mp-invoice.controller.ts
@Controller('invoices')
export class MpInvoiceController {
  constructor(
    @Inject('InvoiceAdapterInterface')
    private readonly invoiceAdapter: InvoiceAdapterInterface,
  ) {}

  @Get(':invoiceId/ticket')
  @UseGuards(ClerkAuthGuard)
  async getInvoiceTicket(
    @Param('invoiceId') invoiceId: string,
    @Context() context,
    @Res() res: Response,
  ) {
    const userRequestId = context.req.userRequestId;
    const pdfBuffer = await this.invoiceAdapter.generateInvoiceTicket(
      invoiceId, 
      userRequestId
    );
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${invoiceId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
```

### Opción B: Query GraphQL que devuelve el PDF en base64

```typescript
// En mp-invoice.resolver.ts agregar:
@Query(() => String, { nullable: true })
@UseGuards(ClerkAuthGuard)
async getInvoiceTicketPdf(
  @Args('invoiceId', { type: () => String }) invoiceId: string,
  @Context() context: { req: CustomContextRequestInterface },
): Promise<string> {
  const userRequestId = context.req.userRequestId;
  const pdfBuffer = await this.invoiceAdapter.generateInvoiceTicket(
    invoiceId, 
    userRequestId
  );
  return pdfBuffer.toString('base64');
}
```

> **Nota:** La Opción A es más eficiente para archivos binarios. La Opción B es más simple de integrar si quieren mantener todo en GraphQL, pero el base64 incrementa el tamaño ~33%.

---

## Lógica del servicio

```typescript
// En mp-invoice.service.ts
async generateInvoiceTicket(invoiceId: string, userRequestId: string): Promise<Buffer> {
  // 1. Buscar invoice por ID, populando paymentId y subscriptionId
  const invoice = await this.invoiceModel
    .findById(invoiceId)
    .populate('paymentId')
    .populate({
      path: 'subscriptionId',
      populate: { path: 'subscriptionPlan' }
    });

  // 2. Validar que existe
  if (!invoice) throw new NotFoundException('Invoice no encontrado');

  // 3. Validar ownership (external_reference === userRequestId)
  if (invoice.external_reference !== userRequestId) {
    throw new ForbiddenException('No tienes acceso a este comprobante');
  }

  // 4. Validar que está aprobado
  if (invoice.paymentStatus !== 'approved') {
    throw new BadRequestException('Solo se pueden generar tickets de pagos aprobados');
  }

  // 5. Generar PDF
  return this.generatePdf(invoice);
}
```

---

## Consideraciones

1. **Performance:** El PDF se genera on-demand. Si hay preocupación por carga, se puede cachear el PDF generado en un bucket (Firebase Storage) la primera vez y devolver el mismo en requests posteriores.

2. **Formato de fecha:** Parsear `timeOfUpdate` (que viene como ZonedDateTime string) al formato legible `DD/MM/YYYY HH:mm`.

3. **Moneda:** Mostrar el símbolo correspondiente según `currencyId` (ARS → $, USD → US$).

4. **Populados necesarios:** El query actual de `getAllInvoicesByExternalReferenceId` ya popula `paymentId`. Para el ticket necesitan también popular `subscriptionId` con su `subscriptionPlan` anidado para tener el nombre del plan y precio.

5. **Registrar en módulo:** No olvidar agregar el nuevo controller/servicio en `mercadopago.module.ts`.

---

## Contrato para el Frontend

Una vez implementado, desde el FE vamos a:

**Si es REST (Opción A):**
```typescript
// Llamar a: GET {API_URL}/invoices/{invoiceId}/ticket
// Con header Authorization: Bearer {token}
// Descargar el blob como PDF
```

**Si es GraphQL (Opción B):**
```typescript
// Query: getInvoiceTicketPdf(invoiceId: "xxx") → base64 string
// Decodificar y descargar como PDF
```

Necesitamos que nos confirmen cuál opción prefieren para armar la integración del lado del cliente.

---

## Resumen de tareas BE

- [ ] Instalar `pdfkit` (o la lib que prefieran)
- [ ] Crear servicio de generación de PDF con el layout descrito
- [ ] Crear endpoint (REST o GraphQL) con autenticación y validaciones
- [ ] Popular las relaciones necesarias (payment, subscription, subscriptionPlan)
- [ ] Registrar nuevos providers en el módulo de MercadoPago
- [ ] Testear con un invoice aprobado real
