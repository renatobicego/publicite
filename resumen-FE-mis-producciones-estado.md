# Mis Producciones — Estado del Frontend (traspaso de sesión)

> Documento de handoff para retomar el trabajo del frontend de **Mis Producciones**.
> Rama: `mis-producciones`. El backend (fases 0–9) ya estaba terminado; esta sesión
> implementó **todo el frontend (fases 0 a 9)** clonando los patrones del cliente.
>
> **Regla del usuario respetada:** `BlockEditor` es un componente **nuevo e independiente**;
> `client/src/app/(root)/novedades/admin/[[...id]]/FormBlogPost.tsx` **NUNCA se tocó**.

---

## 1. Estado general

- Las **12 tareas (fases 0–9)** están implementadas.
- **Verificación:** `cd client && npm run build` da verde (Compiled successfully, 54 páginas) y
  `npx tsc --noEmit` limpio después de cada fase.
- **NO se ejecutó nada contra el server GraphQL real** (no estaba corriendo). Todo se verificó
  leyendo los resolvers/modelos del backend + typecheck + build. Para un test de punta a punta:
  `cd server && npm run dev` con las env vars cargadas (MongoDB, Clerk, y las de tickets —
  `PRODUCTION_TICKETS_TRANSFER_ALIAS/_CBU/_HOLDER/_BANK`).
- **Nada está commiteado por esta sesión** (verificar con `git status`); los cambios están en el
  working tree del `client/`.

---

## 2. Dependencia agregada

- `qrcode.react@4.2.0` (pineada, en `client/package.json`). Renderiza el QR de la credencial
  **localmente**, sin llamadas a terceros.

---

## 3. Arquitectura de la capa de datos (patrón usado en todas las fases)

Cadena estándar del cliente, clonada de Anuncios:

```
client/src/types/productionTypes.ts          # enums, inputs y tipos de respuesta
client/src/graphql/productionQueries.ts        # gql (fragments + queries + mutations)
client/src/services/productionsServices.ts     # ejecutores Apollo (getClient().mutate / query)
client/src/app/server/productionActions.ts     # "use server", orquestación + manejo de error
client/src/utils/functions/productionErrorHandler.ts  # getProductionErrorMessage + isProductionActionError + ProductionActionError
```

**Manejo de errores (importante):** los errores de negocio llegan con HTTP 200 y
`errors[0].message = "Http Exception"`. El texto real está en
`errors[0].extensions.originalError.message.message`. Por eso `handleApolloError` (el genérico) NO
sirve para Producciones; se usa `getProductionErrorMessage`. Todas las actions devuelven
`T | ProductionActionError` y el consumidor chequea con `isProductionActionError(x)`.

**Nota "use server":** `productionActions.ts` sólo exporta funciones async. El helper de error y el
type-guard viven en `utils/functions/productionErrorHandler.ts` (no en el archivo de actions).

---

## 4. Hallazgos clave del backend (verificados contra resolvers/models reales)

Estos difieren o precisan el contrato `.md`:

- **`createProduction` retorna sólo `{ _id }`** (`ProductionIdResponse`), NO trae `url`. Para la url
  hay que refetch `findProductionById`.
- Args de update/delete de árbol usan **`itemId`** (no `folderId`/`fileId`/`articleId`).
- Los IDs son **GraphQL `ID!`** (no `String!`); las variables gql se declaran `ID!` salvo `url` y
  `accessKey` que son `String`.
- **`ProductionResponse`**: `owner`, `ownerType`, `creator` (top-level), `ownerInfo`
  (`ProductionOwnerResponse`: `_id,name,lastName,businessName,username,alias,profilePhotoUrl` — sin
  `ownerType`), `visibility`, `shelf[].imageKey`, `reviewsCount` nullable, `createdAt/updatedAt`,
  `viewer{...}`, `aliasCbu` (solo admin), `moderationStatus` (solo staff), `filesPerBlogLimit` (solo staff).
- **`ProductionItemResponse`** usa el campo **`production`** (no `productionId`), `effectiveVisibility`
  no-nullable, `access.ticket` = `ProductionTicketSummaryResponse` (`_id,isPaid,price,currency,durationHours,untilClose`, sin filesCount).
- **`getProductionItems`** retorna `ProductionItemsResponse { production(ProductionResponse), parent, breadcrumb[{_id,name}], items }`.
- Enum de visibilidad registrado como **`Visibility_of_the_post`** (`public|registered|contacts|friends|topfriends`).
- Guards: `find*` y `getProductionItems` usan `ClerkAuthGuardOptional`; el resto `ClerkAuthGuard`.
- `findUserById` expone **`credentialId`** (String nullable) — ya se agregó al `getUserByIdQuery` del cliente.

---

## 5. Qué se hizo por fase

### Fase 0 — Media / audio
- `client/src/app/api/uploadthing/core.ts`: `fileUploader` y `uploadSingleFile` aceptan `audio` (16MB, count 1).
- `client/src/utils/hooks/useUploadFiles.tsx`: el audio no se comprime y va al final junto con el video.
  Cambio backwards-compatible (Anuncios no manda audio).

### Fase 1 — Núcleo del blog
- **BlockEditor compartido** (nuevo): `client/src/components/BlockEditor/BlockEditor.tsx`
  (forwardRef con `save()`/`clear()`, holder único, plugins header/list/image/link, subida de
  imágenes a UploadThing, i18n español), `blockEditorFormat.ts` (serialize/deserialize),
  `BlockRenderer.tsx` (render read-only de `OutputData`; **no existía** un renderer reutilizable, el
  de Novedades está inline en `NoveltyContent`).
- **Data layer** completa de Producciones (ver §3).
- **Rutas:** `/crear/produccion`, `/editar/produccion/[id]`, `/producciones`, `/producciones/[id]`,
  `/producciones/[id]/item/[itemId]`.
- **Componentes** en `client/src/app/(root)/(explorar)/producciones/`:
  `productionMedia.ts` (`resolveProductionFileUrl`: `FILE_URL+key`, quita el sufijo `"video"`),
  `[id]/components/ProductionBlog.tsx` (header, breadcrumb, grilla, navegación de carpetas),
  `ProductionItemCard.tsx`, `ProductionStaffToolbar.tsx` (crear carpeta / subir archivo / crear
  artículo — detecta el tipo por MIME: image/video/audio/pdf→writing; al key de video le agrega `"video"`),
  `item/[itemId]/components/ProductionItemDetail.tsx` (postal/video/audio/escrito/artículo),
  `crear/produccion/components/CreateProductionForm.tsx` (gate `getProductionLimits`),
  `editar/produccion/[id]/components/EditProductionForm.tsx`,
  `components/ProductionListCard.tsx`.
- `utils/data/urls.ts`: `PRODUCTIONS`, `CREATE_PRODUCTION`, `EDIT_PRODUCTION`.

### Fase 2 — Navegación
- `client/src/components/AppSwitcher/AppSwitcher.tsx`: botonera de 3 apps
  (Anuncios naranja / Producciones magenta `#D6249F` / Social celeste `#20A4F3`).
- Home (`(root)/page.tsx`): AppSwitcher + `FeaturedProductions` (Suspense).
- `crear/page.tsx`: card "Crear Producción".
- Buscador: `producciones` agregado a `Search.tsx` (`keyToPath`), `DropdownSolapas` y `SelectSolapa`.
  La página `/producciones` lee `searchParams.busqueda ?? q`.

### Fase 3 — Alcance + clave
- `productionVisibility.ts` (labels + opciones).
- `AccessKeyModal.tsx` (ingreso de clave), `ProductionAccessSettings.tsx` (alcance por defecto +
  set/quitar clave; luego se le sumó el alias/CBU de Fase 5), `ItemVisibilityControl.tsx`
  (alcance por ítem con "Heredar").
- `ProductionBlog` auto-abre el modal de clave si `viewer.lockReason === accessKey`.

### Fase 4 — Panel de Control (en el cartel)
- Ruta `/perfiles/[id]/producciones` (page vacía; el contenido va en la solapa — patrón del cartel).
- `perfiles/[id]/(components)/ProfileProductionsTab.tsx` (cliente): grid de blogs del usuario +
  (mi cartel) CONTROL Consumo + credencial.
- `producciones/components/CredentialCard.tsx` (QR local + compartir).
- `UserSolapas.tsx`: solapa "Producciones" (cumple NAV-04, alternar Anuncios/Producciones en tabs).

### Fase 5 — Tickets
- **Staff:** `TicketManagerModal.tsx` (crear/editar/quitar ticket de un ítem o del blog, toggle
  pago/gratuito, precio, duración/untilClose). Alias/CBU en `ProductionAccessSettings` (`canManagePayout`).
- **Visitante:** `TicketCheckoutModal.tsx` (checkout por transferencia + no-refund),
  botón "Comprar" en `ProductionItemCard` cuando `lockReason === ticket`.
  `/producciones/mis-tickets` (historial). `productionTicketStatus.ts` (labels + colores).
- **Admin:** `admin/production-tickets/AdminProductionTicketsTable.tsx` + tab en `AdminPanel`
  (confirmar+habilitar / rechazar con motivo / factura 10% / liquidar 90%).
- `urls.ts`: `MY_PRODUCTION_TICKETS`.

### Fase 6 — Blogs de grupo
- Ruta `/grupos/[id]/produccion` + `grupos/[id]/(components)/GroupProductionTab.tsx` (cliente:
  `findAllProductionsByOwner(groupId, Group)`; el creator ve el botón "Crear blog del grupo").
- `GroupSolapas.tsx`: solapa "Producción del Grupo".
- Los roles (admin/moderator/viewer) los resuelve el backend vía `viewer{...}`; los componentes ya
  usan esos flags, así que las vistas por rol funcionan sin código extra.

### Fase 7 — SeudoBase
- Ruta `/producciones/[id]/seudobase` (guard `viewer.canEdit`).
- `SeudoBaseTable.tsx` (cliente): tabla con selección múltiple, búsqueda, y las 3 operaciones
  masivas (precio %/fijo, alcance, borrado) con **modal de confirmación obligatorio** que arma
  `confirm: true`. Botón "SeudoBase" en `ProductionBlog` (staff).

### Fase 8 — Fans y reseñas
- `FanButton.tsx` (toggle con `viewer.isFan`; oculto para el dueño).
- `ProductionCommunity.tsx` (reseñas 1–5 + comentarios; el staff responde). Montado en `ProductionBlog`.
- `components/AppSwitcher/PendingReviewBanner.tsx`: banner persistente de reseña pendiente
  (`getMyPendingProductionReview`), montado en `(root)/layout.tsx` bajo el Header (solo logueado).

### Fase 9 — Denuncias
- `ReportModal.tsx` (motivo + detalles); botón "Denunciar" en `ProductionBlog` (visitantes).
- `admin/production-reports/AdminProductionReportsTable.tsx` + tab en `AdminPanel`
  (filtro por estado, revisión con detalles, bloquear/restaurar). `setProductionFeatured` en data layer.

---

## 6. Rutas y superficies nuevas (resumen)

**Rutas:** `/producciones`, `/producciones/[id]`, `/producciones/[id]/item/[itemId]`,
`/producciones/[id]/seudobase`, `/producciones/mis-tickets`, `/crear/produccion`,
`/editar/produccion/[id]`, `/perfiles/[id]/producciones`, `/grupos/[id]/produccion`.

**Tabs admin:** "Tickets de Producciones", "Denuncias de Producciones".

**Compartidos:** `BlockEditor` + `BlockRenderer`, `AppSwitcher`, `PendingReviewBanner`.

---

## 7. Pendiente / deferido (no crítico)

1. **NAV-07 "Social" (reorg de navegación):** el botón Social del AppSwitcher hoy sólo linkea a
   `/perfiles`. Falta agrupar realmente perfiles + revistas + grupos bajo "Social". Es **invasivo**
   sobre navegación existente → confirmar con el usuario antes de reestructurar.
2. **Header del blog:** el form de crear/editar sólo maneja texto. Falta UI para subir
   `headerPhotoKey` y `welcomeVideoKey`.
3. **Estantería (`shelf`) y muestrario (`showcase`):** tipos y gql listos, sin UI.
4. **Postal (dorso) y `fileName`:** se muestran en el detalle, pero falta UI para **editarlos**
   (BLG-08 / BLG-13).
5. **Ticket a nivel blog entero** (targetId vacío): sólo se puede asignar por ítem; no hay entrada
   directa desde el header.
6. **`getProductionTicketSales`** (ventas del staff): data layer listo, sin UI dedicada.
7. **`getProductionAuditLog`** (auditoría SeudoBase): data layer listo, sin UI (tab de auditoría).
8. **Denuncia por ítem individual:** `ReportModal` acepta `itemId`, pero el botón sólo está a nivel
   blog; falta el botón en `ProductionItemCard`/detalle.
9. **`setProductionFeatured`:** data layer listo, sin botón en el panel admin.
10. **Audio en UploadThing:** confirmar que el dashboard del proveedor tiene habilitado el tipo
    `audio` (si no, la subida falla aunque el FileRouter lo acepte).

---

## 8. Cómo verificar / próximos pasos sugeridos

1. `cd client && npm run build` (debe seguir verde).
2. Levantar el server (`cd server && npm run dev`) con env vars y probar el flujo real:
   crear blog → subir archivos → alcance/clave → tickets → fans/reseñas → denuncias → admin.
3. Revisar los nombres exactos de argumentos/campos GraphQL si algo falla en runtime (todo se
   validó por lectura de código, no ejecutando queries).
4. Decidir con el usuario el alcance de la reorg "Social" (punto 7.1) antes de tocarla.

---

*Contratos de referencia del backend: `contrato-API-mis-producciones-FRONT.md` y
`resumen-BE-mis-producciones-para-FRONT.md`. Plan UI original: `plan-mis-producciones-02-UI.md`.*
