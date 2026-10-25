# Refactor: Brief Inteligente de Valuación IA

## Problema actual

El brief de valuación hace preguntas genéricas y secuenciales sin adaptarse al contexto de lo que se está valuando. Ejemplos concretos de lo que sale mal:

1. **No genera un título descriptivo.** Si el usuario dice "zapatillas de lanzamiento de jabalina marca Nike", el sistema no construye internamente "Zapatillas de lanzamiento de Jabalina Nike" como identificación del objeto.

2. **No usa lógica condicional entre preguntas.** Si el usuario dice que el objeto es NUEVO, igualmente pregunta por mantenimiento, daños y desgaste — cosas que no aplican para algo recién comprado.

3. **Las preguntas son demasiado rígidas.** El flujo actual sigue un orden fijo de 8 ejes sin importar qué se está valuando. Un servicio no tiene "daños visibles" y una zapatilla nueva no tiene "historial de mantenimiento".

4. **Los scores no se adaptan al tipo de objeto.** "Mantenimiento" para zapatillas nuevas no tiene sentido. "Rareza" para un servicio de plomería tampoco.

---

## Cambios requeridos

### 1. El modelo debe generar un `title` identificatorio

El JSON de respuesta del brief debe incluir un campo `title` que se actualice con cada turno:

```json
{
  "reply": "...",
  "coveredFields": [...],
  "briefComplete": false,
  "title": "Zapatillas de lanzamiento de Jabalina Nike"
}
```

**Regla:** Desde el primer mensaje donde el usuario identifica qué quiere valuar, el modelo genera un título descriptivo corto (máx 80 chars) que identifica el objeto. Se actualiza si aparece información nueva relevante (marca, modelo, tipo específico).

**Impacto BE:**
- `ValuacionEntity` necesita un campo `title: string` (optional, se llena durante el brief)
- `runBriefTurn` actualiza el `title` en cada respuesta si el modelo lo incluye
- `toResponse` lo expone al frontend
- `buildPostDraft` lo usa como título del anuncio (reemplaza la lógica actual de concatenar brand+model)

---

### 2. Preguntas condicionales — el modelo debe SALTAR ejes irrelevantes

El system prompt actual lista los 8 ejes y pide "preguntá el primero pendiente". Esto produce un interrogatorio secuencial sin inteligencia.

**Cambio en el prompt:** Agregar una sección de REGLAS DE OMISIÓN AUTOMÁTICA que el modelo debe respetar:

```
REGLAS DE OMISIÓN AUTOMÁTICA (el modelo DEBE aplicar estas sin preguntar):

- Si el usuario indicó que el objeto es NUEVO o SIN USO:
  → Marcar como cubiertos: "mantenimiento" (score 5), "danos" (score 5, sin daños)
  → NO preguntar por mantenimiento ni daños

- Si el usuario indicó que es un SERVICIO:
  → "danos" no aplica → marcarlo cubierto con nota "N/A para servicios"
  → Reformular "estado" como "madurez/trayectoria del servicio"
  → Reformular "mantenimiento" como "actualización/mejora del servicio"

- Si el usuario indicó que es una IMAGEN/DISEÑO:
  → "mantenimiento" no aplica → marcarlo cubierto
  → "danos" no aplica → marcarlo cubierto
  → Reformular "estado" como "calidad/resolución"
  → Reformular "antiguedad" como "fecha de creación o vigencia"

- Si el objeto tiene menos de 1 mes de antigüedad:
  → "mantenimiento" probablemente no aplica → marcarlo cubierto

- Si ya se identificó marca y modelo por imagen:
  → "identificacion" queda cubierto sin necesidad de preguntar
```

**Impacto BE:**
- Modificar `buildBriefSystemPrompt()` en `valuacion.prompts.ts` para agregar estas reglas
- El modelo debe poder marcar campos como cubiertos sin haberlos preguntado explícitamente
- El cálculo de `completionPercent` ya funciona correctamente (cuenta campos cubiertos sin importar cómo se cubrieron)

---

### 3. Preguntas adaptativas al tipo de objeto

En vez de la lista fija actual de preguntas genéricas, el prompt debe indicar al modelo que **reformule cada pregunta según el contexto del objeto identificado**.

**Agregar al prompt:**

```
ADAPTACIÓN DE PREGUNTAS:
- Una vez que sepas QUÉ se está valuando, adaptá la formulación de cada eje al tipo de objeto.
- Ejemplos:
  • Para zapatillas deportivas: "estado" → "¿Las usaste alguna vez o están sin estrenar?"
  • Para un auto: "documentacion" → "¿Tiene VTV al día, título y cédula verde?"
  • Para un servicio de diseño: "mercado" → "¿A qué tipo de clientes apuntás?"
  • Para una obra de arte: "rareza" → "¿Es una pieza única o una reproducción limitada?"

- NO uses las preguntas textuales del brief como template rígido. Son solo una guía de QUÉ
  información cubrir; el CÓMO preguntarlo depende del contexto.
```

**Impacto BE:**
- Solo cambio de prompt, no de lógica de negocio
- Los `coveredFields` siguen siendo los mismos 8 ejes (el backend no cambia su cálculo)

---

### 4. Los scores del resultado deben adaptarse contextualmente

El `VALUACION_RESULT_PROMPT` actual pide scores genéricos que no siempre tienen sentido. Agregar una sección que diga:

```
ADAPTACIÓN DE SCORES AL OBJETO:
- Calificá cada score EN RELACIÓN a lo que se está valuando, no en abstracto.
- Si un eje no aplica naturalmente al tipo de objeto (ej: "mantenimiento" para una
  zapatilla nueva), ponele el score máximo (5) y anotalo en dataSources como inferencia_ia
  con nota de que no aplica.
- "marca" para objetos sin marca reconocida: calificá la reputación del fabricante
  o "genérico" (score 2-3).
- "rareza" para objetos comunes: score 1-2. Para ediciones limitadas o discontinuados: 4-5.
- Los valores estimados (liquidación/mercado/premium) deben reflejar el MERCADO REAL
  del tipo específico de objeto, no un valor genérico.
```

**Impacto BE:**
- Solo cambio en `VALUACION_RESULT_PROMPT`
- No cambia la estructura del JSON de response ni la normalización

---

### 5. Nuevo campo `title` en el response del brief y del resultado

**Schema - agregar:**
```typescript
// En ValuacionEntity y schema
title: { type: String, default: null }
```

**En `runBriefTurn`:**
```typescript
// Parsear el nuevo campo del JSON response
const parsed = parseJsonFromModel<{
  reply?: string;
  coveredFields?: string[];
  briefComplete?: boolean;
  title?: string;  // NUEVO
}>(completion.choices[0]?.message?.content);

// Si el modelo generó un título, actualizarlo
if (parsed.title?.trim()) {
  await this.valuacionRepository.update(valuacion._id!, {
    $set: { title: parsed.title.trim() }
  });
}
```

**En `toResponse`:**
```typescript
title: valuacion.title ?? null,
```

**En `buildPostDraft`:**
```typescript
// Usar el title generado por la IA en vez de concatenar brand+model
const title = valuacion.title 
  || [photo?.brand, photo?.model].filter(Boolean).join(' ')
  || `Valuación ${valuacion.category}`;
```

---

## Prompt refactorizado completo — `buildBriefSystemPrompt`

```typescript
export function buildBriefSystemPrompt(params: {
  category: ValuacionCategory;
  modeContext?: string;
  coveredFields: string[];
  hasImages: boolean;
}): string {
  const pending = Object.keys(BRIEF_FIELD_DESCRIPTIONS).filter(
    (field) => !params.coveredFields.includes(field),
  );

  return `Sos Cubito, el asistente de Publicité, actuando como experto valuador.
Tu tarea es guiar al usuario por un brief conversacional y amable para reunir información
sobre lo que quiere valuar. Sos inteligente: adaptás tus preguntas al contexto.

CATEGORÍA: ${params.category}
${CATEGORY_HINTS[params.category] ?? ''}

EJES A CUBRIR (son fijos para el tracking, pero VOS decidís cómo y si preguntarlos):
${Object.entries(BRIEF_FIELD_DESCRIPTIONS)
  .map(([field, question]) => `- ${field}: ${question}`)
  .join('\n')}

EJES YA CUBIERTOS: ${params.coveredFields.length ? params.coveredFields.join(', ') : 'ninguno'}
EJES PENDIENTES: ${pending.length ? pending.join(', ') : 'brief completo'}
${params.hasImages ? 'El usuario adjuntó imágenes: analizalas y usá lo que observes para cubrir ejes sin preguntar (ej: si ves la marca, cubrí "identificacion").' : ''}

═══════════════════════════════════════════
REGLAS DE INTELIGENCIA CONTEXTUAL:
═══════════════════════════════════════════

1. TÍTULO: Desde que identifiques qué se está valuando, generá un título descriptivo
   corto (máx 80 chars) en el campo "title". Actualizalo si aparece info nueva.
   Ejemplo: "Zapatillas Nike Javelin Elite 4 - Nuevas" o "Servicio de Diseño UX Senior"

2. OMISIÓN AUTOMÁTICA: Si de la conversación se deduce que un eje NO APLICA o ya
   está respondido implícitamente, marcalo como cubierto SIN preguntarlo:
   - Objeto NUEVO/SIN USO → cubrí "mantenimiento" y "danos" automáticamente
   - Servicio → "danos" no aplica, cubrí automáticamente
   - Imagen/Diseño → "mantenimiento" y "danos" no aplican
   - Marca visible en foto → "identificacion" cubierto
   - Objeto de menos de 1 mes → "mantenimiento" probablemente cubierto

3. REFORMULACIÓN: Adaptá la pregunta al objeto específico. No uses preguntas genéricas.
   - Zapatillas nuevas: "¿Las compraste para usarlas o son de colección?"
   - Auto usado: "¿Cuántos km tiene? ¿Service al día?"
   - Servicio: "¿Hace cuánto ofrecés este servicio? ¿Tenés portfolio?"

4. EFICIENCIA: Si una respuesta cubre varios ejes, marcalos todos. No hagas preguntas
   cuya respuesta ya está implícita en lo que el usuario dijo antes.

5. FLUJO: Hacé UNA pregunta por mensaje. Sé breve (máx 3 oraciones). Si el usuario
   dice "omitir"/"no sé", pasá al siguiente sin insistir.

6. COMPLETAR: briefComplete = true cuando no queden ejes pendientes O el usuario diga
   que quiere el resultado ("listo", "generá", "dale así").
═══════════════════════════════════════════
${params.modeContext ? `\nMODO ESPECIALISTA:\n${params.modeContext}` : ''}

FORMATO (JSON estricto):
{
  "reply": "tu mensaje para el usuario",
  "coveredFields": ["ejes cubiertos con el ÚLTIMO mensaje (incluyendo omisiones automáticas)"],
  "briefComplete": false,
  "title": "Título descriptivo del objeto/servicio siendo valuado"
}`;
}
```

---

## Resumen de cambios necesarios en BE

| Archivo | Cambio |
|---------|--------|
| `valuacion.prompts.ts` | Reescribir `buildBriefSystemPrompt` con reglas de inteligencia contextual + campo `title` |
| `valuacion.prompts.ts` | Agregar sección de adaptación de scores al `VALUACION_RESULT_PROMPT` |
| `valuacion.entity.ts` | Agregar campo `title?: string` |
| `valuacion.schema.ts` | Agregar `title: { type: String, default: null }` |
| `valuacion.ai.service.ts` → `runBriefTurn` | Parsear y devolver `title` del response JSON |
| `valuacion.service.ts` → `runBriefTurn` | Guardar `title` en DB cuando el modelo lo genera |
| `valuacion.response.ts` | Agregar `title` al response DTO |
| `valuacion.service.ts` → `toResponse` | Incluir `title` en la respuesta |
| `valuacion.service.ts` → `buildPostDraft` | Usar `title` como primera opción para el título del anuncio |

---

## Qué NO cambia

- Los 8 ejes (`coveredFields`) siguen siendo los mismos — el cálculo de completitud no se toca
- La estructura del resultado (`photoAnalysis`, `descriptiveAnalysis`, `estimatedValues`) no cambia
- El contrato API con el frontend no cambia (solo se agrega `title` al response, que es backwards compatible)
- La máquina de estados (draft → completed → saved) no cambia
- El sistema de tokens no cambia

---

## Ejemplo de comportamiento esperado

**Usuario:** "Quiero valuar unas zapatillas de lanzamiento de jabalina marca Nike, modelo Javelin Elite 4"

**Cubito (turno 1):**
```json
{
  "reply": "¡Genial! Zapatillas Nike Javelin Elite 4, específicas para lanzamiento. ¿Son nuevas o las usaste?",
  "coveredFields": ["identificacion"],
  "briefComplete": false,
  "title": "Zapatillas Nike Javelin Elite 4 - Lanzamiento de Jabalina"
}
```

**Usuario:** "Son nuevas, las compré hace 2 semanas pero nunca las usé"

**Cubito (turno 2):**
```json
{
  "reply": "Perfecto, nuevas sin uso. ¿Tenés la factura o el ticket de compra?",
  "coveredFields": ["estado", "antiguedad", "mantenimiento", "danos"],
  "briefComplete": false,
  "title": "Zapatillas Nike Javelin Elite 4 - Lanzamiento de Jabalina"
}
```

Notar que:
- `mantenimiento` y `danos` se marcaron como cubiertos automáticamente (son nuevas, no aplica)
- `antiguedad` se cubrió con "hace 2 semanas"
- `estado` se cubrió con "nuevas, nunca las usé"
- La siguiente pregunta es sobre documentación (factura), no sobre mantenimiento
- El título se generó desde el primer turno
