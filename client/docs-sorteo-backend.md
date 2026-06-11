# Sorteo - Guía para conectar el Backend

## Resumen

El frontend del sorteo ya está listo con mock data. Cuando las APIs de GraphQL estén disponibles, hay que hacer cambios **únicamente** en un archivo:

📄 `src/services/sorteoService.ts`

---

## Entidad esperada: Giveaway

```typescript
interface Giveaway {
  _id: string;
  participants: string[]; // array de user IDs (clerk IDs)
  winner: GiveawayWinner | null;
}

interface GiveawayWinner {
  _id: string;       // user ID del ganador
  username: string;
  profilePhotoUrl: string;
}
```

---

## APIs que necesitamos (GraphQL)

Las queries/mutations ya están definidas en `src/graphql/sorteoQueries.ts`:

### 1. GET Participants (query)

Trae el sorteo con sus participantes y ganador.

```graphql
query GetParticipants($giveawayId: String!) {
  getParticipants(giveawayId: $giveawayId) {
    _id
    participants
    winner {
      _id
      username
      profilePhotoUrl
    }
  }
}
```

**Input:** `giveawayId` (String)  
**Output:** `Giveaway` (con `_id`, `participants[]`, `winner`)

---

### 2. POST Register Participant (mutation)

Registra un usuario en el sorteo.

```graphql
mutation RegisterParticipant($userId: String!, $giveawayId: String!) {
  registerParticipant(userId: $userId, giveawayId: $giveawayId) {
    _id
    participants
  }
}
```

**Input:** `userId` (String), `giveawayId` (String)  
**Output:** `Giveaway` actualizado (con la nueva lista de participants)

⚠️ Debería validar que el usuario no esté ya registrado y devolver error si ya participa.

---

### 3. POST Get Winner (mutation)

Elige un ganador al azar entre los participantes.

```graphql
mutation GetWinner($giveawayId: String!) {
  getWinner(giveawayId: $giveawayId) {
    _id
    username
    profilePhotoUrl
  }
}
```

**Input:** `giveawayId` (String)  
**Output:** `GiveawayWinner` (datos del usuario ganador)

⚠️ Solo un admin debería poder llamar esto.

---

## Pasos para conectar el BE

### Paso 1: Agregar imports

En `src/services/sorteoService.ts`, agregar estos imports al principio (debajo de los que ya están):

```typescript
import { getAuthToken } from "./auth-token";
import { getApiContext } from "./apiContext";
import { getClient, query } from "@/lib/client";
import {
  getParticipantsQuery,
  registerParticipantMutation,
  getWinnerMutation,
} from "@/graphql/sorteoQueries";
```

### Paso 2: Borrar el mock data

Eliminar toda esta sección del archivo:

```typescript
// ============================================================
// MOCK DATA - Reemplazar con llamadas a GraphQL cuando esté el BE
// ============================================================

const MOCK_GIVEAWAY: Giveaway = {
  _id: "sorteo-lentes-afa-2026",
  participants: ["user1", "user2", "user3", "user4", "user5"],
  winner: null,
};
```

### Paso 3: Descomentar el código real en cada función

#### `getGiveaway`

Reemplazar el contenido del `try` por:

```typescript
const tokenCache = await getAuthToken();
const { context } = await getApiContext(true, tokenCache);
const { data } = await query({
  query: getParticipantsQuery,
  variables: { giveawayId },
  context,
});
return data.getParticipants;
```

#### `registerParticipant`

Reemplazar el contenido del `try` por:

```typescript
const tokenCache = await getAuthToken();
const { context } = await getApiContext(false, tokenCache);
const { data } = await getClient().mutate({
  mutation: registerParticipantMutation,
  variables: { userId, giveawayId },
  context,
});
return data.registerParticipant;
```

#### `pickWinner`

Reemplazar el contenido del `try` por:

```typescript
const tokenCache = await getAuthToken();
const { context } = await getApiContext(false, tokenCache);
const { data } = await getClient().mutate({
  mutation: getWinnerMutation,
  variables: { giveawayId },
  context,
});
return data.getWinner;
```

---

## ID del sorteo actual

El ID del sorteo está hardcodeado en `src/utils/data/sorteoConfig.ts`:

```typescript
export const CURRENT_GIVEAWAY_ID = "sorteo-lentes-afa-2026";
```

Asegurarse de que el sorteo en la base de datos tenga este mismo `_id`, o cambiar el valor en ese archivo.

---

## Cómo testear

1. Levantar el backend con la entidad Giveaway creada
2. Crear un sorteo en la BD con `_id: "sorteo-lentes-afa-2026"`
3. Seguir los pasos de arriba para descomentar
4. Probar:
   - Ir a `/sorteo` sin estar logueado → debería mostrar botones de login
   - Loguearse → debería mostrar botón "Participar"
   - Participar → debería cambiar a "¡Ya estás participando!"
   - Intentar participar de nuevo → debería dar error (validar en BE)
   - Como admin, llamar `pickWinner` → debería aparecer la sección del ganador

---

## Notas

- El front usa el `userId` de Clerk (string) como ID del participante
- `getApiContext(true, token)` envía token incluso si no está registrado (para ver el sorteo sin login)
- `getApiContext(false, token)` requiere usuario autenticado (para participar)
- Si el nombre de las queries/mutations en el schema de GraphQL es diferente, ajustar en `src/graphql/sorteoQueries.ts`
