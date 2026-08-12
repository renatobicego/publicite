# API Valuación IA + Match IA — Guía de integración para el front

> Backend **terminado y desplegable**. Este documento es el contrato real,
> extraído del `schema.gql` generado. Todo lo que está acá ya funciona en el server.
>
> Endpoint GraphQL: el mismo de siempre. Auth: header de Clerk, igual que el resto.

---

## 1. Resumen para arrancar

| Necesito… | Usar |
|---|---|
| Iniciar una valuación | `startValuacion` |
| Responder preguntas del brief | `sendValuacionMessage` |
| Botón "omitir pregunta" | `skipValuacionBriefQuestion` |
| Generar el sticker | `generateValuacionResult` |
| Guardar → panel derecho | `saveValuacionResult` |
| Volver a editar (panel derecho → central) | `restoreValuacionToBoard` |
| Eliminar del panel | `deleteValuacion` |
| Historial de valuaciones | `getUserValuaciones` |
| Buscar anuncios similares | `searchMatch` |
| Asociar valuación a un anuncio | `linkValuacionToPost` |
| Mostrar valuación en la página del anuncio | `getValuacionByPost` |
| Pre-cargar el wizard "crear anuncio" | `getValuacionPostDraft` |
| Modos de Cubito en el chat | campos nuevos en `sendMessageToChatbot` |

**Auth:** todas las de valuación exigen usuario logueado (401 si no).
`searchMatch` acepta anónimos (consume de la cuota diaria comunitaria).

---

## 2. Flujo de Valuación IA

### 2.1 Máquina de estados

```
                  startValuacion
                        │
                        ▼
                   ┌─────────┐   sendValuacionMessage (xN)
                   │  draft  │◄──────────────┐
                   └────┬────┘   skipValuacionBriefQuestion
                        │
       generateValuacionResult (cuando briefComplete = true)
                        │
                        ▼
                 ┌─────────────┐
                 │  completed  │  ← tablero central, muestra el sticker
                 └──┬───────▲──┘
     saveValuacion  │       │  restoreValuacionToBoard
        Result      ▼       │
                 ┌─────────────┐
                 │    saved    │  ← panel derecho
                 └──────┬──────┘
                        │ deleteValuacion
                        ▼
                 ┌─────────────┐
                 │  archived   │  ← soft delete, deja de listarse
                 └─────────────┘
```

`processing` es transitorio (mientras corre `generateValuacionResult`). Si lo ven
en una respuesta, mostrar spinner.

### 2.2 Iniciar

```graphql
mutation StartValuacion($input: StartValuacionRequest!) {
  startValuacion(input: $input) {
    reply           # mensaje de Cubito para el chat inferior
    briefComplete
    valuacion { id status layer completionPercent coveredFields tokenStatus { remaining } }
  }
}
```

```json
{
  "input": {
    "category": "objeto",
    "imageUrls": ["https://utfs.io/f/abc123"],
    "description": "Un reloj automático que quiero vender",
    "mode": "analista_mercado",
    "sessionId": "<sessionId del workspace>"
  }
}
```

- `category` es **obligatorio** y es un enum: `imagen | objeto | servicio | bien | otro`.
- Si mandan `description` o `imageUrls`, Cubito arranca el brief analizando eso.
  Si mandan ambos vacíos, devuelve sólo el saludo **sin gastar tokens** — pensado
  para cuando el usuario abre el panel antes de escribir nada.
- `sessionId`: pasen el mismo del workspace para que el consumo quede correlacionado.

### 2.3 Conversación del brief

```graphql
mutation SendValuacionMessage($input: ValuacionMessageRequest!) {
  sendValuacionMessage(input: $input) {
    reply
    briefComplete     # ← habilitar el botón "Generar resultado" cuando sea true
    limitReached
    valuacion { layer completionPercent coveredFields images { url } tokenStatus { remaining } }
  }
}
```

**Para la barra de progreso del brief:** usar `completionPercent` y `layer`, que
vienen calculados por el backend en cada respuesta. La fórmula es fija —
respuestas del brief 70% + imágenes 30% (topea en 3 imágenes) — así que dos
valuaciones con la misma info siempre dan la misma capa. No la recalculen en el front.

**`coveredFields`** son los 8 ejes ya cubiertos, útil para un checklist visual:

```
identificacion · estado · antiguedad · documentacion
mantenimiento · danos · mercado · precioReferencia
```

**Capas:** `layer` 1 = 0-33% · 2 = 34-66% · 3 = 67-100%.

### 2.4 Generar el sticker

```graphql
mutation GenerateValuacionResult($valuacionId: String!) {
  generateValuacionResult(valuacionId: $valuacionId) {
    id status layer completionPercent confidencePercent finalScore
    photoAnalysis {
      description brand model condition components damages confidence
      scores { estado marca mercado rareza }
    }
    descriptiveAnalysis {
      summary confidence
      scores { uso vidaUtil mantenimiento documentacion }
    }
    estimatedValues { liquidacion mercado premium currency }
    dataSources { field source }
    versionsCount
    tokenStatus { remaining allowance }
  }
}
```

Notas importantes para armar el sticker:

- **`photoAnalysis` es `null` si no se subieron imágenes.** El backend lo fuerza
  a null aunque el modelo invente observaciones visuales. El radar tiene que
  poder dibujarse con sólo los 4 ejes descriptivos.
- **`finalScore`** es el promedio de los ejes presentes (los 8, o sólo 4 si no
  hubo fotos). Ya viene calculado, con 2 decimales.
- **`confidencePercent` está acotado por la capa** (capa 1 → máx 45%, capa 2 →
  máx 75%, capa 3 → 100%). Es intencional: sin esto el modelo declaraba 95% de
  confianza sobre una sola foto.
- **`estimatedValues`** siempre cumple `liquidacion ≤ mercado ≤ premium`. Puede
  venir `null` entero si el modelo no pudo estimar.
- **`dataSources`**: para los íconos de "Fuentes de Información" del sticker.
  `source` es `fotografica | descriptiva | inferencia_ia`.
- Regenerar sobre una valuación que ya tenía resultado **archiva el anterior**
  como versión (`versionsCount` sube). No se pierde nada.

### 2.5 Guardar, restaurar, eliminar

```graphql
mutation { saveValuacionResult(valuacionId: "...") { id status } }      # → saved
mutation { restoreValuacionToBoard(valuacionId: "...") { id status } }  # → completed
mutation { deleteValuacion(valuacionId: "...") }                       # → archived
```

`saveValuacionResult` sólo acepta valuaciones en `completed`, y
`restoreValuacionToBoard` sólo las que están en `saved`. Si el estado no
corresponde, devuelve error 400 con mensaje en español (mostrable directo).

El borrado es **lógico**: la valuación deja de aparecer en `getUserValuaciones`
pero no se pierde el registro ni los tokens gastados.

### 2.6 Historial

```graphql
query { getUserValuaciones(limit: 20, page: 1) {
  valuaciones { id category status layer finalScore createdAt estimatedValues { mercado } }
  total hasMore
} }
```

---

## 3. Match IA

```graphql
mutation SearchMatch($input: SearchMatchRequest!) {
  searchMatch(input: $input) {
    matches { postId title description price imageUrl postType relevanceScore matchReason }
    interpretation
    candidatesEvaluated
    limitReached
    message
    tokenStatus { remaining }
  }
}
```

Se puede mandar cualquier combinación de:

```json
{ "input": {
  "text": "busco algo para cortar el pasto",
  "imageUrls": ["https://utfs.io/f/..."],
  "postId": "<id de un anuncio de referencia>",
  "mode": "consultor_ventas",
  "sessionId": "<sessionId del workspace>"
}}
```

Al menos uno de `text` / `imageUrls` / `postId` es obligatorio (400 si no).

**Para las cards:**
- `relevanceScore` (0-100) → el % de similitud. El backend ya descarta todo lo
  que esté por debajo de 30.
- `matchReason` → texto listo para mostrar, en español, dirigido al usuario.
- **`imageUrl` puede ser `null`**: las necesidades (`postType: "petition"`) no
  tienen imágenes. Prevean un placeholder.
- `message` viene con un texto amable cuando no hay resultados. Si `matches`
  está vacío, mostrar `message` en vez de un vacío pelado.

**Alcance de la búsqueda (importante para expectativas):** Match sólo devuelve
anuncios **públicos y de comportamiento "libre"**, activos y sin vencer. Los
anuncios de agenda quedan fuera a propósito: son privados de la red del autor y
el match se pide sin contexto de relación. Tampoco devuelve anuncios propios del
usuario que busca.

---

## 4. Modos de Cubito (chat existente)

`sendMessageToChatbot` acepta cuatro campos nuevos, todos opcionales. **El chat
actual sigue funcionando igual si no los mandan.**

```graphql
mutation {
  sendMessageToChatbot(sendMessageRequest: {
    message: "¿cómo mejoro este anuncio?"
    sessionId: "..."
    mode: "entrenamiento_publicitario"
    extraPrompt: "enfocate en el título"
    rolePrompt: "respondé como si fueras un experto en autos clásicos"
    imageUrls: ["https://utfs.io/f/..."]
  }) { botResponse tokenStatus { remaining } }
}
```

| Campo | Para qué |
|---|---|
| `mode` | Selector de especialidad |
| `rolePrompt` | Prompt libre de rol del usuario (máx 500 chars) |
| `extraPrompt` | Prompt sugerido que se suma al fijo (Entrenamiento Publicitario) |
| `imageUrls` | Cubito analiza las imágenes (máx 4) |

**Valores válidos de `mode`** (cualquier otro cae en `general` sin romper):

```
general · disenador_grafico · marketing · especialista_negocios
branch · cliente_b2b · consultor_ventas · analista_mercado
entrenamiento_publicitario
```

`entrenamiento_publicitario` es el modo de la página del anuncio: aplica el
Prompt Fijo, y si mandan `extraPrompt` se concatena.

---

## 5. Integración con anuncios

```graphql
# Asociar una valuación a un anuncio propio
mutation { linkValuacionToPost(valuacionId: "...", postId: "...") { id postId } }

# Mostrar la valuación en la página del anuncio (nullable)
query { getValuacionByPost(postId: "...") { id layer finalScore estimatedValues { mercado } } }

# Pre-cargar el wizard de creación de anuncio
query { getValuacionPostDraft(valuacionId: "...") {
  title description suggestedPrice imageUrls brand modelType condition valuacionId
} }
```

`linkValuacionToPost` exige que **el anuncio sea del mismo usuario** (403 si no).

`getValuacionPostDraft` **no crea el anuncio**: devuelve el payload para que
abran el wizard de creación normal con los campos pre-cargados. Después de
crearlo, llamen a `linkValuacionToPost` con el `postId` nuevo.

---

## 6. Tokens

Todas las respuestas que consumen IA traen `tokenStatus`, que es **el mismo tipo
`ChatbotTokenStatusResponse` que ya usa el chat**. El `TokenDisplay` no necesita
un contrato nuevo:

```graphql
tokenStatus { hasActivePaidPlan source allowance used remaining communityTokensAvailable resetsAt }
```

**Ojo con el costo:** valuación y match usan `gpt-4o` cuando hay imágenes, que
cuesta ~10x más por token que el chat normal. El backend descuenta la cuota
ponderada por ese costo, así que **una valuación con fotos consume bastante más
que un chat de largo similar**. Conviene avisarlo en la UI antes de generar el
resultado.

Cuando no hay saldo:
- Valuación (brief): `limitReached: true` y `reply` trae el mensaje explicativo.
- Match: `limitReached: true` y `message` trae el mensaje.
- `generateValuacionResult`: tira error 400 con el mensaje (no hay respuesta parcial).

En los tres casos el texto ya viene en español y es mostrable directo.

---

## 7. Imágenes

Las URLs se validan contra una allowlist de hosts. **Sólo se aceptan imágenes de
UploadThing por https** (`utfs.io` y `*.ufs.sh` por defecto).

Si mandan una URL de otro host, la mutation falla con:
> "Sólo se aceptan imágenes subidas a Publicité. Volvé a cargarlas desde el panel de referencias."

⚠️ **Confirmar con nosotros el host real que devuelve su UploadThing** antes de
salir a producción. Si su app usa un subdominio propio (`<appId>.ufs.sh`) ya está
cubierto; si devuelve otra cosa, se agrega por variable de entorno sin tocar código.

Límites: 10 imágenes por valuación, 4 por búsqueda de match, 4 por mensaje de chat.

**Flujo del editor de imágenes:** la imagen editada hay que **volver a subirla a
UploadThing** y mandar la URL nueva en `sendValuacionMessage.imageUrls`. El
backend no recibe binarios ni base64.

---

## 8. Errores

Errores de negocio salen como GraphQL errors con mensaje en español listo para
mostrar. Los casos que conviene contemplar:

| Situación | Código | Mensaje |
|---|---|---|
| Sin login en valuación | 401 | "Necesitás iniciar sesión para usar la Valuación IA" |
| Valuación de otro usuario | 403 | "La valuación pertenece a otro usuario" |
| Anuncio ajeno en link | 403 | "Sólo podés asociar una valuación a un anuncio propio" |
| Valuación inexistente/borrada | 404 | "Valuación no encontrada" |
| Límite diario | 400 | "Alcanzaste el máximo de N valuaciones por día…" |
| Imagen de host no permitido | 400 | ver sección 7 |
| Sin tokens en generateResult | 400 | mensaje del sistema de tokens |
| Match sin input | 400 | "Contame qué estás buscando, o subí una imagen o un anuncio de referencia" |

---

## 9. Lo que el front todavía tiene que decidir

Cosas que el backend deja abiertas a propósito:

1. **"Guardar" un match** es estado del front. Match es stateless: no persiste
   resultados. Guarden los `postId` en el estado del workspace (o en localStorage).
2. **El panel izquierdo de referencias** es estado del front hasta que se manda
   en un `imageUrls`. El backend sólo conoce las imágenes que ya se enviaron a
   una valuación.
3. **Exportar el sticker a PNG** es 100% front (`html-to-image`). No hay endpoint.
4. **El radar** se dibuja con los 8 scores; recuerden el caso de 4 ejes cuando
   `photoAnalysis` es null.

---

## 10. Variables de entorno (para el deploy, no para el front)

```env
OPENAI_VISION_MODEL=gpt-4o
CHATBOT_TOKENS_MODEL_MULTIPLIERS={"gpt-4o":10,"gpt-4o-mini":1}
VALUACION_MAX_PER_DAY=10
VALUACION_MAX_IMAGES=10
MATCH_MAX_IMAGES=4
UPLOADTHING_ALLOWED_HOSTS=utfs.io,ufs.sh
```

Todas tienen default razonable: si no se definen, el sistema funciona igual.
