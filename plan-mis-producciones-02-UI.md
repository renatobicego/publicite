# Mis Producciones — Plan de UI

> **Alcance:** todo el frontend (Next.js 14 App Router + NextUI + Apollo) de MP.
> **Precondición:** cada fase de UI arranca **solo cuando su BE está verificado** (ver `plan-mis-producciones-01-BE.md`). No se codea UI contra un contrato de GraphQL que todavía no existe.
> **Regla:** clonar la cadena estándar del cliente: `Server Action (app/server/*Actions.ts)` → `Apollo service (services/*Services.ts)` → `documento GraphQL (graphql/*Queries.ts)` + `types/`. Referencia real: `crear/anuncio → createPost → postPost → postPostMutation`.
> **Verificación:** `cd client && npm run build`.

---

## Capas de datos a crear (transversal)

```
client/src/app/server/productionActions.ts     # "use server", gates, orquestación
client/src/services/productionsServices.ts      # arma cliente Apollo y ejecuta
client/src/graphql/productionQueries.ts          # gql`...` (mutations + queries)
client/src/types/production*.ts                  # tipos
```
Auth en server actions: `getAuthToken()` en header `Authorization` (patrón existente). `mongoId` del usuario desde `sessionClaims.metadata.mongoId`.

---

## Fase 0 (UI) — Media / audio
**Depende de:** BE Fase 0.
- Extender el FileRouter `client/src/app/api/uploadthing/core.ts` con el tipo **audio** (BLG-11/RNF-04).
- Ajustar el hook `client/src/utils/hooks/useUploadFiles.tsx` para audio (no se comprime; se guarda `key`; render `FILE_URL + key`).

**DoD:** subir un audio de prueba vía UploadThing y recuperar su `key`.

---

## Fase 1 (UI) — Núcleo del Blog / Producción
**Depende de:** BE Fase 1.

0. **Tarea previa — Extraer el editor de bloques a un componente reutilizable.**
   - Hoy Editor.js vive acoplado dentro de `app/(root)/novedades/admin/[[...id]]/FormBlogPost.tsx`.
   - Crear un componente compartido (p. ej. `components/BlockEditor/BlockEditor.tsx`) que encapsule la instancia de `EditorJS`, los plugins (`@editorjs/header`, `@editorjs/list`, `@editorjs/image`, `@editorjs/link`), la subida de imágenes vía `useUploadThing` y los callbacks de `onReady`/guardado (`OutputData`).
   - **Refactor sin cambio funcional:** hacer que `FormBlogPost` (Novedades) consuma el nuevo componente, de modo que Novedades y el artículo de MP compartan el mismo editor (una sola fuente de verdad).
   - Verificar que Novedades sigue creando/editando igual (`npm run build` + prueba manual) antes de reutilizarlo en MP.

1. **Rutas nuevas (App Router):**
   - `app/(root)/(explorar)/producciones/` — listado/grilla (clona `/anuncios`), con subruta `[id]`.
   - `app/(root)/crear/produccion/` — alta (clona `crear/anuncio/components/CreateForm`).
   - `app/(root)/editar/produccion/[id]/` — edición.
   - Registrar URLs en `client/src/utils/data/urls.ts`.
2. **Capas de datos:** `productionActions.ts` (`createProduction`, `updateProduction`, `deleteProduction`, `uploadFile`, `createFolder`), `productionsServices.ts`, `productionQueries.ts`, tipos.
3. **Componentes de blog:**
   - Header del blog: **nombre/título del blog** (input obligatorio al crear, editable), **descripción opcional** (textarea), foto, URL autogenerada, compartir, texto/video de bienvenida (BLG-02).
   - Estantería de links por categoría en filas scrolleables (BLG-03).
   - Muestrario / "cara de la expo" (BLG-04).
   - Árbol de carpetas → grilla del nivel actual (BLG-07/PC-06).
4. **Representación de archivos:**
   - Foto = **postal de dos caras** (frente imagen; dorso coordenadas/autoría/dedicatoria/descripción — BLG-08).
   - Video = rectángulo (sufijo `video` en el `key` — BLG-09).
   - Escrito = hoja de papel (BLG-10).
   - Audio = player con `fileName` (BLG-11).
   - Edición del `fileName` (ID) por archivo (BLG-13).
5. **Artículo de blog (editor de bloques — BLG-14..17):**
   - Reutilizar el **componente `BlockEditor` compartido** (extraído en el punto 0). El usuario **va seleccionando qué bloque agregar** (encabezado, párrafo, imagen, lista, link…), igual que al crear una Novedad.
   - Imágenes de bloque suben a UploadThing con `useUploadThing` (ya encapsulado en `BlockEditor`).
   - Guardar el `OutputData` como JSON de bloques (patrón `formatNoveltyBlocks` de `services/noveltyService.ts`); en lectura parsear/renderizar con `utils/functions/editorjs-parser.ts`.
6. **Gates de plan (UI):** al alcanzar cupo de blogs/archivos, mostrar Pop-Up de mejora (patrón `PostsLimitReached` con CTA a `/suscripciones` y `/packs-publicaciones` — PLN-04/05).

**DoD:** flujo completo crear → subir archivos → ver grilla → editar → borrar, con `npm run build` verde.

---

## Fase 2 (UI) — Navegación (botonera de 3 apps)
**Depende de:** BE Fase 2.
- **Botonera de 3 apps** (Anuncios naranja / Producciones magenta / Social celeste) en el **home**, con Anuncios por default (NAV-01).
- Tocar Producciones → navega a `/producciones` (NAV-02).
- Sección **"Producciones destacadas"** en el home si existen (NAV-03).
- Botonera equivalente dentro del cartel `/perfiles/:id` para alternar Anuncios/Producciones de esa persona (NAV-04).
- **Social** agrupa perfiles + revistas + grupos existentes (NAV-07) — reorganización de navegación.
- Buscador encuentra producciones (`Header/Search/` — NAV-05).
- Botón **Crear** (`Header/NavMenuItems.tsx`) suma "Producción" (NAV-06).

**DoD:** navegación y búsqueda operativas; `npm run build` verde.

---

## Fase 3 (UI) — Visibilidad + Acceso por clave
**Depende de:** BE Fase 3.
- Configurador de alcance por carpeta/archivo (Público / Contactos / Amigos / Top) con herencia y override visibles (VIS-01..04).
- Modal de **ingreso de clave** (tipo Zoom) cuando el blog está protegido; la clave reemplaza el alcance (INV-01/02, VIS-05).

**DoD:** un visitante entra por clave; el override de una subcarpeta se respeta.

---

## Fase 4 (UI) — Panel de Control (dentro del cartel)
**Depende de:** BE Fase 1 + Fase 4.
> El "Panel de Control" **no es pantalla nueva**: es el cartel existente (`/perfiles/:id` + `(configuracion)`) enriquecido.
- Botonera Anuncios/Producciones dentro del cartel (PC-01/06).
- Credencial con **ID decorativo** nuevo + botón compartir que genera **QR con link al perfil** (PC-02).
- **Pizarra** reutilizando `Board.annotations` (patrón `components/Board/Board.tsx` + `(configuracion)/Preferences/BoardPersonalization.tsx` — PC-03).
- **CONTROL del Blog:** Page del Ticket, visibilidad, módulo de Fans (PC-04).
- **CONTROL Consumo:** tokens utilizados + archivos usados vs límite (PC-05).
- **CONTROL SeudoBase:** entrada a la vista masiva (PC-07).

**DoD:** panel operativo dentro del cartel.

---

## Fase 5 (UI) — Tickets 🔴
**Depende de:** BE Fase 5.
- **Page de Ticket:** asignar ticket a carpeta padre o a subcarpeta/archivo (TKT-01), **toggle** pago/gratuito (círculo naranja — TKT-02), **duración** (mín 24h o hasta cierre — TKT-03).
- **Compra:** advertencia de **no devoluciones** + cantidad de archivos + aceptación explícita (TKT-04), datos de transferencia (TKT-05).
- **Alias/CBU** del creador en la config del blog (TKT-11).
- **Panel admin:** confirmar transferencia y asociar factura del 10% (reutiliza vistas de `admin/invoices` — TKT-06/07).
- Estado de acceso y expiración visibles (TKT-08).
- Gate: plan gratuito no habilita cobro pago (TKT-10/PLN-03).

**DoD:** compra → pendiente → confirmación admin → acceso; `npm run build` verde.

---

## Fase 6 (UI) — Blogs de grupo + roles 🔴
**Depende de:** BE Fase 6.
- Creación de blog de grupo desde el grupo (solo visible para `creator` — GRP-02/03).
- Vistas según rol: admin (todo), moderador (todo menos crear/cobrar), visión (solo lectura) — GRP-04..07.
- Indicadores de que el límite/tickets dependen del plan del creator (GRP-08).

**DoD:** un moderador edita pero no crea/borra el blog; un member solo lee.

---

## Fase 7 (UI) — SeudoBase (gestión masiva)
**Depende de:** BE Fase 7.
- Vista **tipo Excel**: tabla con columnas (Foto, Nº, Título, Precio, etc.), filtros y búsqueda (SB-01).
- Selección múltiple + operaciones: **precio (ej. +5%)**, **visibilidad**, **borrado** (SB-02).
- **Alerta obligatoria de confirmación** antes de aplicar cambios destructivos (SB-02/03).
- Pop-Up de cuota excedida al subir (SB-04).
- CONTROL Consumo consultable (SB-05).

**DoD:** las 3 operaciones masivas funcionan con confirmación; `npm run build` verde.

---

## Fase 8 (UI) — Fans + Reseñas 🟢
**Depende de:** BE Fase 8.
- Listado de **Fans** en el panel del propietario (FAN-01).
- Formularios de **reseña/calificación/comentario** para quien accedió por ticket (REV-01, patrón `PostReview`/`PostComment`).
- **Prompt persistente + bloqueo** de compra/visita hasta reseñar cuando el ticket fue pago (REV-02/D10).

**DoD:** el bloqueo por reseña pendiente impide comprar/visitar hasta completar.

---

## Fase 9 (UI) — Sistema de Denuncias 🔴
**Depende de:** BE Fase 9.
- Botón **denunciar** en contenido UGC (DEN-01).
- Reflejo del ocultamiento automático al superar umbral (DEN-02).
- Panel admin de revisión: confirmar bloqueo o restaurar (DEN-03).

**DoD:** flujo Denuncia → Revisión → Bloqueo visible en UI.

---

## Checklist transversal (aplica a todas las fases UI)
- [ ] Cadena `Action → Service → GraphQL + types` respetada (no llamar Apollo desde componentes).
- [ ] Server actions con `"use server"` y `getAuthToken()`.
- [ ] Route groups correctos (paréntesis no aparecen en la URL); URLs en `utils/data/urls.ts`.
- [ ] Media vía UploadThing: persistir `key`, render `FILE_URL + key`.
- [ ] Gates de plan con el patrón `PostsLimitReached` (CTA a `/suscripciones` y `/packs-publicaciones`).
- [ ] Español en textos de usuario.
- [ ] `npm run build` verde.
