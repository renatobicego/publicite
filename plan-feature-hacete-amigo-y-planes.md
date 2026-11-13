# Plan de desarrollo — Hacete Amigo, cambio de plan, packs y regalo de planes

> **Versión definitiva (2026-11-11).** Reemplaza la del 7/11. Junta cuatro fuentes:
> - la reunión con Renato del 5/11 ([Fathom](https://fathom.video/calls/891179332)),
> - el documento del cliente "Soon Publicité – Requerimientos y Presupuesto - post D3 y D4 (resumen)", con los comentarios de Miguel,
> - el plan anterior de Renato (7/11),
> - una revisión del código actual del 11/11. Lo que se encontró está en §2; cada afirmación tiene archivo y línea.
>
> Las partes que dependen de una pregunta abierta están marcadas con **[P#]**. Las preguntas están en §7.
>
> **Fuera por ahora:** nombres nuevos de planes (incluido el plan Prueba de 1 USD), Gold anual "10/12",
> API de dólar, premios por invitaciones (5 amigos = Premium 6 meses, 10 = Gold), enviar tokens a un
> amigo y "cada uno paga su parte".
>
> **Ítems del presupuesto que cubre:** Planes (nombres, cambio de plan, packs) 10 h, Hacete amigo 35 h,
> Regalo de planes 10 h.
>
> **Branch:** todo (fases 0 a 6) va en `feature/hacete-amigo`, creada desde `main`. Se integra por PR.

---

## 1. Definiciones acordadas

**Hacete Amigo**
- Es un grupo **propio del plan**, no el `Group` de la app.
- **Uno paga por todos.** Hay un solo cobro mensual por débito automático, y lo puede hacer cualquier miembro.
- Vale sólo para **planes pagos mensuales**: no packs, no gratuito, no anuales.
- **Descuento según la cantidad de miembros**, tomado de la tabla del cliente:

  | Miembros | Descuento | Mensaje |
  |---|---|---|
  | 2 | 15 % | Sumá a un amigo y ahorran 15 % |
  | 3 | 20 % | De a 3, 20 % para cada uno |
  | 4 | 25 % | 4x3: pagan 3, rinden 4 |
  | 5 o más | 30 % | De a 5, 30 % para todos |

  El tope es 30 %. La tabla y el tope son configurables. **No hay máximo de miembros**; queda una
  variable por si alguna vez hace falta ponerlo.
- El descuento es **para siempre**, no por un tiempo. Lo dijo Renato en la reunión del 5/11.
- El grupo **queda fijo** una vez pagado:
  - Si alguien se baja, se cancelan el grupo y el plan para todos.
  - Si MP no logra cobrar después de sus reintentos, también se cancela para todos.
- Para que se habilite el pago, **cada miembro** (incluido el que creó el grupo) tiene que haber
  publicado al menos un anuncio o una producción. Si ya tenía uno, no hace falta publicar otro.
- **Es para quien no tiene plan.** Quien tiene un plan pago, propio o regalado, no puede sumarse:
  primero tiene que cancelarlo.
- Se invita de dos formas: con el buscador de usuarios registrados y con un **link de invitación**,
  que también sirve para quien todavía no tiene cuenta.
- Mensaje de bienvenida, adaptado a "uno paga por todos": *"Armá tu grupo y pagá menos. De a 4, pagan
  3 y rinden 4. Uno paga por todos con débito automático y se olvidan de los vencimientos."*

**Cambio de plan**
- Al cambiar de plan, tanto al subir como al bajar, el usuario conserva **todos** los límites del plan
  viejo (anuncios, contactos, blogs, MB y tokens) hasta su próximo cobro (`nextPaymentDate`).
  Ejemplo del cliente: le quedaban 4, compra 10, tiene 14 hasta fin de mes y después vuelve a 10.
- Se resuelve con una **suscripción temporal interna** (`kind: carryover`) que apunta al plan viejo.
  No tiene cobro ni suscripción en MP. Nunca hay dos suscripciones de MP a la vez.
- Al vencer, los límites bajan solos. Los anuncios que sobran **quedan activos**, pero el usuario no
  puede crear más hasta estar por debajo del límite. El sistema le dice cuántos le sobran.
- La cancelación normal (sin cambio de plan) sigue como hoy: los límites bajan en el momento y los
  anuncios no se desactivan.

**Packs**
- Siguen funcionando como hoy: planes `isPack` que se cobran por suscripción de MP.
- Se suman packs de **tokens** y de **MB** **[P6]**.
- Los tokens de cada plan pasan a un campo en Mongo (`SubscriptionPlan.tokensCount`).

**Regalar planes** (decidido el 12/11: va lo que pidió el cliente)
- Quien regala elige un plan pago mensual y **cuántos meses** regala: 1, 2, 3 o 5, como dice el
  documento del cliente. Paga **una sola vez** el precio mensual × los meses. No hay débito
  automático: funciona como una gift card.
- El regalo se asigna de una de dos formas:
  - **A alguien que ya tiene cuenta:** quien regala lo busca con el buscador de usuarios y el regalo
    queda asignado a esa cuenta. Al destinatario le llega una notificación y lo activa con un botón.
  - **A alguien sin cuenta:** quien regala carga el **email** del destinatario y recibe un link con el
    código para mandárselo. Cuando esa persona se registra con ese email, el regalo aparece en su
    cuenta para activarlo.
- Los meses empiezan a contar cuando el destinatario lo activa. Al terminar, el plan vence solo y la
  cuenta vuelve al gratuito.
- Sólo se regalan planes, no packs, y nunca a quien ya tiene plan.
- Los admins ven un registro de todos los regalos, con su código.

---

## 2. Lo que hay hoy (verificado en el código, 2026-11-11)

| Tema | Hoy | Impacto |
|------|-----|---------|
| Alta de suscripción | El navegador manda `userId` y `auto_recurring` (con el monto) a [process_payment/route.ts](client/src/app/api/subscriptions/process_payment/route.ts). La ruta es pública (`proxy.ts:10`), no mira la sesión, crea el preapproval con `preapproval_plan_id` y **descarta el id** que devuelve MP. | El monto y el usuario no se pueden tomar del navegador. Un preapproval sin plan termina en "Plan not found" (`mp-subscription.service.ts:69-74`) y MP reintenta sin fin. → **Decisión H** |
| Alta en el webhook | En producción MP no manda `created`: el alta entra por `updated` desde `be60b11f`. Si llega un `created` duplicado, el índice único da E11000 → 500 → MP reintenta. | Registrar en el momento de crear y dejar el webhook como respaldo, idempotente. |
| Modificar o cancelar | [update/route.ts](client/src/app/api/subscriptions/update/route.ts) cancela o cambia la tarjeta de **cualquier** `mpPreapprovalId` sin chequear de quién es, y manda `external_reference` = email del usuario (línea 19). El `updated` del server copia ese valor al documento (`mp-subscription.service.ts:197`). `editSubscription` nunca lanza, así que el `.catch` de `Checkout`, `ActionButtons` y `ChangePaymentMethodCheckout` es código muerto: siempre se muestra "éxito". | Un cambio de tarjeta rompería las referencias `gift:` y `friendGroup:`. → mutations en el server que validan quién es el dueño. |
| Suscripción activa | El literal `status: 'authorized'` aparece en 7 lugares: `user.repository.ts` líneas 322, 353, 390 y 460; `chatbot.token.repository.ts` líneas 50 y 139; `mp-subscription.repository.ts` línea 79. | Un solo helper que además mire `expiresAt`. |
| `getActiveSubscriptions` | Hace `find({ status: 'authorized', external_reference })` (`mp-subscription.repository.ts:76-86`). Decide si se aplica el downgrade y qué se cancela al borrar una cuenta. | No ve las suscripciones compartidas, regaladas ni temporales. |
| Historial (`GET /subscription/:_id`) | Es REST con `ClerkAuthGuard`, pero **no valida que el `_id` sea el del usuario**. Filtra por `external_reference` o `FREE`, y `makeResponsePlan.ts` arma "plan principal + packs". En el cliente, el "plan actual" es el primer no-pack que aparece (`Profile/actions.ts:124-143`), en Redux, y se pide **una sola vez por sesión**. | Leer desde `User.subscriptions`, devolver `kind` y `expiresAt`, separar la temporal y refrescar Redux después de cada cambio. |
| Downgrade | Sólo se dispara por **pago rechazado** (`mpHandlerFETCHEvents.ts:358-403`) y sólo para el `external_reference`. Cancelar o pausar por el webhook de preapproval no baja nada. Reactivar no devuelve anuncios. Un pago aprobado con `retry_attempt = 0` deja la suscripción en `paused`. | En suscripciones compartidas hay que recorrer los miembros (o el destinatario) y arreglar la reactivación. |
| Cambio de plan | [Checkout.tsx](client/src/app/suscribirse/[planId]/Checkout.tsx) crea el plan nuevo y cancela el viejo desde el cliente. Si la cancelación falla, igual muestra éxito y quedan **dos planes cobrándose**. La página `cambiarPlan` toma el id de la suscripción de la URL y no valida que sea del usuario. | Hacerlo en el server, en una sola llamada. |
| Compra de packs | El botón de [PackCard](client/src/app/(root)/(subscripciones)/components/PackCard.tsx) no hace nada. Además, `/suscribirse/[planId]/page.tsx:36-43` manda a `cambiarPlan` a quien ya tiene un plan pago **aunque esté comprando un pack**, y eso le cancelaría el plan. Hay 3 packs en la base que apuntan a planes cancelados o mal cargados en MP. | Arreglar la redirección y los datos. |
| Fechas | `parseTimeX` suma `frequency` **días**, así que en un plan mensual `endDate` queda en el día siguiente. `nextPaymentDate` es el string crudo de MP. `LimitPosts` muestra "Disponible hasta `endDate`". | Para el tiempo restante usar `nextPaymentDate`, y corregir ese texto. |
| Tokens | Salen de `CHATBOT_TOKENS_PLAN_MAP` (env), que busca por id de MP o por `reason`. Un pack sin mapping da 0; un plan pago sin mapping da 1000. La cuota se arma con `User.subscriptions`, así que cada titular recibe el neto completo. La bolsa comunitaria cuenta **documentos** autorizados (`chatbot.token.repository.ts:137-153`). | Pasar a `tokensCount`. La temporal queda fuera de la bolsa. |
| Cálculo de límites | `calculatePostLimitAndContactLimit.ts` suma `postsLibresCount`, `postsAgendaCount` y `maxContacts` sin `?? 0`. | Un pack de tokens o de MB que no traiga esos campos daría `NaN` en los anuncios. |
| Pagos chicos | `is_a_card_validation` ignora todo pago de ≤ $50 (`mpHandlerFETCHEvents.ts:596-612`). | El monto con descuento siempre tiene que superar los $50. |
| Pagos devueltos | `update_payment` valida contra la lista de estados equivocada: `refunded` y `cancelled` responden 500 en loop. | Las devoluciones de las pruebas de la Fase 0 entrarían en loop. |
| Registro | El `redirect_url` se pierde en tres lugares: la env `SIGN_UP_FORCE_REDIRECT_URL=/onboarding`, el proxy (que redirige a `/onboarding` sin query) y `(clerk)/layout.tsx` (que manda a `/`). | El link de invitación no puede depender del `redirect_url`. → **Decisión L** |
| Notificaciones | Las que crea el server no llegan por socket: se ven al volver a pedir la lista. El cliente elige el componente buscando un substring en `event` (`NotificationRenderer.tsx:46-55`), así que el orden importa. Los campos nuevos de `frontData` se agregan a mano en `getAllNotificationsQuery`. | Nombres de evento sin `payment`, `share`, `notification_group`, `notification_user` ni `magazine`. |
| Invitaciones de grupo | Pasan por el servidor de sockets externo y no validan quién invita. | No clonarlas. → **Decisión M** |
| Borrado de cuenta | El webhook de Clerk hace una cadena de DELETE. `deleteSubscription` cancela en MP dentro de un `forEach(async)` sin `await`. | Cubrir grupo y regalos, y esperar a MP. |
| Plan gratuito | Es **un único documento `Subscription` compartido**: su id está hardcodeado en `UserFactory` y figura en las `subscriptions` de todos los usuarios. | Es el precedente de la suscripción compartida de Hacete Amigo. |
| Tareas programadas | No hay (Firebase Functions). | Los vencimientos se evalúan al leer. |

Lo que el plan anterior daba por cierto y **sí se confirmó**:
- los 7 filtros por `authorized`;
- `getActiveSubscriptions` filtra por `external_reference`;
- `parseTimeX` suma días;
- el botón de `PackCard` no tiene link;
- los tokens salen de la env;
- la regla de ≤ $50;
- la cancelación se hace desde el cliente;
- `User.productions` existe;
- la firma `x-signature` ya se valida (`mp.handler.validations.ts`).

---

## 3. Fases

### Fase 0 — Validar MercadoPago (bloquea la Fase 5)

Objetivo: confirmar cómo se comporta un **preapproval sin plan asociado** antes de construir encima.

#### Lo que ya se sabe

- **Documentación** ([pago autorizado](https://www.mercadopago.com.ar/developers/es/docs/subscriptions/integration-configuration/subscription-no-associated-plan/authorized-payments), [pago pendiente](https://www.mercadopago.com.ar/developers/en/docs/subscriptions/integration-configuration/subscription-no-associated-plan/pending-payments), [PUT](https://www.mercadopago.com.ar/developers/en/reference/online-payments/subscriptions/update-preapproval/put)):
  - **Modo autorizado:** `status: "authorized"` + `card_token_id`, con el mismo Brick que usamos hoy. Es el que vamos a usar.
  - **Modo pendiente:** sin tarjeta, devuelve un `init_point`. Queda como plan B.
  - En una suscripción sin plan son obligatorios `reason`, `external_reference`, `payer_email` y `auto_recurring` (`frequency: 1`, `frequency_type: "months"`, `transaction_amount`, `currency_id: "ARS"`).
  - Una cuota rechazada se reintenta hasta **4 veces en 10 días**. Después de **3 cuotas rechazadas**, MP da de baja la suscripción solo.
- **Ya probado en producción:** MP **no manda** el evento `created` de `subscription_preapproval`; el alta llega por `updated`. Con la decisión H esto deja de importar, porque el alta se registra al crear.
- **`external_reference`:** hay [un caso real](https://github.com/FedericoDeniard/Receiptle/pull/206) en el que MP no lo propaga. Como el server guarda el `mpPreapprovalId` en el momento de crear (decisión H), el webhook resuelve por id aunque falte la referencia.
- **Sandbox:** hacen falta un vendedor **y** un comprador de prueba del mismo país ([caso real](https://github.com/Matitisco/iManager/pull/384)). El nombre del titular de la tarjeta define el resultado: `APRO` aprobado, `OTHE` rechazado, `FUND` sin fondos.

#### Lo que hay que construir para la prueba

1. **`FetchToMpInterface.createPreapproval(body)`** (`POST /preapproval` desde el server). Es la misma pieza que usa la Fase 1, así que no se descarta.
2. **Webhook tolerante:** las `external_reference` que empiezan con `mptest:` guardan el payload completo en la colección `mptestevents` y responden 200, sin tocar usuarios ni límites. Esto queda como la base del enrutamiento por referencia de la Fase 1.
3. **Arreglo de `update_payment`** (estados `refunded` y `cancelled`), para que las devoluciones de las pruebas no queden en loop.
4. **Página de admin `/admin/prueba-mp`** (detrás de `AdminGuard`), que llama a mutations del server (`AdminGuard`):
   - Brick de tarjeta + monto (default $100) → `createMpTestPreapproval`, con `external_reference: mptest:<uuid>`. Muestra la respuesta cruda.
   - Botones para consultar (`GET /preapproval/{id}`), pausar, reactivar y cancelar (`PUT`; primero con `cancelled` y, si falla, con `canceled`).
   - Tabla con los eventos de `mptestevents`.
   - Un botón de **pago único** de $100 (`POST /v1/payments`, `mptest:`), para el regalo de planes.
5. Al terminar se borra la página. Las piezas 1, 2 y 3 quedan.

#### Cómo se prueba (decidido el 12/11)

1. **Primero en local, con el sandbox de MP.**
   - Maxi tiene acceso a la cuenta de MP de Soon. Desde el panel de desarrolladores ("Cuentas de prueba") crea un **vendedor** y un **comprador** de prueba.
   - El server y el cliente locales usan las credenciales del vendedor de prueba. No sirven las de `client/.env.local`, que son de otra cuenta.
   - El comprador paga con tarjetas de prueba (`APRO`, `OTHE`, `FUND`).
   - Los webhooks llegan al server local por un túnel (cloudflared o ngrok) configurado en la app de prueba, con su propia clave en `SECRET_KEY_MP_WEBHOOK`.
   - El monto tiene que ser de más de $50. Si no, el webhook lo toma como validación de tarjeta y lo ignora.
2. **Después, a producción con montos chicos ($100), sólo para lo que el sandbox no confirma.**
   - Paga Maxi con su tarjeta y devuelve el cobro desde el panel de MP.
   - El sandbox de suscripciones de MP es inestable: exige que el pagador sea el comprador de prueba y no siempre manda todos los eventos. Por eso los casos marcados como Producción no se dan por buenos con el sandbox.

#### Casos de prueba

| # | Dónde | Caso | Qué anotar |
|---|-------|------|------------|
| 1 | Local, después producción ($100) | Alta autorizada | Status de la respuesta, si devuelve `init_point`, qué eventos llegan y en qué orden, si `external_reference` viene en preapproval, authorized_payment y payment, cuánto tarda el primer cobro y si hay cobro de validación |
| 2 | Producción | Firma de cada evento | Que `x-signature` valide en los 3 topics |
| 3 | Local, después producción | Pausar y reactivar por PUT | Status aceptado y evento que llega |
| 4 | Local, después producción | Cancelar por PUT desde el server | Grafía aceptada, evento `updated` con `cancelled`, que no haya más cobros |
| 5 | Producción | Pagar con un `payer_email` distinto del de la cuenta de MP de la tarjeta | Que MP lo acepte: en Hacete Amigo paga cualquier miembro |
| 6 | Local (sandbox) | Alta con tarjeta `OTHE` y `FUND` | Status del preapproval y de la cuota, eventos de rechazo y reintento (`retry_attempt`) |
| 7 | Local (sandbox) | Alta en modo `pending` (plan B) | `init_point` y eventos después de pagar en MP |
| 8 | Producción, opcional | Dejar uno vivo hasta el segundo mes | Evento de la segunda cuota |
| 9 | Local, después producción | Devolver un cobro | Evento `payment.updated` `refunded` → 200 |
| 10 | Local, después producción | Pago único de $100 (regalo) | Respuesta en el momento, evento `payment`, `external_reference`, devolución |

Al terminar, se cancelan todos los de producción y se devuelven los cobros.

**Resultado:** una sección "Resultados de la Fase 0" en este archivo, con los payloads reales y estas definiciones:
- modo elegido;
- grafía de la cancelación;
- orden de los eventos;
- si se puede confiar en `external_reference`;
- cómo se detecta que MP terminó de reintentar (paso 7 de la Fase 5).

### Fase 1 — Base común y arreglos previos

Todo lo que necesitan las fases 2 a 5. Incluye arreglos de bugs que los flujos nuevos van a destapar.

**Modelo (server)**
1. **`Subscription`** suma tres campos:
   - `kind`: `mp` (default, lo de hoy) | `carryover` | `friendGroup` | `gift`.
   - `expiresAt?: Date`. Sólo lo tienen las temporales y los regalos.
   - `payerUser?: ObjectId`: quién paga. Se carga en todas las suscripciones nuevas; en las anteriores se usa `external_reference`. Lleva índice.
2. **Helper `activeSubscriptionMatch()`** en `module_shared/subscriptions/`: `{ status: 'authorized', $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }`. Es una función, para que la fecha se evalúe en cada llamada. Reemplaza los 7 filtros de §2. En `chatbot.token.repository.ts:139` además excluye `kind: carryover`.
3. **Lecturas por titular:**
   - `getActiveSubscriptions(userId)` lee desde `User.subscriptions` con el helper.
   - `hasPaidPlan(userId)` = activa, plan `!isFree && !isPack`, `kind ≠ carryover`. Es la pregunta "¿tiene un plan pago?" que hacen los regalos, Hacete Amigo y el checkout individual.
   - `user_has_active_subscription` pasa a usar `getActiveSubscriptions`.
4. **`resolveExternalReference(ref)`**: `<mongoId>` → usuario · `gift:<id>` → regalo · `friendGroup:<id>` → grupo · `mptest:<uuid>` → prueba. La usa el webhook para:
   - dar de alta si falta;
   - decidir a quién se le aplica el downgrade (el que paga, cada miembro o el destinatario);
   - notificar;
   - armar la factura, cuyo `external_reference` es siempre el `payerUser`, para que aparezca en "Mis pagos" y en el panel de admin con los datos del usuario.

   `Subscription.external_reference` guarda el valor crudo que tiene MP.

**Checkout por el server (decisión H)**

5. Mutation **`startSubscriptionCheckout(input)`** (`ClerkAuthGuard`, en el módulo de mercadopago):
   - **Input:** `planId` (`_id` de Mongo), `cardTokenId`, `payerEmail`, `replacesSubscriptionId?` (Fase 3) y `friendGroupId?` (Fase 5).
   - El usuario sale del token, y el plan y el monto los decide el server. **Nada se toma del navegador.**
   - Llama a `POST /preapproval`: con `preapproval_plan_id` para planes y packs, sin plan para Hacete Amigo.
   - **Registra la `Subscription` en el momento**, con el id y el status de la respuesta, y la agrega a `User.subscriptions`, todo en una transacción. El webhook sólo actualiza el estado; si la suscripción falta, la registra como respaldo.
   - Valida que quien compra un plan individual no tenga ya un plan pago (salvo que esté cambiando de plan), que no esté en un grupo activo y, si es un pack, que el plan sea `isPack` y que no tenga ya ese mismo pack activo. Esta última regla hoy la aplica la página de checkout (`page.tsx:22`).
   - Devuelve `{ subscriptionId, status }`. El cliente muestra éxito sólo si no hubo error.
6. Mutations **`cancelMySubscription(subscriptionId)`** y **`updateMySubscriptionCard(subscriptionId, cardTokenId)`**. Las dos validan que la suscripción sea del usuario y esperan la respuesta de MP.
7. **Cliente:**
   - `Checkout`, `ChangePaymentMethodCheckout` y `ActionButtons` pasan a usar estas mutations, con la cadena Action → Service → GraphQL.
   - Se borran `api/subscriptions/process_payment`, `api/subscriptions/update` (y los `route 2.ts` duplicados), y `/api/subscriptions(.*)` sale de las rutas públicas. Con eso desaparece el bug de `external_reference = email`.
   - El slice de suscripciones de Redux suma una acción para refrescar, que se llama después de comprar, cancelar o cambiar de plan.
   - El tipo `Subscription` suma `kind`, `expiresAt` y `payerUser`.

**Historial**

8. `GET /subscription/:_id`:
   - Usa el usuario del token, no el parámetro.
   - Lee desde `User.subscriptions`.
   - Devuelve `kind`, `expiresAt` y `payerUser`.
   - `makeResponsePlan` devuelve la temporal en una lista aparte (`carryover[]`) y nunca la elige como plan principal.

**Tokens**

9. **`SubscriptionPlan.tokensCount`** (tokens brutos por mes):
   - `getPlanGrossPubliciteTokens` lo lee primero, después `CHATBOT_TOKENS_PLAN_MAP` (que queda de respaldo) y por último el default.
   - Se suma a `PLAN_FIELDS` (`chatbot.token.repository.ts:22`).
   - `aiTokensPerMonth` de la respuesta de planes sigue funcionando: se calcula a partir de ese número.
   - Los valores actuales de la env se cargan en cada plan como dato.

**Arreglos del webhook y de los límites**

10. Alta idempotente: si la suscripción ya existe, se actualiza en vez de fallar con E11000.
11. Cualquier pago aprobado reactiva una suscripción `paused`. Hoy sólo lo hace si `retry_attempt > 0`.
12. `await` en las notificaciones del handler (líneas 194, 216, 397, 426 y 475). En Firebase, lo que no se espera se corta.
13. `?? 0` en `calculatePostLimitAndContactLimit.ts`.
14. `deleteSubscription` (borrado de cuenta) espera a MP y cubre los casos nuevos:
    - grupo de Hacete Amigo → se cancela para todos;
    - regalos y temporales → se saltean, porque no tienen suscripción en MP. Los regalos ya pagados siguen valiendo para quien los recibió.

**Tests**

15. Cubren:
    - límites con suscripción vencida, compartida y temporal;
    - tokens con `tokensCount`;
    - validaciones del checkout, incluido un `userId` o un monto ajeno;
    - enrutamiento por `external_reference`;
    - alta duplicada;
    - reactivación con `retry_attempt = 0`.

### Fase 2 — Packs de tokens y MB (y arreglar la compra de packs)

**Datos (admin)**
- Corregir los packs que apuntan a planes cancelados o mal cargados en MP: Pack Más 2 mensual, Pack Más 40 trimestral y Pack Más 2 trimestral, que tiene el id del mensual. Los planes de más de un mes se crean **por API** como N meses, nunca desde el panel de MP.
- Crear en MP y en Mongo los packs nuevos (según lo que conteste el cliente, §8), con `isPack: true`, el campo que suman (`tokensCount` o `storageBytesLimit`) y 0 en el resto.

**Cliente**
- El botón de `PackCard` lleva a `/suscribirse/:mpPreapprovalPlanId`.
- **Arreglo:** `/suscribirse/[planId]/page.tsx` manda a `cambiarPlan` sólo si el plan de destino **no** es pack.
- `/packs-publicaciones` muestra los packs agrupados (anuncios / tokens / MB) y recibe los packs que ya tiene el usuario (hoy pasa `[]`). La tarjeta dice qué suma cada pack.
- `LimitPosts` muestra "Se renueva el `nextPaymentDate`" en vez de "Disponible hasta `endDate`".

**Server:** comprar un pack nunca pasa por la lógica de cambio de plan ni toca el plan actual. Lo valida `startSubscriptionCheckout`.

### Fase 3 — Cambio de plan con extra temporal

**Server:** `startSubscriptionCheckout` con `replacesSubscriptionId`. Cuando MP aceptó el plan nuevo:
1. Valida que la suscripción anterior sea del usuario, esté `authorized`, tenga `kind: mp` y no sea gratuita ni pack.
2. La cancela en MP desde el server (`changeSubscriptionStatusInMercadopago_fetch`, con `await`) y en la base.
   - Si MP falla, se reintenta una vez.
   - Si sigue fallando, se deja un registro de error para el admin (como el código `4545`) y el cliente ve "Tu plan nuevo quedó activo, pero no pudimos cancelar el anterior: contactá a soporte".
   - Nunca se muestra éxito con dos planes cobrándose sin avisar.
3. Si `nextPaymentDate > ahora`, crea la temporal en la misma transacción que la cancelación en la base:
   - `kind: carryover`, `status: authorized`;
   - `mpPreapprovalId: carryover:<idViejo>`, para no duplicar;
   - `subscriptionPlan` = el plan viejo;
   - `expiresAt` = `nextPaymentDate`;
   - `payerUser` = el usuario.

   La agrega a `User.subscriptions`.
4. **No** aplica downgrade.

Cuando llega del webhook el `cancelled` de la suscripción vieja, ya está cancelada y no hace nada nuevo.

**Cómo se trata la temporal en el resto del sistema**

| Lugar | Comportamiento |
|-------|----------------|
| Límites (anuncios, contactos, blogs, MB, tokens) | **Cuenta.** Para eso existe. |
| `canSellPaidTickets` (Producciones) | Cuenta: el tiempo del plan viejo ya está pago. |
| Decisión de downgrade (`user_has_active_subscription`) | Cuenta. Si se rechaza el pago del plan nuevo mientras la temporal sigue viva, los listeners recalculan con la temporal incluida. |
| "¿Tiene plan pago?" (`hasPaidPlan`: regalos, Hacete Amigo, checkout individual) | **No cuenta.** Es un extra, no un plan. |
| Facturas, notificaciones de pago, webhooks | La ignoran: no tiene pago propio. |
| Bolsa comunitaria de tokens (`chatbot.token.repository.ts:139`) | **No cuenta**, para no acreditar dos veces el aporte del plan viejo en el mismo mes. |
| Cambiar de plan con una temporal viva | Se permite. Sólo genera temporal la suscripción `kind: mp` que se cancela, así que no hay temporales encadenadas. |

**Cliente**
- `checkIfUserIsSubscribed` y el "plan actual" de Redux (`getSubscriptions`) ignoran la temporal.
- **Configuración > Suscripción:** la temporal aparece aparte, como "Límites de tu plan anterior (X) hasta el dd/mm", sin botones.
- **Límites que bajan:** `getPostAndContactLimit` suma `carryoverExpiresAt` y los límites sin la temporal. `ActivePostsCounter` y el Control de Consumo muestran "El dd/mm tu límite pasa a N".
- **Checkout de cambio de plan** (`Details isChangingPlan`): el texto pasa a "Conservás los límites de tu plan actual hasta el dd/mm".

**Vencimiento** (sin tarea programada)
- El helper deja de contar la temporal desde `expiresAt`. No hay downgrade.
- Los mensajes de rechazo dicen cuántos sobran. Al usuario se le dice "geolocalizados", nunca "libres":
  - `post.service.ts:93-95` y `:128-130`: hoy "agostaste el limite…". Pasan a "Tenés N anuncios {geolocalizados|de agenda} activos y tu límite es M. Desactivá N − M + 1 para publicar uno nuevo."
  - `setNewActiveUserRelations` (contactos) y `blogLimitMessage` (blogs) siguen el mismo criterio.
  - El cliente muestra lo mismo antes de entrar a `/crear/anuncio`.

### Fase 4 — Regalar planes

#### Cómo se cobra con MercadoPago

- Hoy todo lo que se cobra en Soon es suscripción. Pero el formulario de tarjeta que ya usamos
  (`CardPayment` de `@mercadopago/sdk-react`) es el componente de MercadoPago para **pagos únicos**.
  Al enviarlo devuelve el token de la tarjeta, el medio de pago, el emisor, las cuotas y el email del pagador.
- Con eso, el server cobra con `POST /v1/payments`:
  - mismo access token que hoy;
  - header `X-Idempotency-Key` = id del regalo, para que un reintento no cobre dos veces;
  - `external_reference: gift:<id>`;
  - 1 cuota, como en las suscripciones.
- Con tarjeta, MP responde en el momento (`approved`, `rejected` o `in_process`). Después confirma
  por el webhook `payment`, que ya está configurado.
- **Qué hay que adaptar:**
  - El webhook supone que todo pago viene de una suscripción: `Payment.mpPreapprovalId` es
    obligatorio (`payment.schema.ts:6`). Un pago de regalo fallaría y MP lo reintentaría sin fin,
    así que las referencias `gift:` se desvían antes.
  - Hoy las facturas sólo se arman para cuotas de suscripción. Para los regalos hay que crearlas.
- **Se descarta Checkout Pro** (redirigir a MP para pagar con dinero en cuenta o en efectivo). Es
  otro flujo, y con efectivo el pago queda pendiente varios días.
- Se prueba en el caso 10 de la Fase 0.

#### Server (`module_friend_plan/planGift/`, 3 capas)

- **Colección `plangifts`:**
  - `code`: 10 caracteres sin `0/O/1/I`, índice único. Va en el link y en el registro de admin;
  - `giver`, `subscriptionPlan`, `months`, `amount`;
  - destinatario: `recipient` (usuario que ya existe) **o** `recipientEmail` (en minúsculas, para quien no tiene cuenta);
  - `status`: `pendingPayment` → `paid` (asignado, sin activar) → `active` → `expired`, más `rejected` y `refunded`;
  - `mpPaymentId`, `activatedAt`, `subscription`, fechas.
- **Configuración:** `PLAN_GIFT_MONTH_OPTIONS` = `1,2,3,5`.
- **`buyPlanGift(input)`** (`ClerkAuthGuard`). Recibe `planId`, `months`, `recipientId` **o**
  `recipientEmail`, y los datos del formulario (`token`, `paymentMethodId`, `issuerId`, `payerEmail`, `identification`):
  - Sólo planes pagos mensuales, nunca pack ni gratuito. `months` tiene que estar en la configuración.
  - Si el destinatario tiene cuenta, no puede tener un plan pago ni estar en un grupo de Hacete Amigo
    (`hasPaidPlan`). Se avisa **antes de cobrar**: "Este usuario ya tiene un plan". No se puede regalar a uno mismo.
  - Si es un email y ya hay una cuenta con ese email, se trata como usuario existente.
  - `amount` = monto del plan en MP × meses. Lo calcula el server.
  - Crea el regalo en `pendingPayment` y cobra:
    - aprobado → `paid`, y se avisa al destinatario si tiene cuenta;
    - `in_process` → espera al webhook;
    - rechazado → devuelve el motivo.
- **Regalos por email:** al crear el usuario en Mongo (al terminar el onboarding), un evento
  `user.created` busca los regalos `paid` con ese `recipientEmail` y los asigna a la cuenta nueva,
  con notificación. Clerk ya verificó el email.
- **`updatePlanGiftEmail(giftId, email)`:** quien regala corrige el email mientras el regalo no se asignó.
- **`activatePlanGift(giftId)`** (`ClerkAuthGuard`, sólo el destinatario):
  - Si ya tiene un plan pago o está en un grupo de Hacete Amigo, no puede activarlo. Ve "Ya tenés un
    plan. Podés activar el regalo cuando termine", y el regalo sigue guardado.
  - Crea la `Subscription` con `kind: gift`, `status: authorized`, `expiresAt` = ahora + meses,
    `payerUser` = quien regala y `mpPreapprovalId: gift:<id>`, y la agrega a `User.subscriptions` del destinatario.
- **Webhook `payment` con `gift:`:**
  - aprobado → `paid`; rechazado → `rejected`;
  - devuelto → si estaba activo, cancela la suscripción; si no, pasa a `refunded`.
  - Crea la factura a nombre de quien regala, así aparece en sus pagos y en el panel de admin.
- **Consultas:**
  - `getMyPlanGifts`: los que regalé y los que recibí.
  - `getPlanGiftByCode(code)`: `ClerkAuthGuardOptional`, con datos mínimos (plan, meses, quién regala, si sigue disponible).
  - `getAllPlanGiftsAdmin`: `AdminGuard`.
- **Notificaciones** (discriminator `NotificationPlanGift`, eventos `notification_plan_gift_*`):
  - al destinatario: "X te regaló N meses de Y";
  - a quien regala: cuando el destinatario lo activa.
- **No se cancela:** una vez pagado está hecho. Una devolución la hace el admin desde el panel de MP y entra por el webhook.

#### Cliente

- **Comprar:** página `/regalar`, enlazada desde `/suscripciones`.
  - Se elige el plan y los meses, con el total a la vista.
  - Se elige a quién: con el buscador de usuarios (`SearchUsers`) o con "No tiene cuenta" + email.
  - Se paga con `CardPayment` en modo pago único.
  - Al terminar: si el destinatario tiene cuenta, "Le avisamos a X"; si no, el link `/canjear/<code>`
    con botones de copiar y compartir (`ShareLinkButton` se mueve a `components/`).
- **Link `/canjear/[code]`:** página pública, que se suma a `proxy.ts`.
  - Muestra quién regala, el plan y los meses.
  - Sin sesión: "Registrate con <email> para recibirlo". Guarda el código en una cookie y lleva a registrarse (decisión L).
  - Con sesión y el email correcto: asigna el regalo y ofrece activarlo.
- **"¿Te regalaron un plan?"** en la página de registro.
- **Configuración > Suscripción:**
  - "Regalos recibidos", con el botón "Activar";
  - "Regalos que hice", con su estado, el link para reenviar y la opción de corregir el email;
  - si el plan actual es un regalo: "Plan regalado por X hasta dd/mm".
- **Admin:** sección `/admin/regalos` (código, quién regala, destinatario, plan, meses, monto, estado
  y fechas). Hay que tocar `AdminPanel`, `AdminDropdown`, `MobileMenu` y su altura hardcodeada.

### Fase 5 — Hacete Amigo (después de la Fase 0)

**Módulo nuevo** `server/src/contexts/module_friend_plan/friendGroup/`, con las 3 capas, DI por token y adapter, siguiendo la estructura de `module_post` y `module_novelty`.

**Entidad `FriendGroup`** (colección `friendgroups`)
- `creator`, `subscriptionPlan`, `members[]` (`user`, `status`: `invited` | `accepted`, `joinedAt`), `payer`.
- `inviteCode`: código aleatorio para el link, con índice único. Se puede regenerar, y el anterior deja de servir.
- `status`: `forming` → `paying` → `active` ⇄ `paymentFailed` → `cancelled`.
- Snapshot al pagar: `memberCount`, `discountPercent`, `planAmount`, `pricePerMember`, `totalAmount`.
- `mpPreapprovalId`, `subscription` (ref a la `Subscription` compartida), `cancelReason`, `paymentFailedAt`, fechas.

**Configuración** (`module_shared/friend-plan/friend.plan.config.ts`, con env vars como los límites de Producciones)
- `FRIEND_PLAN_DISCOUNT_TIERS` = `{"2":15,"3":20,"4":25,"5":30}`. El descuento de N miembros es el del mayor tramo ≤ N.
- `FRIEND_PLAN_MAX_DISCOUNT` = `30`.
- `FRIEND_PLAN_MIN_MEMBERS` = `2`.
- `FRIEND_PLAN_MAX_MEMBERS` = `0` (sin tope).
- `FRIEND_PLAN_PAYMENT_FAILED_DAYS` = `10`: tope propio si la Fase 0 no da una forma de detectar que MP terminó de reintentar.
- **Precio (decisión N):**
  - `planAmount` = `auto_recurring.transaction_amount` del plan en MP, lo mismo que paga un plan individual.
  - `pricePerMember = round(planAmount × (1 − descuento))` y `totalAmount = pricePerMember × N`.
  - Siempre se calcula en el server, y `totalAmount` tiene que dar más de $50.

**Flujo**
1. **Crear:** un usuario elige un plan pago mensual y arma el grupo. Queda como primer miembro `accepted`.
2. **Invitar** (decisión M):
   - **Buscador** (`SearchUsers` + `useSearchUsers` + `InvitationModal`) → `inviteToFriendGroup` → notificación del server → el invitado responde con `respondFriendGroupInvitation`.
   - **Link** `/hacete-amigo/unirse/:inviteCode`, página pública:
     - Con sesión, muestra quién invita, el plan y el precio por persona, y un botón "Sumarme".
     - Sin sesión, guarda el código en una cookie y lleva a registrarse (decisión L). Entrar por link equivale a aceptar.
     - El link deja de servir cuando el grupo pasa a `paying`, se cancela o llega al máximo, y la página lo explica.
3. **Validaciones al aceptar** (y otra vez al pagar):
   - no tener un plan pago activo, propio o regalado (mensaje: "Primero cancelá tu plan actual");
   - no estar en otro grupo `forming`, `paying` o `active`;
   - respetar el máximo de miembros.
4. **Activación** (decisión P): cada miembro cumple si `User.posts.length > 0 || User.productions.length > 0`, en cualquier estado. Se calcula al leer, no se guarda.
5. **Pagar:**
   - El botón se habilita con ≥ `MIN_MEMBERS` aceptados y todos activados.
   - `getFriendGroupCheckout(groupId)` valida todo y devuelve el monto.
   - `startSubscriptionCheckout({ friendGroupId, ... })` crea el preapproval **sin plan** con `external_reference: friendGroup:<id>`.
   - Se registra **una** `Subscription` con `kind: friendGroup`, `payerUser` = quien pagó y `subscriptionPlan` = el plan del grupo, y se agrega a `User.subscriptions` de **cada miembro**.
   - El grupo pasa a `active` (o a `paying`, si MP responde pendiente). Desde ahí queda congelado.
6. **Webhook:** `friendGroup:` → si la suscripción falta, se registra. Se valida que `transaction_amount` coincida con `totalAmount`; si no coincide, se cancela en MP y se avisa.
7. **Pago rechazado** (decisión G):
   - **Primer rechazo:** se pausa (lógica de hoy) y el grupo pasa a `paymentFailed`. Se aplica el downgrade **a cada miembro** que no tenga otro plan pago. Se avisa a todos, y a quien paga se le pide revisar la tarjeta.
   - **Un reintento sale bien:** vuelve a `authorized` (con el arreglo 11 de la Fase 1) y el grupo vuelve a `active`. Se avisa a todos. Los anuncios desactivados no se reactivan solos, igual que hoy.
   - **MP no logra cobrar:** el server cancela el preapproval si sigue vivo, y el grupo y la suscripción pasan a `cancelled`. Se avisa a todos. Si no se puede detectar el final de los reintentos, después de `PAYMENT_FAILED_DAYS` se cancela al leer el grupo.
8. **Alguien se baja o borra su cuenta** con el grupo `active`:
   - El server cancela el preapproval en MP (con `await`), y la suscripción y el grupo pasan a `cancelled`. Se avisa a todos con el motivo.
   - **Sin downgrade** (decisión K): los límites bajan y los anuncios quedan activos, como en una cancelación individual.
   - En `forming`, salir sólo saca a esa persona del grupo.
9. **Simetría:** mientras está en un grupo activo, el usuario no puede contratar un plan individual. Los packs sí.

**API** (GraphQL con `ClerkAuthGuard`; los permisos se validan contra el grupo guardado)
- `createFriendGroup(planId)`, `inviteToFriendGroup(groupId, userId)`, `respondFriendGroupInvitation(groupId, accept)`.
- `getFriendGroupByInviteCode(code)` (`ClerkAuthGuardOptional`: datos mínimos, sin la lista de miembros), `joinFriendGroupByInviteCode(code)`, `regenerateFriendGroupInviteCode(groupId)` (sólo el creador).
- `leaveFriendGroup(groupId)`, `removeFriendGroupMember(groupId, userId)` (sólo el creador y sólo en `forming`).
- `getMyFriendGroup`, `getFriendGroupCheckout(groupId)`, `getFriendPlanPricing(planId)`.

**Notificaciones** (discriminator `NotificationFriendGroup`; se clona `NotificationProductionTicket`)
- Eventos `notification_friend_plan_*`:
  - `invited`, `accepted`, `rejected`;
  - `ready_to_pay`, `active`;
  - `charge_failed`, `charge_recovered`;
  - `cancelled` (con el motivo).
- Ningún nombre lleva `payment`, `share`, `notification_group` ni `notification_user`, y la clave nueva va **primera** en `NotificationRenderer`.
- Los campos nuevos de `frontData` se agregan en `getAllNotificationsQuery`.
- No hay socket: se ven al abrir las notificaciones.

**Cliente**
- **`/suscripciones/hacete-amigo`:** mensaje de bienvenida y tabla de descuentos calculada con la configuración real para el plan elegido. Lugar para el video del cliente, si lo mandan. Botón "Armar mi grupo".
- **`/hacete-amigo/unirse/[code]`:** página pública, que se suma a `proxy.ts`.
- **Panel del grupo:**
  - miembros con su estado (invitado / aceptó / ya publicó);
  - buscador para invitar;
  - link con copiar, compartir y regenerar;
  - "resumen tipo carrito" con el precio por persona y el total, que se actualiza al sumar gente;
  - botón de pago, deshabilitado con el motivo cuando corresponde;
  - "Salir del grupo", con la advertencia "se cancela el plan para todos".
- Cadena Action → Service → GraphQL (`friendGroupActions.ts`, etc.).

**Tests**
- Link de invitación: unirse con sesión, código regenerado, grupo lleno o en `paying`.
- Cálculo de descuento (tramos, tope, máximo de miembros) y monto mínimo.
- Validaciones de ingreso.
- Activación por anuncio o por producción.
- Alta (desde el checkout y desde el webhook).
- Monto que no coincide.
- Rechazo y recuperación.
- Salida de un miembro y borrado de cuenta.

### Fase 6 — Documentación y textos

- **Glosario de Cubito** (`GLOSSARY` en `chatbot.ai.service.ts`) **y** `GlosaryModal.tsx`: Hacete Amigo, regalar planes, packs de tokens y MB, y extra temporal al cambiar de plan.
- **`AGENTS.md`:**
  - en §6: `Subscription.kind`, `expiresAt`, `payerUser`, `activeSubscriptionMatch`, `hasPaidPlan`, checkout por el server, `resolveExternalReference`, `tokensCount`;
  - el módulo `module_friend_plan` con su configuración;
  - en §7: las rutas nuevas.

---

## 4. Orden y dependencias

```
Fase 1 (base + arreglos) ─┬─ Fase 2 (packs)
                          ├─ Fase 3 (cambio de plan)
                          ├─ Fase 4 (regalo) ← necesita la respuesta a P1
                          └─────────────┬─ Fase 5 (Hacete Amigo)
Fase 0 (validar MP) ────────────────────┘
Fase 6 (docs) al cerrar cada fase
```

Orden sugerido: **1 → 2 → 3**, con la **0** en cuanto estén las personas para las pruebas **[P5]**, y después **4 → 5**.
La Fase 0 comparte con la 1 el `createPreapproval` del server, así que conviene empezarla cuando esa pieza exista.

---

## 5. Decisiones tomadas

- **A. Pack temporal de cambio de plan:** apunta directo al plan viejo (`kind: carryover`), sin packs ocultos.
- **B. Vencimiento del extra temporal:** sin downgrade ni tarea programada. Los anuncios de más quedan activos, no se pueden crear nuevos y se avisa cuántos sobran.
- **C. Regalar packs:** no. Sólo planes, y nunca a quien ya tiene plan.
- **D. Cancelar un regalo:** no se cancela; una vez pagado está hecho. Sólo el admin puede devolver el pago desde MP.
- **E. Invitar a gente sin cuenta en Hacete Amigo:** sí, con el link de invitación.
- **F. Cancelación normal (sin cambio de plan):** queda como hoy.
- **G. Pago rechazado en Hacete Amigo:** con el primer rechazo se pausa para todos. Si un reintento sale bien, vuelve. Si MP no logra cobrar, se cancela el grupo.
- **H. Checkout por el server:** todas las altas (plan, pack, cambio de plan, grupo y regalo) pasan por mutations del server que toman el usuario del token, deciden plan y monto, cobran en MP (preapproval o pago único) y registran el alta en el momento. Se eliminan las API routes públicas de `/api/subscriptions`. Motivos:
  - hoy el navegador decide el usuario y el monto;
  - cualquiera puede cancelar cualquier suscripción;
  - MP no manda el `created`.
- **I. Referencias:** `Subscription.external_reference` guarda el valor crudo de MP. Quién paga va en `payerUser`, y quiénes son titulares sale de `User.subscriptions`.
- **J. Suscripción activa:** un solo helper (`activeSubscriptionMatch`) con `expiresAt`, evaluado al leer.
- **K. Downgrade sólo por pago rechazado**, como hoy. Una baja voluntaria (cancelar, salir de un grupo, borrar la cuenta) baja los límites pero no desactiva anuncios. *(Cambia el paso 8 de la Fase 5 del plan anterior, que aplicaba downgrade a todos.)*
- **L. Links de invitación y de canje con cookie:** la página pública guarda el código en una cookie (7 días). Al terminar el onboarding, `(clerk)/layout.tsx` lo lee y, en vez de mandar a `/`, manda de vuelta al link. No se depende del `redirect_url`, que hoy se pierde en tres lugares.
- **M. Invitaciones por GraphQL** con notificaciones creadas en el server, no por el servidor de sockets externo, que no valida quién invita.
- **N. Precio del grupo:** se toma el monto del plan en MP (lo que paga un plan individual), y sólo se aceptan planes pagos mensuales.
- **O. Descuento de Hacete Amigo para siempre** (reunión del 5/11).
- **P. Activación:** al menos un anuncio o una producción, en cualquier estado, contando también al creador del grupo.
- **Q. Hacete Amigo es para quien no tiene plan** (respuesta del 12/11): para sumarse hay que cancelar antes el plan pago.
- **R. Sin máximo de miembros** en Hacete Amigo (respuesta del 12/11). Queda configurable.
- **S. Nombres nuevos de planes, plan Prueba y Gold anual "10/12": fuera**, como decía el plan del 7/11 (respuesta del 12/11).
- **T. Regalo de planes** (respuesta del 12/11): meses prepagos con pago único, como pidió el cliente. Se asignan a una cuenta existente o a un email, para quien no tiene cuenta. Los meses cuentan desde que el destinatario lo activa. Esto reemplaza el "lo activa por nombre y apellido" del documento: el regalo queda atado a la cuenta o al email, no al nombre.
- **U. Pruebas de MercadoPago** (respuesta del 12/11): primero en local con el sandbox; a producción sólo lo necesario, con montos chicos que paga y devuelve Maxi.
- **V. Packs como hoy:**
  - los compra cualquiera, también con el plan Gratis;
  - uno de cada uno a la vez;
  - los tokens se renuevan cada mes, sin acumular;
  - bajar almacenamiento no borra nada;
  - los 3 packs cancelados en MP se rehacen con el mismo precio.

  Al cliente sólo se le pregunta qué packs nuevos se venden (§8).

---

## 6. Datos y contenido a cargar

- **`tokensCount` de cada plan**, con los valores que hoy se ven en producción:
  - Premium, 1.000 brutos (800 netos);
  - Gold, 5.000 brutos (4.000 netos).

  Ojo: el **Gold anual hoy recibe 800 en vez de 4.000**. Seguramente es porque el mapping de tokens usa
  el id viejo del plan en MP, que se cambió el 22/10. Con `tokensCount` se corrige.
- **Packs cancelados en MP** (verificado el 12/11): Pack Más 2 mensual, Pack Más 2 trimestral y Pack
  Más 40 trimestral. Se rehacen en MP con el mismo precio, porque los packs siguen como hoy (decisión V).
- **Packs nuevos de tokens y MB**, según lo que conteste el cliente (§8).
- **Env vars** `FRIEND_PLAN_*` en producción.
- **Video de Hacete Amigo**, si el cliente lo manda (opcional).

---

## 7. Preguntas abiertas

- **P1. Resuelta (12/11):** el regalo es lo que pidió el cliente: meses prepagos (1, 2, 3 o 5) con pago único, asignados a una cuenta o a un email (decisión T, Fase 4).
- **P2. Resuelta (12/11):** quien tiene un plan pago no puede sumarse a Hacete Amigo; tiene que cancelarlo antes.
- **P3. Resuelta (12/11):** sin máximo de miembros, como en la propuesta.
- **P4. Resuelta (12/11):** los nombres nuevos, el plan Prueba y el Gold anual quedan fuera, como decía el plan del 7/11.
- **P5. Resuelta (12/11):** las pruebas se hacen primero en local con el sandbox, y en producción con montos chicos que paga y devuelve Maxi (decisión U, Fase 0).
- **P6. Packs nuevos:** lo único que falta es qué packs de tokens y de almacenamiento se venden, y eso lo decide el cliente (§8). No bloquea el código: sólo hace falta para cargar los packs antes de salir.

---

## 8. Pregunta para el cliente: packs nuevos

Se manda en `preguntas-packs-cliente.xlsx`, en la raíz del repo, sin versionar.

**Lo único que falta definir:** qué packs de **tokens** y de **almacenamiento** se venden. Para cada
uno, cuánto suma, el precio mensual y, si se quiere, el precio trimestral.
- **Por qué se pregunta:** ni el plan ni el documento del cliente ni el código dicen cantidades ni
  precios. El documento sólo dice "además, packs de tokens y de MB".
- **Para qué se necesita:** para crear esos packs en MP y en Mongo (Fase 2, datos). No bloquea el
  código, que sirve para cualquier pack con `tokensCount` o `storageBytesLimit`. Sólo hace falta
  antes de salir a producción.

**Lo que no se pregunta, porque ya está definido** (el plan dice que los packs "siguen funcionando
como hoy", y esto es lo que hace hoy el código; decisión V):
- **Quién puede comprar:** cualquier usuario, también con el plan Gratis. El checkout no lo bloquea y el pack se suma.
- **Uno de cada uno:** no se puede tener dos veces el mismo pack a la vez. Hoy lo bloquea la página de checkout (`client/src/app/suscribirse/[planId]/page.tsx:22`). Al pasar el checkout al server (Fase 1), esa regla tiene que quedar en la mutation.
- **Tokens:** se renuevan cada mes y no se acumulan. La cuota se cuenta por mes calendario (`chatbot.token.service.ts`, `monthPeriod`).
- **Almacenamiento:** si se da de baja un pack, no se borra nada; sólo se bloquean las subidas nuevas (el cupo se valida al subir, §6.1 de `AGENTS.md`).
- **Los 3 packs de anuncios cancelados en MP:** se rehacen con el mismo precio.

**Aparte, no es una pregunta:** el Pack Más 10 ($4.200 por mes) cuesta más que el plan Premium
($1.250), que da los mismos 5 + 5 anuncios y además tokens y 2 GB, y el Más 40 ($12.600) cuesta más
que el Gold ($12.500). Los precios son datos y se cambian sin tocar código. Queda a criterio
comentárselo al cliente.
