# Plan de desarrollo — Hacete Amigo, cambio de plan, packs y regalo de planes

> Alcance: los temas de la reunión "Hacete Amigo - Notas". Fuera por ahora: nombres nuevos de
> planes, plan anual, API de dólar, premios por invitaciones (5 amigos = Premium, 10 = Gold),
> enviar tokens a un amigo y "cada uno paga su parte".
>
> Ítems del presupuesto que cubre: **Planes (cambio de plan, packs)** 10 h, **Hacete amigo** 35 h,
> **Regalo de planes** 10 h.

---

## 1. Definiciones acordadas

**Hacete Amigo**
- Es un grupo **propio del plan**, no el `Group` de la app.
- **Uno paga por todos**: un solo cobro mensual por débito automático, que puede hacer cualquier miembro.
- Sirve para **cualquier plan pago**. El descuento depende de la cantidad de miembros, con un
  **tope de descuento del 30%**. La tabla, el tope y un máximo opcional de miembros se configuran.
- El grupo **queda fijo** una vez pagado: si alguien se baja, se cancelan el grupo y el plan para todos.
- Si falla el pago, se cancela el plan para todos.
- Para que se habilite el pago, cada miembro (incluido el que invita) tiene que tener **al menos un
  anuncio o una producción publicados**. Si ya tiene uno, no hace falta publicar otro.
- Quien tiene un plan pago individual **no puede sumarse**: primero tiene que cancelarlo.

**Cambio de plan**
- Al cambiar de plan (subir o bajar), el usuario conserva **todos** los límites del plan viejo
  (anuncios, contactos, blogs, MB y tokens) hasta la fecha de su próximo cobro (`nextPaymentDate`).
- Se resuelve con una **suscripción temporal interna** que apunta al plan viejo, sin cobro y sin
  suscripción de MercadoPago. No hay dos suscripciones de MP a la vez ni packs ocultos.
- Al vencer, los límites bajan solos. Los anuncios que sobran **quedan activos**, pero el usuario
  no puede crear más hasta estar por debajo del límite, y se le dice cuántos tiene de más.
- La cancelación normal (sin cambio de plan) sigue como hoy: los límites se pierden en el momento.

**Packs**
- Siguen funcionando como hoy: planes `isPack` que se cobran por suscripción de MercadoPago.
- Se suman packs de **tokens** y de **MB**. Los tokens pasan a un campo del plan en Mongo (`tokensCount`).

**Regalar planes**
- Quien regala elige a un **usuario que ya existe** y paga una **suscripción mensual** a su nombre.
- El destinatario recibe una notificación.
- No se puede regalar a quien ya tiene un plan pago: se avisa que ya tiene plan.
- Sólo se regalan **planes**, no packs.
- El regalo lo pueden cancelar **los dos**: quien regala y quien lo recibe.

**Invitaciones de Hacete Amigo**
- Se puede invitar a usuarios registrados (buscador) y también con un **link de invitación**, que
  sirve para quien todavía no tiene cuenta: se registra y queda dentro del grupo.

---

## 2. Lo que hay hoy y hay que cambiar

| Tema | Hoy | Impacto |
|------|-----|---------|
| Alta de suscripción | El cliente crea el preapproval ([process_payment/route.ts](client/src/app/api/subscriptions/process_payment/route.ts)) con `preapproval_plan_id` y `external_reference` = mongoId. El webhook busca el plan por ese id. | Un preapproval **sin plan** tira "Plan not found". `external_reference` no puede ser siempre un usuario. |
| Suscripción activa | `status: 'authorized'`, filtrado en 7 lugares (`user.repository` ×4, `chatbot.token.repository` ×2, `mp-subscription.repository` ×1). | Hay que sumar el vencimiento (`expiresAt`) en los 7: conviene un solo helper. |
| `getActiveSubscriptions` | Filtra por `external_reference` = usuario. | No ve una suscripción compartida (grupo) ni una regalada. Afecta la decisión de aplicar el downgrade. |
| Cambio de plan | El [Checkout](client/src/app/suscribirse/[planId]/Checkout.tsx) da de alta el plan nuevo y cancela el viejo **desde el cliente**. | El usuario pierde sus límites al instante, y el server no sabe que la cancelación fue por un cambio de plan. |
| `endDate` | `parseTimeX` suma `frequency` **días** (1 día en un plan mensual). | Para el tiempo restante se usa `nextPaymentDate`, no `endDate`. |
| Compra de packs | [PackCard](client/src/app/(root)/(subscripciones)/components/PackCard.tsx): el botón "Aumenta el Límite" no tiene link. | Los packs hoy no se pueden comprar. |
| Tokens por plan | Salen de variables de entorno (`CHATBOT_TOKENS_PLAN_MAP`), y un pack da 0. | Se pasa a `SubscriptionPlan.tokensCount`. |
| Validación de tarjeta | El webhook ignora los pagos de ≤ $50. | El monto con descuento nunca tiene que quedar en ≤ $50 (y la prueba de $100 pasa). |
| Tareas programadas | No hay (Firebase Functions). | Los vencimientos se evalúan al leer (ver decisión B). |

Precedente útil: el plan gratuito ya es **un único documento `Subscription` compartido**
(`external_reference: 'FREE'`) al que apuntan todos los usuarios. Hacete Amigo usa la misma idea:
una suscripción por grupo, referenciada desde `User.subscriptions` de cada miembro. Así el cálculo
de límites no cambia.

---

## 3. Fases

### Fase 0 — Validar MercadoPago en producción (bloquea la Fase 5)

Objetivo: confirmar cómo se comporta un **preapproval sin plan asociado** antes de construir encima.

#### Lo que dice la documentación (y casos reales)

- **Dos modos sin plan** ([pago autorizado](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments), [pago pendiente](https://www.mercadopago.com.ar/developers/en/docs/subscriptions/integration-configuration/subscription-no-associated-plan/pending-payments)):
  - `status: "authorized"` + `card_token_id`: el mismo Brick de tarjeta que usamos hoy. **Es el que usamos.**
  - `status: "pending"` sin tarjeta: la respuesta trae `init_point` y el usuario paga en MercadoPago.
    Queda como plan B si el modo autorizado da problemas.
- **Body** de `POST /preapproval` sin plan: `reason` y `external_reference` son obligatorios en este
  caso, `payer_email` es obligatorio, más `auto_recurring` (`frequency: 1`, `frequency_type: "months"`,
  `transaction_amount`, `currency_id: "ARS"`; `start_date` y `end_date` opcionales), `back_url` y `status`.
- **Primer cobro:** en el modo autorizado, "la primera cuota se acredita en 1 hora". Antes MP hace un
  cobro chico de validación de tarjeta y lo devuelve. Nuestro webhook ya ignora los pagos de ≤ $50, así que eso queda cubierto.
- **Reintentos:** una cuota rechazada se reintenta **hasta 4 veces en 10 días**. Tras **3 cuotas
  rechazadas** MP da de baja la suscripción solo y le manda un email al vendedor.
- **Modificar** (`PUT /preapproval/{id}`, [referencia](https://www.mercadopago.com.ar/developers/en/reference/online-payments/subscriptions/update-preapproval/put)):
  monto (`auto_recurring.transaction_amount`), tarjeta, `reason` y `status` (pausar o cancelar). Ojo
  con la grafía: la [página de gestión](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/subscription-management)
  dice `canceled`, y nuestro código y los webhooks usan `cancelled`. Hay que probar cuál acepta el PUT.
  Como el grupo queda fijo, **no hace falta cambiar el monto**.
- **Webhooks:** topics `subscription_preapproval` (alta y cambios), `subscription_authorized_payment`
  (cada cuota) y `payment`. Firma `x-signature` (`ts=…,v1=…`) + `x-request-id`: **ya la validamos**
  en `mp.handler.validations.ts`.
- **Riesgo con `external_reference`:** [un caso real](https://github.com/FedericoDeniard/Receiptle/pull/206)
  reporta que MP no siempre lo propaga al preapproval (con checkout alojado y plan), y lo recuperan
  desde `/v1/payments/{id}`. Mitigación nuestra: la ruta de Next ya recibe el `id` del preapproval al
  crearlo (hoy lo descarta). Lo guardamos en el grupo o regalo **en el momento**, así el webhook lo
  resuelve por `mpPreapprovalId` aunque no venga la referencia.
- **Sandbox:** [otro caso real](https://github.com/Matitisco/iManager/pull/384) confirma que no se puede
  mezclar un vendedor real con un comprador de prueba: hacen falta vendedor **y** comprador de prueba
  del mismo país. En las tarjetas de prueba, el nombre del titular define el resultado (`APRO`
  aprobado, `OTHE` rechazado, `FUND` sin fondos). Sirve para probar rechazos sin esperar un mes.

#### Lo que hay que construir para la prueba (chico y descartable)

1. **Webhook tolerante:** hoy un preapproval sin `preapproval_plan_id` tira "Plan not found" y MP
   reintenta para siempre. Se agrega en `registerSubscription` y en los handlers de cuotas un desvío:
   `external_reference` que empieza con `mptest:` (o un `mpPreapprovalId` registrado como prueba) →
   **se guarda el payload completo** en una colección `mptestevents` y se responde 200. No toca usuarios ni límites.
2. **Página de admin** `/admin/prueba-mp` (detrás de `AdminGuard` y el layout de admin):
   - Brick de tarjeta + monto (default $100) → ruta `/api/subscriptions/test_no_plan` (sólo admin)
     que crea el preapproval sin plan con `external_reference: mptest:<uuid>` y muestra la respuesta cruda.
   - Botones: consultar (`GET /preapproval/{id}`), pausar, reactivar y cancelar (`PUT`, primero con
     `cancelled` y si falla con `canceled`).
   - Tabla con los eventos recibidos de `mptestevents` (topic, action, status, `external_reference`,
     monto, hora).
3. Al terminar se borra la página y la ruta. El desvío del webhook queda como base de la Fase 5.

#### Casos de prueba

| # | Dónde | Caso | Qué anotar |
|---|-------|------|------------|
| 1 | Producción, $100 | Alta autorizada con tarjeta real | Status de la respuesta, si trae `init_point`, qué eventos llegan y en qué orden (¿llega el `created`?), si `external_reference` viene en preapproval, authorized_payment y payment, cuánto tarda el primer cobro, si aparece el cobro de validación |
| 2 | Producción | Firma de cada evento | Que `x-signature` valide en los 3 topics |
| 3 | Producción | Pausar y reactivar por PUT | Status aceptado y evento recibido |
| 4 | Producción | Cancelar por PUT desde el server | Grafía aceptada, evento `updated` con `cancelled`, que no haya más cobros |
| 5 | Producción | 2–3 personas distintas pagan su propio preapproval de prueba | Que `payer_email` no tenga que coincidir con la cuenta de MP del que paga (la doc corta justo ahí) |
| 6 | Sandbox | Alta con tarjeta `OTHE` / `FUND` | Status del preapproval y de la cuota, eventos de rechazo y reintento |
| 7 | Sandbox | Alta en modo `pending` (plan B) | `init_point`, eventos después de pagar en MP |
| 8 | Producción, opcional | Dejar uno vivo hasta el segundo mes | Evento de la segunda cuota (`retry_attempt`, `next_payment_date`) |

Después se cancelan todos los de producción y se devuelven los $100 desde el panel de MP si hace falta.

#### Resultado

Una sección "Resultados de la Fase 0" en este archivo con los payloads reales y las respuestas a:
modo elegido (autorizado o pendiente), grafía de la cancelación, orden de eventos, si se puede confiar
en `external_reference` y cómo se detecta que MP terminó de reintentar (para la decisión G).

### Fase 1 — Base común (server)

1. **`Subscription`**: sumar
   - `kind`: `mp` (default, lo de hoy) | `carryover` (pack temporal de cambio de plan) | `friendGroup` | `gift`
   - `expiresAt?: Date`: sólo en las temporales
   - `payerUser?: ObjectId`: quién paga, cuando no es el titular (regalo, grupo)
2. **Helper `activeSubscriptionMatch()`** (`module_shared`): `status: 'authorized'` y
   (`expiresAt` inexistente o `> ahora`). Reemplaza el filtro en los 7 lugares de la tabla.
3. **`getActiveSubscriptions(userId)`**: leer desde `User.subscriptions` con el helper, en vez de
   filtrar por `external_reference`. Así ve las de grupo, las regaladas y las temporales.
4. **`resolveExternalReference(ref)`**: `<mongoId>` → usuario · `gift:<id>` → regalo ·
   `friendGroup:<id>` → grupo. Lo usan el webhook, las facturas y las notificaciones de pago.
   Si no matchea, se sigue tratando como hoy.
5. **`SubscriptionPlan.tokensCount`**: `getPlanGrossPubliciteTokens` lo lee primero, después el
   mapa de variables de entorno (que queda como respaldo) y después el default. Sumar el campo a `PLAN_FIELDS`.
6. Tests: límites con suscripción vencida, compartida y temporal, y tokens con `tokensCount`.

### Fase 2 — Packs de tokens y MB (+ arreglar la compra de packs)

- **Datos (admin):** crear en MercadoPago y en Mongo los packs nuevos con `isPack: true` y sólo el
  campo que suman (`tokensCount` o `storageBytesLimit`). Los MB ya se acumulan entre suscripciones (§6.1 de AGENTS.md).
- **Cliente:** el botón de `PackCard` lleva a `/suscribirse/:mpPreapprovalPlanId`, igual que un plan.
  La página `/packs-publicaciones` pasa a mostrar packs de anuncios, tokens y MB (agrupados o con un filtro).
  La tarjeta muestra qué suma cada pack.
- **Revisar:** que comprar un pack no pase por la lógica de "cambiar de plan" ni cancele el plan actual.

### Fase 3 — Cambio de plan con extra temporal

**Server**
- Mutation `changeSubscriptionPlan(previousSubscriptionId)` (`ClerkAuthGuard`). El cliente la
  llama **después** de que el alta del plan nuevo salió bien, en lugar de cancelar el plan viejo directo contra MP:
  1. Valida que la suscripción anterior sea del usuario, esté `authorized` y no sea gratuita, pack, de grupo ni regalada.
  2. La cancela en MercadoPago desde el server (`fetchToMp`; ya existe `changeSubscriptionStatusInMercadopago_fetch`, hoy comentado) y en la base.
  3. Si `nextPaymentDate > hoy`, crea la **suscripción temporal** (`kind: carryover`,
     `mpPreapprovalId: carryover:<idViejo>` para no duplicar, `subscriptionPlan` = plan viejo,
     `expiresAt` = `nextPaymentDate`) y la agrega a `User.subscriptions`. Todo en una transacción.
  4. **No** aplica downgrade, porque los límites siguen siendo los del plan viejo más los del nuevo.
- Webhook: cuando llega el `cancelled` de esa suscripción vieja, ya está cancelada → no hace nada nuevo.
- Las facturas y las notificaciones de pago ignoran las `carryover` (no tienen pago propio).

**Cómo se trata la temporal en el resto del sistema** (apunta al plan viejo, así que hay que
distinguirla por `kind: carryover` en todos los lugares que preguntan "¿qué plan tiene?")

| Lugar | Comportamiento |
|-------|----------------|
| Cálculo de límites (anuncios, contactos, blogs, MB, tokens) | **Cuenta.** Para eso existe. |
| `canSellPaidTickets` (Producciones) | Cuenta: el tiempo del plan viejo ya está pago. |
| `user_has_active_subscription` (decide el downgrade) | Cuenta. Si se rechaza el pago del plan nuevo mientras la temporal sigue viva, no hay downgrade (es coherente con la decisión de vencimiento). |
| "¿Tiene plan pago?" (regalos, Hacete Amigo, checkout de plan individual) | **No cuenta.** Es un extra, no un plan. |
| Facturas, notificaciones de pago, webhooks | La ignoran: no tiene pago propio. |
| Tokens: aporte a la bolsa comunitaria (`chatbot.token.repository` línea ~139) | **No cuenta**, para no acreditar dos veces el share del plan viejo en el mismo mes. |
| Cambiar de plan con una temporal viva | Se permite. Si vuelve al plan viejo, la temporal sigue hasta su vencimiento. No se encadenan temporales de temporales: sólo genera una la suscripción `kind: mp` que se cancela. |

**Validaciones en la UI**
- `getSubscriptionHistory` (y el tipo `Subscription` del cliente) devuelve `kind` y `expiresAt`.
- `checkIfUserIsSubscribed` ignora `kind: carryover`. Si no, el plan viejo aparece como "ya
  suscripto" en `/suscripciones` y la página `cambiarPlan` redirige.
- `AccountType` / `AccountTypeForm` / `ActionButtons`: el "plan actual" es la suscripción `mp` (o
  `gift` / `friendGroup`), nunca la temporal. La temporal no se puede cancelar ni cambiar desde ahí.
- Configuración > Suscripción: la temporal aparece aparte, como "Límites de tu plan anterior (X)
  hasta el dd/mm", sin botones.
- `ActivePostsCounter` y el Control de Consumo muestran el límite total y, si hay temporal, cuánto
  baja al vencer: "El dd/mm tu límite pasa a N".
- Checkout de cambio de plan: "Conservás los límites de tu plan actual hasta el dd/mm".

**Cliente**
- `Checkout` con `previousSubscriptionId` → llama a la mutation en vez de `editSubscription(... cancelled)`.
  Si la mutation falla, muestra el error y pide contactar a soporte (como hoy).

**Vencimiento** (sin tarea programada)
- El helper `activeSubscriptionMatch()` deja de contar la temporal desde `expiresAt`. No hay downgrade.
- Los anuncios de más quedan activos. Al crear un anuncio, `isThisUserAllowedToPost` ya lo
  rechaza (cuenta ≥ límite). Se cambia el mensaje del rechazo para que diga cuántos sobran:
  "Tenés N anuncios {libres|de agenda} activos y tu límite es M. Desactivá N − M + 1 para publicar
  uno nuevo." Lo mismo en el cliente antes de entrar a `/crear/anuncio` (`getPostAndContactLimit`).
- Mismo criterio para blogs de Producciones (el gate ya usa `available <= 0`) y contactos: se bloquea
  lo nuevo y se avisa cuántos sobran, sin tocar lo existente.

### Fase 4 — Regalar planes

**Server**
- Colección `planGifts`: `giver`, `recipient`, `subscriptionPlan`, `status`
  (`pending` → `active` → `cancelled`), `mpPreapprovalId`, fechas.
- Query `canReceivePlanGift(recipientId)`: rechaza si el destinatario tiene una suscripción paga
  activa (no gratuita, no pack), un regalo activo o un grupo de Hacete Amigo activo.
  Mensaje: "Este usuario ya tiene un plan".
- Mutation `createPlanGift(recipientId, planId)`: valida otra vez, rechaza packs (`isPack`) y
  planes gratuitos, y crea el regalo en `pending`. Devuelve el `giftId`.
- Mutation `cancelPlanGift(giftId)`: la pueden usar **quien regala y quien recibe**. Cancela en
  MercadoPago desde el server, marca el regalo y la suscripción como `cancelled` y aplica el downgrade
  al destinatario si no le queda otra suscripción paga. Avisa a la otra parte.
- El checkout crea el preapproval con `preapproval_plan_id` del plan y
  `external_reference: gift:<giftId>`.
- Webhook (alta): `resolveExternalReference` → regalo → crea la `Subscription` con `kind: gift`,
  `external_reference` = destinatario y `payerUser` = quien regala, la agrega a
  `User.subscriptions` del **destinatario** y pasa el regalo a `active`. Si el destinatario ya
  consiguió un plan mientras tanto, la deja igual (se acumula) y avisa en el log.
- Pago rechazado o cancelación: misma lógica de hoy, con el downgrade sobre el destinatario.
- Facturas: a nombre de quien paga (`payerUser`). El panel de admin muestra las dos personas.

**Notificaciones** (discriminator nuevo `NotificationPlanGift`, mismo patrón que `NotificationProductionTicket`)
- Destinatario: "X te regaló el plan Y". También cuando quien regala lo cancela o deja de pagarlo.
- Quien regala: pago rechazado, y cuando el destinatario lo cancela.

**Cliente**
- Sección "Regalar un plan" en `/suscripciones`: buscador de usuarios (se reutiliza el de perfiles),
  elección del plan, chequeo `canReceivePlanGift` antes de pagar y checkout con el mismo Brick.
- El selector de planes muestra sólo planes pagos (sin packs ni gratuito).
- En la configuración de quien regala: lista de regalos activos, con opción de cancelar.
- En la del destinatario: "Plan regalado por X", con opción de cancelar ("X va a dejar de pagarlo").

### Fase 5 — Hacete Amigo (después de la Fase 0)

**Módulo nuevo** `server/src/contexts/module_friend_plan/friendGroup/`, con las 3 capas
(`domain`, `application`, `infraestructure`), DI por token y adapter.

**Entidad `FriendGroup`** (colección `friendgroups`)
- `creator`, `subscriptionPlan`, `members[]` (`user`, `status`: `invited` | `accepted`, `joinedAt`), `payer`
- `inviteCode`: código aleatorio para el link de invitación (índice único). Se puede regenerar, y
  el código anterior deja de servir.
- `status`: `forming` → `paying` → `active` ⇄ `paymentFailed` → `cancelled`
- Snapshot al pagar: `memberCount`, `discountPercent`, `pricePerMember`, `totalAmount`
- `mpPreapprovalId`, `subscription` (ref a la `Subscription` compartida), `cancelReason`, fechas

**Configuración** (`module_shared/friend-plan/friend.plan.config.ts`, env vars como los límites de Producciones)
- `FRIEND_PLAN_DISCOUNT_TIERS` = `{"2":15,"3":20,"4":25,"5":30}`: el descuento de N miembros es el
  del mayor tramo ≤ N.
- `FRIEND_PLAN_MAX_DISCOUNT` = `30`: tope final.
- `FRIEND_PLAN_MIN_MEMBERS` = `2`; `FRIEND_PLAN_MAX_MEMBERS` = `0` (sin tope).
- Precio: `totalAmount = round(N × plan.price × (1 − descuento))`, calculado **siempre en el server**.

**Flujo**
1. **Crear:** un usuario elige un plan pago y arma el grupo (queda como primer miembro `accepted`).
2. **Invitar**, de dos formas:
   - **Buscador** de usuarios registrados → notificación de invitación → el invitado acepta o rechaza.
   - **Link de invitación** `/hacete-amigo/unirse/:inviteCode`, para compartir por WhatsApp o donde sea:
     - Con sesión iniciada: muestra el grupo (quién invita, plan, precio por persona) y el botón "Sumarme".
     - Sin cuenta: la ruta es pública. "Sumarme" lleva a `registrarse` con `redirect_url` de vuelta al
       link. El código pasa por el onboarding (el `proxy.ts` fuerza el onboarding, así que hay que
       conservar la `redirect_url` hasta el final) y al volver se une al grupo.
     - Entrar por link equivale a aceptar: queda `accepted` sin un paso extra.
     - El link deja de servir cuando el grupo pasa a `paying`, se cancela o llega al máximo de miembros.
       La página lo explica.
3. **Validaciones al aceptar** (y otra vez al pagar): no tener plan pago individual activo (mensaje:
   "Primero cancelá tu plan actual"), ni regalo activo, ni otro grupo `forming` o `active`. Respetar el máximo de miembros.
4. **Activación:** cada miembro cumple si tiene ≥ 1 en `User.posts` o en `User.productions`. Se calcula al leer, no se guarda.
5. **Pagar:** el botón se habilita cuando hay ≥ `MIN_MEMBERS` aceptados y todos cumplen la activación. Cualquier miembro puede pagar:
   - Query `getFriendGroupCheckout(groupId)`: valida todo y devuelve el monto.
   - La ruta de Next que crea el preapproval **no toma el monto del body**: lo pide al server.
     Preapproval sin plan con `external_reference: friendGroup:<id>`.
   - El grupo pasa a `paying` y se congela: no se puede invitar ni salir sin cancelar.
6. **Webhook (alta):** `friendGroup:` → valida que `transaction_amount` coincida con `totalAmount` (si
   no coincide, cancela en MP y avisa). Crea **una** `Subscription` (`kind: friendGroup`,
   `subscriptionPlan` = plan del grupo, `payerUser` = quien pagó) y la agrega a `User.subscriptions`
   de **cada miembro**. Grupo → `active`. Cada miembro recibe los límites completos del plan.
7. **Pago rechazado** (decisión G):
   - **Primer rechazo:** la suscripción compartida se **pausa** (lógica de hoy), así que todos pierden
     el plan juntos mientras MP reintenta (hasta 4 veces en 10 días). El grupo pasa a `paymentFailed`.
     El downgrade (`downgrade_plan_post` / `downgrade_plan_contact`) se emite **por cada miembro** sin
     otra suscripción paga. Se avisa a todos y, a quien paga, se le pide revisar la tarjeta.
   - **Un reintento sale bien:** la suscripción vuelve a `authorized` (lógica de hoy para las pausadas),
     el grupo vuelve a `active` y se avisa a todos. Los anuncios desactivados por el downgrade no se
     reactivan solos (igual que hoy).
   - **MP no logra cobrar** (la cuota termina rechazada después de los reintentos, o MP da de baja la
     suscripción): el server cancela el preapproval en MP si sigue vivo, y el grupo y la suscripción
     pasan a `cancelled`. Se avisa a todos.
   - Cómo se detecta "terminó de reintentar" sale de la Fase 0 (caso 6: `retry_attempt` y estado
     final de la cuota). Si no se puede detectar, un tope propio: 10 días en `paymentFailed` →
     se cancela al leer el grupo.
8. **Alguien se baja** (o borra su cuenta) con el grupo `active`: el server cancela el preapproval en
   MP, marca la suscripción y el grupo como `cancelled`, aplica el downgrade a cada miembro y avisa a todos.
   Con el grupo en `forming`, salir sólo lo saca del grupo.
9. **Simetría:** mientras está en un grupo activo, el usuario no puede contratar un plan individual
   (el checkout lo bloquea con el mismo mensaje).

**API (GraphQL, `ClerkAuthGuard`, permisos validados contra el grupo guardado)**
- `createFriendGroup(planId)`, `inviteToFriendGroup(groupId, userId)`, `respondFriendGroupInvitation(groupId, accept)`
- `getFriendGroupByInviteCode(code)` (`ClerkAuthGuardOptional`: datos públicos mínimos del grupo, sin
  la lista completa de miembros), `joinFriendGroupByInviteCode(code)`, `regenerateFriendGroupInviteCode(groupId)` (creador)
- `leaveFriendGroup(groupId)`, `removeFriendGroupMember(groupId, userId)` (sólo el creador y sólo en `forming`)
- `getMyFriendGroup`, `getFriendGroupCheckout(groupId)`, `getFriendPlanPricing(planId)` (tabla de precios para la UI)

**Notificaciones** (discriminator `NotificationFriendGroup`): invitación, aceptó o rechazó, "ya pueden
pagar", plan activo, pago rechazado, grupo cancelado (con el motivo).

**Cliente**
- `/suscripciones/hacete-amigo`: mensaje de bienvenida y tabla de descuentos calculada con la
  configuración real para el plan elegido. Botón "Armar mi grupo".
- Página pública `/hacete-amigo/unirse/[code]` (sumarla a las rutas públicas de `proxy.ts`).
- Panel del grupo: miembros con su estado (invitado / aceptó / ya publicó), buscador para invitar,
  link de invitación con botón de copiar y compartir (se reutiliza `ShareLinkButton`) y opción de regenerarlo,
  precio por persona y total actualizados, botón de pago (deshabilitado con el motivo) y botón "Salir del grupo" con
  advertencia ("se cancela el plan para todos").
- Cadena Action → Service → GraphQL, como el resto (`friendGroupActions.ts`, etc.).

**Tests**
- Link de invitación: unirse con sesión, código regenerado, grupo lleno o en `paying`.
- Cálculo de descuento (tramos, tope, máximo de miembros), validaciones de ingreso, activación por
  anuncio o producción, webhook de alta, monto que no coincide, rechazo y salida de un miembro con
  downgrade de todos.

### Fase 6 — Documentación y textos

- Glosario de Cubito (`GLOSSARY` en `chatbot.ai.service.ts`) **y** `GlosaryModal.tsx`: Hacete Amigo,
  regalar planes, packs de tokens/MB y extra temporal al cambiar de plan.
- `AGENTS.md`: módulo nuevo, `Subscription.kind`, `resolveExternalReference`, helper de suscripción activa y config.

---

## 4. Orden y dependencias

```
Fase 0 (validar MP) ───────────────────────────────┐
Fase 1 (base) ─┬─ Fase 2 (packs)                   │
               ├─ Fase 3 (cambio de plan)          │
               ├─ Fase 4 (regalo)                  │
               └───────────────────────────────────┴─ Fase 5 (Hacete Amigo)
                                                      Fase 6 (docs, al cerrar cada fase)
```

La Fase 0 se puede hacer en paralelo con la 1–4, que no la necesitan.

---

## 5. Decisiones tomadas

- **A. Pack temporal de cambio de plan:** apunta directo al plan viejo (`kind: carryover`), sin
  packs ocultos. Cómo se trata en cada lugar y en la UI: ver Fase 3.
- **B. Vencimiento del extra temporal:** no hay downgrade ni tarea programada. Los anuncios de más
  quedan activos, pero no se pueden crear nuevos y se le dice al usuario cuántos tiene de más.
- **C. Regalar packs:** no. Sólo planes, y nunca a alguien que ya tiene plan.
- **D. Cancelar un regalo:** lo pueden cancelar quien regala y quien lo recibe.
- **E. Invitar a gente sin cuenta en Hacete Amigo:** sí, con un link de invitación que sirve
  después del registro (ver Fase 5).
- **F. Cancelación normal (sin cambio de plan):** queda como hoy. El extra es sólo para el cambio de plan.
- **G. Pago rechazado en Hacete Amigo:** con el primer rechazo se pausa el plan para todos. Si MP
  logra cobrar en un reintento, vuelve. Si no lo logra, se cancela el grupo (ver Fase 5, paso 7).
