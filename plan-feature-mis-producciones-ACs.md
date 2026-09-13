# Mis Producciones — Documento de Requerimientos Enriquecido (Criterios de Aceptación)

> **Estado:** V2 — decisiones de producto confirmadas (ver §9).
> **Fuente comercial:** `Presupuesto - Mis Producciones (Soonpublicite) V2.docx.md` (Desarrollo 3).
> **Objetivo:** convertir el documento conceptual/comercial en Criterios de Aceptación (ACs) accionables y verificables, anclados a la arquitectura **real** de la app (verificada contra el código), para poder derivar luego un plan de desarrollo y una estimación defendible.
> **Formato de AC:** Gherkin liviano (Dado / Cuando / Entonces), con ID estable por área.

> **Decisiones de scope confirmadas (todas dentro de este desarrollo):**
> 1. Navegación: **botonera de 3 apps** — **Anuncios** (default) / **Producciones** / **Social** (perfiles+revistas+grupos) — cada una con ruta propia. MP es una **sección nueva** de la app (como Grupos/Revistas). Publicité y Promos quedan fuera de scope.
> 2. **MP no tiene solapas.** El contenido es una **grilla** de posts o de carpetas (sin categorías/solapas propias). En el **home** se muestran "Producciones destacadas" si existen; el buscador debe encontrar producciones.
> 3. SeudoBase y "Espacio Libre": **entran**.
> 4. Tipo de archivo **Audio: entra**.
> 5. SeudoBase soporta edición masiva de **precios, visibilidad y borrado**.
> 6. Jerarquía de contenido **Blog → Carpetas → Subcarpetas → Archivos: confirmada**.
> 7. Límite de plan **por cantidad** (arranca en 10 imágenes), pero el valor debe ser **editable**/configurable.
> 8. La credencial (perfil) **ya existe**; se le agrega un **ID decorativo** nuevo (el usuario hoy solo tiene `_id`/`username`/`dni`/`finder`, sin ID de credencial). El **QR es el link al perfil**.
> 9. Ticket pago MVP = **transferencia + confirmación manual del admin**. El creador setea **alias/CBU en su blog**; la transacción del blog aparece en `admin/invoices`, donde Publicité asocia una **factura por el 10% de comisión**.
> 10. Reseña obligatoria en ticket pago: **insiste y además bloquea** comprar/visitar nuevas producciones hasta reseñar.
> 11. Producciones y Anuncios son **entidades independientes** (sin conversión entre sí).
> 12. **Sistema de Denuncias: entra** en este desarrollo (flujo Denuncia → Revisión → Bloqueo con ocultamiento automático).
> 13. **Blog de grupo:** un blog puede pertenecer a un **grupo** (no solo a un usuario). Los archivos se **comparten** entre miembros. Lo crea **solo el admin** del grupo y se **descuenta de su límite** de blogs de grupo.
> 14. **Roles del blog de grupo** = roles **existentes** del grupo, sin agregar ninguno: `creator` → **admin** (hace todo, incl. crear/borrar el blog y cobrar), `admins[]` → **moderador** (hace todo menos crear el blog), `members[]` → **visión** (solo lectura).
> 15. **Límites por plan (configurables):** blogs personales = **1 fijo** en todos los planes; blogs de grupo = **1** en gratuito y **N configurable** en pagos; archivos = cupo **por blog** (arranca ~10, sube con el plan). **Gratuito = 2 blogs** (1 personal + 1 de grupo).
> 16. El **límite de archivos y el permiso de tickets pagos de un blog de grupo dependen del plan del admin** que lo creó.
> 17. **Acceso por clave (tipo Zoom):** una **contraseña** del blog; cualquiera que la tenga entra. **Reemplaza** al esquema de alcance (público/AGC). Es **independiente del ticket** (puede combinarse con ticket gratuito o pago). Si el ticket es pago, la **reseña obligatoria igual aplica**.

---

## 0. Contexto de arquitectura verificado (lo que YA existe y se reutiliza)

Todo lo siguiente fue verificado leyendo el código; condiciona los ACs. "Mis Producciones" (en adelante **MP**) debe **replicar la lógica de Anuncios (Posts)**, tal como pide el doc original.

| Área | Dónde vive hoy (verificado) | Implicancia para MP |
|------|------------------------------|----------------------|
| **Anuncios (patrón a clonar)** | `server/src/contexts/module_post/post/` con DDD de 3 capas: `domain/` (entity + interfaces + enums), `application/` (service, factory), `infraestructure/` (schema Mongoose, repository, adapter, resolver, module). DI por **token string** (`@Inject('PostServiceInterface')`). | MP se implementa como módulo nuevo `module_production` (o `module_post/production`) clonando esta estructura: entity, schema, resolver, service, repository, adapter, factory, module. |
| **Creación transaccional** | `PostService.create()` abre sesión Mongo (`connection.startSession()` + `withTransaction`), valida límite con `userService.isThisUserAllowedToPost(author, behaviour)`, crea el post y lo asocia con `saveNewPostInUser`. | MP replica el patrón: crear entidad + asociar a `User` en una sola transacción, validando cuota del plan **antes** de persistir. |
| **Relación con el usuario** | `User.posts[]` (`ref: 'Post'`) + `Post.author` (`ref: 'User'`). En borrado se hace `$pull` de `User.posts`. | MP añade `User.productions[]` / `Production.author` con el mismo mecanismo. |
| **Board / "Cartel de Usuario"** | `module_user/board/` (DDD completo). `BoardSchema { annotations[], visibility, user, color, keywords[], searchTerm }`. Se referencia como `User.board`. Cliente: `components/Board/Board.tsx`, edición de color en `(configuracion)/Preferences/BoardPersonalization.tsx`. | El "Panel de Control" de MP **extiende** el patrón Board (la Pizarra = `annotations`). No se reinventa. |
| **Planes y límites** | `subscriptionPlan.schema.ts` (`module_webhook/mercadopago`): `isFree`, `postsLibresCount`, `postsAgendaCount`, `maxContacts`, `isPack`, `price`, `mpPreapprovalPlanId`. **Límites SOLO por cantidad; NO existe ninguna dimensión de MB/almacenamiento.** Cálculo en `calculatePostLimitAndContactLimit.ts` (suma acumulativa de todas las subs). | ⚠️ **Desviación / trabajo nuevo:** MP necesita límite por **cantidad de archivos** (D7: inicial ~10, configurable) → hay que **agregar dimensión nueva** al modelo de plan y a la lógica de cálculo. Sin MB en esta etapa. |
| **Pagos (suscripciones)** | MercadoPago automático (`module_webhook/mercadopago`): webhooks, payment/subscription/invoice services. `invoice.schema.ts` con `facturaUrl / facturaUploadedAt / facturaUploadedBy`. Panel admin `AdminInvoiceResolver` (`@UseGuards(ClerkAuthGuard, AdminGuard)`) con `getAllInvoicesAdmin` y `attachFacturaToInvoice`. | ⚠️ **Flujo NUEVO:** los **tickets de MP** se pagan por **transferencia bancaria + confirmación manual del admin + 10% para Soonpublicité**. Es un flujo distinto al de suscripciones MercadoPago; reutiliza el **patrón** admin/invoice pero es una entidad nueva (`Ticket` / `TicketPurchase`). |
| **Consumo / tokens** | `chatbot.token.service.ts`: `TokenConsumerBucket` (PLAN / FREE / ANONYMOUS), cuota mensual/diaria, bolsa comunitaria, logs de uso. | Precedente para el medidor "CONTROL Consumo" del Panel de Control. Los **tokens ya existen**; lo que falta medir es el **conteo de archivos usados vs. límite** del plan (D7). |
| **Archivos / media** | **UploadThing** (`api/uploadthing/core.ts`: image 8MB×10, video 32MB×1, pdf 8MB×3). Hook `useUploadFiles.tsx` **comprime imágenes** (`browser-image-compression`), sube y guarda el **`key`**; adjuntos como `{ url, label }`. Render con `FILE_URL + key`. **No hay Firebase.** | Fotos/videos/escritos(pdf)/audio de MP se suben a UploadThing y se referencian por `key`. Audio requiere agregar tipo al FileRouter (hoy no está). |
| **Auth / ownership** | Clerk (`ClerkAuthGuard`, `ClerkAuthGuardOptional`, `AdminGuard`) + `PubliciteAuth.authorize(userRequestId, author_id)`. Cliente: `middleware.ts` (rutas públicas/privadas/admin + gate de onboarding), `mongoId` en `sessionClaims.metadata.mongoId`. | Todos los resolvers de MP usan el mismo guard + verificación de propiedad. Listados públicos usan el guard opcional. |
| **Borrado** | Anuncios hacen **hard delete en cascada** (transacción: borra reviews/reactions/comments + `$pull` de `User.posts`). `isActive` es un toggle de disponibilidad, usado al bajar de plan (`desactivateAllPost`). | ✅ MP usa el **mismo hard delete** que Anuncios (D-borrado). Al borrar archivos, baja el conteo del usuario y se **libera cupo** de su límite. Sin soft delete. |
| **Categorías / solapas** | En Anuncios, `PostCategory` es una **colección Mongo** (`{ label }`) referenciada por `Post.category[]`, y el Explorar usa solapas. | ⚠️ **MP no usa solapas ni categorías** (D2): el contenido se muestra como **grilla** de carpetas/posts. Se omite todo el modelo de categorías para MP. |
| **Navegación / Header** | `(root)/layout.tsx` + `Header.tsx` (links: Explorar→`/anuncios`, Cubito, Tablero, Search, botón **Crear**→`/crear`, avatar). El buscador (`Header/Search/`) y los listados de perfiles/grupos/revistas ya existen. | Se agrega una **botonera de 3 apps** (Anuncios/Producciones/Social) en el home y en el cartel (`/perfiles/:id`). **Producciones** es una **ruta/sección nueva** (`/producciones`) que clona el patrón de `/anuncios`. **Social** reagrupa perfiles+revistas+grupos existentes. El botón Crear suma "Producción". |
| **Capas cliente** | `Server Action` (`app/server/*Actions.ts`) → `Apollo service` (`services/*Services.ts`) → `documento GraphQL` (`graphql/*Queries.ts`) + `types/`. | MP replica esta separación: `productionActions.ts` + `productionServices.ts` + `productionQueries.ts` + tipos. |

**Leyenda de esfuerzo en los ACs:** 🟢 = replica un patrón existente · 🟡 = extiende un patrón existente · 🔴 = trabajo nuevo sin precedente en el código.

---

## 1. Navegación — Botonera de Apps (Anuncios / Producciones / Social) 🟡🔴

**Historia:** Como usuario quiero elegir entre ver **Anuncios**, **Producciones** o **Social** desde una botonera, tanto en el home como dentro del cartel de un usuario, para explorar cada tipo de contenido por separado.

**Modelo confirmado (D1, D2):** MP es una **sección nueva** de la app, al mismo nivel que Grupos/Revistas. La navegación es una **botonera de 3 apps**, cada una con **ruta propia** y color:
- **Anuncios** (naranja) — `/anuncios` — **seleccionada por default**.
- **Producciones** (magenta/vino) — `/producciones` (ruta nueva).
- **Social** (celeste) — agrupa **perfiles + revistas + grupos** (contenido ya existente, reagrupado).
- Fuera de scope: Publicité y Promos.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| NAV-01 | el usuario está en el **home** | ve la botonera de apps | se muestran **Anuncios / Producciones / Social**, cada una con su color; **Anuncios** viene seleccionada por default. |
| NAV-02 | el usuario toca **Producciones** en la botonera | selecciona la app | navega a la ruta propia **`/producciones`** con su listado/grilla (patrón equivalente a `/anuncios`). |
| NAV-03 | el usuario está en el **home** y existen producciones | la home se renderiza | además del contenido de Anuncios se muestra una sección **"Producciones destacadas"** (si no hay producciones, la sección no aparece). |
| NAV-04 | un usuario (dueño o visitante) abre el **cartel** de una persona (`/perfiles/:id`) | usa la botonera del cartel | alterna entre ver los **Anuncios** de esa persona o sus **Producciones**; Anuncios por default. |
| NAV-05 | el usuario usa el **buscador** | busca producciones | las producciones son **buscables** siguiendo el mismo patrón de búsqueda ya existente (como anuncios/perfiles). |
| NAV-06 | el usuario está en la app **Producciones** | usa el botón **Crear** | puede crear una Producción/Blog (el botón Crear ofrece Producción como opción, junto a las entidades ya existentes en `/crear`). |
| NAV-07 | el usuario toca **Social** en la botonera | selecciona la app | ve agrupados perfiles, revistas y grupos (reorganización de navegación de contenido existente). |

**Notas:** El doc comercial hablaba de una botonera de 5 apps con "SuperButton contextual"; el alcance real confirmado es la botonera de **3 apps** (Anuncios/Producciones/Social) con rutas propias. El botón **Crear** suma "Producción" como opción; no requiere volverse totalmente contextual.

---

## 2. Panel de Control (dentro del Cartel de Usuario) 🟡

**Historia:** Como propietario quiero, dentro de mi cartel, poder alternar entre mis Anuncios y mis Producciones y acceder a los controles de mi blog (ticket, base de datos, consumo), sin salir del cartel.

**Aclaración de modelo:** el "Panel de Control" del doc comercial **no es una pantalla nueva**: es el **cartel de usuario existente** (`/perfiles/:id` + `(configuracion)`) enriquecido con la botonera Anuncios/Producciones y los controles del blog. Las "zonas" del doc se mapean sobre lo que ya existe.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| PC-01 | el usuario abre su cartel | se renderiza | se muestran: credencial + board, pizarra, la **botonera Anuncios/Producciones**, los controles del blog (Ticket, SeudoBase, Consumo) y el contenido de la app seleccionada. |
| PC-02 | el cartel muestra la Credencial | el usuario la visualiza | se muestran foto, rol, ubicación y un **ID decorativo de credencial** (campo **nuevo**; hoy el usuario solo tiene `_id`/`username`/`dni`/`finder`). El botón **compartir/QR** genera un **QR con el link al perfil** (`/perfiles/:id`). |
| PC-03 | el usuario está en la Pizarra | escribe o edita una nota rápida | la nota se persiste reutilizando `Board.annotations` (patrón existente, como la edición de color del board). |
| PC-04 | el usuario abre **CONTROL del Blog** | accede | puede ir a la "Page del Ticket", gestionar visibilidad y acceder al módulo de Fans. |
| PC-05 | el usuario abre **CONTROL Consumo** | accede | ve **Tokens utilizados** (dato ya disponible vía token bucket) y **archivos usados vs. límite del plan** (conteo por cantidad — RNF-06). |
| PC-06 | el usuario está en el cartel con **Producciones** seleccionada en la botonera | navega | ve una **grilla** de carpetas/posts del nivel actual; al entrar en una carpeta, la grilla muestra su contenido (árbol de BLG-07). Con **Anuncios** seleccionada, ve sus anuncios como hoy. |
| PC-07 | el usuario abre **CONTROL SeudoBase** | accede | entra a la vista tipo Excel de gestión masiva (§5). |

**Nota:** el "Espacio Libre" y la SeudoBase (marcados "(REVISAR)" en el doc) **entran** en este desarrollo (D3).

---

## 3. Blog de Mis Producciones (núcleo — creación y edición) 🟢🟡

**Historia:** Como usuario quiero crear y editar un Blog "Mis Producciones" con su header, estantería de links y muestrario, y subir archivos de distintos tipos (fotos, videos, escritos, audio), replicando la lógica de Anuncios.

### 3.1 Blog / contenedor

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| BLG-01 | el usuario está en la App MP | usa el SuperButton "Crear" | se crea una Producción/Blog con `author` = usuario autenticado, en una **transacción** (patrón `PostService.create`), validando la cuota de almacenamiento del plan **antes** de persistir. |
| BLG-02 | el blog existe | un visitante lo abre | ve el **Header del Blog**: **nombre/título del blog** (editable por el propietario), **descripción opcional del blog**, foto, **URL autogenerada**, botón de compartir y texto/video de bienvenida. El título es obligatorio al crear y alimenta búsqueda (NAV-05) y "Producciones destacadas" (NAV-03); la descripción es opcional y también se usa en búsqueda y en la tarjeta/grilla. |
| BLG-03 | el propietario habilita la **Estantería (Board de Links)** | agrega recursos externos | se muestran en filas scrolleables por categoría (Pelis, Libros, Sitios web, Youtube, Games, Places). |
| BLG-04 | el propietario configura el **Muestrario** | selecciona archivos destacados de un contenedor | el Muestrario ("la cara de la expo") muestra esa selección. |
| BLG-05 | el propietario edita el blog | guarda | los cambios se persisten validando propiedad con `PubliciteAuth.authorize(userRequestId, author_id)`. |
| BLG-06 | el propietario elimina un blog/archivo | confirma | se aplica **hard delete** (borrado físico en cascada, mismo patrón que Anuncios). Al borrar archivos, el conteo del usuario baja y se **libera cupo** de su límite de fotos/archivos (RNF-06). |

### 3.2 Jerarquía de contenido

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| BLG-07 | el propietario organiza su blog | crea carpetas y subcarpetas | el contenido se modela como árbol **Blog → Carpetas → Subcarpetas → Archivos** (D6), base para heredar visibilidad y tickets (ver §4). |

### 3.3 Archivos (Librerías Visuales)

Cada archivo tiene un **ID tipo `fileName`** que el usuario puede setear.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| BLG-08 | el usuario sube una **Foto (Postcard)** | se procesa | se representa como **postal de dos caras**: frente = imagen; dorso = coordenadas, autoría, dedicatoria y descripción guiada ("¿Qué sentiste este día?"). |
| BLG-09 | el usuario sube un **Video** | se procesa | se representa como **rectángulo** (patrón existente: se marca el `key` con sufijo `video`). |
| BLG-10 | el usuario sube un **Escrito/Texto** | se procesa | se representa como **hoja de papel**. |
| BLG-11 | el usuario sube un **Audio** | se procesa | se representa con su player e ID `fileName` (D4). ⚠️ El FileRouter de UploadThing hoy **no acepta audio** → hay que agregar el tipo (RNF-04). |
| BLG-12 | el usuario sube cualquier archivo | el upload ocurre | el archivo se sube a **UploadThing** y se referencia por `key` (imágenes comprimidas con `browser-image-compression`); se valida la **cuota del plan antes** de completar (§5). |
| BLG-13 | el usuario asigna/edita el `fileName` (ID) de un archivo | guarda | el ID queda persistido, visible y único dentro del contenedor. |

### 3.4 Artículo de blog (editor de bloques) 🟡

**Historia:** Como propietario quiero crear un **artículo de blog** con un **editor de bloques** (ir seleccionando qué agregar: encabezado, párrafo, imagen, lista, etc.), igual que se crean las Novedades del carrousel del home.

**Patrón a reutilizar (verificado en el código):** las Novedades usan **Editor.js** (`@editorjs/editorjs` + plugins `@editorjs/header`, `@editorjs/list`, `@editorjs/image`, `@editorjs/link`). El editor se instancia en `client/src/app/(root)/novedades/admin/[[...id]]/FormBlogPost.tsx`, se guarda el `OutputData` (JSON de bloques) y se renderiza parseando esos bloques con `client/src/utils/functions/editorjs-parser.ts`. El artículo de blog de MP **clona este patrón**, no inventa un editor nuevo.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| BLG-14 | el propietario está en su blog | crea un **artículo** | se abre un **editor de bloques (Editor.js)** donde va **seleccionando qué agregar** (encabezado, párrafo, imagen, lista, link…), mismo patrón que la creación de Novedades. |
| BLG-15 | el propietario agrega un **bloque de imagen** en el artículo | sube la imagen | la imagen se sube a **UploadThing** (patrón existente en `FormBlogPost`, hook `useUploadThing`) y queda referenciada dentro del contenido del artículo. |
| BLG-16 | el propietario guarda el artículo | persiste | el contenido se guarda como **JSON de bloques (`OutputData`)** (igual que `Novelty.content`), asociado al blog/carpeta actual; en lectura se parsea y renderiza con `editorjs-parser`. |
| BLG-17 | el artículo cuenta para límites/visibilidad | se evalúa | el artículo es un **ítem de contenido más** del árbol (§3.2): respeta cupo del plan, visibilidad/herencia (§4.1) y hard delete (BLG-06). |

**Nota:** el artículo de blog es un **tipo de contenido nuevo** dentro de la Producción, distinto de los archivos sueltos (foto/video/escrito/audio de §3.3). Comparte con ellos el árbol de carpetas, la visibilidad y los límites.

---

## 4. Visibilidad y Tickets (Alcance + Cobro)

Sección de mayor complejidad. Se separa en **Alcance** (quién ve) y **Cobro** (quién paga).

### 4.1 Alcance — 12 combinaciones 🟡

Matriz de 2 condiciones:
- **Condición A — Alcance:** Público (todo Usuario Registrado, UR) · o restringido por Agenda de Contactos (AGC) en 3 grados: **Contactos · Amigos · Top Amigos**.
- **Condición B — Cobro:** libre sin ticket · libre con ticket **gratuito** (conteo de visitas) · privado con ticket **pago**.
- 4 alcances × 3 modos de cobro = **12 combinaciones** de control de acceso. (Aplican al contenido de MP; MP no las expone como solapas — D2.)

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| VIS-01 | el propietario configura el alcance | elige Público o un grado de AGC | el contenido queda visible solo para ese segmento, reutilizando la jerarquía de relaciones que ya usa la visibilidad de Anuncios (`Visibility` + relaciones/contactos). |
| VIS-02 | el sistema combina Alcance × Cobro | se resuelve la matriz | quedan definidas las **12 combinaciones** de acceso y cada ítem se muestra u oculta al visitante según la combinación aplicable (MP no las agrupa en solapas). |
| VIS-03 | el propietario asigna visibilidad a una **carpeta padre** | guarda | la configuración se **hereda** por los hijos salvo override. |
| VIS-04 | el propietario asigna una configuración específica a una **subcarpeta o archivo** | guarda | ese ítem **sobreescribe** la herencia del padre (navegación híbrida). |
| VIS-05 | el blog usa **acceso por clave** (INV-01) | se evalúa la visibilidad | la clave **reemplaza** las 12 combinaciones de alcance/AGC: el acceso lo define la contraseña (D19). El cobro por ticket sigue siendo una capa aparte. |

### 4.2 Cobro — Tickets (Page de Ticket) 🔴

⚠️ **Flujo NUEVO** (no existe hoy): pago por **transferencia bancaria**, confirmación **manual del admin**, **10%** para Soonpublicité, **sin devoluciones**.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| TKT-01 | el propietario está en la **Page de Ticket** | asigna un ticket | puede asignarlo a una carpeta padre completa o a subcarpetas/archivos individuales (modelo híbrido, ligado a BLG-07). |
| TKT-02 | el propietario usa el **Toggle Button** (círculo naranja) | lo alterna | toda la carpeta cambia entre **Pago** y **Gratuito** de forma inmediata. |
| TKT-03 | el propietario crea un ticket | lo configura | debe definir una **duración** (mínimo 24 hs, o "hasta el cierre del blog"). |
| TKT-04 | un visitante intenta comprar un ticket pago | inicia la compra | el sistema le **advierte que no hay devoluciones** e informa la **cantidad de archivos** incluidos, y **requiere aceptación explícita** antes de continuar. |
| TKT-05 | el visitante confirma la compra | paga por **transferencia bancaria** a la cuenta de Soonpublicité | se crea un registro de ticket en estado **"pendiente de confirmación"** (entidad nueva `Ticket`/`TicketPurchase`, patrón `invoice`). |
| TKT-06 | el pago está pendiente | el **admin** verifica la transferencia | la transacción del blog aparece en `admin/invoices`; al **confirmar**, Publicité puede **asociar una factura por el 10% de comisión** (reutiliza `attachFacturaToInvoice`/`AdminInvoiceResolver` + `AdminGuard`) y el **90%** queda a liquidar al creador vía su alias/CBU (TKT-11). |
| TKT-11 | el creador configura su blog | carga su **alias o CBU** de cobro | el dato se persiste en el blog y se le **expone al admin** de Soonpublicité junto a la transacción del ticket, para liquidar el 90%. |
| TKT-07 | la operación fue confirmada | el admin **o** el creador habilitan el acceso | el visitante obtiene acceso por la duración configurada. |
| TKT-08 | el ticket vence (duración cumplida o blog cerrado) | expira | el acceso se **revoca automáticamente**. |
| TKT-09 | el visitante compró un ticket **pago** | accede al contenido | queda obligado a dejar una **reseña** (ver §6, REV-02). |
| TKT-10 | el plan del creador es **Gratuito** | intenta emitir un ticket pago | el sistema lo bloquea (solo tickets gratuitos en plan free, ligado a PLN-03). |

### 4.3 Planes (capacidad y monetización) 🟡

**Dimensiones de límite por plan (todas configurables, como los límites de posts hoy):**
- **Blogs personales:** `1` fijo en todos los planes.
- **Blogs de grupo:** `1` en gratuito · `N configurable` en planes pagos.
- **Archivos por blog:** cupo inicial ~`10` en gratuito, sube con el plan.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| PLN-01 | el usuario tiene **Plan Gratuito** | usa Producciones | puede tener **1 blog personal + 1 blog de grupo** (total 2), con **~10 archivos por blog** (configurable) y **solo tickets gratuitos**. |
| PLN-02 | el usuario mejora a un **Plan Pago** | usa Producciones | mantiene **1 blog personal** (no aumenta), sube la **cantidad de blogs de grupo** permitidos y el **cupo de archivos por blog**, y se habilita **cobrar con Tickets Pagos**. |
| PLN-03 | el usuario en Plan Gratuito | intenta habilitar cobro | el sistema bloquea la acción e invita a mejorar el plan (patrón `PostsLimitReached` con CTA a `/suscripciones` y `/packs-publicaciones`). |
| PLN-04 | el usuario alcanza su límite de blogs (personales o de grupo) | intenta crear otro | el sistema lo bloquea e informa el límite de su plan (mismo patrón de gate que posts). |
| PLN-05 | un blog (personal o de grupo) alcanza su cupo de **archivos** | el usuario sube uno más | se **detiene** con Pop-Up de mejora de plan / packs (ligado a SB-04). Al **borrar** archivos se libera cupo. |

### 4.4 Blogs de grupo, roles e invitación por clave 🔴

**Historia:** Como admin de un grupo quiero crear un blog del grupo cuyos archivos se compartan entre los miembros, con roles heredados del grupo, y poder proteger el acceso con una clave.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| GRP-01 | existe un blog | se modela | su **dueño es polimórfico**: `owner` = **User** o **Group** (`ownerType`). Un blog de grupo comparte sus archivos entre los miembros del grupo. |
| GRP-02 | el usuario es el **`creator` del grupo** | crea el blog del grupo | se permite la creación (solo el `creator` puede), y ese blog **se descuenta de su límite de blogs de grupo** (según su plan — D18). |
| GRP-03 | un usuario que **no es `creator`** del grupo | intenta crear el blog del grupo | el sistema lo **bloquea** (solo el `creator` crea). |
| GRP-04 | un blog de grupo existe | se resuelven los roles | se **derivan directamente de los roles del grupo, sin roles nuevos**: `creator` → **admin del blog**; `admins[]` → **moderador**; `members[]` → **visión** (solo lectura). |
| GRP-05 | el usuario es el **`creator`** del grupo (admin del blog) | opera | puede hacer **todo**: subir/editar/borrar archivos, gestionar tickets, invitar, **crear/borrar el blog** y **cobrar** (recibe la liquidación). |
| GRP-06 | el usuario está en **`admins[]`** del grupo (moderador) | opera | puede hacer **todo menos crear el blog** (sube/edita/borra archivos, gestiona tickets e invitaciones); **no** crea ni es quien cobra. |
| GRP-07 | el usuario está en **`members[]`** del grupo (visión) | opera | acceso de **solo lectura** al contenido permitido. |
| GRP-08 | el límite de archivos y el permiso de tickets pagos de un blog de grupo | se evalúan | dependen del **plan del `creator` que creó el blog** (D18), no del grupo. |
| INV-01 | el dueño/admin del blog configura el acceso por **clave** | define una contraseña | el blog queda protegido por **clave (tipo Zoom)**; cualquiera que la ingrese obtiene acceso. |
| INV-02 | un blog usa **clave** | se evalúa el acceso | la clave **reemplaza** el esquema de alcance (público/Contactos/Amigos/Top): el gate es la contraseña, no la agenda (D19). |
| INV-03 | un blog tiene **clave + ticket** | un visitante entra con la clave | la clave y el ticket son **capas independientes**: la clave habilita la visibilidad; si además hay **ticket pago**, aplica el flujo de cobro y la **reseña obligatoria** igual (ligado a TKT-09 / REV-02). |

---

## 5. SeudoBase y Control de Consumo (Gestión Masiva) 🟡🔴

**Historia:** Como propietario quiero una vista tipo Excel para gestionar masivamente mis producciones y monitorear mi consumo, para operar a escala con seguridad.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| SB-01 | el usuario abre la **SeudoBase** desde el Panel | se renderiza | ve una tabla con columnas (Foto, Nº, Título, Precio, etc.) con filtros y búsqueda. |
| SB-02 | el usuario selecciona ítems y aplica un **cambio masivo** | ejecuta una de las 3 operaciones soportadas: **edición de precio** (ej. +5%), **cambio de visibilidad** o **borrado masivo** | el sistema muestra una **alerta obligatoria de confirmación** antes de aplicar. |
| SB-03 | el usuario confirma un cambio masivo destructivo (borrado o cambio de precio/visibilidad en lote) | acepta | el cambio se aplica solo tras confirmación explícita; el borrado es **hard delete** (libera cupo del límite) y la operación queda **auditada** (alto impacto). |
| SB-04 | el usuario en Plan Gratuito sube un archivo | **excede la cuota** (nº de archivos permitidos por su plan) | la acción se **detiene** y aparece un **Pop-Up** que incita a comprar packs o mejorar el plan. |
| SB-05 | el usuario abre CONTROL Consumo | consulta | ve Tokens (precedente token bucket) y **archivos usados vs. límite** por cantidad (RNF-06). |

---

## 6. Fans, Reseñas y Comentarios 🟢

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| FAN-01 | un visitante ve un blog | se convierte en **Fan** | queda en un listado visible en el Panel del propietario y en las solapas de la app. |
| REV-01 | un visitante **accedió mediante ticket** | deja feedback | puede dejar **reseña, calificación o comentario** sobre la producción (patrón `PostReview`/`PostComment`). |
| REV-02 | el ticket del visitante era **pago** y no dejó reseña | vuelve a la plataforma | el sistema (a) **insiste** con un prompt de reseña pendiente y (b) **bloquea** que compre tickets nuevos o visite nuevas producciones hasta completar la reseña pendiente (ligado a TKT-09). |

---

## 7. Sistema de Denuncias 🔴

**En scope (D12).** Flujo provisional Denuncia → Revisión → Bloqueo, con ocultamiento automático por acumulación.

| ID | Dado que… | Cuando… | Entonces… |
|----|-----------|---------|-----------|
| DEN-01 | un usuario ve contenido UGC | lo **denuncia** | se registra la denuncia asociada al archivo/producción, iniciando el flujo Denuncia → Revisión → Bloqueo. |
| DEN-02 | un archivo **acumula** denuncias sobre un umbral configurable | se alcanza el umbral | el sistema **oculta automáticamente** el archivo (queda pendiente de revisión). |
| DEN-03 | un archivo fue ocultado o denunciado | el **admin** lo revisa | puede confirmar el bloqueo o restaurar el archivo (patrón admin con `AdminGuard`). |

---

## 8. Requerimientos NO funcionales / técnicos

- **RNF-01 (DDD server):** MP se implementa como módulo nuevo en `server/src/contexts/` replicando `module_post/post` (domain / application / infraestructure, DI por token string, factory por subtipo si aplica), registrado en `app.module.ts`.
- **RNF-02 (Cliente):** capas Server Action → Apollo service → documento GraphQL + tipos; pantallas bajo `(root)/(explorar)` (listado), `crear`/`editar` (alta/edición) y route-group propio para el Panel de Control.
- **RNF-03 (Auth):** todo resolver protegido con `ClerkAuthGuard` (o `ClerkAuthGuardOptional` para listados públicos) y ownership con `PubliciteAuth.authorize`; endpoints admin con `AdminGuard`.
- **RNF-04 (Media):** subida vía UploadThing; entidades guardan el `key`. Compresión de imágenes con el hook existente. **Agregar tipo audio** al FileRouter (BLG-11 está en scope — D4).
- **RNF-05 (Borrado = hard delete):** MP usa el **mismo hard delete en cascada** que Anuncios (sin soft delete). Al borrar archivos, el conteo del usuario baja y se libera cupo de su límite (RNF-06).
- **RNF-06 (Límites configurables por plan):** se **agregan** al modelo de plan (`subscriptionPlan.schema.ts`) tres campos nuevos: **blogs personales** (fijo 1), **blogs de grupo** (1 free / N pago) y **archivos por blog** (~10 free, sube con el plan). El cálculo replica el patrón de `calculatePostLimitAndContactLimit` (acumulativo por suscripciones). Límite por **cantidad**, no por MB.
- **RNF-11 (Blog polimórfico):** la entidad `Blog`/`Production` tiene dueño polimórfico `owner` = `User` | `Group` (`ownerType`). Un blog de grupo comparte archivos entre miembros. `User.productions[]` / `Group.blog` según el caso.
- **RNF-12 (Roles del blog de grupo):** se **derivan de los roles existentes del grupo, sin agregar roles nuevos** (`group.schema.ts` ya tiene `creator`/`admins`/`members`): `creator` → admin, `admins[]` → moderador, `members[]` → visión. La autorización se resuelve verificando en qué lista del grupo está el `userRequestId`, además del `PubliciteAuth.authorize` de ownership.
- **RNF-13 (Acceso por clave):** el blog puede guardar una **clave** de acceso (hash, no texto plano). Si está seteada, **reemplaza** la evaluación de alcance/AGC. Es ortogonal al ticket (pago/gratuito) y a la reseña obligatoria.
- **RNF-14 (Blog de grupo hereda plan del admin):** los límites de archivos y el permiso de tickets pagos de un blog de grupo se evalúan contra el **plan del admin que lo creó**.
- **RNF-09 (ID de credencial):** se agrega al usuario un **ID decorativo de credencial** (hoy no existe; solo `_id`/`username`/`dni`/`finder`). El QR de compartir apunta al perfil (`/perfiles/:id`), no expone el `_id` interno.
- **RNF-10 (Alias/CBU del creador):** el blog guarda el **alias o CBU** del creador para la liquidación del 90%; se expone al admin en el panel de tickets/invoices.
- **RNF-07 (Tickets ≠ suscripciones):** el ticket es una **entidad nueva** con su ciclo de vida (pendiente → confirmado → activo → expirado). Reutiliza el **patrón** admin/invoice pero no el flujo automático de MercadoPago.
- **RNF-08 (Módulos futuros):** Sooncoin/ARCA y pasarelas internacionales quedan **fuera de scope inicial**; se mantiene MercadoPago de forma provisional (para suscripciones) y transferencia para tickets.

---

## 9. Decisiones de producto confirmadas

Las dudas del borrado inicial fueron resueltas. Se dejan registradas como referencia de diseño:

| # | Tema | Decisión |
|---|------|----------|
| D1 | Navegación | **Botonera de 3 apps** (ver D14). Reemplaza la idea de "5 apps + SuperButton contextual" del doc comercial. |
| D2 | Solapas de MP | **MP no tiene solapas.** El contenido es una **grilla** de posts o de carpetas. |
| D3 | SeudoBase y "Espacio Libre" | **Entran** en este desarrollo. |
| D4 | Tipo Audio | **Entra.** Requiere agregar el tipo audio al FileRouter de UploadThing (RNF-04). |
| D5 | Operaciones de SeudoBase | Soporta edición masiva de **precio**, **visibilidad** y **borrado**. |
| D6 | Jerarquía de contenido | **Blog → Carpetas → Subcarpetas → Archivos** (árbol), con herencia + override de visibilidad/tickets. |
| D7 | Límite de archivos | **Por cantidad, por blog** (inicial ~10), **configurable** por plan. Sin límite por MB. |
| D8 | Credencial / QR | La credencial (perfil) ya existe. Se agrega un **ID decorativo** nuevo al usuario. El **QR es el link al perfil** (`/perfiles/:id`). |
| D9 | Ticket pago (MVP) | **Transferencia + confirmación manual del admin.** El creador setea **alias/CBU** en su blog; la transacción aparece en `admin/invoices` y Publicité **asocia una factura por el 10%** de comisión. Sin MercadoPago para tickets. |
| D10 | Reseña obligatoria | **Insiste y bloquea**: prompt persistente + bloqueo de compra/visita de nuevas producciones hasta reseñar. |
| D11 | Relación MP ↔ Anuncios | **Independientes** (sin conversión entre entidades). |
| D12 | Sistema de Denuncias | **Entra** en este desarrollo: flujo Denuncia → Revisión → Bloqueo + ocultamiento automático por umbral configurable + revisión admin. |

| D13 | Borrado | **Hard delete** (igual que Anuncios), sin soft delete. Al borrar archivos se **libera cupo** del límite de fotos/archivos del usuario. |
| D14 | Navegación | **Botonera de 3 apps**: Anuncios (default) / Producciones / Social (perfiles+revistas+grupos). Cada una con ruta propia. Home muestra "Producciones destacadas"; producciones **buscables**. Publicité/Promos fuera de scope. |
| D15 | Blog de grupo | Un blog puede pertenecer a un **grupo** (dueño polimórfico User\|Group). Comparte archivos entre miembros. Lo crea **solo el admin** del grupo y se descuenta de su límite de blogs de grupo. |
| D16 | Roles del blog de grupo | Se **mapean directo a los roles existentes del grupo, sin roles nuevos**: `creator` → **admin** (todo, incl. crear/borrar y cobrar); `admins[]` → **moderador** (todo menos crear el blog); `members[]` → **visión** (solo lectura). |
| D17 | Límites por plan | Blogs personales = **1 fijo**; blogs de grupo = **1 free / N configurable pago**; archivos = **por blog** (~10 free, sube con plan). Gratuito = **2 blogs** (1 personal + 1 grupo). |
| D18 | Plan del blog de grupo | Límite de archivos y permiso de tickets pagos del blog de grupo dependen del **plan del admin** que lo creó. |
| D19 | Acceso por clave | Contraseña del blog (tipo Zoom): quien la tiene entra. **Reemplaza** el alcance público/AGC. Es **independiente del ticket**; si el ticket es pago, la **reseña obligatoria igual aplica**. |

**No hay ítems diferidos:** todo el alcance del documento comercial entra en este desarrollo.

---

## 10. Trazabilidad con el documento original

| Sección doc original | Estimación doc | Cubierto en | Riesgo de estimación |
|----------------------|----------------|-------------|----------------------|
| 1. Navegación (botonera de apps) | 2 h | §1 (NAV) | 🔴 subestimado: ruta nueva `/producciones` + botonera + "destacadas" en home + búsqueda + reagrupar Social (D14). |
| 2. Panel de Control | 10 h | §2 (PC) | 🟡 depende de cuánto reusa de Board. |
| 3. Blog - Mis Producciones (creación/edición) | 20 h | §3 (BLG) | 🟡 postcard 2 caras + árbol de carpetas (D6) + audio (D4) suben el número. |
| 4. Visibilidad y tickets (Alcance) | 2 h | §4.1 (VIS) | 🟡 herencia con override (D6) no es trivial. |
| 5. Visibilidad y tickets (Cobro) | 15 h | §4.2 (TKT) + §4.3 (PLN) | 🔴 flujo nuevo de ticket + admin + liquidación con alias/CBU (D9). |
| 6. Herramientas de Soporte (SeudoBase) | 10 h | §5 (SB) | 🔴 edición masiva de precio/visibilidad/borrado (D5) con confirmación auditada. |
| 7. Sistema de Fans | 2 h | §6 (FAN) | 🟢 replica patrón. |
| 8. Reseñas y comentarios | 2 h | §6 (REV) | 🟢 replica `PostReview`/`PostComment` + bloqueo por reseña pendiente (D10). |
| 9. Sistema de denuncias | 2 h | §7 (DEN) | 🔴 flujo denuncia + ocultamiento por umbral + revisión admin (D12); entidad nueva. |
| **+ Blogs de grupo, roles e invitación por clave** | *no estimado* | §4.4 (GRP/INV) | 🔴 **alcance nuevo, no estaba en el presupuesto**: blog polimórfico User\|Group, roles derivados de creator/admins/members (sin roles nuevos), límites de blogs personales/grupo por plan, acceso por clave. |
| **Total (doc original)** | **65 h / 875 USD** | — | Costos nuevos no desglosados: RNF-06 (límites configurables + 3 dimensiones), RNF-09 (ID credencial), RNF-10 (alias/CBU), RNF-11/12/13/14 (blog de grupo + roles + clave), bloqueo por reseña (D10), ruta/sección nueva `/producciones` + búsqueda + "Producciones destacadas". **La estimación de 65 h queda claramente corta con este alcance ampliado.** |
