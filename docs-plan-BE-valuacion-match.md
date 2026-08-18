# Plan de Backend — Módulo IA Valuación y Match

## Resumen

Extensión del módulo `chatbot` existente (NestJS + Mongoose + OpenAI) para soportar:
- Valuación IA con análisis fotográfico + descriptivo (GPT-4o con vision)
- Match IA con búsqueda por keywords/categoría (endpoint stateless, sin persistencia propia)
- Modos de Cubito (system prompts intercambiables)
- Nueva entidad `Valuacion` para persistir valuaciones y resultados

---

## 1. Arquitectura Actual (Referencia)

```
module_user/chatbot/
├── application/
│   ├── adapter/        → ChatbotAdapter (expone al resolver GraphQL)
│   ├── dto/            → Request/Response DTOs
│   └── service/        → ChatbotService (orquesta lógica)
├── domain/
│   ├── entity/         → ChatSession, ChatMessage, token types
│   ├── repository/     → ChatbotRepositoryInterface
│   └── service/        → ChatbotAIService (OpenAI), TokenService
└── infrastructure/
    ├── adapter/        → Implementación del adapter
    ├── graphql/        → Resolver GraphQL
    ├── module/         → ChatbotModule (NestJS)
    ├── repository/     → MongoDB repository
    └── schemas/        → Mongoose schemas
```

**Modelo actual:** `gpt-4o-mini` para chat, `gpt-image-1-mini` para imágenes.
**Token system:** Ya funcional con planes, cuota comunitaria, tracking por request.

---

## 2. Nuevas Entidades (Mongoose Schemas)

### 2.1 `Valuacion` — Schema principal

```typescript
// schemas/valuacion.schema.ts
const ValuacionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, index: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post', default: null },

  // Metadata
  category: { 
    type: String, 
    enum: ['imagen', 'objeto', 'servicio', 'bien', 'otro'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['draft', 'processing', 'completed', 'archived'], 
    default: 'draft' 
  },
  layer: { type: Number, enum: [1, 2, 3], default: 1 },
  completionPercent: { type: Number, default: 0, min: 0, max: 100 },
  confidencePercent: { type: Number, default: 0, min: 0, max: 100 },

  // Brief - Respuestas del usuario
  briefAnswers: [{
    question: String,
    answer: String,
    skipped: { type: Boolean, default: false },
    source: { type: String, enum: ['user', 'photo', 'inference'] }
  }],

  // Imágenes subidas
  images: [{ 
    url: String, 
    uploadedAt: Date,
    analysisNotes: String  // Notas de la IA sobre esta imagen
  }],

  // Resultados - Análisis Fotográfico
  photoAnalysis: {
    description: String,
    brand: String,
    model: String,
    condition: String,
    components: [String],
    damages: [String],
    scores: {
      estado: { type: Number, min: 1, max: 5 },
      marca: { type: Number, min: 1, max: 5 },
      mercado: { type: Number, min: 1, max: 5 },
      rareza: { type: Number, min: 1, max: 5 },
    },
    confidence: { type: Number, min: 0, max: 100 }
  },

  // Resultados - Análisis Descriptivo
  descriptiveAnalysis: {
    summary: String,
    scores: {
      uso: { type: Number, min: 1, max: 5 },
      vidaUtil: { type: Number, min: 1, max: 5 },
      mantenimiento: { type: Number, min: 1, max: 5 },
      documentacion: { type: Number, min: 1, max: 5 },
    },
    confidence: { type: Number, min: 0, max: 100 }
  },

  // Valores estimados
  estimatedValues: {
    liquidacion: { type: Number, default: null },
    mercado: { type: Number, default: null },
    premium: { type: Number, default: null },
    currency: { type: String, default: 'USD' }
  },

  // Puntuación final
  finalScore: { type: Number, min: 1, max: 5 },

  // Fuentes de cada dato
  dataSources: [{
    field: String,
    source: { type: String, enum: ['fotografica', 'descriptiva', 'inferencia_ia'] }
  }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'valuaciones' });

ValuacionSchema.index({ userId: 1, createdAt: -1 });
ValuacionSchema.index({ postId: 1 });
ValuacionSchema.index({ status: 1 });
```

### 2.2 Match IA — Sin schema propio

Match IA es un endpoint **stateless**. No persiste resultados en una colección propia.
Recibe el input del usuario, busca posts que matcheen, y devuelve la lista.
Si el usuario quiere "guardar" un match, es simplemente una referencia a un postId
que se maneja en el estado del frontend (panel derecho del workspace).

---

## 3. Nuevos Endpoints (GraphQL)

### 3.1 Mutations — Valuación IA

```graphql
type Mutation {
  # Inicia una nueva valuación
  startValuacion(input: StartValuacionInput!): Valuacion!
  
  # Envía mensaje al brief de valuación (la IA responde con siguiente pregunta o resultado)
  sendValuacionMessage(input: ValuacionMessageInput!): ValuacionMessageResponse!
  
  # Omitir pregunta actual del brief
  skipBriefQuestion(valuacionId: String!): ValuacionMessageResponse!
  
  # Solicitar generación del resultado final
  generateValuacionResult(valuacionId: String!): Valuacion!
  
  # Guardar resultado (mover a panel derecho)
  saveValuacionResult(valuacionId: String!): Valuacion!
  
  # Asociar valuación a un anuncio
  linkValuacionToPost(valuacionId: String!, postId: String!): Valuacion!
  
  # Eliminar valuación
  deleteValuacion(valuacionId: String!): Boolean!
}
```

### 3.2 Mutations — Match IA

```graphql
type Mutation {
  # Buscar anuncios similares (stateless, no persiste)
  searchMatch(input: StartMatchInput!): MatchResponse!
}
```

### 3.3 Queries

```graphql
type Query {
  # Obtener valuaciones del usuario
  getUserValuaciones(limit: Int, page: Int): ValuacionListResponse!
  
  # Obtener una valuación por ID
  getValuacion(valuacionId: String!): Valuacion!
}
```

### 3.4 Responses — Match IA

```graphql
type MatchResponse {
  matches: [MatchedPost!]!
  tokensUsed: Float
}

type MatchedPost {
  postId: String!
  title: String!
  description: String
  price: Float
  imageUrl: String
  relevanceScore: Int!       # 0-100
  matchReason: String!       # Explicación de por qué matchea
}
```

### 3.4 Inputs

```graphql
input StartValuacionInput {
  category: String!          # imagen | objeto | servicio | bien | otro
  imageUrls: [String!]       # URLs de imágenes ya subidas via UploadThing
  description: String        # Descripción libre opcional
  mode: String               # Modo de Cubito (diseñador, marketing, etc.)
}

input ValuacionMessageInput {
  valuacionId: String!
  message: String!
  imageUrls: [String!]       # Imágenes adicionales
}

input StartMatchInput {
  inputType: String!         # text | image | post | mixed
  text: String
  imageUrls: [String!]
  postId: String             # Si matchea contra un anuncio existente
  mode: String
}
```

---

## 4. Lógica de Negocio — Valuación IA

### 4.1 Servicio `ValuacionService`

```typescript
// application/service/valuacion.service.ts

class ValuacionService {
  
  // 1. Crear valuación y obtener primera pregunta del brief
  async startValuacion(userId, input): Promise<Valuacion> {
    // Crear entidad en DB con status 'draft'
    // Llamar a OpenAI con system prompt de valuación + categoría
    // Devolver primera pregunta del brief
  }

  // 2. Procesar respuesta del usuario al brief
  async processMessage(userId, valuacionId, message, images): Promise<Response> {
    // Cargar valuación de DB
    // Agregar respuesta al briefAnswers
    // Recalcular completionPercent y layer
    // Llamar a OpenAI con contexto del brief hasta ahora
    // Si hay imágenes nuevas: analizar con GPT-4o vision
    // Devolver siguiente pregunta o indicar que el brief está completo
  }

  // 3. Generar resultado final
  async generateResult(userId, valuacionId): Promise<Valuacion> {
    // Llamar a OpenAI con TODO el contexto (brief + imágenes)
    // System prompt especial que pide JSON estructurado con:
    //   - scores por cada eje (1-5)
    //   - descripción fotográfica y descriptiva
    //   - valores estimados (liquidación, mercado, premium)
    //   - porcentaje de confianza
    //   - fuentes de cada dato
    // Parsear respuesta JSON
    // Guardar en DB con status 'completed'
    // Cobrar tokens
  }
}
```

### 4.2 System Prompt — Valuación IA

```typescript
const VALUACION_SYSTEM_PROMPT = `
Eres un experto valuador de objetos, bienes y servicios. Tu rol es guiar al usuario
a través de un brief estructurado para obtener la mayor cantidad de información posible
sobre lo que quiere valuar.

CATEGORÍA SELECCIONADA: {category}

FLUJO DEL BRIEF:
1. Saluda y confirma la categoría
2. Pregunta UNA cosa a la vez, en este orden:
   - ¿Qué es exactamente? (marca, modelo, tipo)
   - ¿En qué estado se encuentra? (nuevo, usado, reparado)
   - ¿Cuánto tiempo lo tiene / lo usa?
   - ¿Tiene documentación? (factura, garantía, certificados)
   - ¿Se le hizo mantenimiento? ¿Cuándo fue el último?
   - ¿Tiene algún daño o desgaste visible?
   - ¿En qué mercado/rubro se mueve? (lujo, cotidiano, profesional)
   - ¿Conoce el precio original o de referencia?

REGLAS:
- Haz UNA pregunta por mensaje
- Si el usuario dice "omitir" o "no sé", aceptá y pasá a la siguiente
- Sé conversacional y amable, no interrogador
- Cuando tengas suficiente info (o el usuario diga "listo"), indicá que vas a generar el resultado
- Si hay imágenes, mencioná lo que observás en ellas

MODO ESPECIALISTA: {mode_context}
`;
```

### 4.3 System Prompt — Generación de Resultado

```typescript
const VALUACION_RESULT_PROMPT = `
Con base en toda la información recopilada (brief + imágenes), generá un JSON
con la siguiente estructura EXACTA. No agregues texto fuera del JSON.

{
  "photoAnalysis": {
    "description": "Descripción de lo observado en las imágenes",
    "brand": "Marca identificada o null",
    "model": "Modelo identificado o null",
    "condition": "Estado visual general",
    "components": ["componente1", "componente2"],
    "damages": ["daño1"] o [],
    "scores": { "estado": 1-5, "marca": 1-5, "mercado": 1-5, "rareza": 1-5 },
    "confidence": 0-100
  },
  "descriptiveAnalysis": {
    "summary": "Resumen de la info del usuario",
    "scores": { "uso": 1-5, "vidaUtil": 1-5, "mantenimiento": 1-5, "documentacion": 1-5 },
    "confidence": 0-100
  },
  "estimatedValues": {
    "liquidacion": número_en_USD,
    "mercado": número_en_USD,
    "premium": número_en_USD
  },
  "finalScore": promedio_1_a_5,
  "confidencePercent": 0-100,
  "layer": 1|2|3,
  "dataSources": [{"field": "nombre", "source": "fotografica|descriptiva|inferencia_ia"}]
}

REGLAS PARA VALORES ESTIMADOS:
- Liquidación: precio de venta rápida/urgente (70-80% del mercado)
- Mercado: precio promedio de mercado actual
- Premium: precio máximo razonable en condiciones ideales de venta
- Si no hay suficiente información, usá tu mejor estimación y bajá la confianza
- Los precios son en USD

REGLAS PARA SCORES:
- 5 estrellas = Excelente
- 4 estrellas = Muy bueno
- 3 estrellas = Bueno
- 2 estrellas = Regular
- 1 estrella = Deficiente

REGLAS PARA CAPAS:
- Capa 1 (0-33% completitud): Info mínima, confianza baja
- Capa 2 (34-66% completitud): Info parcial, confianza media
- Capa 3 (67-100% completitud): Info completa, confianza alta
`;
```

---

## 5. Lógica de Negocio — Match IA (Approach Simplificado)

### 5.1 Estrategia

En lugar de embeddings vectoriales, usamos un approach en 2 pasos:

1. **Extracción de keywords con IA:** GPT-4o analiza el input del usuario (texto/imagen) y extrae: categorías relevantes, keywords, rango de precio, tipo de producto/servicio.

2. **Búsqueda en MongoDB:** Con las keywords extraídas, hacemos queries sobre los campos `searchTitle`, `searchDescription`, `category` y `price` de la colección `posts` usando regex y filtros combinados.

3. **Ranking con IA:** Los resultados de Mongo se pasan a la IA para que rankee por relevancia y explique por qué matchea cada uno.

### 5.2 Servicio `MatchService`

```typescript
class MatchService {

  async searchMatch(userId, input): Promise<MatchResponse> {
    // 1. Gate de tokens
    const tokenGate = await this.tokenService.resolveAndCheck(userId);
    if (!tokenGate.allowed) throw new Error('Sin tokens disponibles');

    // 2. Llamar a OpenAI para extraer keywords/categorías del input
    const extraction = await this.extractMatchCriteria(input);
    // extraction = { keywords: [...], categories: [...], priceRange: {...}, type: "good|service" }

    // 3. Buscar en MongoDB con los criterios extraídos
    const candidates = await this.searchPosts(extraction);
    // Usa: $regex en searchTitle/searchDescription, $in en category, rango en price

    // 4. Pasar candidatos a la IA para ranking
    const ranked = await this.rankMatches(input, candidates);
    // La IA devuelve un JSON con postId, relevanceScore, matchReason

    // 5. Cobrar tokens y devolver
    await this.tokenService.recordUsage(tokenGate, totalUsage, { kind: 'match' });
    return { matches: ranked, tokensUsed };
  }

  private async extractMatchCriteria(input): Promise<MatchCriteria> {
    // System prompt que pide JSON con keywords, categorías, priceRange
    // Si hay imagen: usar GPT-4o vision para describir qué se ve
  }

  private async searchPosts(criteria: MatchCriteria): Promise<Post[]> {
    // Query MongoDB:
    // - $or con $regex por cada keyword en searchTitle y searchDescription  
    // - $in en category si hay categorías
    // - $gte/$lte en price si hay rango
    // - isActive: true
    // - Limit 20 candidatos
  }

  private async rankMatches(input, candidates: Post[]): Promise<RankedMatch[]> {
    // Pasar al modelo: "Dado este input del usuario y estos N anuncios candidatos,
    // rankeá del más al menos relevante y explicá por qué matchea cada uno"
    // Devuelve JSON con relevanceScore 0-100 y matchReason por cada post
  }
}
```

### 5.3 System Prompt — Extracción de Criterios

```typescript
const MATCH_EXTRACTION_PROMPT = `
Analizá el siguiente input del usuario y extraé criterios de búsqueda.
Devolvé SOLO un JSON con esta estructura:

{
  "keywords": ["keyword1", "keyword2", ...],
  "categories": ["categoría1", ...],
  "priceRange": { "min": number|null, "max": number|null },
  "postType": "good" | "service" | "petition" | null,
  "description": "Resumen en 1 oración de lo que busca"
}

REGLAS:
- Keywords: palabras clave relevantes para buscar en títulos y descripciones
- Categories: inferir categorías de la plataforma que podrían aplicar
- Si hay imagen: describir lo que ves y extraer keywords de eso
- Si no hay suficiente info para un campo, poné null
`;
```

---

## 6. Modos de Cubito — System Prompts

### 6.1 Implementación

Los modos no cambian la IA ni crean agentes. Solo agregan un bloque de contexto adicional al system prompt existente. El frontend envía el `mode` como parámetro en cada request.

### 6.2 Archivo de Contextos por Modo

```typescript
// domain/service/cubito-modes.ts

export const CUBITO_MODES: Record<string, string> = {
  general: '',  // Sin contexto adicional

  disenador_grafico: `
    Respondé como un diseñador gráfico profesional. Enfocate en:
    - Composición visual, balance, paleta de colores
    - Tipografía y jerarquía visual
    - Identidad de marca y coherencia visual
    - Formatos adecuados para cada plataforma
    - Principios de diseño (contraste, repetición, alineación, proximidad)
    Usá terminología de diseño cuando sea apropiado.
  `,

  marketing: `
    Respondé como un especialista en marketing digital. Enfocate en:
    - Estrategias de posicionamiento y diferenciación
    - Copywriting y comunicación persuasiva
    - Análisis de competencia y mercado
    - Segmentación de audiencia y targeting
    - Métricas y KPIs relevantes
    - Tendencias de marketing actual
  `,

  especialista_negocios: `
    Respondé como un consultor de negocios. Enfocate en:
    - Modelo de negocio y propuesta de valor
    - Análisis costo-beneficio
    - Estrategias de pricing y monetización
    - Escalabilidad y crecimiento
    - Negociación y cierre de ventas
    - ROI y proyecciones financieras
  `,

  branch: `
    Respondé como un especialista en branding. Enfocate en:
    - Construcción y gestión de marca
    - Brand voice y personalidad de marca
    - Naming y storytelling
    - Posicionamiento de marca en el mercado
    - Consistencia de marca across touchpoints
    - Brand equity y percepción del consumidor
  `,

  cliente_b2b: `
    Respondé como un asesor de ventas B2B. Enfocate en:
    - Relaciones comerciales entre empresas
    - Propuestas de valor para clientes corporativos
    - Ciclos de venta largos y decision makers múltiples
    - Account-based marketing
    - Contratos, SLAs y negociación corporativa
    - Networking y generación de leads B2B
  `,

  consultor_ventas: `
    Respondé como un consultor de ventas. Enfocate en:
    - Técnicas de venta y cierre
    - Objeciones y cómo manejarlas
    - Pricing strategies y descuentos
    - Presentación de productos/servicios
    - Funnels de venta y conversión
    - Fidelización y upselling
  `,

  analista_mercado: `
    Respondé como un analista de mercado. Enfocate en:
    - Análisis de oferta y demanda
    - Tendencias de mercado y proyecciones
    - Competencia directa e indirecta
    - Oportunidades y amenazas del mercado
    - Comportamiento del consumidor
    - Datos y métricas de mercado
  `,
};
```

### 6.3 Integración con el ChatbotAIService

Modificar `buildOpenAIMessages()` para aceptar un parámetro `mode`:

```typescript
// En chatbot.ai.service.ts - modificar generateResponse
async generateResponse(
  conversationHistory: ChatMessage[],
  userMessage: string,
  mode?: string,           // NUEVO
  imageUrls?: string[],    // NUEVO - para vision
): Promise<ChatbotAIResult> {
  
  const modeContext = CUBITO_MODES[mode || 'general'] || '';
  
  // Si hay imágenes, usar gpt-4o en vez de gpt-4o-mini
  const model = imageUrls?.length ? 'gpt-4o' : CHAT_MODEL;
  
  // Inyectar modeContext en el system prompt
  // Agregar imágenes como content type "image_url" en el user message
}
```

---

## 7. Modelo de IA — Uso por Funcionalidad

| Funcionalidad | Modelo | Razón |
|---------------|--------|-------|
| Chat general | `gpt-4o-mini` | Económico, suficiente para Q&A |
| Brief de valuación (sin imágenes) | `gpt-4o-mini` | Solo texto conversacional |
| Análisis de imágenes (valuación) | `gpt-4o` | Vision capabilities |
| Generación de resultado final | `gpt-4o` | Necesita precisión + vision |
| Extracción de criterios (match) | `gpt-4o-mini` | Solo parsing de texto |
| Ranking de match (con imágenes) | `gpt-4o` | Comparación visual |
| Ranking de match (solo texto) | `gpt-4o-mini` | Comparación semántica |
| Generación de imágenes | `gpt-image-1-mini` | Ya configurado |

### Consumo de tokens estimado por operación:
- Chat normal: ~200-800 tokens por request
- Brief (por pregunta): ~300-500 tokens
- Generación de resultado valuación: ~2000-4000 tokens (input pesado con brief completo)
- Match (extracción + ranking): ~1500-3000 tokens
- Análisis de imagen: ~1000-2000 tokens adicionales por imagen

---

## 8. Estructura de Archivos (Backend nuevo)

```
server/src/contexts/module_user/
├── chatbot/                          # Existente - se modifica
│   ├── domain/service/
│   │   ├── chatbot.ai.service.ts     # MODIFICAR: agregar mode + vision
│   │   └── cubito-modes.ts           # NUEVO: contextos por modo
│   └── infrastructure/graphql/
│       └── chatbot.resolver.ts       # MODIFICAR: agregar param mode
│
├── valuacion/                        # NUEVO módulo
│   ├── application/
│   │   ├── dto/
│   │   │   ├── start-valuacion.input.ts
│   │   │   ├── valuacion-message.input.ts
│   │   │   └── valuacion.response.ts
│   │   └── service/
│   │       └── valuacion.service.ts
│   ├── domain/
│   │   ├── entity/
│   │   │   └── valuacion.entity.ts
│   │   ├── repository/
│   │   │   └── valuacion.repository.interface.ts
│   │   └── service/
│   │       ├── valuacion.service.interface.ts
│   │       └── valuacion.prompts.ts      # System prompts de valuación
│   └── infrastructure/
│       ├── graphql/
│       │   └── valuacion.resolver.ts
│       ├── module/
│       │   └── valuacion.module.ts
│       ├── repository/
│       │   └── valuacion.repository.ts
│       └── schemas/
│           └── valuacion.schema.ts
│
├── match/                            # NUEVO módulo (stateless, sin schema propio)
│   ├── application/
│   │   ├── dto/
│   │   │   ├── start-match.input.ts
│   │   │   └── match.response.ts
│   │   └── service/
│   │       └── match.service.ts
│   ├── domain/
│   │   └── service/
│   │       ├── match.service.interface.ts
│   │       └── match.prompts.ts
│   └── infrastructure/
│       ├── graphql/
│       │   └── match.resolver.ts
│       └── module/
│           └── match.module.ts
```

---

## 9. Integración con Sistema de Tokens Existente

El sistema de tokens ya está implementado y funcional. Para valuación y match:

- **Cada request a OpenAI** se cobra igual que hoy (por tokens reales consumidos)
- **Valuación completa** (brief + generación resultado) puede consumir ~5000-8000 tokens reales ≈ 5-8 tokens Publicité
- **Match completo** (extracción + búsqueda + ranking) puede consumir ~3000-5000 tokens reales ≈ 3-5 tokens Publicité
- **GPT-4o es ~10x más caro que gpt-4o-mini** en input tokens — considerar esto en la UI (mostrar al usuario que valuación consume más)

### Modificación necesaria:
- Reusar `ChatbotTokenServiceInterface.resolveAndCheck()` y `recordUsage()` desde los nuevos servicios
- Agregar `kind: 'valuacion' | 'match'` al tracking de uso (además de 'chat' e 'image' existentes)

---

## 10. Consideraciones de Seguridad

- Validar que el `userId` del request coincida con el usuario autenticado (Clerk)
- Rate limiting por usuario en endpoints de valuación/match (más costosos que chat)
- Validar URLs de imágenes (solo aceptar URLs de UploadThing del proyecto)
- Sanitizar contenido de respuestas de la IA antes de guardar en DB
- No exponer tokens de OpenAI reales al frontend (solo "tokens Publicité")

---

## 11. Plan de Ejecución (Orden de desarrollo sugerido)

### Fase 1 — Base (8-10h)
1. Schema de Valuación en Mongoose
2. Módulo `valuacion` con estructura DDD
3. Endpoints básicos: start, sendMessage, generateResult
4. System prompts de valuación
5. Integración con GPT-4o vision

### Fase 2 — Match (4-5h)
1. Módulo `match` (sin schema, solo service + resolver)
2. Lógica de extracción de keywords + búsqueda en Mongo
3. Ranking con IA
4. Endpoint: searchMatch

### Fase 3 — Modos + Ajustes (4-5h)
1. Archivo de contextos por modo
2. Modificar ChatbotAIService para aceptar mode + imageUrls
3. Agregar kind 'valuacion'|'match' al token tracking
4. Queries de historial de valuaciones

### Fase 4 — Integración con Posts (3-4h)
1. Endpoint linkValuacionToPost
2. Lógica para crear anuncio desde valuación
3. Mostrar valuación en página del anuncio (campo opcional en Post)

---

## 12. Variables de Entorno Nuevas

```env
# Modelo para análisis con visión (valuación + match con imágenes)
OPENAI_VISION_MODEL=gpt-4o

# Límites de rate por usuario
VALUACION_MAX_PER_DAY=10
MATCH_MAX_PER_DAY=20

# Máximo de imágenes por valuación
VALUACION_MAX_IMAGES=10
```
