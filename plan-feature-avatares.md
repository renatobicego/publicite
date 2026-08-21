# Plan Feature: Avatares de IA Personalizados

## Resumen

El usuario podrá crear **Avatares** (personajes de IA) desde el Tablero de Cubito. Cada avatar tiene un **nombre** y un **contexto** (instrucciones de comportamiento). Al seleccionar un avatar antes de chatear, el sistema inyecta ese contexto como parte del system prompt, de forma similar al `rolePrompt` que ya existe.

Se usa la librería [Blobatar](https://blobatar.dev/) para generar una imagen visual única por avatar (basada en un seed derivado del nombre o un ID).

---

## Arquitectura Actual (referencia)

| Capa | Detalle |
|------|---------|
| **Backend** | NestJS + GraphQL (Apollo) + MongoDB (Mongoose). DDD por módulos en `server/src/contexts/`. |
| **Chatbot module** | `module_user/chatbot/` con entities (ChatSession, ChatMessage), service de IA (`chatbot.ai.service.ts`), y sistema de modos (`cubito-modes.ts`). |
| **Modos existentes** | `CUBITO_MODES` son modos hardcoded (disenador_grafico, marketing, etc.). También existe `rolePrompt` libre (max 500 chars) que se pasa por request. |
| **Frontend** | Next.js 14 App Router + NextUI. El Tablero está en `client/src/app/(root)/cubito/workspace/`. |
| **Comunicación** | Server Actions → Apollo Client → GraphQL mutations/queries al BE. |

---

## Modelo de Datos

### Nueva entidad: `Avatar`

```typescript
// server/src/contexts/module_user/chatbot/domain/entity/avatar.entity.ts

@ObjectType()
export class Avatar {
  _id: ObjectId;
  userId: string;        // mongoId del usuario dueño
  name: string;          // Nombre visible del avatar (ej: "Diseñador UX")
  context: string;       // Prompt/instrucciones de comportamiento (max ~1000 chars)
  seed: string;          // Seed para generar la imagen con Blobatar (puede ser el _id.toString())
  createdAt: Date;
  updatedAt: Date;
}
```

### Schema MongoDB

```typescript
// server/src/contexts/module_user/chatbot/infrastructure/schemas/avatar.schema.ts

const AvatarSchema = new Schema({
  userId:    { type: String, required: true, index: true },
  name:      { type: String, required: true, maxlength: 60 },
  context:   { type: String, required: true, maxlength: 1000 },
  seed:      { type: String, required: true },
}, { timestamps: true });

AvatarSchema.index({ userId: 1, name: 1 }, { unique: true });
```

> **Nota:** No se guarda imagen en DB. La imagen se genera client-side con Blobatar usando el `seed` (el `_id` del avatar).

---

## Backend (API GraphQL)

### Queries & Mutations

```graphql
# Queries
type Query {
  getUserAvatars: [Avatar!]!          # Devuelve avatares del usuario autenticado
}

# Mutations
type Mutation {
  createAvatar(input: CreateAvatarInput!): Avatar!
  updateAvatar(input: UpdateAvatarInput!): Avatar!
  deleteAvatar(avatarId: ID!): Boolean!
}

# Inputs
input CreateAvatarInput {
  name: String!       # max 60 chars
  context: String!    # max 1000 chars
}

input UpdateAvatarInput {
  avatarId: ID!
  name: String        # optional
  context: String     # optional
}

# Type
type Avatar {
  _id: ID!
  userId: String!
  name: String!
  context: String!
  seed: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Integración con el Chat

El mutation `sendMessageToChatbot` ya acepta `mode` y `rolePrompt` en el `SendMessageRequest`. Para los avatares se agrega un campo opcional:

```graphql
input SendMessageRequest {
  sessionId: String
  message: String!
  userId: String
  mode: String
  rolePrompt: String       # <- ya existe
  extraPrompt: String      # <- ya existe
  avatarId: ID             # <- NUEVO: si viene, se busca el avatar y se usa su context como rolePrompt
}
```

**Lógica en el service:**

```typescript
// En chatbot.service.ts → sendMessage()
if (request.avatarId) {
  const avatar = await this.avatarRepository.findById(request.avatarId);
  if (avatar && avatar.userId === request.userId) {
    // El contexto del avatar se usa como rolePrompt
    options.rolePrompt = avatar.context;
  }
}
```

Esto aprovecha la función `buildFreeRoleContext()` que ya existe en `cubito-modes.ts` y se inyecta en el system prompt automáticamente.

### Estructura de archivos BE (nuevo)

```
server/src/contexts/module_user/chatbot/
├── domain/
│   ├── entity/
│   │   └── avatar.entity.ts              ← NUEVO
│   └── repository/
│       └── avatar.repository.interface.ts ← NUEVO
├── application/
│   ├── dto/
│   │   └── HTTP-REQUEST/
│   │       ├── create-avatar.input.ts     ← NUEVO
│   │       └── update-avatar.input.ts     ← NUEVO
│   └── service/
│       └── avatar.service.ts              ← NUEVO
├── infrastructure/
│   ├── schemas/
│   │   └── avatar.schema.ts              ← NUEVO
│   ├── repository/
│   │   └── avatar.repository.ts          ← NUEVO
│   └── graphql/
│       └── resolver/
│           └── avatar.resolver.ts         ← NUEVO
```

### Validaciones BE

- `name`: required, max 60 chars, trim, no duplicados por usuario.
- `context`: required, max 1000 chars, trim.
- Máximo **10 avatares** por usuario (configurable por env).
- Solo el owner puede CRUD sus avatares.
- Al enviar `avatarId` en el chat, se valida que pertenezca al userId.

---

## Frontend (UI)

### 1. Instalación de Blobatar

```bash
npm install blobatar
```

Uso: `<Blobatar seed="avatar-id-string" size={64} />` genera un blob SVG único.

### 2. Ubicación en el Tablero

El panel de Avatares se agrega como **una nueva sección** dentro del `WorkspaceLayout` o como un **nuevo Tab** en `CubitoTabs`.

**Opción recomendada:** Agregar un tercer tab "Avatares" en `CubitoTabs.tsx`:

```
Tabs: [Chat] [Tablero de Trabajo] [Avatares]
```

O alternativamente, integrar la gestión de avatares dentro del panel izquierdo del Tablero (ReferencesPanel area).

### 3. Componentes UI nuevos

```
client/src/app/(root)/cubito/avatars/
├── AvatarsPanel.tsx           # Panel principal con lista de avatares
├── AvatarCard.tsx             # Card de cada avatar (Blobatar image + nombre)
├── CreateAvatarModal.tsx      # Modal con form: nombre + contexto
├── EditAvatarModal.tsx        # Modal para editar avatar existente
└── AvatarSelector.tsx         # Dropdown/selector para elegir avatar activo en el chat
```

### 4. AvatarsPanel (vista principal)

- Muestra grid/lista de avatares del usuario.
- Cada card muestra:
  - Imagen generada con `<Blobatar seed={avatar._id} size={48} />`
  - Nombre del avatar
  - Preview truncado del contexto
  - Botones: Editar / Eliminar
- Botón "Crear Avatar" abre el modal.

### 5. CreateAvatarModal

```
┌─────────────────────────────────────┐
│  Crear nuevo Avatar                 │
│                                     │
│  Nombre: [___________________]      │
│                                     │
│  Contexto / Instrucciones:          │
│  [                              ]   │
│  [  Ej: "Sos un experto en     ]   │
│  [  diseño gráfico. Respondé   ]   │
│  [  enfocado en composición,   ]   │
│  [  paletas y tipografías."    ]   │
│  [                              ]   │
│                                     │
│  Preview:                           │
│  [Blobatar generated image]         │
│                                     │
│         [Cancelar]  [Crear]         │
└─────────────────────────────────────┘
```

### 6. AvatarSelector (en el Chat)

Se agrega un **selector** arriba del input del chat (en `CubitoChat.tsx`) que permite elegir un avatar activo:

```
┌──────────────────────────────────────────┐
│ 🤖 Avatar: [Sin avatar ▾]               │
│            ├─ Sin avatar (Cubito general)│
│            ├─ 🟣 Diseñador UX           │
│            ├─ 🔵 Marketing Digital      │
│            └─ 🟢 Asesor de Ventas       │
└──────────────────────────────────────────┘
```

Cuando se selecciona un avatar, el `avatarId` se envía en cada `sendMessageToAI()`.

### 7. Flujo de datos (Frontend)

```
1. Usuario crea avatar → CreateAvatarModal
   → Server Action: createAvatarService(name, context)
   → GraphQL mutation: createAvatar
   → BE crea doc en MongoDB, devuelve Avatar

2. Usuario abre Chat con avatar seleccionado
   → useChatbot hook tiene state: selectedAvatarId
   → Al enviar mensaje, se incluye avatarId en el request
   → sendMessageToAI({ sessionId, message, userId, avatarId })

3. BE recibe avatarId
   → Busca avatar en DB
   → Valida ownership
   → Inyecta avatar.context como rolePrompt en buildModeContext()
   → OpenAI responde con el contexto del avatar
```

### 8. Services (Frontend)

```typescript
// client/src/services/avatarServices.ts

export const getUserAvatars = async (): Promise<Avatar[]> => { ... }
export const createAvatar = async (input: CreateAvatarInput): Promise<Avatar> => { ... }
export const updateAvatar = async (input: UpdateAvatarInput): Promise<Avatar> => { ... }
export const deleteAvatar = async (avatarId: string): Promise<boolean> => { ... }
```

```typescript
// client/src/graphql/avatarQueries.ts

export const getUserAvatarsQuery = gql`...`
export const createAvatarMutation = gql`...`
export const updateAvatarMutation = gql`...`
export const deleteAvatarMutation = gql`...`
```

### 9. Modificación al sendMessage existente

En `chatbotServices.ts`, agregar `avatarId` al variables del mutation:

```typescript
export const sendMessageToAI = async (request: SendMessageRequest) => {
  // ... existing code ...
  variables: {
    sendMessageRequest: {
      ...sendMessageRequest,
      avatarId: request.avatarId || undefined,  // ← NUEVO
    },
  },
}
```

---

## Resumen de cambios por capa

### Backend
| Archivo | Acción |
|---------|--------|
| `domain/entity/avatar.entity.ts` | Crear |
| `domain/repository/avatar.repository.interface.ts` | Crear |
| `application/dto/create-avatar.input.ts` | Crear |
| `application/dto/update-avatar.input.ts` | Crear |
| `application/service/avatar.service.ts` | Crear |
| `infrastructure/schemas/avatar.schema.ts` | Crear |
| `infrastructure/repository/avatar.repository.ts` | Crear |
| `infrastructure/graphql/resolver/avatar.resolver.ts` | Crear |
| `infrastructure/module/chatbot.module.ts` | Modificar (registrar nuevos providers) |
| `application/dto/HTTP-REQUEST/send-message.request.ts` | Modificar (agregar avatarId) |
| `application/service/chatbot.service.ts` | Modificar (resolver avatarId → context) |

### Frontend
| Archivo | Acción |
|---------|--------|
| `package.json` | Agregar dep `blobatar` |
| `src/app/(root)/cubito/avatars/AvatarsPanel.tsx` | Crear |
| `src/app/(root)/cubito/avatars/AvatarCard.tsx` | Crear |
| `src/app/(root)/cubito/avatars/CreateAvatarModal.tsx` | Crear |
| `src/app/(root)/cubito/avatars/EditAvatarModal.tsx` | Crear |
| `src/app/(root)/cubito/avatars/AvatarSelector.tsx` | Crear |
| `src/services/avatarServices.ts` | Crear |
| `src/graphql/avatarQueries.ts` | Crear |
| `src/types/avatarTypes.ts` | Crear |
| `src/app/(root)/cubito/CubitoTabs.tsx` | Modificar (agregar tab Avatares) |
| `src/app/(root)/cubito/CubitoChat.tsx` | Modificar (agregar AvatarSelector) |
| `src/components/buttons/ChatbotButton/useChatbot.ts` | Modificar (state selectedAvatarId) |
| `src/services/chatbotServices.ts` | Modificar (pasar avatarId en mutation) |
| `src/types/chatbotTypes.ts` | Modificar (agregar avatarId al type) |

---

## Orden de implementación sugerido

### Backend (primero)
1. Crear schema + entity de Avatar
2. Crear repository (interface + implementación)
3. Crear DTOs (inputs)
4. Crear service de Avatar (CRUD)
5. Crear resolver GraphQL
6. Registrar todo en chatbot.module
7. Modificar sendMessage para aceptar y resolver `avatarId`
8. Tests

### Frontend (después)
1. Instalar `blobatar`
2. Crear types + graphql queries
3. Crear services
4. Crear componentes de gestión (Panel, Cards, Modals)
5. Integrar tab en CubitoTabs
6. Crear AvatarSelector
7. Integrar selector en el Chat
8. Modificar useChatbot + chatbotServices para enviar avatarId

---

## Notas técnicas

- **Blobatar** genera SVGs determinísticos a partir de un seed string. Usar el `_id` del avatar como seed garantiza unicidad y consistencia sin guardar imágenes.
- El `context` del avatar se trata igual que `rolePrompt` existente: va delimitado con la advertencia de que es preferencia de TONO y ENFOQUE (no altera reglas del sistema). Esto previene prompt injection.
- Límite de 10 avatares por usuario para no abusar del storage.
- Si no se selecciona ningún avatar, el chat funciona exactamente como ahora (modo general o con los modos hardcoded del selector de modo existente).
