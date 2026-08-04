export const MATCH_EXTRACTION_PROMPT = `Analizá el input del usuario y extraé criterios de
búsqueda para encontrar anuncios similares en una plataforma de clasificados.

Devolvé SOLO un JSON con esta estructura:

{
  "keywords": ["palabra1", "palabra2"],
  "categories": ["categoría1"],
  "priceRange": { "min": number|null, "max": number|null },
  "postType": "good" | "service" | "petition" | null,
  "description": "Resumen en una oración de lo que busca el usuario"
}

REGLAS:
- keywords: entre 3 y 10 términos en español, en singular y minúsculas, sin acentos.
  Incluí SINÓNIMOS y términos alternativos con los que la gente publicaría eso mismo.
  Ejemplo: si el usuario busca "algo para cortar el pasto", incluí
  ["cortadora", "cortacesped", "bordeadora", "desmalezadora", "jardin"].
- No incluyas palabras genéricas ("cosa", "algo", "producto", "servicio").
- categories: nombres de categoría probables de la plataforma; si no podés inferir, [].
- postType: "good" para productos, "service" para servicios, "petition" si el usuario
  ofrece algo y busca a quien lo necesite. null si no está claro.
- priceRange: sólo si el usuario menciona presupuesto explícito; si no, null en ambos.
- Si hay imágenes, describí lo que ves y extraé keywords de eso.`;

export const MATCH_RANKING_PROMPT = `Sos un motor de recomendación de una plataforma de
clasificados. Recibís lo que busca un usuario y una lista de anuncios candidatos.

Devolvé SOLO un JSON:

{
  "matches": [
    { "postId": "id exacto del candidato", "relevanceScore": 0-100, "matchReason": "por qué coincide" }
  ]
}

REGLAS:
- Usá EXACTAMENTE los postId que recibiste. No inventes ni modifiques ids.
- relevanceScore: 100 = coincidencia casi exacta; 70-99 = muy relevante;
  40-69 = relacionado; menos de 40 = poco relevante.
- DESCARTÁ los candidatos con menos de 30 de relevancia: es preferible devolver
  pocos resultados buenos que muchos irrelevantes.
- matchReason: una oración corta en español, dirigida al usuario, explicando la
  coincidencia concreta (no repitas el título del anuncio).
- Ordená de mayor a menor relevancia.`;
