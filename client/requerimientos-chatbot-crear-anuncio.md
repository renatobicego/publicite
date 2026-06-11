# Requerimientos Backend - Crear Anuncio desde Chatbot

## Contexto

El chatbot (Cubito) debe poder detectar cuando un usuario quiere crear un anuncio y responder con una señal especial para que el frontend active un flujo de creación guiado dentro del chat. El formulario lo maneja el FE, no la IA.

---

## 1. Detección de intención

La IA (OpenAI) debe detectar cuando el usuario expresa intención de crear un anuncio. Ejemplos:
- "Quiero crear un anuncio"
- "Cómo publico algo?"
- "Necesito vender un producto"
- "Puedo ofrecer un servicio acá?"

### Implementación sugerida

Usar **function calling / tools** de OpenAI. Definir una tool:

```json
{
  "type": "function",
  "function": {
    "name": "create_ad",
    "description": "Se activa cuando el usuario quiere crear un anuncio o publicar un bien/servicio en la plataforma",
    "parameters": {
      "type": "object",
      "properties": {},
      "required": []
    }
  }
}
```

Cuando OpenAI devuelve un `tool_call` con `create_ad`, el BE **no ejecuta nada**, simplemente le indica al FE que active el flujo.

---

## 2. Modificación de la respuesta de `sendMessageToChatbot`

Agregar un campo `action` a la respuesta de la mutation `sendMessageToChatbot`:

```graphql
type ChatbotResponse {
  botResponse: String!
  sessionId: String!
  timestamp: String!
  userMessage: String!
  action: String          # NUEVO - nullable
}
```

### Valores posibles de `action`:
- `null` → respuesta normal de texto
- `"create_ad"` → el FE debe activar el flujo de creación de anuncio

### Lógica del resolver:

```
1. Enviar mensaje del usuario a OpenAI (con la tool "create_ad" definida)
2. Si OpenAI responde con tool_call "create_ad":
   - botResponse = "¡Genial! Te ayudo a crear tu anuncio. Completá los datos a continuación:"
   - action = "create_ad"
3. Si OpenAI responde con texto normal:
   - botResponse = texto de OpenAI
   - action = null
```

---

## 3. Generación de imagen con IA (futuro)

Cuando el usuario esté en el flujo de creación y quiera generar una imagen:

### Nueva mutation:

```graphql
type Mutation {
  generateImageForAd(prompt: String!): GeneratedImage!
}

type GeneratedImage {
  imageUrl: String!
}
```

### Lógica:
- Recibir el prompt del usuario
- Llamar a la API de OpenAI (DALL-E) o el servicio de imágenes que usen
- Devolver la URL de la imagen generada
- El FE la muestra como preview y el usuario decide si adjuntarla

---

## 4. Resumen de cambios

| Cambio | Detalle |
|--------|---------|
| Tool definition en OpenAI | Agregar `create_ad` a las tools del chat |
| Response type | Agregar campo `action: String` a `ChatbotResponse` |
| Resolver `sendMessageToChatbot` | Detectar tool_call y devolver action correspondiente |
| Nueva mutation (fase 2) | `generateImageForAd(prompt: String!): GeneratedImage!` |

---

## 5. Notas

- El FE se encarga de todo el formulario de creación. El BE solo necesita señalizar que se active.
- No hace falta que la IA recopile datos del anuncio. Solo detecta la intención.
- La generación de imagen es una feature separada que se puede hacer en una segunda fase.
