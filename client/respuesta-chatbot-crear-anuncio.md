# Respuesta Backend — Crear Anuncio desde Chatbot

Revisé el documento de requerimientos. La propuesta está bien y vamos por ese camino. Tres ajustes menores antes de congelar el contrato, y un plan para que ustedes arranquen sin esperarnos.

---

## 1. Ajustes al contrato propuesto

### 1.1. `action` como enum, no string libre

Para no atarnos a strings mágicos cuando crezcan las intenciones (crear revista, crear grupo, generar imagen, etc.), lo tipamos como enum GraphQL:

```graphql
enum ChatbotAction {
  CREATE_AD
}

type ChatbotResponse {
  botResponse: String!
  sessionId: String!
  timestamp: String!
  userMessage: String!
  action: ChatbotAction      # nullable
}
```

En el arranque solo existirá `CREATE_AD`. Cuando agreguemos más intenciones, sumamos valores al enum sin romper nada.

### 1.2. Copy del `botResponse` cuando hay `action`

El BE va a devolver un mensaje fijo cuando se dispare la intención (ej.: *"¡Genial! Te ayudo a crear tu anuncio. Completá los datos a continuación:"*).

**Recomendación:** que el copy lo mande el BE, así un cambio futuro no requiere deploy del FE. ¿Les parece bien? Si tienen un copy preferido, pásenmelo y lo dejo configurado del lado nuestro.

### 1.3. Generación de imagen (fase 2)

OK separarla. Cuando arranquemos esa fase, definimos rate limit y costo por usuario (DALL-E cuesta plata por imagen, conviene ligarlo al plan de suscripción).

---

## 2. Cómo arrancan ustedes sin esperarnos

El contrato de arriba queda **congelado**, así que pueden mockear la respuesta del lado de ustedes desde ahora:

- Si el mensaje del usuario contiene "crear anuncio" o similar → el mock devuelve `action: CREATE_AD` + `botResponse` fijo.
- Caso contrario → el mock devuelve `action: null` y el texto normal.

Cuando yo termine la integración real con la tool de OpenAI, ustedes solo sacan el mock y siguen consumiendo la misma mutation con el mismo response. **No hay cambios del lado del FE.**

---

## 3. Plan de avance del lado del BE

1. **Agregar el campo `action` (enum) al `ChatbotResponse`** y desplegar a QA, sin lógica detrás (siempre `null`). Esto les desbloquea contra el endpoint real, no contra mock.
2. **Definir la tool `create_ad`** en la llamada a OpenAI y ajustar el system prompt (hoy está restringido al glosario, hay que autorizar la detección de intención).
3. **Detectar el `tool_call`** en la respuesta de OpenAI y devolver `action: CREATE_AD` con el copy correspondiente.

El paso 1 puedo tenerlo en QA en muy poco tiempo. Avísenme y lo priorizo.

---

## 4. Resumen para ustedes

| Item | Estado |
|------|--------|
| Contrato `ChatbotResponse` con `action` | ✅ Congelado (con ajuste a enum) |
| Pueden mockear y desarrollar el flujo | ✅ Desde ahora |
| Campo `action` disponible en QA (sin lógica) | 🔜 Próximo entregable BE |
| Detección real de intención con OpenAI | 🔜 Inmediatamente después |
| Generación de imagen | 📅 Fase 2 |

Cualquier duda o si quieren ajustar algo del contrato, hablemos antes de que arranquen para no rehacer trabajo.
