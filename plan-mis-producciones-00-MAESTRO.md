# Mis Producciones — Plan Maestro de Desarrollo

> **Qué es:** plan de acción end-to-end para implementar la feature **Mis Producciones (MP)**.
> **Fuentes:** `plan-feature-mis-producciones-ACs.md` (criterios de aceptación) + `AGENTS.md` (arquitectura real).
> **Estrategia:** primero se implementa y verifica **todo el Backend** (ver `plan-mis-producciones-01-BE.md`), y recién cuando el BE de una fase está estable se arranca la **UI** de esa fase (ver `plan-mis-producciones-02-UI.md`).
> **Regla de oro:** MP **clona el patrón de Anuncios** (`module_post/post` en server; cadena `Action → Service → GraphQL` en client). No se inventan estructuras nuevas salvo donde el AC lo marca como 🔴 trabajo nuevo.

---

## 1. Principios que ordenan el plan

1. **BE antes que UI, por fase.** Cada fase entrega BE verificado (`npm run build` + `npm run test` en `server/`) y luego su UI (`npm run build` en `client/`). No se abre UI de una fase sin su BE mergeado.
2. **De lo transversal a lo específico.** Primero los cambios que habilitan todo (modelo de plan, entidad Blog, media/audio), después las capas que dependen de ellos (tickets, denuncias, gestión masiva).
3. **Riesgo alto temprano.** Los 🔴 (tickets con transferencia, blog polimórfico de grupo, denuncias) se atacan apenas su base 🟢/🟡 existe, para no descubrir bloqueos al final.
4. **Cada fase es demostrable.** Al cerrar una fase hay algo que un usuario puede ver o hacer (aunque sea parcial).

---

## 1.bis Decisiones previas a resolver con el equipo de BE (antes de escribir código)

Antes de arrancar la Fase 0, el **equipo de BE debe confirmar** estos puntos abiertos:

1. **Ubicación del módulo.** ¿`server/src/contexts/module_production/production/` (módulo nuevo, propuesta por defecto) o `module_post/production/` (submódulo dentro de Post)? El resto del plan asume `module_production/production/`; si se elige la otra opción, ajustar rutas en los planes BE y UI. **Preguntar antes de empezar.**

> Todo lo que dependa de esta decisión (paths de import, registro en `app.module.ts`, nombre de tokens de DI) queda supeditado a la respuesta del equipo de BE.

---

## 2. Mapa de módulos afectados

### Server (`server/src/contexts/`)
| Módulo | Acción | Motivo |
|--------|--------|--------|
| `module_production` (**nuevo**) | Crear clonando `module_post/post` | Núcleo de MP: Blog, Carpetas, Archivos, Tickets, Fans, Reseñas, Denuncias. |
| `module_webhook/mercadopago` | **Extender** `subscriptionPlan.schema.ts` + cálculo de límites | 3 dimensiones nuevas de plan (blogs personales, blogs de grupo, archivos por blog) + panel admin de tickets. |
| `module_user` | **Extender** `User` schema/service | `User.productions[]`, ID decorativo de credencial, `isThisUserAllowedToCreateBlog` / conteo de archivos. |
| `module_group` | **Extender** (lectura de roles) | Resolver roles `creator/admins[]/members[]` del blog de grupo; `Group.blog`. |
| `module_shared` | **Extender** guards/auth si hace falta | Autorización por rol de grupo + acceso por clave. |

### Client (`client/src/`)
| Área | Acción | Motivo |
|------|--------|--------|
| `app/(root)/(explorar)/producciones/` (**nuevo**) | Ruta/sección nueva | Clona `/anuncios` (listado + grilla). |
| `app/(root)/crear/produccion/` + `editar/produccion/[id]/` (**nuevo**) | Alta/edición | Clona `crear/anuncio`. |
| Botonera de 3 apps + Header | **Nuevo/extender** | Anuncios/Producciones/Social en home y en `/perfiles/:id`. |
| `app/server/productionActions.ts` + `services/` + `graphql/` + `types/` (**nuevo**) | Capas de datos | Cadena estándar del cliente. |
| Panel de Control (dentro del cartel) | **Extender** `(configuracion)` + `/perfiles/:id` | Board + controles de blog (Ticket, SeudoBase, Consumo). |
| UploadThing FileRouter | **Extender** | Agregar tipo audio. |

---

## 3. Fases (orden de implementación)

Cada fase lista sus ACs cubiertos. El detalle técnico está en los planes BE y UI.

### Fase 0 — Fundaciones transversales (BE)
**Objetivo:** habilitar el resto sin UI todavía.
- Extender `subscriptionPlan.schema.ts` con 3 dimensiones nuevas + cálculo acumulativo (RNF-06).
- Agregar `User.productions[]` y **ID decorativo de credencial** (RNF-09).
- Agregar tipo **audio** al FileRouter de UploadThing (RNF-04) — cambio de cliente pero es fundación, va acá.
- ACs: RNF-06, RNF-09, RNF-04, base de PLN-01..05.
- **Salida:** planes con nuevos límites; usuario con `productions[]` e ID de credencial. Sin pantalla.

### Fase 1 — Núcleo del Blog / Producción (BE → UI)
**Objetivo:** crear/editar/borrar un blog personal y sus archivos, con la jerarquía de carpetas.
- BE: `module_production` con entity `Blog`/`Production` (dueño polimórfico User|Group — RNF-11, pero se arranca por User), schema, repository, service transaccional (patrón `PostService.create`), adapter, resolver, module. Árbol Blog→Carpetas→Subcarpetas→Archivos (BLG-07). CRUD de archivos con validación de cupo antes de persistir (BLG-01, 05, 06, 12, 13). Hard delete en cascada (RNF-05).
- UI: ruta `/producciones` (listado/grilla), `crear/produccion`, `editar/produccion/[id]`, subida a UploadThing con tipos de archivo (foto postcard 2 caras BLG-08, video BLG-09, escrito BLG-10, audio BLG-11), header del blog, estantería y muestrario (BLG-02..04).
- ACs: BLG-01..13, PLN-04/05 (gate de cupo).
- **Salida:** un usuario crea un blog personal, sube archivos y los organiza.

### Fase 2 — Navegación (botonera de 3 apps) (UI, apoyada en BE de Fase 1)
**Objetivo:** integrar MP a la navegación de la app.
- UI: botonera Anuncios/Producciones/Social en home y en `/perfiles/:id`, "Producciones destacadas" en home, buscador de producciones, botón Crear suma "Producción".
- BE: queries de listado público (`ClerkAuthGuardOptional`) + búsqueda (NAV-05) y "destacadas" (NAV-03).
- ACs: NAV-01..07.
- **Salida:** MP navegable y buscable como Anuncios.

### Fase 3 — Visibilidad + Acceso por clave (BE → UI)
**Objetivo:** controlar quién ve el contenido.
- BE: alcance Público/AGC (12 combinaciones — VIS-01/02) reutilizando `Visibility` + relaciones; herencia + override por carpeta/archivo (VIS-03/04); acceso por **clave hasheada** que reemplaza el alcance (INV-01/02, VIS-05, RNF-13).
- UI: configuración de alcance por carpeta/archivo, ingreso de clave (tipo Zoom).
- ACs: VIS-01..05, INV-01/02.
- **Salida:** contenido restringible por segmento o por clave.

### Fase 4 — Panel de Control (dentro del cartel) (UI, apoyada en BE existente)
**Objetivo:** el propietario opera su blog desde el cartel.
- UI: botonera Anuncios/Producciones dentro del cartel, Pizarra reutilizando `Board.annotations` (PC-03), CONTROL del Blog (PC-04), CONTROL Consumo (tokens + archivos usados vs límite — PC-05), grilla del blog (PC-06).
- BE: query de consumo (archivos usados vs límite — SB-05/PC-05) apoyada en Fase 0.
- ACs: PC-01..07.
- **Salida:** panel operativo del propietario.

### Fase 5 — Tickets (cobro por transferencia) (BE → UI) 🔴
**Objetivo:** cobrar acceso con confirmación manual del admin.
- BE: entidad nueva `Ticket`/`TicketPurchase` (ciclo pendiente→confirmado→activo→expirado — RNF-07), alias/CBU en el blog (RNF-10), integración con `admin/invoices` + `attachFacturaToInvoice` para la comisión del 10% (TKT-05/06/11), expiración automática (TKT-08), gate de plan gratuito (TKT-10/PLN-03).
- UI: Page de Ticket (asignar a carpeta/archivo, toggle pago/gratuito, duración, advertencia sin devoluciones — TKT-01..04), flujo de compra por transferencia, panel admin de confirmación.
- ACs: TKT-01..11, PLN-01..03.
- **Salida:** venta de tickets pagos con liquidación manual.

### Fase 6 — Blogs de grupo + roles (BE → UI) 🔴
**Objetivo:** blogs propiedad de un grupo, con roles derivados del grupo.
- BE: dueño polimórfico User|Group efectivo (GRP-01), creación solo por `creator` (GRP-02/03), roles derivados `creator→admin / admins[]→moderador / members[]→visión` (GRP-04..07, RNF-12), límites y tickets del blog según **plan del creator** (GRP-08, RNF-14).
- UI: creación de blog de grupo desde el grupo, vistas según rol.
- ACs: GRP-01..08.
- **Salida:** blogs de grupo compartidos con permisos por rol.

### Fase 7 — SeudoBase + gestión masiva (BE → UI)
**Objetivo:** operar a escala tipo Excel.
- BE: operaciones masivas de precio, visibilidad y borrado (hard delete) con auditoría (SB-02/03), gate de cupo (SB-04).
- UI: tabla con filtros/búsqueda, selección múltiple, confirmación obligatoria (SB-01..05).
- ACs: SB-01..05.
- **Salida:** gestión masiva segura.

### Fase 8 — Fans + Reseñas (BE → UI) 🟢
**Objetivo:** feedback y comunidad.
- BE: Fans (FAN-01), reseñas/comentarios patrón `PostReview`/`PostComment` (REV-01), bloqueo por reseña pendiente en ticket pago (REV-02/TKT-09/D10).
- UI: listado de Fans en el panel, formularios de reseña, prompt/bloqueo persistente.
- ACs: FAN-01, REV-01/02.
- **Salida:** fans y reseñas con obligación en tickets pagos.

### Fase 9 — Sistema de Denuncias (BE → UI) 🔴
**Objetivo:** moderación de UGC.
- BE: entidad denuncia, umbral configurable con ocultamiento automático (DEN-01/02), revisión admin con `AdminGuard` (DEN-03).
- UI: botón denunciar, panel admin de revisión.
- ACs: DEN-01..03.
- **Salida:** flujo Denuncia → Revisión → Bloqueo.

---

## 4. Dependencias entre fases

```
Fase 0 (fundaciones)
  └─> Fase 1 (blog núcleo)
        ├─> Fase 2 (navegación)
        ├─> Fase 3 (visibilidad + clave)
        │     └─> Fase 5 (tickets) ──> Fase 8 (reseñas obligatorias)
        ├─> Fase 4 (panel de control)
        ├─> Fase 6 (blogs de grupo)   [requiere Fase 1 + Fase 5 para tickets de grupo]
        ├─> Fase 7 (seudobase)
        └─> Fase 9 (denuncias)
```

- **Fase 5 depende de Fase 3** (el ticket es una capa sobre el acceso; la clave es ortogonal — INV-03).
- **Fase 8 depende de Fase 5** (la reseña obligatoria se dispara por ticket pago).
- **Fase 6 depende de Fase 5** (los tickets pagos de grupo dependen del plan del creator).
- Fases 2, 4, 7, 9 dependen solo de Fase 1 y pueden paralelizarse si hay capacidad.

---

## 5. Verificación por fase (Definition of Done)

- **BE:** `cd server && npm run build` y `npm run test` (Jest con `mongodb-memory-server`) en verde. Resolvers protegidos con `ClerkAuthGuard`/`AdminGuard` y ownership con `PubliciteAuth.authorize`.
- **UI:** `cd client && npm run build` en verde. Cadena `Action → Service → GraphQL + types` respetada.
- **Idioma:** dominio y mensajes de usuario en español.
- **AGENTS.md:** actualizar la sección de módulos si se agrega `module_production`.

---

## 6. Documentos hermanos
- **Backend:** `plan-mis-producciones-01-BE.md`
- **UI:** `plan-mis-producciones-02-UI.md` (ejecutar por fase una vez que su BE está verificado).
