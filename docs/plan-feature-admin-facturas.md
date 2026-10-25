# Plan Feature: Panel Admin - Gestión de Facturas/Tickets

## Resumen

Página `/admin` donde un usuario con rol `admin` (verificado desde `UserPublicMetadata.role` de Clerk) puede:

1. **Ver todos los tickets/invoices** de todos los usuarios (la misma tabla de `PaymentsTable.tsx` pero con data global y columna extra de usuario).
2. **Cargar y asociar una factura (PDF/imagen)** a cada ticket.

---

## Arquitectura actual (referencia)

| Componente | Detalle |
|------------|---------|
| **Invoices** | Módulo `module_webhook/mercadopago/`. Entidad `Invoice` con campos: paymentId, subscriptionId, status, paymentStatus, external_reference (mongoId del user), timeOfUpdate, invoice_id, transactionAmount, etc. |
| **Query actual** | `getAllInvoicesByExternalReferenceId(limit, page)` — filtra por el `userRequestId` del token (solo ve sus propias invoices). |
| **Controller ticket PDF** | `GET /invoices/:invoiceId/ticket` — genera PDF comprobante, protegido por `ClerkAuthGuard`. Valida que el invoice pertenezca al user. |
| **Auth BE** | `ClerkAuthGuard` verifica el JWT de Clerk. Setea `req.userRequestId` con el mongoId del user. |
| **Rol admin** | Definido en `UserPublicMetadata.role` y `CustomJwtSessionClaims.metadata.role` como `"admin" | "user"`. **No se usa en el BE todavía.** |
| **Frontend** | No existe página `/admin`. |

---

## Backend

### 1. Nuevo Guard: `AdminGuard`

```typescript
// server/src/contexts/module_shared/auth/clerk-auth/admin.guard.ts

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Primero ejecutar la lógica de ClerkAuthGuard (ya seteó req.userRequestId)
    // Luego verificar el claim "role" del JWT de Clerk
    const token = getTokenFromRequest(context);
    const decoded = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });

    // El role viene en publicMetadata que se propaga al JWT via session claims
    const role = decoded?.metadata?.role || decoded?.public_metadata?.role;
    if (role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
```

> **Alternativa:** Crear un decorator `@AdminOnly()` que combine `ClerkAuthGuard` + verificación de role.

---

### 2. Nueva Query GraphQL: `getAllInvoicesAdmin`

```graphql
type Query {
  """Solo admin: devuelve todos los tickets de todos los usuarios, paginados"""
  getAllInvoicesAdmin(
    page: Float!
    limit: Float!
    filters: AdminInvoiceFilters
  ): AdminInvoiceGetAllResponse!
}

input AdminInvoiceFilters {
  userId: String             # Filtrar por usuario específico
  paymentStatus: String      # approved, pending, rejected
  dateFrom: String           # ISO date
  dateTo: String             # ISO date
}

type AdminInvoiceGetAllResponse {
  invoices: [AdminInvoice!]!
  hasMore: Boolean!
  total: Int!
}

type AdminInvoice {
  _id: ID!
  paymentId: Payment
  subscriptionId: Subscription
  status: String!
  paymentStatus: String!
  external_reference: String!
  timeOfUpdate: String!
  invoice_id: String!
  transactionAmount: Float!
  currencyId: String
  reason: String!
  nextRetryDay: String!
  retryAttempts: Int!
  rejectionCode: String

  # Datos del usuario (populated)
  userName: String!           # nombre + apellido del user
  userEmail: String!

  # Factura asociada (nueva feature)
  facturaUrl: String          # URL del archivo subido (null si no tiene)
  facturaUploadedAt: DateTime
}
```

---

### 3. Nueva Mutation: `attachFacturaToInvoice`

```graphql
type Mutation {
  """Solo admin: asocia una factura (URL de archivo subido) a un invoice"""
  attachFacturaToInvoice(input: AttachFacturaInput!): AdminInvoice!
}

input AttachFacturaInput {
  invoiceId: ID!
  facturaUrl: String!   # URL del archivo subido via UploadThing
}
```

---

### 4. Modificación al Schema de Invoice (MongoDB)

Agregar campos opcionales al schema existente de Invoice:

```typescript
// En el schema de Mongoose de Invoice, agregar:
{
  facturaUrl: { type: String, default: null },        // URL del PDF/imagen de factura
  facturaUploadedAt: { type: Date, default: null },   // Fecha de carga
  facturaUploadedBy: { type: String, default: null }, // mongoId del admin que subió
}
```

---

### 5. Nuevo Resolver: `AdminInvoiceResolver`

```typescript
// server/src/contexts/module_webhook/mercadopago/infastructure/resolver/admin-invoice.resolver.ts

@Resolver()
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminInvoiceResolver {

  @Query(() => AdminInvoiceGetAllResponse)
  async getAllInvoicesAdmin(
    @Args('page') page: number,
    @Args('limit') limit: number,
    @Args('filters', { nullable: true }) filters?: AdminInvoiceFilters,
    @Context() context?,
  ): Promise<AdminInvoiceGetAllResponse> {
    // Buscar invoices sin filtrar por external_reference
    // Populate datos del usuario (nombre, email)
    // Aplicar filtros opcionales
  }

  @Mutation(() => AdminInvoice)
  async attachFacturaToInvoice(
    @Args('input') input: AttachFacturaInput,
    @Context() context?,
  ): Promise<AdminInvoice> {
    // Buscar invoice por ID
    // Setear facturaUrl, facturaUploadedAt, facturaUploadedBy
    // Guardar y retornar
  }
}
```

---

### 6. Nuevo método en Repository

```typescript
// Agregar a mp-invoice.repository.interface.ts:
getAllInvoicesPaginated(page: number, limit: number, filters?: any): Promise<{ invoices: any[], total: number, hasMore: boolean }>;
attachFactura(invoiceId: string, facturaUrl: string, adminId: string): Promise<any>;
```

```typescript
// Implementación en mp-invoice.repository.ts:
async getAllInvoicesPaginated(page: number, limit: number, filters?: any) {
  const query: any = {};
  if (filters?.userId) query.external_reference = filters.userId;
  if (filters?.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters?.dateFrom || filters?.dateTo) {
    query.timeOfUpdate = {};
    if (filters.dateFrom) query.timeOfUpdate.$gte = filters.dateFrom;
    if (filters.dateTo) query.timeOfUpdate.$lte = filters.dateTo;
  }

  const total = await this.invoiceModel.countDocuments(query);
  const invoices = await this.invoiceModel
    .find(query)
    .sort({ timeOfUpdate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('paymentId')
    .populate('subscriptionId');

  return { invoices, total, hasMore: page * limit < total };
}

async attachFactura(invoiceId: string, facturaUrl: string, adminId: string) {
  return this.invoiceModel.findByIdAndUpdate(invoiceId, {
    facturaUrl,
    facturaUploadedAt: new Date(),
    facturaUploadedBy: adminId,
  }, { new: true });
}
```

---

### 7. Estructura de archivos BE (nuevos/modificados)

| Archivo | Acción |
|---------|--------|
| `module_shared/auth/clerk-auth/admin.guard.ts` | **Crear** |
| `module_webhook/mercadopago/infastructure/resolver/admin-invoice.resolver.ts` | **Crear** |
| `module_webhook/mercadopago/domain/graphql_models/response/admin-invoice.model.graphql.ts` | **Crear** (types AdminInvoice, AdminInvoiceGetAllResponse) |
| `module_webhook/mercadopago/application/dto/attach-factura.input.ts` | **Crear** |
| `module_webhook/mercadopago/application/dto/admin-invoice-filters.input.ts` | **Crear** |
| `module_webhook/mercadopago/domain/repository/mp-invoice.respository.interface.ts` | **Modificar** (agregar métodos) |
| `module_webhook/mercadopago/infastructure/repository/mp-invoice.repository.ts` | **Modificar** (implementar métodos) |
| Schema de Invoice (Mongoose) | **Modificar** (agregar campos factura) |
| Module de MercadoPago | **Modificar** (registrar resolver + guard) |

---

## Frontend

### 1. Verificación de rol admin

Desde el cliente se puede verificar con Clerk:

```typescript
// Usando useUser() de Clerk
const { user } = useUser();
const isAdmin = user?.publicMetadata?.role === "admin";

// O desde session claims en server components:
const { sessionClaims } = auth();
const isAdmin = sessionClaims?.metadata?.role === "admin";
```

---

### 2. Nueva página: `/admin`

```
client/src/app/(root)/admin/
├── page.tsx                    # Server component: valida admin, redirige si no
├── AdminLayout.tsx             # Layout con sidebar o tabs para futuras secciones admin
├── invoices/
│   ├── AdminInvoicesTable.tsx  # Tabla (basada en PaymentsTable) con todas las invoices
│   ├── AdminInvoiceFilters.tsx # Filtros: usuario, estado, fecha
│   └── AttachFacturaModal.tsx  # Modal para subir/asociar factura a un ticket
└── components/
    └── AdminGuard.tsx          # Client component wrapper que verifica rol
```

---

### 3. `page.tsx` (Server Component)

```typescript
// client/src/app/(root)/admin/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLayout from "./AdminLayout";

export default async function AdminPage() {
  const { sessionClaims } = auth();
  const role = sessionClaims?.metadata?.role;

  if (role !== "admin") {
    redirect("/");
  }

  return <AdminLayout />;
}
```

---

### 4. `AdminInvoicesTable.tsx`

Basado en `PaymentsTable.tsx` pero con:

- **Columna extra**: "Usuario" (nombre + email)
- **Columna extra**: "Factura" (botón subir/ver si ya tiene)
- **Filtros arriba**: por usuario (búsqueda), por estado, por rango de fechas
- **Paginación server-side** (la query trae `total` para calcular pages)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Panel Admin - Tickets                                                         │
│                                                                                │
│  Filtros: [Usuario: ___] [Estado: ▾ Todos] [Desde: __/__] [Hasta: __/__]      │
│                                                                                │
│  ┌────────┬──────────┬────────┬────────┬────────┬───────┬──────────┬────────┐ │
│  │ Fecha  │ Usuario  │ Detalle│ Estado │ Monto  │ Comp. │ Factura  │ Acción │ │
│  ├────────┼──────────┼────────┼────────┼────────┼───────┼──────────┼────────┤ │
│  │ 15/08  │ Juan P.  │ Plan X │Aprobado│ $5000  │  📄   │    -     │[Subir] │ │
│  │ 14/08  │ María G. │ Plan Y │Aprobado│ $3000  │  📄   │   📎    │ [Ver]  │ │
│  │ 13/08  │ Pedro L. │ Plan X │Pending │ $5000  │   -   │    -     │   -    │ │
│  └────────┴──────────┴────────┴────────┴────────┴───────┴──────────┴────────┘ │
│                                                                                │
│                        [ < 1 2 3 ... 10 > ]                                    │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5. `AttachFacturaModal.tsx`

- Se abre al clickear "Subir" en la columna Factura.
- Muestra info del ticket (usuario, monto, fecha, estado).
- Input para subir archivo (PDF o imagen) usando **UploadThing** (ya está integrado en el proyecto).
- Al confirmar, llama a la mutation `attachFacturaToInvoice` con la URL del archivo subido.
- Si ya tiene factura, permite verla o reemplazarla.

```
┌────────────────────────────────────────┐
│  Asociar Factura                       │
│                                        │
│  Ticket: #INV-2025-001                 │
│  Usuario: Juan Pérez (juan@mail.com)   │
│  Monto: $5.000                         │
│  Fecha: 15/08/2026                     │
│                                        │
│  Factura: [Seleccionar archivo...]     │
│           📎 factura-001.pdf           │
│                                        │
│         [Cancelar]  [Guardar]          │
└────────────────────────────────────────┘
```

---

### 6. Services (Frontend)

```typescript
// client/src/services/adminServices.ts
"use server";

export const getAllInvoicesAdmin = async (
  page: number,
  limit: number,
  filters?: AdminInvoiceFilters
): Promise<AdminInvoiceResponse | { error: string }> => {
  // Validar rol admin desde auth()
  // Query GraphQL: getAllInvoicesAdmin
}

export const attachFacturaToInvoice = async (
  invoiceId: string,
  facturaUrl: string
): Promise<AdminInvoice | { error: string }> => {
  // Validar rol admin desde auth()
  // Mutation GraphQL: attachFacturaToInvoice
}
```

```typescript
// client/src/graphql/adminQueries.ts

export const getAllInvoicesAdminQuery = gql`
  query GetAllInvoicesAdmin($page: Float!, $limit: Float!, $filters: AdminInvoiceFilters) {
    getAllInvoicesAdmin(page: $page, limit: $limit, filters: $filters) {
      invoices {
        _id
        transactionAmount
        paymentStatus
        timeOfUpdate
        status
        reason
        retryAttempts
        rejectionCode
        external_reference
        userName
        userEmail
        facturaUrl
        facturaUploadedAt
        paymentId {
          paymentTypeId
          paymentMethodId
          status
        }
      }
      hasMore
      total
    }
  }
`;

export const attachFacturaMutation = gql`
  mutation AttachFacturaToInvoice($input: AttachFacturaInput!) {
    attachFacturaToInvoice(input: $input) {
      _id
      facturaUrl
      facturaUploadedAt
    }
  }
`;
```

---

### 7. Types (Frontend)

```typescript
// client/src/types/adminTypes.ts

export interface AdminInvoice extends Invoice {
  external_reference: string;
  userName: string;
  userEmail: string;
  facturaUrl: string | null;
  facturaUploadedAt: string | null;
}

export interface AdminInvoiceFilters {
  userId?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminInvoiceResponse {
  invoices: AdminInvoice[];
  hasMore: boolean;
  total: number;
}
```

---

### 8. Protección de ruta (middleware)

Opcionalmente, agregar protección a nivel de middleware de Next.js para que `/admin` solo sea accesible si el user tiene rol admin:

```typescript
// En middleware.ts existente (si lo hay), o crear:
if (pathname.startsWith('/admin')) {
  const role = sessionClaims?.metadata?.role;
  if (role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url));
  }
}
```

---

## Resumen de cambios

### Backend
| Archivo | Acción |
|---------|--------|
| `module_shared/auth/clerk-auth/admin.guard.ts` | Crear |
| `mercadopago/infastructure/resolver/admin-invoice.resolver.ts` | Crear |
| `mercadopago/domain/graphql_models/response/admin-invoice.model.graphql.ts` | Crear |
| `mercadopago/application/dto/attach-factura.input.ts` | Crear |
| `mercadopago/application/dto/admin-invoice-filters.input.ts` | Crear |
| `mercadopago/domain/repository/mp-invoice.respository.interface.ts` | Modificar |
| `mercadopago/infastructure/repository/mp-invoice.repository.ts` | Modificar |
| Invoice Mongoose Schema | Modificar (agregar facturaUrl, facturaUploadedAt, facturaUploadedBy) |
| Module MercadoPago | Modificar (registrar nuevo resolver) |

### Frontend
| Archivo | Acción |
|---------|--------|
| `src/app/(root)/admin/page.tsx` | Crear |
| `src/app/(root)/admin/AdminLayout.tsx` | Crear |
| `src/app/(root)/admin/invoices/AdminInvoicesTable.tsx` | Crear |
| `src/app/(root)/admin/invoices/AdminInvoiceFilters.tsx` | Crear |
| `src/app/(root)/admin/invoices/AttachFacturaModal.tsx` | Crear |
| `src/services/adminServices.ts` | Crear |
| `src/graphql/adminQueries.ts` | Crear |
| `src/types/adminTypes.ts` | Crear |
| `middleware.ts` (si existe) | Modificar (proteger /admin) |

---

## Orden de implementación

### Backend (primero)
1. Crear `AdminGuard`
2. Agregar campos factura al schema de Invoice
3. Agregar métodos al repository (getAllPaginated, attachFactura)
4. Crear DTOs (inputs + filters)
5. Crear GraphQL models (AdminInvoice, response)
6. Crear `AdminInvoiceResolver` con query + mutation
7. Registrar en module
8. Tests

### Frontend (después)
1. Crear types
2. Crear graphql queries
3. Crear services
4. Crear page `/admin` con guard de rol
5. Crear `AdminInvoicesTable` (basado en PaymentsTable)
6. Crear filtros
7. Crear `AttachFacturaModal` con UploadThing
8. (Opcional) Proteger en middleware

---

## Notas técnicas

- **Subida de archivos**: Usar UploadThing (ya integrado). El admin sube el PDF/imagen → obtiene URL → se envía la URL en la mutation `attachFacturaToInvoice`.
- **Populate de usuario**: La query admin necesita hacer un lookup/populate del user por `external_reference` para traer nombre y email. Puede ser un aggregate con `$lookup` a la colección `users` o una resolución a nivel de campo en el resolver.
- **Seguridad doble**: Tanto el server component como el resolver GraphQL validan el rol admin. El frontend redirige, el backend rechaza con 403.
- **El claim `role`** se propaga automáticamente en el JWT si está configurado en Clerk (Dashboard → Sessions → Customize session token → agregar `"role": "{{user.public_metadata.role}}"`). Verificar que esté configurado.
- **Escalabilidad**: La página `/admin` queda como layout extensible para futuras funciones admin (gestión de usuarios, reportes, etc.).
