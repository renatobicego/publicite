# API Mis Producciones — Guía de integración para el front

> Backend de las **fases 0 a 9** de `plan-mis-producciones-01-BE.md`, en la rama `mis-producciones`.
> Este contrato sale del schema GraphQL que generan los resolvers del módulo
> `server/src/contexts/module_production/production/`.
>
> Endpoint GraphQL: el mismo de siempre. Auth: header de Clerk (`Authorization`), igual que el resto.
> Todos los tipos llevan el prefijo `Production*`.

---

## 1. Resumen para arrancar

| Necesito… | Usar | Auth |
|---|---|---|
| Crear un blog (personal o de grupo) | `createProduction` | login |
| Ver un blog / por URL | `findProductionById` / `findProductionByUrl` | opcional |
| Editar header, estantería o muestrario | `updateProductionById` | staff |
| Borrar el blog | `deleteProductionById` | admin del blog |
| Grilla de un nivel del árbol | `getProductionItems` | opcional |
| Detalle de un archivo o artículo | `getProductionItemById` | opcional |
| Carpetas | `createFolder` / `updateFolder` / `deleteFolder` | staff |
| Archivos (ya subidos a UploadThing) | `uploadFile` / `updateFile` / `deleteFile` | staff |
| Artículos (Editor.js) | `createArticle` / `updateArticle` / `deleteArticle` | staff |
| Listado `/producciones` y buscador | `findAllProductions` | opcional |
| "Producciones destacadas" del home | `findFeaturedProductions` | opcional |
| Blogs de un cartel (`/perfiles/:id`) o grupo | `findAllProductionsByOwner` | opcional |
| Límites del plan | `getProductionLimits` | login |
| CONTROL Consumo | `getProductionConsumption` | login |
| Alcance del blog / de un ítem | `setProductionVisibility` / `setProductionItemVisibility` | staff |
| Clave tipo Zoom | `setProductionAccessKey` / `unlockProductionWithKey` | staff / login |
| Page de Ticket | `createProductionTicket` / `updateProductionTicket` / `deleteProductionTicket` / `getProductionTickets` | staff |
| Alias/CBU de cobro | `setProductionPayoutAlias` | admin del blog |
| Comprar un ticket | `getProductionTicketCheckout` → `purchaseProductionTicket` | login |
| Mis tickets | `getMyProductionTicketPurchases` | login |
| Ventas del blog / habilitar compra confirmada | `getProductionTicketSales` / `activateProductionTicketPurchase` | staff |
| SeudoBase | `getProductionSeudoBase` + `bulkUpdateProductionPrices` / `bulkUpdateProductionVisibility` / `bulkDeleteProductionItems` / `getProductionAuditLog` | staff |
| Fans | `becomeProductionFan` / `stopBeingProductionFan` / `getProductionFans` / `getMyFanProductions` | login (listado: staff) |
| Reseñas | `createProductionReview` / `updateProductionReview` / `deleteProductionReview` / `getProductionReviews` | login (listado: opcional) |
| Aviso de reseña pendiente | `getMyPendingProductionReview` | login |
| Comentarios | `createProductionComment` / `replyProductionComment` / `updateProductionComment` / `deleteProductionComment` / `getProductionComments` | login (listado: opcional) |
| Denunciar | `reportProductionContent` | login |
| Panel admin | ver §9 | `AdminGuard` |

**Auth.** "opcional" = sin token se ve sólo lo público; con token se amplía.
"staff" = admin o moderador del blog. Las mutations **no reciben `author_id`**:
el usuario sale del token y el permiso se valida contra el dueño guardado.

---

## 2. Conceptos

### 2.1 Roles (`ProductionRole`)

| Rol | Quién | Puede |
|---|---|---|
| `admin` | Dueño del blog personal, o `creator` del grupo | Todo: editar, tickets, clave, borrar el blog, cobrar (alias/CBU) |
| `moderator` | `admins[]` del grupo | Todo menos borrar el blog y cobrar |
| `viewer` | `members[]` del grupo | Sólo lectura, pero ve **todo** el contenido del grupo (sin alcance, clave ni ticket) |
| `visitor` | El resto | Lo que habilitan alcance, clave y tickets |

Cada `ProductionResponse` trae `viewer` con `role`, `canEdit`, `canManageAccess`,
`canDelete`, `canManagePayout`, `canViewContent`, `lockReason`, `isFan` y
`pendingReviewProductionId`. **Usar estos flags para mostrar u ocultar controles.**

### 2.2 Árbol del blog

`Production` → ítems (`ProductionItemResponse`) con `kind`:

- `folder`: carpeta o subcarpeta (`parent` = carpeta padre; `null` = raíz).
- `file`: `fileType` (`photo` | `video` | `writing` | `audio`), `key` de UploadThing,
  `fileName` (el "Nº", editable y único por carpeta) y `postcard` (dorso de la postal).
- `article`: `blocks` de Editor.js; cada bloque es `{ type, data }` con `data` = JSON stringificado
  (mismo formato que Novedades).

`getProductionItems(productionId, parentId?)` devuelve la grilla de un nivel:
carpetas primero, `breadcrumb` desde la raíz y el `parent` actual.

### 2.3 Acceso: por qué algo no se ve

Se evalúa en este orden:

1. **Moderación:** lo `hidden` (oculto por denuncias) o `blocked` no aparece para visitantes. El staff lo ve con `moderationStatus`.
2. **Reseña pendiente** (§6.3): bloquea entrar a otros blogs.
3. **Clave:** si `hasAccessKey`, el alcance no se evalúa; hace falta la clave.
4. **Alcance** (`visibility`: `public` | `registered` | `contacts` | `friends` | `topfriends`):
   lo que queda fuera **no se lista**. Los ítems heredan de su carpeta (`visibility: null`)
   y `effectiveVisibility` dice cuál aplica.
5. **Ticket:** el ítem **se lista** pero sin contenido hasta tener un ticket activo.

Cuando el contenido está bloqueado, `key`, `blocks` y `postcard` vienen en `null` y
`access.lockReason` explica el motivo:

| `lockReason` | Qué mostrar |
|---|---|
| `accessKey` | Modal para ingresar la clave |
| `ticket` | Botón de compra con `access.ticket` (precio, duración) |
| `pendingReview` | Aviso para reseñar `pendingReviewProductionId` |
| `visibility` / `moderation` | (no llegan al front: esos ítems no se listan) |

---

## 3. Blog

### Crear

```graphql
mutation {
  createProduction(productionRequest: {
    title: "Mi blog"              # obligatorio
    description: "Opcional"
    headerPhotoKey: "key-uploadthing"
    welcomeText: "Bienvenidos"
    welcomeVideoKey: "keyvideo"
    visibility: public            # default public
    shelf: [{ category: books, title: "Rayuela", link: "https://..." }]
    groupId: "..."                # sólo para el blog de un grupo (lo crea el creator)
  }) { _id }
}
```

- `url` se genera sola (`mi-blog-a1b2c3`) y no cambia al editar el título.
- Estantería: `category` ∈ `movies | books | websites | youtube | games | places`.

**Errores de límite (PLN-04):** "Ya tenés tu blog personal. Tu plan permite un único blog personal."
/ "Alcanzaste el límite de blogs de grupo de tu plan. Mejorá tu plan para crear más."
→ mostrar el Pop-Up de mejora (patrón `PostsLimitReached`).

### Editar

`updateProductionById(productionId, productionUpdate)`: `title`, `description`,
`headerPhotoKey`, `welcomeText`, `welcomeVideoKey`, `shelf` (reemplaza la lista),
`showcase` (ids de archivos/artículos del blog, **no carpetas**; máx. 50).

### Campos útiles de `ProductionResponse`

`ownerInfo` (nombre/usuario o nombre/alias del grupo + foto), `filesCount`,
`filesPerBlogLimit` (sólo staff), `fansCount`, `rating`, `reviewsCount`, `isFeatured`,
`hasAccessKey`, `aliasCbu` (sólo admin del blog), `moderationStatus` (sólo staff).

---

## 4. Archivos y artículos

El archivo se sube **primero a UploadThing** y después se registra con su `key`:

```graphql
mutation {
  uploadFile(fileRequest: {
    productionId: "..."
    parentId: "..."          # carpeta; vacío = raíz
    fileType: photo           # photo | video | writing | audio
    key: "key-uploadthing"
    fileName: "FOTO-01"       # opcional; si no viene: archivo-1, archivo-2...
    name: "Atardecer"         # título visible; default = fileName
    postcard: { latitude: -34.6, longitude: -58.4, authorship: "Ana",
                dedication: "Para vos", description: "¿Qué sentiste este día?" }
  }) { _id fileName key access { canViewContent } }
}
```

- **Cupo (PLN-05, SB-04):** archivos + artículos por blog, según el plan del **creator** del blog.
  Error: "Alcanzaste el límite de N archivos de este blog según tu plan. Mejorá tu plan o comprá un pack para subir más." → Pop-Up de mejora.
- Borrar libera cupo. Borrar una carpeta borra todo su contenido.
- `fileName` repetido en la misma carpeta → "Ya existe un elemento con el ID "X" en esta carpeta".
- Artículo: `createArticle(articleRequest: { productionId, parentId, title, fileName, blocks: [{ type, data }] })`.
  Las imágenes de los bloques se suben a UploadThing desde el editor, igual que en Novedades.

> ⚠️ **Audio:** el FileRouter de UploadThing (`client/src/app/api/uploadthing/core.ts`) todavía
> no acepta audio (RNF-04). Es un cambio del cliente.

---

## 5. Alcance y clave

- `setProductionVisibility(productionId, visibility)`: alcance por defecto del blog.
- `setProductionItemVisibility(itemId, visibility)`: alcance propio; **sin `visibility` vuelve a heredar**.
- `setProductionAccessKey(productionId, accessKey)`: entre 4 y 128 caracteres; sin `accessKey` la quita.
  Cambiarla invalida los accesos anteriores. Nunca se devuelve la clave ni su hash.
- `unlockProductionWithKey(productionId, accessKey)`: **requiere login**. El acceso queda
  guardado para ese usuario. Errores: "La clave es incorrecta" y, después de 5 intentos
  fallidos, "Demasiados intentos. Probá de nuevo en 15 minutos." (valores configurables).
- Las lecturas también aceptan `accessKey` como argumento (útil si el usuario llega con la clave en un link).
- En el cartel (`findAllProductionsByOwner`) los blogs con clave se listan sin contenido
  (`hasAccessKey: true`); en el listado global y en destacadas no aparecen.

---

## 6. Tickets (Page de Ticket y compra por transferencia)

### 6.1 Configuración (staff)

```graphql
mutation {
  createProductionTicket(ticketRequest: {
    productionId: "..."
    targetId: "..."        # carpeta o archivo; vacío = todo el blog
    isPaid: true            # toggle pago/gratuito
    price: 1500             # obligatorio si es pago
    durationHours: 48       # mínimo 24...
    untilClose: false       # ...o true = hasta el cierre del blog
  }) { _id filesCount stats { purchases active revenue } }
}
```

- Un ticket por destino; los hijos lo heredan salvo que tengan uno propio.
- `updateProductionTicket(ticketId, { isPaid: false })` = el toggle que cambia toda la carpeta.
- **Tickets pagos:** requieren plan pago del creator (si no: "Tu plan gratuito sólo permite tickets
  gratuitos. Mejorá tu plan para cobrar con tickets pagos.") **y** alias/CBU cargado con
  `setProductionPayoutAlias` (alias de 6 a 20 caracteres o CBU/CVU de 22 dígitos).

### 6.2 Compra

1. `getProductionTicketCheckout(ticketId)`: `ticket.filesCount`, `requiresNoRefundAcceptance`,
   `noRefundWarning`, `paymentInstructions` (alias/CBU de Soonpublicité y monto) y
   `existingPurchase` si ya tiene una abierta.
2. `purchaseProductionTicket(purchaseRequest: { ticketId, acceptNoRefund: true, transferReference })`.
   - Pago: queda `pending` y trae `paymentInstructions.reference` (el id de la compra) para indicar en la transferencia.
   - Gratuito: queda `active` en el momento.

Estados (`ProductionTicketPurchaseStatus`):

```
pending ──(admin confirma)──► confirmed ──(admin o staff habilita)──► active ──(vence)──► expired
   │                              │
   └──(admin rechaza)─────────────┴──► rejected        (blog cerrado antes de confirmar) ► cancelled
```

- El vencimiento se evalúa en cada lectura: un acceso vencido deja de habilitar sin
  esperar ningún proceso.
- `getMyProductionTicketPurchases(status?)`: historial del comprador. El comprador no ve el reparto.
- Staff: `getProductionTicketSales(productionId, status?)` (ve su 90%) y
  `activateProductionTicketPurchase(purchaseId)` para habilitar una compra `confirmed`.

### 6.3 Reseña obligatoria (REV-02)

Cuando el visitante **usa** un ticket **pago**, queda obligado a reseñar ese blog.
Mientras no lo haga:

- `getMyPendingProductionReview` devuelve `{ productionId, productionTitle }` → mostrar el aviso persistente.
- Otros blogs vienen con `viewer.lockReason = pendingReview` y sin ítems.
- `purchaseProductionTicket` falla con "Tenés una reseña pendiente…".
- El blog a reseñar sigue accesible. `createProductionReview` levanta el bloqueo.

---

## 7. SeudoBase (staff)

`getProductionSeudoBase(productionId, filters: { kinds, parentId, searchTerm }, page, limit)` devuelve filas con
`key` (foto), `fileName` (Nº), `name` (título), `price` (el que aplica), `ownTicket`,
`effectiveTicket`, `visibility`/`effectiveVisibility`, `path` y `moderationStatus`.

Operaciones masivas (máx. 200 ítems del mismo blog), **todas con `confirm: true` obligatorio**:

| Mutation | Input extra | Nota |
|---|---|---|
| `bulkUpdateProductionPrices` | `mode: percentage \| fixed`, `value` | Sólo ítems con ticket **pago propio**; el resto vuelve en `skipped`. `percentage` 5 = +5%. |
| `bulkUpdateProductionVisibility` | `visibility` (vacío = heredar) | |
| `bulkDeleteProductionItems` | — | Hard delete; libera cupo |

Cada operación devuelve `auditId`; `getProductionAuditLog` lista quién hizo qué, con el
antes/después en `details` (JSON).

---

## 8. Fans, reseñas, comentarios y denuncias

- **Fans:** `becomeProductionFan` / `stopBeingProductionFan` devuelven el blog actualizado
  (`fansCount`, `viewer.isFan`). El dueño no puede ser fan de su blog.
- **Reseñas:** `createProductionReview(input: { productionId, rating: 1..5, review })`. Sólo quien
  accedió con un ticket y no es parte del blog; una por usuario (después se edita).
  `getProductionReviews` trae `rating` promedio.
- **Comentarios:** `createProductionComment(input: { productionId, itemId?, comment })` sobre el blog o
  un ítem que el usuario puede ver. `replyProductionComment` = respuesta del staff (una por comentario).
  Borra el autor o el staff. `getProductionComments(productionId, itemId?)` trae cada comentario con su `response`.
- **Denuncias:** `reportProductionContent(input: { productionId, itemId?, reason, details })`,
  `reason` ∈ `inappropriate | violence | sexual | spam | copyright | other`. Una denuncia abierta por
  usuario y contenido. `contentHidden: true` indica que con esa denuncia el contenido se ocultó.

---

## 9. Panel admin (`ClerkAuthGuard` + `AdminGuard`)

| Operación | Uso |
|---|---|
| `getProductionTicketPurchasesAdmin(page, limit, filters)` | Transacciones de tickets para `admin/invoices`: monto, 10% (`commissionAmount`), 90% (`creatorPayoutAmount`), `payoutAliasCbu`, comprador con email, `transferReference`, factura y liquidación. Filtros: `status`, `productionId`, `buyerId`, `payoutStatus`, `hasFactura`, `isPaid`. |
| `confirmProductionTicketPurchase(purchaseId, activate)` | La transferencia llegó; con `activate: true` además habilita el acceso |
| `rejectProductionTicketPurchase(input: { purchaseId, reason })` | La transferencia no llegó |
| `activateProductionTicketPurchaseAsAdmin(purchaseId)` | Habilita una compra confirmada |
| `attachFacturaToProductionTicketPurchase(input: { purchaseId, facturaUrl })` | Factura del 10% (misma mecánica que `attachFacturaToInvoice`) |
| `markProductionTicketPayoutDone(purchaseId)` | Se liquidó el 90% al creador |
| `setProductionFeatured(productionId, isFeatured)` | Fijar en "Producciones destacadas" |
| `getProductionReportTargetsAdmin(status, page, limit)` | Contenidos denunciados agrupados, con motivos y estado |
| `getProductionTargetReportsAdmin(productionId, itemId?)` | Denuncias de un contenido, con los denunciantes |
| `moderateProductionContent(input: { productionId, itemId?, action: block \| restore, note })` | Confirmar el bloqueo o restaurar |

> Las compras de tickets **no** se mezclan con `getAllInvoicesAdmin` (esos invoices son de
> suscripciones de MercadoPago y tienen campos propios). La pantalla `admin/invoices` puede
> mostrar las dos listas.

---

## 10. Configuración del backend (variables de entorno, todas opcionales)

| Variable | Default | Qué controla |
|---|---|---|
| `PRODUCTION_FREE_PERSONAL_BLOGS` | 1 | Blogs personales sin plan |
| `PRODUCTION_FREE_GROUP_BLOGS` | 1 | Blogs de grupo sin plan |
| `PRODUCTION_FREE_FILES_PER_BLOG` | 10 | Archivos por blog sin plan |
| `PRODUCTION_MAX_PERSONAL_BLOGS` | 1 | Tope de blogs personales en cualquier plan |
| `PRODUCTION_ACCESS_KEY_MAX_ATTEMPTS` | 5 | Intentos de clave antes del bloqueo |
| `PRODUCTION_ACCESS_KEY_LOCK_MINUTES` | 15 | Minutos de bloqueo |
| `PRODUCTION_TICKET_COMMISSION_PERCENT` | 10 | Comisión de Soonpublicité |
| `PRODUCTION_TICKET_MIN_DURATION_HOURS` | 24 | Duración mínima de un ticket |
| `PRODUCTION_TICKETS_TRANSFER_ALIAS` / `_CBU` / `_HOLDER` / `_BANK` | — | Cuenta para las transferencias |
| `PRODUCTION_REPORTS_HIDE_THRESHOLD` | 3 | Denuncias que ocultan un contenido |

Los límites reales por plan están en `SubscriptionPlan`: `personalBlogsCount`,
`groupBlogsCount` y `filesPerBlogCount`. Los planes que no los tengan cargados dan el
cupo gratuito. Se exponen también en `GET /subscriptionplans`.

Además, `findUserById` devuelve `credentialId` (ID decorativo `SP-XXXX-XXXX` para la credencial).
