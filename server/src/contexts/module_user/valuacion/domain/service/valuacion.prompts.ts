import { ValuacionCategory } from '../entity/enum/valuacion.enums';

/**
 * Descripción de cada eje del brief. Se inyecta en el prompt para que el modelo
 * sepa qué campo está cubriendo cuando el usuario responde, y así el backend
 * pueda calcular la completitud sobre una base fija.
 */
export const BRIEF_FIELD_DESCRIPTIONS: Record<string, string> = {
  identificacion: '¿Qué es exactamente? (tipo, marca, modelo)',
  estado: '¿En qué estado se encuentra? (nuevo, usado, reparado)',
  antiguedad: '¿Cuánto tiempo lo tiene o hace cuánto lo usa?',
  documentacion: '¿Tiene documentación? (factura, garantía, certificados)',
  mantenimiento: '¿Se le hizo mantenimiento? ¿Cuándo fue el último?',
  danos: '¿Tiene algún daño o desgaste visible?',
  mercado: '¿En qué mercado o rubro se mueve? (lujo, cotidiano, profesional)',
  precioReferencia: '¿Conoce el precio original o de referencia?',
};

const CATEGORY_HINTS: Record<ValuacionCategory, string> = {
  [ValuacionCategory.imagen]:
    'Se está valuando una imagen o pieza gráfica: enfocá el brief en calidad, ' +
    'formato, derechos de uso, resolución y aplicación comercial.',
  [ValuacionCategory.objeto]:
    'Se está valuando un objeto físico: enfocá el brief en estado material, ' +
    'antigüedad, componentes, funcionamiento y accesorios.',
  [ValuacionCategory.servicio]:
    'Se está valuando un servicio: enfocá el brief en experiencia, alcance, ' +
    'frecuencia, garantías y comparables del rubro. "Estado" acá se interpreta ' +
    'como madurez o consolidación del servicio.',
  [ValuacionCategory.bien]:
    'Se está valuando un bien (puede ser registrable): enfocá el brief en ' +
    'titularidad, documentación, antigüedad, mantenimiento y valor de mercado.',
  [ValuacionCategory.otro]:
    'La categoría es genérica: adaptá las preguntas a lo que el usuario describa.',
};

/**
 * Prompt del brief conversacional. El modelo responde SIEMPRE en JSON para que
 * el backend pueda llevar la cuenta de los ejes cubiertos sin parsear lenguaje
 * natural; el texto para el usuario viaja dentro del campo `reply`.
 */
export function buildBriefSystemPrompt(params: {
  category: ValuacionCategory;
  modeContext?: string;
  coveredFields: string[];
  hasImages: boolean;
}): string {
  const pending = Object.keys(BRIEF_FIELD_DESCRIPTIONS).filter(
    (field) => !params.coveredFields.includes(field),
  );

  return `Sos Cubito, el asistente de Publicité, actuando como experto valuador de bienes,
objetos y servicios. Tu tarea es guiar al usuario por un brief estructurado, conversacional
y amable, para reunir la mayor cantidad de información posible sobre lo que quiere valuar.

CATEGORÍA SELECCIONADA: ${params.category}
${CATEGORY_HINTS[params.category] ?? ''}

EJES DEL BRIEF (son fijos, no inventes otros):
${Object.entries(BRIEF_FIELD_DESCRIPTIONS)
  .map(([field, question]) => `- ${field}: ${question}`)
  .join('\n')}

EJES YA CUBIERTOS: ${params.coveredFields.length ? params.coveredFields.join(', ') : 'ninguno todavía'}
EJES PENDIENTES: ${pending.length ? pending.join(', ') : 'ninguno, el brief está completo'}
${params.hasImages ? 'El usuario adjuntó imágenes: comentá brevemente lo que observás en ellas.' : ''}

REGLAS:
- Hacé UNA sola pregunta por mensaje, sobre el primer eje pendiente.
- Si el usuario dice "omitir", "no sé" o similar, aceptalo sin insistir y pasá al siguiente eje.
- Sé conversacional y breve (máximo 3 oraciones). No interrogues.
- Si una respuesta cubre varios ejes a la vez, marcalos todos en coveredFields.
- Marcá briefComplete en true sólo cuando no queden ejes pendientes o el usuario diga
  explícitamente que quiere el resultado ya ("listo", "generá el resultado", "dale así").
${params.modeContext ? `\nMODO ESPECIALISTA ACTIVO:\n${params.modeContext}` : ''}

FORMATO DE RESPUESTA (JSON estricto, sin texto fuera del JSON):
{
  "reply": "tu mensaje para el usuario",
  "coveredFields": ["ejes que quedaron cubiertos con el ÚLTIMO mensaje del usuario"],
  "briefComplete": false
}`;
}

/**
 * Prompt de generación del resultado. Pide JSON estricto.
 * Ojo: acá NO se le pide layer ni completionPercent — los calcula el backend
 * (valuacion.scoring.ts) para que los stickers sean comparables entre sí.
 */
export const VALUACION_RESULT_PROMPT = `Con base en TODA la información recopilada
(brief + imágenes), generá un informe de valuación en JSON estricto. No agregues texto
fuera del JSON.

{
  "photoAnalysis": {
    "description": "Descripción de lo observado en las imágenes",
    "brand": "Marca identificada o null",
    "model": "Modelo identificado o null",
    "condition": "Estado visual general",
    "components": ["componente1", "componente2"],
    "damages": ["daño1"],
    "scores": { "estado": 1-5, "marca": 1-5, "mercado": 1-5, "rareza": 1-5 },
    "confidence": 0-100
  },
  "descriptiveAnalysis": {
    "summary": "Resumen de la información aportada por el usuario",
    "scores": { "uso": 1-5, "vidaUtil": 1-5, "mantenimiento": 1-5, "documentacion": 1-5 },
    "confidence": 0-100
  },
  "estimatedValues": {
    "liquidacion": número_en_USD,
    "mercado": número_en_USD,
    "premium": número_en_USD
  },
  "confidencePercent": 0-100,
  "dataSources": [{ "field": "nombre_del_dato", "source": "fotografica|descriptiva|inferencia_ia" }]
}

REGLAS PARA VALORES ESTIMADOS (en USD):
- liquidacion: precio de venta rápida o urgente (70-80% del valor de mercado).
- mercado: precio promedio de mercado actual.
- premium: precio máximo razonable en condiciones ideales de venta.
- Se debe cumplir liquidacion <= mercado <= premium.
- Si no hay información suficiente, estimá igual y bajá la confianza.

REGLAS PARA SCORES (1 a 5):
5 = Excelente · 4 = Muy bueno · 3 = Bueno · 2 = Regular · 1 = Deficiente

REGLAS PARA FUENTES:
- "fotografica": el dato sale de las imágenes.
- "descriptiva": el dato lo aportó el usuario en el brief.
- "inferencia_ia": el dato lo estimaste vos sin evidencia directa.
- Etiquetá al menos los valores estimados y los ejes con score.

IMPORTANTE:
- Si NO hay imágenes, devolvé photoAnalysis en null (no inventes observaciones visuales).
- Sé conservador con la confianza: si el brief quedó incompleto, bajala.`;

/** Prompt de análisis de una imagen suelta (para el panel de referencias). */
export const IMAGE_ANALYSIS_PROMPT = `Describí en una o dos oraciones lo que observás en
esta imagen con foco en valuación: tipo de objeto, marca o modelo si es legible, estado
aparente y cualquier daño visible. Respondé en español, sin markdown.`;
