# Guía de Testing — Chatbot Detección de Intención `CREATE_AD`

Esta guía cubre cómo probar la nueva detección de intención del chatbot, tanto desde **backend** (validar que la tool de OpenAI se dispara correctamente) como desde **frontend** (validar que reciben el campo `action` y reaccionan a él).

---

## 1. Contrato GraphQL

### Nuevo enum

```graphql
enum ChatbotAction {
  CREATE_AD
}
```

### Mutation `sendMessageToChatbot`

```graphql
mutation SendMessage($req: SendMessageRequest!) {
  sendMessageToChatbot(sendMessageRequest: $req) {
    sessionId
    userMessage
    botResponse
    timestamp
    action          # NUEVO — nullable
  }
}
```

### Query `getChatSessionHistory`

El campo `action` también está disponible en cada mensaje del historial:

```graphql
query History($sessionId: String!) {
  getChatSessionHistory(sessionId: $sessionId) {
    sessionId
    totalMessages
    messages {
      role
      content
      timestamp
      action        # NUEVO — nullable
    }
  }
}
```

### Valores posibles de `action`

| Valor | Significado |
|---|---|
| `null` | Respuesta informativa normal (el bot respondió texto basado en glosario) |
| `CREATE_AD` | El usuario expresó intención de crear un anuncio — el FE debe disparar el flujo guiado |

---

## 2. Pre-requisitos para probar

1. Server local arriba: `npm run dev` (usa `.env.qa`) o `npm run start:dev`.
2. Variable `OPENAI_API_KEY` configurada en el `.env.qa` con saldo suficiente.
3. MongoDB accesible (lo levanta el `.env.qa` automáticamente).
4. GraphQL Playground o Apollo Sandbox en `http://localhost:<port>/graphql`.

---

## 3. Testing — Backend

### 3.1. Caso happy path: intención clara de crear anuncio

**Request:**

```graphql
mutation {
  sendMessageToChatbot(sendMessageRequest: {
    message: "Quiero crear un anuncio"
  }) {
    sessionId
    botResponse
    action
    timestamp
  }
}
```

**Response esperado:**

```json
{
  "data": {
    "sendMessageToChatbot": {
      "sessionId": "<uuid>",
      "botResponse": "¡Genial! Te ayudo a crear tu anuncio. Completá los datos a continuación 👇",
      "action": "CREATE_AD",
      "timestamp": "2026-05-26T..."
    }
  }
}
```

**✅ Validar:**
- `action === "CREATE_AD"`
- `botResponse` es el copy fijo (no texto generado por la IA)
- El mensaje queda persistido en la sesión con `action: CREATE_AD`

---

### 3.2. Variantes de intención a probar

Estas deberían disparar `CREATE_AD`:

| Frase del usuario | `action` esperado |
|---|---|
| `"Quiero crear un anuncio"` | `CREATE_AD` |
| `"Necesito vender un producto"` | `CREATE_AD` |
| `"Cómo publico algo"` | `CREATE_AD` ⚠️ borderline |
| `"Puedo ofrecer un servicio acá"` | `CREATE_AD` |
| `"Quiero subir una publicación"` | `CREATE_AD` |
| `"Necesito publicar una necesidad"` | `CREATE_AD` |
| `"Quiero ofertar mi bici"` | `CREATE_AD` |

⚠️ El caso "Cómo publico algo" es ambiguo (puede ser pregunta informativa o intención). El prompt está configurado para priorizar la intención cuando el verbo está en primera persona / imperativo.

---

### 3.3. Casos negativos: NO debe disparar `CREATE_AD`

Estas deben devolver `action: null` con respuesta informativa:

| Frase del usuario | `action` esperado | Razón |
|---|---|---|
| `"¿Cómo funciona crear un anuncio?"` | `null` | Pregunta informativa |
| `"Explicame los pasos para publicar"` | `null` | Pide información, no acción |
| `"¿Qué tipos de anuncios hay?"` | `null` | Consulta de glosario |
| `"Hola, qué es Publicite?"` | `null` | Saludo / info general |
| `"Necesito ayuda con mis contactos"` | `null` | Otro tema |
| `"Cuánto cuestan los planes?"` | `null` | Otro tema |

**✅ Validar:**
- `action === null`
- `botResponse` contiene texto generado por la IA con enlaces del glosario

---

### 3.4. Caso edge: conversación con contexto

Probar que después de disparar `CREATE_AD` la conversación siga funcionando normalmente:

**Mensaje 1:**
```graphql
{ message: "Quiero crear un anuncio", sessionId: "test-session-001" }
```
→ `action: CREATE_AD`

**Mensaje 2 (misma sesión):**
```graphql
{ message: "Y cómo agrego contactos?", sessionId: "test-session-001" }
```
→ `action: null` (debe responder informativamente sobre contactos)

**✅ Validar:**
- El segundo mensaje NO vuelve a disparar `CREATE_AD`
- Se mantiene el contexto de la conversación
- Al consultar `getChatSessionHistory` el primer mensaje del bot persiste con `action: CREATE_AD`

---

### 3.5. Verificar persistencia en MongoDB

Conectarse a MongoDB y revisar la colección `chatsessions`:

```js
db.chatsessions.findOne({ sessionId: "test-session-001" })
```

**✅ Validar:**
- El mensaje del bot que disparó la intención tiene el campo `action: "CREATE_AD"` persistido
- Los mensajes anteriores y los del user no tienen el campo (o es `undefined`/`null`)

---

### 3.6. Usuario autenticado vs anónimo

La detección de intención funciona **igual para ambos**. La diferencia la maneja el FE:
- Si hay `userRequestId` en el contexto, el `sessionId` se sobreescribe con el clerkId del usuario.
- Si es guest, se usa el `sessionId` enviado en el request o se genera uno nuevo.

Probar:
1. **Con header de auth Clerk** → debería usar el clerkId como sessionId
2. **Sin auth** → debería generar/usar el sessionId del request

En ambos casos `action: CREATE_AD` debe disparar igual.

---

## 4. Testing — Frontend

### 4.1. Lo que tienen que actualizar

1. **Schema GraphQL en el codegen** — regenerar tipos para que aparezca el campo `action` y el enum `ChatbotAction`.
2. **Query de `sendMessageToChatbot`** — agregar `action` al selection set.
3. **Lógica del componente del chat** — reaccionar al `action` en el response.

### 4.2. Pseudocódigo de manejo en el FE

```ts
const result = await sendMessageToChatbot({ message });

if (result.action === ChatbotAction.CREATE_AD) {
  // 1. Mostrar el botResponse como mensaje del bot (es el copy fijo)
  showBotMessage(result.botResponse);

  // 2. Disparar el flujo guiado de creación de anuncio dentro del chat
  openCreateAdForm();
} else {
  // Respuesta normal de texto
  showBotMessage(result.botResponse);
}
```

### 4.3. Casos a validar en el FE

| Caso | Acción esperada del FE |
|---|---|
| Usuario tipea "quiero crear un anuncio" | Mostrar mensaje del bot + abrir formulario de creación |
| Usuario tipea "¿cómo creo un anuncio?" | Mostrar respuesta informativa con enlaces, NO abrir formulario |
| Usuario es guest y dispara `CREATE_AD` | Mostrar mensaje + redirigir a registro (decisión del FE) |
| Usuario logueado dispara `CREATE_AD` | Mostrar mensaje + abrir formulario inline |
| Usuario recarga la página | El historial debe mostrar el mensaje con `action: CREATE_AD` pero NO volver a disparar el flujo (es solo display) |

### 4.4. Test de regresión

Verificar que el chatbot existente sigue funcionando para preguntas informativas:

```
"Cómo añado un contacto?" → respuesta con pasos + link
"Cuáles son los planes disponibles?" → respuesta con link a suscripciones
"Qué es la pizarra?" → respuesta con descripción
```

Ninguno de estos debe traer `action: CREATE_AD`.

---

## 5. Troubleshooting

### "La IA no dispara `CREATE_AD` cuando debería"

- Verificar logs del server al recibir el mensaje — buscar `Error calling OpenAI API`.
- Probar con frases más explícitas: "quiero crear un anuncio ya", "necesito publicar algo".
- Si el modelo no detecta intención clara, está priorizando responder informativamente — está bien que sea conservador.

### "Dispara `CREATE_AD` cuando no debería"

- Revisar el log del mensaje del usuario.
- Si la detección es muy agresiva, podemos endurecer el prompt en `chatbot.ai.service.ts` (sección `buildTools` y `buildOpenAIMessages` → mensaje del sistema, sección "EXCEPCIÓN — DETECCIÓN DE INTENCIÓN").

### "El campo `action` no aparece en la respuesta"

- Confirmar que se levantó el server (el `schema.gql` se regenera al arrancar la app, no en `nest build`).
- Verificar que el FE actualizó el selection set para incluir `action`.
- Regenerar el codegen del FE.

### "Error: OPENAI_API_KEY is not defined"

- Falta la variable en el `.env.qa` (o `.env` si corre en prod).

---

## 6. Checklist de aceptación

### Backend
- [ ] Server arranca sin errores
- [ ] `schema.gql` contiene `enum ChatbotAction` y `action: ChatbotAction` en `SendMessageResponse` y `ChatMessageResponse`
- [ ] Mensaje "quiero crear un anuncio" → `action: CREATE_AD` + copy fijo
- [ ] Mensaje "cómo creo un anuncio" → `action: null` + respuesta informativa
- [ ] El `action` se persiste en MongoDB
- [ ] `getChatSessionHistory` devuelve el `action` en los mensajes históricos
- [ ] Conversación con múltiples mensajes mantiene contexto correctamente

### Frontend
- [ ] Codegen regenerado, tipos incluyen `ChatbotAction`
- [ ] Query incluye el campo `action` en el selection set
- [ ] Se dispara el flujo de creación cuando `action === CREATE_AD`
- [ ] No se dispara el flujo cuando `action === null`
- [ ] El historial muestra mensajes pasados sin re-disparar el flujo
- [ ] Comportamiento diferenciado guest vs logueado (si aplica)

---

## 7. Contacto

Cualquier ajuste de copy, comportamiento del prompt o nuevos `ChatbotAction` que el FE necesite, se modifica en:

- **Copy del bot:** `chatbot.ai.service.ts` → constante `CREATE_AD_RESPONSE_COPY`
- **Comportamiento de detección:** `chatbot.ai.service.ts` → `buildTools()` (descripción de la tool) y `buildOpenAIMessages()` (system prompt)
- **Nuevos valores de enum:** `chatbot.action.enum.ts`
