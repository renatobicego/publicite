# Sistema de tokens de IA — "Tokens Publicité"

Implementado el 2026-07-20. Controla quién puede usar a Cubito (chat web + WhatsApp
+ generación de imágenes) y cuánto, con tracking de consumo real por request.

## Modelo

- **Unidad visible**: "tokens Publicité". 1 token Publicité = `CHATBOT_TOKENS_RATIO`
  tokens reales de OpenAI (default **1000**). Internamente todo se contabiliza en
  tokens reales (enteros, exactos según `usage` de OpenAI); la conversión ocurre
  sólo al mostrar. Referencia: cada mensaje a Cubito consume ~4.000–8.000 tokens
  reales (≈ 4–8 tokens Publicité) por el glosario embebido en el prompt.
- **Buckets de consumo** (resueltos en cada request):
  1. **`plan`** — usuario registrado con suscripción `authorized` de plan pago:
     cuota mensual personal = neto del plan. Sin saldo → se corta hasta el mes
     siguiente (no cae a la bolsa comunitaria).
  2. **`free`** — usuario registrado sin plan pago: cuota mensual
     `CHATBOT_TOKENS_FREE_MONTHLY`, descontada de la **bolsa comunitaria**.
  3. **`anonymous`** — no registrado (web por `sessionId`, WhatsApp por
     `whatsapp:<tel>`): cuota **diaria** `CHATBOT_TOKENS_ANON_DAILY`, también
     contra la bolsa comunitaria.
  - Si la bolsa comunitaria está en 0, `free` y `anonymous` no pueden usar la IA.
- **Split interno (invisible al usuario)**: de los tokens brutos de un plan,
  `CHATBOT_TOKENS_COMMUNITY_SHARE`% (default 20) va a la bolsa comunitaria y el
  resto es la cuota del usuario. **En todo lo público (planes, perfil) se muestra
  el neto**; el split no se expone nunca.
- **Reset**: implícito por período — cada mes (o día, para anónimos) usa un
  documento de cuenta nuevo, sin jobs. Si la suscripción se pausa por impago
  (webhook MP existente), el usuario pierde el bucket `plan` automáticamente.
- **Acreditación de la bolsa**: lazy y mensual. La primera request del mes de un
  usuario free/anónimo suma a la bolsa el share comunitario de **todas** las
  suscripciones pagas `authorized` + `CHATBOT_TOKENS_COMMUNITY_BONUS_MONTHLY`.
  Idempotente por índice único de período (`chatbottokenaccruals`); no depende
  de los webhooks de MercadoPago.
- **Bloqueo**: cuando no hay saldo, `sendMessageToChatbot` responde
  `limitReached: true` y un `botResponse` normal con el aviso (así la web y
  WhatsApp lo muestran sin manejo de errores). No se llama a OpenAI ni se
  persiste el intercambio. Las imágenes (`generateAdImage`) requieren usuario
  registrado y lanzan error con el mensaje.

## Variables de entorno (todas opcionales, con defaults)

| Variable | Default | Qué controla |
|---|---|---|
| `CHATBOT_TOKENS_RATIO` | `1000` | Tokens reales de OpenAI por 1 token Publicité |
| `CHATBOT_TOKENS_PLAN_DEFAULT` | `1000` | Tokens Publicité **brutos**/mes de un plan pago sin mapping |
| `CHATBOT_TOKENS_PLAN_MAP` | — | JSON `{"<mpPreapprovalPlanId o reason en minúsculas>": brutos}` por plan. Ej: `{"plan oro": 3000}` |
| `CHATBOT_TOKENS_COMMUNITY_SHARE` | `20` | % del bruto que va a la bolsa comunitaria |
| `CHATBOT_TOKENS_FREE_MONTHLY` | `100` | Tokens Publicité/mes de registrados sin plan pago |
| `CHATBOT_TOKENS_ANON_DAILY` | `15` | Tokens Publicité/día de no registrados (web y WhatsApp) |
| `CHATBOT_TOKENS_IMAGE_FALLBACK` | `5` | Costo en tokens Publicité por imagen si OpenAI no informa usage |
| `CHATBOT_TOKENS_COMMUNITY_BONUS_MONTHLY` | `0` | Aporte mensual de la plataforma a la bolsa (para lanzar la feature sin suscriptores pagos) |
| `CHATBOT_TOKENS_COMMUNITY_SEED` | `0` | **Base histórica acumulada** que la plataforma carga a la bolsa (el crédito comprado en OpenAI convertido a tokens Publicité). Idempotente e incremental: para "recargar", subir el número y se acredita sólo la diferencia |
| `CHATBOT_USAGE_REPORT_KEY` | — | Clave de la query `getChatbotUsageReport`; sin definir, el reporte queda deshabilitado |
| `CHATBOT_TOKENS_UNLIMITED_IDS` | — | Identidades internas sin límite (ver "Cuentas de prueba sin límite") |

Con los defaults: un plan pago otorga 1000 brutos → el usuario ve y recibe
**800 tokens Publicité/mes** (~100–200 mensajes) y 200 van a la bolsa.

> ⚠️ Los packs (`isPack`) no otorgan tokens salvo mapping explícito en
> `CHATBOT_TOKENS_PLAN_MAP`. Los planes `isFree` nunca otorgan.

## Colecciones nuevas (Mongo)

- `chatbottokenaccounts` — consumo por `(ownerType, ownerId, period)`. Períodos:
  `YYYY-MM` (plan/free) o `YYYY-MM-DD` (anónimos), en UTC.
- `chatbotcommunitypools` — singleton (`key: 'main'`) con el saldo de la bolsa.
- `chatbottokenaccruals` — un doc por mes acreditado (auditoría + idempotencia).
- `chatbotusagelogs` — un doc por request a OpenAI: `promptTokens`,
  `completionTokens`, `totalRealTokens`, `aiModel`, `channel` (web/whatsapp),
  `kind` (chat/image), `chargedTo` (plan/community). **Ésta es la fuente para
  analizar cuánto consume cada usuario.**

## API

- `sendMessageToChatbot` ahora devuelve además `limitReached: Boolean` y
  `tokenStatus { hasActivePaidPlan, source, allowance, used, remaining,
  communityTokensAvailable, resetsAt }` (en tokens Publicité).
- Query nueva `getMyChatbotTokenStatus` (guard Clerk) — la usa el perfil.
- `GET /subscriptionplans` ahora incluye `aiTokensPerMonth` (neto) por plan.
- El resolver del chatbot usa `ClerkAuthGuardOptional`: si el front manda el
  token, la identidad para el cobro es la del token; si no, se usa el `userId`
  del body (compatibilidad) o se trata como anónimo.

## Front (`client/`)

- Card "Tokens Publicité de IA" en el perfil (`(configuracion)/Subscriptions/AiTokens/AiTokensLimit.tsx`)
  con barra de progreso, fecha de renovación y CTA a suscripciones.
- Las cards de planes muestran "X tokens Publicité de IA por mes" (`PlanDetails.tsx`).
- `chatbotServices.ts` ahora adjunta el token de Clerk al chat y a la generación
  de imágenes.

## Operación

### Cargar la base de la plataforma (crédito comprado en OpenAI)

Setear `CHATBOT_TOKENS_COMMUNITY_SEED` con el total acumulado en tokens
Publicité; la primera request lo acredita solo (idempotente, sobrevive a
reinicios/instancias paralelas). Para una nueva compra de crédito, **subir el
número** (ej. 250000 → 500000): se acredita la diferencia automáticamente.

Conversión de referencia (gpt-4o-mini: US$0,15/M entrada + US$0,60/M salida;
mix real medido de Cubito ≈ 5.500 entrada + 200 salida por mensaje ⇒
~US$0,001/mensaje ≈ US$0,17 por millón de tokens reales):

> **US$50 ≈ 285 millones de tokens reales ≈ 285.000 tokens Publicité.**
> Recomendado cargar `CHATBOT_TOKENS_COMMUNITY_SEED=250000` (deja ~12% de
> margen para imágenes —más caras por token— y variaciones de mix).

La bolsa es contabilidad interna: el gasto real en dólares lo corta el crédito
de OpenAI. Cargando un número conservador, la bolsa se agota **antes** que el
crédito real y el sistema corta a los usuarios gratuitos a tiempo.

### Cuentas de prueba sin límite (desarrollo)

`CHATBOT_TOKENS_UNLIMITED_IDS` acepta una lista separada por comas de identidades
que nunca se quedan sin tokens (cuota sintética de 1.000.000 de tokens Publicité
por mes, ~200.000 mensajes):

```
CHATBOT_TOKENS_UNLIMITED_IDS=68b3f1c2a4d5e6f708192a3b,whatsapp:+5491122334455
```

- Se aceptan **mongoIds de usuario** e identidades anónimas de WhatsApp
  (`whatsapp:<tel>`), para poder probar el bot sin estar registrado.
- Se resuelven como bucket `plan`: **no descuentan de la bolsa comunitaria** ni se
  bloquean si la bolsa está en 0, así probar no le come los tokens a los usuarios
  reales. El consumo **sí** queda en `chatbotusagelogs` (`chargedTo: 'plan'`), así
  que el gasto real en OpenAI se sigue viendo en el reporte.
- Aplica a todo lo que pasa por el gate: chat web, WhatsApp, imágenes, valuación y match.
- Es sólo para cuentas internas: cualquier id que se agregue acá deja de pagar cuota.

Para obtener el mongoId: el `ownerId` que devuelve `getChatbotUsageReport` para ese
usuario, o directo en Mongo `db.users.findOne({ email: "<mail>" }, { _id: 1 })`.

### Reporte de consumo por usuario

Query GraphQL `getChatbotUsageReport(adminKey, chargedTo?, limit?)` — sin
guard de Clerk, protegida por `CHATBOT_USAGE_REPORT_KEY`. Devuelve el estado de
la bolsa (saldo/acreditado/consumido) y los consumidores ordenados por consumo,
con `username`/`email` resueltos para usuarios registrados. `chargedTo:
"community"` muestra sólo lo que salió de la bolsa de la plataforma (lo que
pedía el cliente); `"plan"` sólo cuotas personales; omitido = todo.

```graphql
query {
  getChatbotUsageReport(adminKey: "<CHATBOT_USAGE_REPORT_KEY>", chargedTo: "community") {
    poolBalance poolTotalAccrued poolTotalConsumed
    consumers { ownerId ownerType username email publiciteTokensUsed requestCount lastUsedAt channels }
  }
}
```

- **Consumo por usuario (crudo)**: agregación sobre `chatbotusagelogs` por `ownerId`.
- El fix del 2026-07-20 eliminó los `ConfigModule.forRoot()` sin `envFilePath`
  de `user/post/chatbot module` — **no reintroducirlos**: cargaban `.env` (prod)
  y hacían que `npm run dev` pegara a la base de producción.
