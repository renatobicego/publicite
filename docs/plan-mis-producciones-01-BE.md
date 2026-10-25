# Mis Producciones — Plan de Backend (BE)

> **Alcance:** todo el backend (NestJS + GraphQL + Mongoose, DDD 3 capas) de la feature MP.
> **Regla:** clonar `module_post/post`. DI por **token string**, **adapter** entre resolver y service, **factory** por subtipo, schemas Mongoose en `infraestructure/` (respetar el typo de carpeta `infraestructure`).
> **Verificación:** `cd server && npm run build && npm run test` en cada fase.
> **Orden:** este plan se ejecuta fase por fase; la UI de cada fase arranca recién cuando su BE está verificado.

---

## ✅ Estado de implementación

Fases 0 a 9 implementadas en la rama `mis-producciones`, con tests. El contrato para la UI
está en `contrato-API-mis-producciones-FRONT.md`. Decisiones tomadas durante la implementación:

- **Ubicación:** `server/src/contexts/module_production/production/` (la opción por defecto de este plan).
- **Árbol:** carpetas, archivos y artículos en una colección (`productionitems`) con discriminator `kind`.
- **Clave de acceso:** exige usuario registrado y limita los intentos fallidos (fuerza bruta).
- **Tickets:** entidad `ProductionTicket` + `ProductionTicketPurchase` con su propio panel admin
  (`getProductionTicketPurchasesAdmin`, `attachFacturaToProductionTicketPurchase`, etc.) en vez de
  insertar en `invoices`, cuyo schema es exclusivo de las suscripciones de MercadoPago. Se agregaron los
  estados `rejected` y `cancelled`, y la liquidación del 90% (`markProductionTicketPayoutDone`).
- **Vencimiento de tickets:** se evalúa al leer; no hay scheduler en Firebase Functions.
- **Blogs de grupo:** si el grupo se borra, se borra su blog; si el creator cede el grupo, el blog pasa al
  nuevo creator (cupo, plan y cobro) y se limpia el alias/CBU anterior.
- **Pendiente fuera del BE:** tipo audio en el FileRouter de UploadThing (cliente).

---

## ⚠️ Decisión previa (confirmar con el equipo de BE antes de empezar)

**Ubicación del módulo.** Este plan asume `server/src/contexts/module_production/production/` (módulo nuevo). La alternativa es `module_post/production/` (submódulo dentro de Post). **El equipo de BE decide** cuál usar; preguntarlo **antes de escribir código**. Si se elige `module_post/production/`, ajustar todos los paths de este documento, el registro en `app.module.ts` y los nombres de tokens de DI en consecuencia.

---

## Estructura objetivo del módulo nuevo

```
server/src/contexts/module_production/production/
├── domain/
│   ├── entity/
│   │   ├── production.entity.ts            # Blog (POJO con getters), dueño polimórfico
│   │   ├── folder.entity.ts                # Carpeta / Subcarpeta (árbol)
│   │   ├── file.entity.ts                  # Archivo (foto/video/escrito/audio)
│   │   ├── ticket.entity.ts                # Ticket / TicketPurchase (Fase 5)
│   │   ├── report.entity.ts                # Denuncia (Fase 9)
│   │   ├── enum/ (fileType, ownerType, ticketStatus, accessScope...)
│   │   └── models_graphql/ (HTTP-REQUEST / HTTP-RESPONSE)
│   ├── repository/production.repository.interface.ts
│   ├── service/production.service.interface.ts
│   └── production-factory/production.factory.interface.ts
├── application/
│   ├── service/production.service.ts
│   ├── production-factory/production.factory.ts   # crea File por subtipo
│   └── adapter/production.adapter.interface.ts (+ mapper)
└── infraestructure/
    ├── schemas/ (production.schema.ts, folder.schema.ts, file.schema.ts, ...)
    ├── repository/production.repository.ts
    ├── adapter/production.adapter.ts (+ mapper)
    ├── graphql/resolver/production.resolver.ts
    └── module/production.module.ts   # binding token→impl; registrar en app.module.ts
```

---

## Fase 0 — Fundaciones transversales

**Objetivo:** habilitar límites de plan, relación con usuario, credencial y audio. Sin resolvers de MP todavía.

1. **Modelo de plan (RNF-06).** Extender `module_webhook/mercadopago/infastructure/schemas/subscriptionPlan.schema.ts` con:
   - `personalBlogsCount` (fijo 1),
   - `groupBlogsCount` (1 free / N pago),
   - `filesPerBlogCount` (~10 free, sube por plan).
   Mantener el patrón de los campos `postsLibresCount`/`postsAgendaCount` existentes. **Límite por cantidad, no MB.**
2. **Cálculo de límites.** Clonar el patrón de `module_user/user/application/functions/calculatePostLimitAndContactLimit.ts` en `calculateProductionLimits.ts`: suma acumulativa de las suscripciones activas para blogs y archivos.
3. **User (RNF-09).** En `module_user/user`:
   - agregar `User.productions[]` (`ref: 'Production'`),
   - agregar **ID decorativo de credencial** (campo nuevo, no reemplaza `_id`; usarlo solo para mostrar).
4. **Media (RNF-04).** Agregar tipo **audio** al FileRouter `client/src/app/api/uploadthing/core.ts` (`fileUploader`). Es cambio de cliente pero es fundación de MP.

**DoD:** build + test verdes; migración/manejo de planes existentes sin límites (default seguro).

---

## Fase 1 — Núcleo del Blog / Producción

**Objetivo:** CRUD transaccional de blog + árbol de carpetas + archivos, para dueño **User** (el polimorfismo Group se activa en Fase 6).

1. **Entities (domain).**
   - `Production` (Blog): `owner` + `ownerType` (User|Group — RNF-11, arranca User), `title` (**nombre del blog, obligatorio** — decisión confirmada; se valida no vacío al crear y alimenta búsqueda/destacadas), `description` (**opcional**; se indexa para búsqueda y se muestra en la tarjeta/grilla), `headerPhotoKey`, `welcomeText`/`welcomeVideoKey`, `url` autogenerada (BLG-02), `shelf[]` (estantería de links por categoría — BLG-03), `showcase[]` (muestrario — BLG-04), `aliasCbu` (placeholder, se usa en Fase 5), `accessKeyHash` (placeholder Fase 3).
   - `Folder`: `parent` (self-ref para subcarpetas — BLG-07), `blog`, `name`.
   - `File`: `fileName` (ID editable único por contenedor — BLG-13), `type` (enum foto/video/escrito/audio), `key` (UploadThing), y metadata de postcard (dorso: coordenadas, autoría, dedicatoria, descripción — BLG-08).
   - `Article` (**artículo de blog, editor de bloques — BLG-14..17**): `title`, `content` = **JSON de bloques Editor.js** (`OutputData`, mismo formato que `Novelty.content` — se persiste stringificado, patrón `formatNoveltyBlocks`/`parseNoveltyBlocks`), `folder`/`blog` (nodo del árbol §3.2). Las imágenes internas del artículo se suben a UploadThing y quedan referenciadas dentro del `content`. Es un **ítem de contenido más** del árbol: cuenta para cupo, visibilidad/herencia y hard delete.
2. **Schemas (infraestructure).** `production.schema.ts` (colección `productions`), `folder.schema.ts`, `file.schema.ts`. Usar `discriminatorKey` si conviene para subtipos de File (patrón `post.schema.ts`).
3. **Factory.** `ProductionFactory` crea el `File` correcto según `type` (patrón `PostFactory` good/service/petition).
4. **Service transaccional.** `ProductionService.create()` clona `PostService.create()`:
   - `connection.startSession()` + `session.withTransaction(...)`,
   - **valida cuota ANTES de persistir**: `isThisUserAllowedToCreateBlog(owner)` y, al subir archivos, `isThisBlogAllowedToAddFile(blogId)` (usa `calculateProductionLimits`),
   - crea la entidad `productionRepository.create(mapped, { session })`,
   - asocia con `userService.saveNewProductionInUser(id, owner, { session })` (push a `User.productions[]`).
5. **Borrado (RNF-05).** Hard delete en cascada (transacción): borra carpetas, archivos, y `$pull` de `User.productions`; al borrar archivos baja el conteo y libera cupo (BLG-06).
6. **Repository / Adapter (+mapper) / Resolver / Module.** Clonar 1:1 la estructura de `post.*`. Resolver con mutations `createProduction`, `updateProductionById`, `deleteProductionById`, `createFolder`, `uploadFile`, `updateFile`, `deleteFile`, `createArticle`/`updateArticle`/`deleteArticle` (contenido = JSON de bloques Editor.js — BLG-14..17); queries `findProductionById`, `findAllProductionsByOwner`, etc. Todas con `ClerkAuthGuard` + `PubliciteAuth.authorize(userRequestId, owner_id)` en las que modifican (BLG-05, RNF-03).
7. **Registrar** `ProductionModule` en `app.module.ts` con binding `'ProductionServiceInterface'` → impl.

**DoD:** crear/editar/borrar blog y archivos vía GraphQL playground; tests de creación transaccional y de gate de cupo (PLN-04/05).

---

## Fase 2 — Listado público, búsqueda y destacadas

**Objetivo:** exponer queries para navegación.
- Query de listado con `ClerkAuthGuardOptional` (sin token → solo público; con token → amplía).
- Query de búsqueda de producciones (NAV-05) siguiendo el patrón de búsqueda de posts.
- Query "Producciones destacadas" para el home (NAV-03).

**DoD:** queries responden con paginación equivalente a `findAllPostsGlobal`.

---

## Fase 3 — Visibilidad + Acceso por clave

**Objetivo:** control de acceso por segmento o por clave.
1. **Alcance (VIS-01/02).** Reutilizar `Visibility` + relaciones/contactos que usa Anuncios. Modelar las 12 combinaciones (4 alcances × 3 modos de cobro) como configuración por ítem.
2. **Herencia + override (VIS-03/04).** La carpeta padre define visibilidad; hijos heredan salvo override propio. Resolver en el service al leer el árbol.
3. **Acceso por clave (RNF-13, INV-01/02, VIS-05).** `Production.accessKeyHash` (hash, nunca texto plano). Si está seteada, **reemplaza** el alcance/AGC. Query/mutation para validar clave y emitir acceso. Ortogonal al ticket (INV-03).

**DoD:** tests de herencia/override y de acceso por clave (hash correcto, clave inválida rechazada).

---

## Fase 4 — Consumo (soporte al Panel de Control)

**Objetivo:** datos para CONTROL Consumo.
- Query `getProductionConsumption`: tokens (reusa token bucket existente `chatbot.token.service`) + **archivos usados vs límite** por cantidad (PC-05, SB-05), calculado con `calculateProductionLimits`.

**DoD:** query devuelve usados/límite por blog y global.

---

## Fase 5 — Tickets (cobro por transferencia) 🔴

**Objetivo:** entidad de ticket con ciclo de vida y liquidación manual.
1. **Entidad `Ticket`/`TicketPurchase` (RNF-07).** Estados `pendiente → confirmado → activo → expirado`. Vinculada a carpeta/archivo (modelo híbrido — TKT-01), con `duracion` (mín 24h o hasta cierre — TKT-03), `esPago`/`gratuito` (toggle — TKT-02).
2. **Alias/CBU (RNF-10).** `Production.aliasCbu` (ya reservado en Fase 1); se expone al admin.
3. **Compra (TKT-04/05).** Mutation que crea el registro en `pendiente`, con advertencia de no-devolución y cantidad de archivos; pago por transferencia (fuera del sistema).
4. **Confirmación admin (TKT-06/11).** La transacción aparece en `admin/invoices`; reutilizar `AdminInvoiceResolver` + `attachFacturaToInvoice` (`AdminGuard`) para asociar factura del **10%**; el 90% queda a liquidar por alias/CBU.
5. **Habilitación y expiración (TKT-07/08).** Al confirmar, se habilita acceso por la duración; job/verificación de expiración que **revoca automáticamente**.
6. **Gate de plan (TKT-10/PLN-03).** Plan gratuito no puede emitir tickets pagos (patrón `PostsLimitReached`).

**DoD:** tests del ciclo de vida, del gate de plan y de la asociación de factura del 10%.

---

## Fase 6 — Blogs de grupo + roles 🔴

**Objetivo:** dueño polimórfico Group + roles derivados.
1. **Polimorfismo efectivo (GRP-01).** Activar `ownerType = Group`; `Group.blog` (en `module_group`). Archivos compartidos entre miembros.
2. **Creación solo por `creator` (GRP-02/03).** Validar que `userRequestId === group.creator`; descontar del límite `groupBlogsCount` **del creator** (RNF-14).
3. **Roles derivados (GRP-04..07, RNF-12).** Sin roles nuevos: resolver autorización mirando en qué lista del grupo está el `userRequestId` — `creator → admin`, `admins[] → moderador`, `members[] → visión`. Combinar con `PubliciteAuth.authorize`.
4. **Plan del creator (GRP-08).** Límite de archivos y permiso de tickets pagos del blog de grupo se evalúan contra el plan del creator.

**DoD:** tests de autorización por rol (admin/moderador/visión) y de límite contra plan del creator.

---

## Fase 7 — SeudoBase (gestión masiva)

**Objetivo:** operaciones en lote seguras.
- Mutations de **edición masiva de precio**, **cambio de visibilidad** y **borrado masivo** (SB-02); borrado = hard delete que libera cupo (SB-03).
- Auditoría de la operación (alto impacto) y gate de cupo (SB-04).

**DoD:** tests de las 3 operaciones masivas + confirmación requerida a nivel API.

---

## Fase 8 — Fans + Reseñas 🟢

**Objetivo:** feedback.
- **Fans (FAN-01).** Registro de fan por blog visitado.
- **Reseñas/comentarios (REV-01).** Clonar `PostReview`/`PostComment`.
- **Bloqueo por reseña pendiente (REV-02/TKT-09/D10).** Si el visitante usó ticket **pago** y no reseñó: bloquear compra/visita de nuevas producciones hasta reseñar (gate en resolvers de compra/acceso).

**DoD:** tests del bloqueo por reseña pendiente.

---

## Fase 9 — Sistema de Denuncias 🔴

**Objetivo:** moderación.
- **Entidad denuncia (DEN-01).** Asociada a archivo/producción.
- **Umbral configurable + ocultamiento automático (DEN-02).** Al superar el umbral, ocultar el archivo (pendiente de revisión).
- **Revisión admin (DEN-03).** Mutations con `AdminGuard` para confirmar bloqueo o restaurar.

**DoD:** tests de acumulación/ocultamiento y de acciones admin.

---

## Checklist transversal (aplica a todas las fases)
- [ ] DI por token string + adapter entre resolver y service.
- [ ] `ClerkAuthGuard`/`ClerkAuthGuardOptional`/`AdminGuard` según corresponda.
- [ ] `PubliciteAuth.authorize` en toda mutation sobre recursos propios.
- [ ] Transacciones Mongo para operaciones compuestas.
- [ ] Hard delete en cascada (sin soft delete).
- [ ] Español en dominio y mensajes.
- [ ] `npm run build` + `npm run test` verdes.
- [ ] Actualizar `AGENTS.md` (tabla de módulos) al crear `module_production`.
