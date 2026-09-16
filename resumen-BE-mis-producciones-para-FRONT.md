# Mis Producciones — Resumen del backend para el equipo de Frontend

> **Estado:** el backend de las fases 0 a 9 de `plan-mis-producciones-01-BE.md` está terminado y
> probado en la rama **`mis-producciones`** (ya en GitHub).
> Este documento resume qué se hizo y qué necesita saber el front para construir la UI
> (`plan-mis-producciones-02-UI.md`).
>
> El detalle de cada query y mutation (argumentos, campos y ejemplos) está en
> **[`contrato-API-mis-producciones-FRONT.md`](contrato-API-mis-producciones-FRONT.md)**.
> Los criterios de aceptación siguen en `plan-feature-mis-producciones-ACs.md`.

---

## 1. Qué hay en el backend

| Fase | Qué quedó funcionando |
|---|---|
| 0 | Límites de Producciones en los planes, `User.productions[]` e **ID de credencial** del usuario (`SP-XXXX-XXXX`) |
| 1 | Blog con header, estantería y muestrario; árbol de carpetas, archivos (foto-postal, video, escrito, audio) y artículos de Editor.js; cupo de archivos por plan; borrado en cascada |
| 2 | Listado público `/producciones`, buscador y "Producciones destacadas" |
| 3 | Alcance (público / registrados / contactos / amigos / top amigos) con herencia entre carpetas; clave de acceso tipo Zoom |
| 4 | Datos para **CONTROL Consumo** (tokens de IA y archivos usados vs. límite) |
| 5 | **Tickets:** configuración por carpeta/archivo/blog, compra por transferencia, confirmación del admin, factura del 10% y liquidación del 90% |
| 6 | **Blogs de grupo** con roles tomados del grupo (creator, admins, members) |
| 7 | **SeudoBase:** tabla de gestión y cambios masivos de precio, visibilidad y borrado, con auditoría |
| 8 | Fans, reseñas con calificación, comentarios y **reseña obligatoria** tras un ticket pago |
| 9 | **Denuncias**, con ocultamiento automático y revisión del admin |

Código: `server/src/contexts/module_production/production/`. Pruebas: 124 tests de integración y
unitarios del módulo, más 13 de la Fase 0; todos pasan. No se rompió ningún test que antes pasara.

---

## 2. Cómo consumirlo

- **Mismo endpoint GraphQL y mismo header** `Authorization` (token de Clerk vía `getAuthToken()`).
  Mantener la cadena de siempre: `app/server/productionActions.ts` → `services/productionsServices.ts`
  → `graphql/productionQueries.ts` + `types/`.
- **Explorar el schema:** con el server local (`cd server && npm run dev`) la landing de Apollo está
  habilitada (introspección activa) y permite ver y probar todas las operaciones.
- **Nombres para los documentos con variables:**
  - Escalar de fechas: `DateTime`.
  - Alcance: se reutiliza el enum existente **`Visibility_of_the_post`**
    (`public | registered | contacts | friends | topfriends`).
  - Enums nuevos: `ProductionFileType`, `ProductionItemKind`, `ProductionOwnerType`,
    `ProductionShelfCategory`, `ProductionRole`, `ProductionLockReason`, `ProductionModerationStatus`,
    `ProductionTicketPurchaseStatus`, `ProductionPayoutStatus`, `ProductionPriceChangeMode`,
    `ProductionBulkAction`, `ProductionReportReason`, `ProductionReportStatus`, `ProductionModerationAction`.
  - Inputs: `ProductionCreateRequest`, `ProductionUpdateRequest`, `ProductionShelfLinkInput`,
    `ProductionFolderRequest`, `ProductionFolderUpdateRequest`, `ProductionFileRequest`,
    `ProductionFileUpdateRequest`, `ProductionPostcardInput`, `ProductionArticleRequest`,
    `ProductionArticleUpdateRequest`, `ProductionArticleBlockInput`, `ProductionTicketCreateRequest`,
    `ProductionTicketUpdateRequest`, `ProductionTicketPurchaseRequest`, `ProductionTicketPurchaseFilters`,
    `ProductionTicketRejectInput`, `AttachProductionTicketFacturaInput`, `ProductionSeudoBaseFilters`,
    `ProductionBulkPriceInput`, `ProductionBulkVisibilityInput`, `ProductionBulkDeleteInput`,
    `ProductionReviewInput`, `ProductionReviewUpdateInput`, `ProductionCommentInput`,
    `ProductionReportInput`, `ProductionModerationInput`.
- **Las mutations no reciben `author_id`**, a diferencia de Anuncios: el backend toma al usuario
  del token y valida el permiso contra el dueño real del blog.

### Errores: dónde leer el mensaje

Un error de negocio llega con HTTP 200 y `errors[0].message = "Http Exception"`. El texto para
mostrar al usuario y el código viajan en `extensions.originalError`:

```json
{
  "errors": [{
    "message": "Http Exception",
    "extensions": {
      "code": "BAD_REQUEST",
      "originalError": {
        "statusCode": 400,
        "message": { "message": "La clave es incorrecta", "error": "Bad Request", "statusCode": 400 }
      }
    }
  }]
}
```

```ts
// Helper sugerido para las server actions de Producciones
import { ApolloError } from "@apollo/client";

export const getProductionErrorMessage = (error: unknown): string | undefined => {
  if (!(error instanceof ApolloError)) return undefined;
  const original = error.graphQLErrors?.[0]?.extensions?.originalError as any;
  const message =
    typeof original?.message === "string" ? original.message : original?.message?.message;
  // Los errores de validación de los inputs (class-validator) traen un array.
  return Array.isArray(message) ? message.join(". ") : message;
};
```

`handleApolloError` (`utils/functions/errorHandler.ts`) usa el `statusCode` HTTP, que en estos
casos es 200, así que no sirve para mostrar estos mensajes.

---

## 3. Qué construir en cada fase de UI y con qué operaciones

| Fase UI | Operaciones del backend | Notas |
|---|---|---|
| **0 — Audio** | — | ⚠️ Falta agregar audio al FileRouter (`client/src/app/api/uploadthing/core.ts`) y a `useUploadFiles`. El backend ya acepta `fileType: audio`. |
| **1 — Blog** | `createProduction`, `updateProductionById`, `deleteProductionById`, `findProductionById`, `findProductionByUrl`, `getProductionItems`, `getProductionItemById`, `createFolder` / `updateFolder` / `deleteFolder`, `uploadFile` / `updateFile` / `deleteFile`, `createArticle` / `updateArticle` / `deleteArticle`, `getProductionLimits` | El archivo se sube primero a UploadThing y después se registra con su `key`. Artículos: `blocks: [{ type, data }]` con `data` = JSON stringificado (igual que Novedades). Antes, extraer `BlockEditor` (tarea 0 del plan UI). |
| **2 — Navegación** | `findAllProductions(page, limit, searchTerm)`, `findFeaturedProductions(limit)`, `findAllProductionsByOwner(ownerId, ownerType)` | Si "destacadas" viene vacío, no mostrar la sección. En el cartel `/perfiles/:id` usar `findAllProductionsByOwner(userId)`. |
| **3 — Alcance y clave** | `setProductionVisibility`, `setProductionItemVisibility`, `setProductionAccessKey`, `unlockProductionWithKey` | `visibility: null` en un ítem = hereda; mostrar `effectiveVisibility`. La clave requiere login. |
| **4 — Panel de Control** | `findUserById` (campo nuevo `credentialId`), `getProductionConsumption`, `getProductionFans`, `getProductionTickets` | La Pizarra usa `Board.annotations` como hoy. El QR apunta a `/perfiles/:id`. |
| **5 — Tickets** | Staff: `createProductionTicket`, `updateProductionTicket`, `deleteProductionTicket`, `getProductionTickets`, `getProductionTicketSales`, `activateProductionTicketPurchase`, `setProductionPayoutAlias`. Visitante: `getProductionTicketCheckout`, `purchaseProductionTicket`, `getMyProductionTicketPurchases`. Admin: ver §3.1 | El toggle pago/gratuito es `updateProductionTicket(ticketId, { isPaid })`. |
| **6 — Grupos** | `createProduction({ ..., groupId })`, `findAllProductionsByOwner(groupId, Group)` | Sólo el creator del grupo crea el blog. Usar `viewer.role` para las vistas: admin, moderator o viewer. |
| **7 — SeudoBase** | `getProductionSeudoBase`, `bulkUpdateProductionPrices`, `bulkUpdateProductionVisibility`, `bulkDeleteProductionItems`, `getProductionAuditLog` | Mostrar la alerta de confirmación y recién entonces mandar `confirm: true`. |
| **8 — Fans y reseñas** | `becomeProductionFan`, `stopBeingProductionFan`, `getMyFanProductions`, `createProductionReview`, `updateProductionReview`, `deleteProductionReview`, `getProductionReviews`, `getMyPendingProductionReview`, `createProductionComment`, `replyProductionComment`, `updateProductionComment`, `deleteProductionComment`, `getProductionComments` | Ver §4.5 (reseña pendiente). |
| **9 — Denuncias** | `reportProductionContent`. Admin: ver §3.1 | `contentHidden: true` = el contenido se ocultó con esa denuncia. |

### 3.1 Panel admin (rol admin de Clerk)

- **Tickets** (para `admin/invoices`): `getProductionTicketPurchasesAdmin`,
  `confirmProductionTicketPurchase(purchaseId, activate)`, `rejectProductionTicketPurchase`,
  `activateProductionTicketPurchaseAsAdmin`, `attachFacturaToProductionTicketPurchase` (factura del 10%)
  y `markProductionTicketPayoutDone` (90% liquidado). Son operaciones propias, separadas de
  `getAllInvoicesAdmin`: la pantalla puede mostrar las dos listas.
- **Destacadas:** `setProductionFeatured`.
- **Denuncias:** `getProductionReportTargetsAdmin`, `getProductionTargetReportsAdmin`,
  `moderateProductionContent` (`block` / `restore`).

---

## 4. Reglas que la UI tiene que respetar

### 4.1 Permisos: usar `viewer`

Cada `ProductionResponse` trae `viewer { role canViewContent lockReason canEdit canManageAccess
canDelete canManagePayout isFan pendingReviewProductionId }`. Mostrar u ocultar botones con esos
flags, no comparando ids en el cliente.

| `role` | Quién |
|---|---|
| `admin` | Dueño del blog personal o creator del grupo |
| `moderator` | Admin del grupo: hace todo menos borrar el blog y cobrar |
| `viewer` | Miembro del grupo: sólo lee, pero ve todo |
| `visitor` | El resto |

### 4.2 Contenido bloqueado

`ProductionItemResponse.access { canViewContent lockReason ticket }`. Si `canViewContent` es
`false`, `key`, `blocks` y `postcard` vienen en `null`:

| `lockReason` | UI |
|---|---|
| `ticket` | Tarjeta bloqueada + botón de compra con `access.ticket` (precio, duración, pago o gratuito) |
| `accessKey` | Modal de clave (a nivel blog: `viewer.lockReason`) |
| `pendingReview` | Aviso para reseñar `viewer.pendingReviewProductionId` |

Lo que está fuera del alcance o moderado no se lista, así que la UI no tiene que resolverlo.

### 4.3 Límites del plan (Pop-Up de mejora)

Consultar antes, como hace hoy `PostsLimitReached`:
- `getProductionLimits` → `personalBlogsAvailable`, `groupBlogsAvailable`, `filesPerBlogLimit`, `canSellPaidTickets`.
- En el blog (staff): `filesCount` vs. `filesPerBlogLimit`.

Si igual se intenta, el backend responde con estos mensajes (en `originalError.message.message`):
- "Ya tenés tu blog personal. Tu plan permite un único blog personal."
- "Alcanzaste el límite de blogs de grupo de tu plan. Mejorá tu plan para crear más."
- "Alcanzaste el límite de N archivos de este blog según tu plan. Mejorá tu plan o comprá un pack para subir más."
- "Tu plan gratuito sólo permite tickets gratuitos. Mejorá tu plan para cobrar con tickets pagos." (403)
- "Cargá el alias o CBU de cobro del blog antes de crear tickets pagos"

### 4.4 Flujo de compra de un ticket

1. Tarjeta bloqueada → `getProductionTicketCheckout(ticketId)`: archivos incluidos, aviso de
   "sin devoluciones", datos de transferencia y si ya hay una compra abierta (`existingPurchase`).
2. Checkbox obligatorio de "acepto que no hay devoluciones" → `purchaseProductionTicket({ ticketId, acceptNoRefund: true, transferReference })`.
3. Pago: estado `pending` + `paymentInstructions` (con `reference` = id de la compra para indicar en la transferencia).
   Gratuito: queda `active` y el contenido se ve de inmediato.
4. Estados: `pending → confirmed → active → expired` (más `rejected` y `cancelled`).
   "Mis tickets": `getMyProductionTicketPurchases`.

### 4.5 Reseña obligatoria (REV-02)

Después de **usar** un ticket **pago**, el usuario queda obligado a reseñar ese blog. Mientras no lo haga:
- `getMyPendingProductionReview` devuelve el blog → mostrar un aviso persistente (conviene consultarlo al cargar la app).
- No puede ver otros blogs (`lockReason: pendingReview`) ni comprar tickets.
- Al crear la reseña (`createProductionReview`, calificación de 1 a 5) el bloqueo se levanta.

### 4.6 Otros detalles

- **ID del archivo (`fileName`):** es opcional al subir; si no viene se genera (`archivo-1`, `articulo-1`).
  Es único por carpeta y editable.
- **Estantería:** `category` ∈ `movies | books | websites | youtube | games | places`; `link` tiene que ser una URL con protocolo.
- **Muestrario (`showcase`):** sólo ids de archivos o artículos del blog, no de carpetas.
- **Clave:** entre 4 y 128 caracteres. Tras 5 intentos fallidos el usuario queda bloqueado 15 minutos en ese blog.
- **Borrar una carpeta** borra todo su contenido y libera cupo: pedir confirmación.
- **Denuncias:** `reason` ∈ `inappropriate | violence | sexual | spam | copyright | other`.

---

## 5. Cambios en entidades existentes

- **Usuario:** `findUserById` devuelve `credentialId` (ID decorativo para la credencial). Los usuarios
  que no lo tenían lo reciben la primera vez que se consulta.
- **Planes:** `GET /subscriptionplans` suma `personalBlogsCount`, `groupBlogsCount` y `filesPerBlogCount`.
- **Grupos:** el schema tiene `blog`. Para mostrarlo en la página del grupo usar
  `findAllProductionsByOwner(groupId, Group)`. Si se borra el grupo, se borra su blog; si el creator
  cede el grupo, el blog pasa al nuevo creator.

---

## 6. Configuración que hace falta

- **Planes en la base:** cargar `personalBlogsCount`, `groupBlogsCount` y `filesPerBlogCount` en los
  planes pagos. Mientras no estén, todos reciben el cupo gratuito (1 blog personal, 1 de grupo y 10 archivos).
- **Cuenta para las transferencias (server):** `PRODUCTION_TICKETS_TRANSFER_ALIAS`, `_CBU`,
  `_HOLDER` y `_BANK`. Sin eso, `paymentInstructions` llega con esos campos en `null`.
- Otros parámetros opcionales (comisión, umbral de denuncias, intentos de clave): ver §10 del contrato.

---

## 7. Diferencias con el plan original

- **Tickets en `admin/invoices`:** tienen operaciones admin propias en vez de mezclarse con los
  invoices de MercadoPago.
- **Estados de compra:** además de `pending / confirmed / active / expired`, existen `rejected` y `cancelled`.
- **Clave:** exige usuario logueado y limita los intentos fallidos.
- **"Destacadas":** primero las que fija un admin y después las que tienen más fans.
- **Vencimiento de tickets:** se evalúa cada vez que alguien accede; no hay un proceso programado.

---

## 8. Commits de la rama

```
b627b817 docs: contrato de API para el front y estado del backend
e070a307 fase 9 BE - sistema de denuncias con ocultamiento y revisión
8dbc9c09 fase 8 BE - fans, reseñas, comentarios y reseña obligatoria
f2822bbf fase 7 BE - SeudoBase y gestión masiva auditada
27f856ef test: el test de humo no depende de OPENAI_API_KEY
bad9b95e fase 6 BE - blogs de grupo y roles derivados
c5d268f7 fase 5 BE - tickets con cobro por transferencia
49db1afc fase 4 BE - consumo para el panel de control
c2ba4453 fase 3 BE - visibilidad con herencia y acceso por clave
8fdbae51 fase 2 BE - listado público, búsqueda y destacadas
e22cb8cb fase 1 BE - núcleo del blog, árbol y archivos
c44f3f92 fase 0 BE - límites de plan, productions[] e ID de credencial
7a8615c9 fix(user): alinear argumentos posicionales del constructor de User
```
