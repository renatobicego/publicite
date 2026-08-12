# Plan de UI — Módulo IA Valuación y Match

## Resumen

Rediseño de la experiencia de Cubito para incorporar un **Tablero de Trabajo** con tres paneles, manteniendo el chat popup actual intacto. El tablero es una tab nueva en la ruta `/cubito` que coexiste con el chat de página completa existente.

> **Contrato API:** Este plan está alineado con `contrato-API-valuacion-match-FRONT.md`.
> Todas las mutations/queries referenciadas ya están implementadas en el backend.

---

## 1. Estructura de Navegación

### 1.1 Popup Flotante (sin cambios mayores)
- Se mantiene tal cual está (`Chatbot.tsx` + `ChatWindow`)
- **Nuevo:** Agregar un botón "Ir al Tablero de Trabajo" que navega a `/cubito?tab=tablero`

### 1.2 Página `/cubito` — Tabs
La página actual pasa a tener un sistema de tabs:

| Tab | Contenido |
|-----|-----------|
| **Chat** | El CubitoChat actual (chat de página completa) |
| **Tablero de Trabajo** | Nuevo workspace con 3 paneles + chat inferior |

---

## 2. Layout del Tablero de Trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Tabs [Chat | Tablero] + Selector de Modo + Tokens      │
├──────────┬──────────────────────────────┬───────────────────────┤
│          │                              │                       │
│  PANEL   │      PANEL CENTRAL           │    PANEL DERECHO      │
│  IZQ     │      (Tablero IA)            │    (Resultados)       │
│          │                              │                       │
│ Referen- │  - Resultado de Valuación    │  - Stickers guardados │
│ cias     │  - Resultado de Match        │  - Descargar          │
│          │  - Editor de imagen          │  - Compartir          │
│ - Imgs   │  - Círculo de valoración     │  - Publicar anuncio   │
│ - Videos │                              │                       │
│ - Info   │                              │                       │
│ - Anun-  │                              │                       │
│   cios   │                              │                       │
│          │                              │                       │
├──────────┴──────────────────────────────┴───────────────────────┤
│  Chat inferior: Input + Botones de modo [Valuación IA] [Match]  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Responsive (Mobile)
En mobile/tablet, los 3 paneles se convierten en **tabs internas**:
- Tab "Referencias" (panel izquierdo)
- Tab "Tablero" (panel central) — **default activo**
- Tab "Resultados" (panel derecho)

El chat inferior queda siempre visible en todas las tabs.

---

## 3. Componentes Nuevos

### 3.1 `WorkspaceLayout.tsx`
Componente contenedor del tablero de 3 paneles.
- Props: `activeModule: "valuacion" | "match" | "idle"`
- Maneja el layout responsive (grid en desktop, tabs en mobile)

### 3.2 Panel Izquierdo — `ReferencesPanel.tsx`
- Upload de imágenes (usar UploadThing existente)
- Lista de imágenes subidas con preview y botón eliminar
- Botón "Editar" por imagen (abre `ImageEditorModal`)
- Sección de texto/info adjunta
- Drag & drop de imágenes al panel central
- **Nota API:** Este panel es 100% estado del frontend. El backend solo conoce las imágenes cuando se envían explícitamente en un `imageUrls` de alguna mutation. Las URLs deben ser de UploadThing (`utfs.io` / `*.ufs.sh`)
- **Límites:** máx 10 imágenes por valuación, 4 por match, 4 por mensaje de chat

### 3.3 Panel Central — `WorkboardPanel.tsx`
Renderiza dinámicamente según el módulo activo:

#### Modo Valuación IA:
- `ValuacionBrief.tsx` — Flujo de preguntas guiado por la IA
- `BriefProgress.tsx` — Barra de progreso + checklist de campos cubiertos:
  ```
  ✅ identificacion · ✅ estado · ⬜ antiguedad · ⬜ documentacion
  ⬜ mantenimiento · ⬜ danos · ✅ mercado · ⬜ precioReferencia
  ```
  Usa `completionPercent`, `layer` y `coveredFields` del response de `sendValuacionMessage`
- `ValuacionResult.tsx` — Muestra el resultado cuando la IA lo genera:
  - Círculo de Valoración (gráfico radar — 8 ejes o 4 si `photoAnalysis` es null)
  - Devolución Fotográfica (puede ser null si no se subieron imágenes)
  - Devolución Descriptiva
  - Valores Estimados (Liquidación / Mercado / Premium) — puede ser null entero
  - Porcentaje de confianza IA (acotado por capa: capa 1 → máx 45%, capa 2 → máx 75%)
  - Nivel de capa (1/2/3)
  - Badge "Versión N" si `versionsCount > 1`
  - Íconos de fuentes de información (`dataSources`: 📷 Fotográfica | 📝 Descriptiva | 🤖 Inferencia IA)
- `ImageEditor.tsx` — Wrapper de `react-photo-editor` para editar imágenes antes de enviar

#### Modo Match IA:
- `MatchResults.tsx` — Lista de anuncios similares encontrados
  - Header con interpretación de la IA (`interpretation`) + badge "N anuncios evaluados" (`candidatesEvaluated`)
  - Card de anuncio con imagen (placeholder si null — las necesidades no tienen imagen), título, precio, % de similitud (`relevanceScore`), razón del match (`matchReason`)
  - Botón "Guardar" para pasar al panel derecho (estado frontend, no persiste en BE)
  - Botón "Ver anuncio" para abrir en nueva tab
  - **Estado vacío:** Si `matches` está vacío, mostrar `message` del response (texto amable del backend)
  - **`limitReached`:** Si es true, mostrar banner con el mensaje del backend sobre tokens

#### Modo Idle (sin módulo activo):
- Pantalla de bienvenida con Cubito y los botones de acción disponibles

### 3.4 Panel Derecho — `ResultsPanel.tsx`
- Lista de resultados guardados (stickers de valuación, matches guardados)
- **Valuaciones guardadas** (vienen de `saveValuacionResult`, status = `saved`):
  - Botón descargar (exportar sticker como imagen PNG con `html-to-image`)
  - Botón compartir (copiar link o share nativo)
  - Botón "Publicar como anuncio" → llama `getValuacionPostDraft` y abre wizard de creación con datos pre-cargados. Después de crear, llama `linkValuacionToPost`
  - Botón "Volver a editar" → llama `restoreValuacionToBoard` (solo funciona en status `saved`)
  - Botón eliminar → llama `deleteValuacion` (soft delete, status → `archived`)
- **Matches guardados** (estado frontend, lista de postIds en localStorage/estado):
  - Mini-card con imagen, título, precio
  - Botón "Ver anuncio"
  - Botón quitar de guardados

### 3.5 Chat Inferior — `WorkspaceChat.tsx`
- Input de texto con botones de acción:
  - Botón **"Valuación IA"** — Activa el modo valuación (llama `startValuacion`)
  - Botón **"Match IA"** — Activa el modo match
  - Botón **"Omitir"** — Visible durante el brief, llama `skipValuacionBriefQuestion`
  - Botón **"Generar Resultado"** — Se habilita solo cuando `briefComplete === true` del response, llama `generateValuacionResult`
  - Selector de **Modo/Especialidad** de Cubito (envía `mode` en cada request)
- Campo opcional "Instrucción adicional" (max 500 chars) → envía como `rolePrompt`
- El chat mantiene la conversación contextual con Cubito
- Los mensajes de Cubito guían el proceso (Brief, preguntas, resultados)
- **Manejo de `limitReached`:** Si cualquier response trae `limitReached: true`, mostrar el mensaje del backend como banner/toast en vez de un error genérico
- **`sessionId`:** Se envía en todas las requests (valuación, match, chat) para correlacionar consumo. Usar el mismo de `sessionStorage`
- **Advertencia de costo:** Antes de llamar `generateValuacionResult`, mostrar confirmación: "Generar el resultado consume más tokens que un chat normal. ¿Continuar?"

### 3.6 `ValuacionSticker.tsx` — Componente del Sticker
Card de formato fijo con:
```
┌────────────────────────────────────────┐
│  [Imagen del objeto]                    │
│  CAPA 3 — 92%                          │
│  Reloj Automático                      │
│  Marca X – Modelo Y                   │
│                                        │
│  ┌─ Análisis Fotográfico ─┐            │
│  │ Estado: ★★★★☆           │            │
│  │ Marca: ★★★★★            │            │
│  │ Mercado: ★★★★☆          │            │
│  │ Rareza: ★★★☆☆           │            │
│  └─────────────────────────┘            │
│                                        │
│  ┌─ Análisis Descriptivo ─┐            │
│  │ Uso: ★★★★☆              │            │
│  │ Vida Útil: ★★★★☆        │            │
│  │ Mantenimiento: ★★★★★    │            │
│  │ Documentación: ★★★☆☆    │            │
│  └─────────────────────────┘            │
│                                        │
│  [Gráfico Radar / Círculo Valoración]  │
│                                        │
│  VALORES ESTIMADOS                     │
│  Liquidación: USD 250                  │
│  Mercado: USD 400                      │
│  Premium: USD 600                      │
│                                        │
│  Confianza IA: 88%                     │
│  Fuentes: 📷 Fotográfica | 📝 Desc | 🤖 IA │
└────────────────────────────────────────┘
```

### 3.7 `RadarChart.tsx` — Círculo de Valoración
- Gráfico de radar con 8 ejes (Estado, Marca, Mercado, Rareza, Uso, Vida Útil, Mantenimiento, Documentación)
- **Importante:** Si `photoAnalysis` es null (no se subieron imágenes), dibujar solo 4 ejes descriptivos (Uso, Vida Útil, Mantenimiento, Documentación)
- Cada eje de 1 a 5
- `finalScore` ya viene calculado del backend (promedio de ejes presentes, 2 decimales)
- Usar librería ligera (recharts o chart.js)

### 3.8 `ModeSelector.tsx` — Selector de Modo/Especialidad
Dropdown o chip-group con los modos (valores exactos del API):
- `general` — Asistente General (default)
- `disenador_grafico` — Diseñador Gráfico
- `marketing` — Marketing
- `especialista_negocios` — Especialista en Negocios
- `branch` — Branch/Branding
- `cliente_b2b` — Cliente B2B
- `consultor_ventas` — Consultor de Ventas
- `analista_mercado` — Analista de Mercado
- `entrenamiento_publicitario` — Entrenamiento Publicitario (modo especial para la página del anuncio, aplica Prompt Fijo + `extraPrompt`)

Cualquier valor no reconocido cae en `general` sin romper.

### 3.9 `TokenDisplay.tsx` — Indicador de Tokens
- Usa el tipo `ChatbotTokenStatusResponse` que ya existe (mismo que usa el chat actual)
- Muestra: `remaining` / `allowance` tokens Publicité
- Indica `source` (plan propio vs comunidad)
- `resetsAt` para mostrar cuándo se renueva la cuota
- Se actualiza con cada response (todas las mutations traen `tokenStatus`)

### 3.10 `ImageEditorModal.tsx` — Editor de Imágenes
- Modal con `react-photo-editor` integrado
- Al guardar: la imagen editada se **re-sube a UploadThing** (el backend no acepta base64 ni binarios) y reemplaza la original en el panel izquierdo
- La nueva URL de UploadThing se envía en `sendValuacionMessage.imageUrls`
- Opción de "Re-procesar con IA" después de editar

### 3.11 `PostValuacion.tsx` — Valuación en Página del Anuncio (NUEVO)
- Componente para mostrar en la página de detalle de un anuncio
- Llama `getValuacionByPost(postId)` — nullable, solo muestra si hay valuación asociada
- Mini-sticker con: capa, finalScore, valores estimados (mercado)
- Link a ver la valuación completa

---

## 4. Flujos de UI

### 4.1 Flujo Valuación IA
1. Usuario hace click en botón "Valuación IA" o escribe "quiero valuar algo"
2. Panel central muestra selector de categoría (Imagen/Objeto/Servicio/Bien/Otro)
3. Frontend llama `startValuacion({ category, imageUrls?, description?, mode, sessionId })`
4. Cubito responde en el chat inferior con `reply` (saludo + primera pregunta)
5. Panel central muestra `BriefProgress` con checklist de `coveredFields` y barra de `completionPercent`
6. Usuario responde preguntas → frontend llama `sendValuacionMessage({ valuacionId, message, imageUrls? })`
7. Con cada response, se actualiza `layer`, `completionPercent`, `coveredFields`
8. Usuario puede hacer click en "Omitir" → `skipValuacionBriefQuestion(valuacionId)` — baja la capa
9. Cuando `briefComplete === true`, se habilita botón "Generar Resultado"
10. Click en "Generar Resultado" → mostrar advertencia de tokens → confirmar → `generateValuacionResult(valuacionId)`
11. Mostrar spinner mientras `status === 'processing'`
12. Al completar: panel central muestra el sticker con radar, puntajes, valores
13. Usuario puede:
    - **Guardar** → `saveValuacionResult` → pasa al panel derecho (status `saved`)
    - **Regenerar** → `generateValuacionResult` otra vez (crea nueva versión, `versionsCount` sube)
    - **Eliminar** → `deleteValuacion` → soft delete (status `archived`)

### 4.2 Flujo Match IA
1. Usuario hace click en "Match IA" o escribe "buscame anuncios similares"
2. Cubito pregunta qué quiere matchear (se puede hacer directamente con el input)
3. Usuario escribe texto y/o sube imágenes y/o selecciona un anuncio de referencia
4. Frontend llama `searchMatch({ text?, imageUrls?, postId?, mode, sessionId })`
   - Al menos uno de `text` / `imageUrls` / `postId` es obligatorio (400 si no)
5. Mostrar spinner
6. Al recibir response:
   - Si `matches` tiene resultados: mostrar `interpretation` como texto introductorio + badge `candidatesEvaluated` + lista de `MatchCard`
   - Si `matches` está vacío: mostrar `message` del backend (estado vacío amable)
   - Si `limitReached`: mostrar banner con mensaje de tokens
7. Match solo devuelve anuncios públicos, de comportamiento "libre", activos y sin vencer. No devuelve anuncios propios del usuario.
8. "Guardar" un match = guardar el `postId` en estado local del panel derecho (no persiste en BE)

### 4.3 Flujo Edición de Imagen
1. Usuario hace click en una imagen del panel izquierdo → botón "Editar"
2. Se abre modal con `react-photo-editor`
3. Usuario edita (crop, rotate, brightness, draw, etc.)
4. Guarda → imagen editada se **re-sube a UploadThing** → nueva URL reemplaza la anterior en panel izquierdo
5. Opción "Re-analizar con IA" → envía la nueva URL en `sendValuacionMessage.imageUrls`

### 4.4 Flujo Publicar Anuncio desde Valuación
1. En panel derecho, usuario hace click en "Publicar como anuncio"
2. Frontend llama `getValuacionPostDraft(valuacionId)` → recibe `{ title, description, suggestedPrice, imageUrls, brand, modelType, condition, valuacionId }`
3. Se abre el wizard de creación de anuncio existente (`useCreateAdWizard`) con campos pre-cargados
4. Usuario completa/ajusta y publica
5. Después de crear el post, frontend llama `linkValuacionToPost(valuacionId, newPostId)`

---

## 5. Estructura de Archivos (Frontend)

```
src/app/(root)/cubito/
├── page.tsx                          # Page con tabs (Chat | Tablero)
├── CubitoChat.tsx                    # Chat existente (sin cambios)
├── CubitoTabs.tsx                    # Componente de tabs
└── workspace/
    ├── WorkspaceLayout.tsx           # Layout 3 paneles
    ├── WorkspaceChat.tsx             # Chat inferior del tablero
    ├── panels/
    │   ├── ReferencesPanel.tsx       # Panel izquierdo
    │   ├── WorkboardPanel.tsx        # Panel central
    │   └── ResultsPanel.tsx          # Panel derecho
    ├── valuacion/
    │   ├── ValuacionBrief.tsx        # Flujo de preguntas
    │   ├── ValuacionResult.tsx       # Resultado completo
    │   ├── ValuacionSticker.tsx      # Sticker de formato fijo
    │   ├── BriefProgress.tsx         # Barra + checklist de coveredFields
    │   ├── RadarChart.tsx            # Gráfico de valoración (4 u 8 ejes)
    │   ├── CategorySelector.tsx      # Selector de categoría
    │   └── CostWarningModal.tsx      # Advertencia de tokens antes de generar
    ├── match/
    │   ├── MatchResults.tsx          # Lista de resultados + interpretation
    │   ├── MatchCard.tsx             # Card de anuncio similar
    │   └── MatchEmptyState.tsx       # Estado vacío con message del BE
    ├── shared/
    │   ├── ModeSelector.tsx          # Selector de modo IA
    │   ├── RolePromptInput.tsx       # Input para instrucción adicional (rolePrompt)
    │   ├── TokenDisplay.tsx          # Indicador de tokens (tokenStatus)
    │   ├── TokenLimitBanner.tsx      # Banner cuando limitReached = true
    │   ├── ImageEditorModal.tsx      # Editor de imágenes
    │   └── ConfidenceIndicator.tsx   # Indicador de capa/confianza
    ├── post-integration/
    │   └── PostValuacion.tsx         # Mini-sticker en página del anuncio
    └── hooks/
        ├── useWorkspace.ts           # Estado general del workspace
        ├── useValuacion.ts           # Lógica de valuación (mutations/queries)
        └── useMatch.ts               # Lógica de match (searchMatch)
```

---

## 6. Dependencias Nuevas (Frontend)

| Paquete | Uso |
|---------|-----|
| `react-photo-editor` | Editor de imágenes |
| `recharts` o `react-chartjs-2` | Gráfico de radar |
| `html-to-image` | Exportar sticker como PNG |

---

## 7. Modificaciones a Componentes Existentes

| Componente | Cambio |
|------------|--------|
| `Chatbot.tsx` | Agregar botón "Ir al Tablero" dentro del ChatWindow |
| `CubitoChat.tsx` | Mover a ser una tab dentro de `CubitoTabs.tsx` |
| `page.tsx` (cubito) | Renderizar `CubitoTabs` en vez de `CubitoChat` directamente |
| `useChatbot.ts` | Agregar params `mode`, `rolePrompt`, `extraPrompt`, `imageUrls` a `handleSendMessage`. El hook actual sigue funcionando sin cambios si no se pasan (campos opcionales en el API) |
| Página del anuncio | Agregar `PostValuacion.tsx` que llama `getValuacionByPost(postId)` y muestra mini-sticker si existe |
| `useCreateAdWizard.ts` | Aceptar datos pre-cargados desde `getValuacionPostDraft` para iniciar con campos llenos |

---

## 8. Estados del Workspace

```typescript
interface WorkspaceState {
  activeModule: "idle" | "valuacion" | "match";
  activeMode: CubitoMode;
  rolePrompt: string;          // Instrucción adicional libre (max 500 chars)
  sessionId: string;           // Se envía en todas las requests
  
  // Valuación
  valuacion: {
    id: string | null;         // valuacionId del backend
    status: "idle" | "draft" | "processing" | "completed" | "saved";
    category: string | null;
    currentLayer: 1 | 2 | 3;
    completionPercent: number;
    coveredFields: string[];   // ejes ya cubiertos del brief
    briefComplete: boolean;    // habilita botón "Generar Resultado"
    result: ValuacionResult | null;
    versionsCount: number;
  };
  
  // Match
  match: {
    status: "idle" | "input" | "searching" | "results";
    results: MatchedPost[];           // del response de searchMatch
    interpretation: string | null;    // qué interpretó la IA
    candidatesEvaluated: number;
    message: string | null;           // mensaje cuando no hay resultados
    savedPostIds: string[];           // matches guardados (estado local)
  };
  
  // Paneles
  references: ReferenceItem[];     // Panel izquierdo (estado frontend)
  savedResults: SavedResult[];     // Panel derecho
  
  // Chat
  messages: WorkspaceMessage[];
  isProcessing: boolean;
  limitReached: boolean;           // si se quedó sin tokens
  limitMessage: string | null;     // mensaje del BE cuando limitReached
  
  // Tokens
  tokenStatus: {
    hasActivePaidPlan: boolean;
    source: string;
    allowance: number;
    used: number;
    remaining: number;
    communityTokensAvailable: number;
    resetsAt: string;
  } | null;
}

type CubitoMode = 
  | "general"
  | "disenador_grafico"
  | "marketing"
  | "especialista_negocios"
  | "branch"
  | "cliente_b2b"
  | "consultor_ventas"
  | "analista_mercado"
  | "entrenamiento_publicitario";

interface MatchedPost {
  postId: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;    // null para necesidades (petition)
  postType: string;
  relevanceScore: number;     // 0-100
  matchReason: string;
}

interface ValuacionResult {
  id: string;
  layer: 1 | 2 | 3;
  completionPercent: number;
  confidencePercent: number;
  finalScore: number;
  photoAnalysis: PhotoAnalysis | null;   // null si no hubo imágenes
  descriptiveAnalysis: DescriptiveAnalysis;
  estimatedValues: EstimatedValues | null; // null si no pudo estimar
  dataSources: DataSource[];
  versionsCount: number;
}
```

---

## 9. Mapeo de Acciones UI → API

| Acción del usuario | Mutation/Query GraphQL | Notas |
|----|----|----|
| Selecciona categoría y arranca valuación | `startValuacion` | Puede incluir imageUrls y description iniciales |
| Responde pregunta del brief | `sendValuacionMessage` | Actualiza layer, completionPercent, coveredFields |
| Click "Omitir" | `skipValuacionBriefQuestion` | Baja la capa de confianza |
| Click "Generar Resultado" | `generateValuacionResult` | Solo cuando `briefComplete === true`. Mostrar advertencia de costo |
| Click "Guardar" (panel central → derecho) | `saveValuacionResult` | Solo en status `completed` |
| Click "Volver a editar" (panel derecho → central) | `restoreValuacionToBoard` | Solo en status `saved` |
| Click "Eliminar" | `deleteValuacion` | Soft delete → `archived` |
| Click "Publicar como anuncio" | `getValuacionPostDraft` → wizard → `linkValuacionToPost` | 2 pasos |
| Ver valuación en página de anuncio | `getValuacionByPost` | Nullable |
| Historial de valuaciones | `getUserValuaciones` | Paginado |
| Buscar match | `searchMatch` | Stateless, no persiste |
| Chat con modo | `sendMessageToChatbot` + campos `mode`, `rolePrompt`, `imageUrls` | Backwards compatible |

---

## 10. Manejo de Errores

Todos los errores de negocio del backend vienen con mensaje **en español, listo para mostrar**.

| Situación | Cómo mostrar |
|-----------|-------------|
| `limitReached: true` en brief/match | Banner `TokenLimitBanner.tsx` con el mensaje del response |
| Error 400 en `generateValuacionResult` (sin tokens) | Toast con el mensaje |
| Error 401 (no logueado) | Redirect a login o toast |
| Error 403 (anuncio/valuación de otro usuario) | Toast con mensaje |
| Error 404 (valuación no encontrada) | Toast + redirect al tablero |
| Error 400 (imagen de host no permitido) | Toast: "Sólo se aceptan imágenes subidas a Publicité" |
| Match sin input | Validar en frontend antes de llamar (deshabilitar botón si no hay input) |

---

## 11. Notas de Implementación

1. **`sessionId` es obligatorio** en todas las requests del workspace. Generarlo al montar el workspace y persistir en sessionStorage.
2. **Match guarda estado en frontend:** Los matches "guardados" se almacenan como array de `postId` en el estado del workspace (o localStorage para persistir entre sesiones).
3. **Exportar sticker a PNG** es 100% frontend con `html-to-image`. No hay endpoint para esto.
4. **El radar se adapta:** 8 ejes si hay `photoAnalysis`, 4 ejes descriptivos si es null.
5. **Los campos del chat son backwards compatible:** `mode`, `rolePrompt`, `extraPrompt`, `imageUrls` son todos opcionales. El chat popup existente sigue funcionando sin mandar ninguno.
6. **Validar host de imágenes:** Solo URLs de UploadThing (`utfs.io`, `*.ufs.sh`). Confirmar el host real antes de producción.
