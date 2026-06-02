# Pruebas locales — Refactor Contact con visibility

Guía para validar manualmente el refactor de `Contact` (visibility por campo + `description` movido a Contact).

## Setup

- Levantar server: `npm run dev` → escucha en `http://localhost:3001`
- GraphQL Playground: `http://localhost:3001/graphql`
- REST: `http://localhost:3001/<ruta>`
- Auth: todas las rutas/queries marcadas con `ClerkAuthGuard` requieren header `Authorization: Bearer <JWT_DE_CLERK>`.

> Reemplazá los placeholders `<...>` por valores reales de tu base QA:
> - `<USERNAME>`: username del usuario a tocar (ej. `maxicattaneo`)
> - `<USER_ID>`: `_id` Mongo del usuario
> - `<CONTACT_ID>`: `_id` del Contact asociado al usuario
> - `<TOKEN>`: JWT válido de Clerk

## Valores válidos para `Visibility`

- **GraphQL (mutations / queries):** enum en MAYÚSCULAS — `PUBLIC | REGISTERED | CONTACTS | FRIENDS | TOPFRIENDS`
- **REST (PUT /user/personal | /user/business):** string en minúsculas — `public | registered | contacts | friends | topfriends`
- **En Mongo / response REST:** se persisten en minúsculas
- **En response GraphQL:** se devuelven en MAYÚSCULAS

---

## 1) Mutation GraphQL — `updateContactById`

Actualiza directamente el documento Contact por su `_id`. Es el endpoint principal para tocar todos los campos nuevos.

### 1.1 Update completo (todos los campos nuevos)

**URL:** `POST http://localhost:3001/graphql`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <TOKEN>
```

**Body:**
```json
{
  "query": "mutation UpdateContact($contactId: String!, $req: UpdateContactRequest!) { updateContactById(contactId: $contactId, updateRequest: $req) }",
  "variables": {
    "contactId": "<CONTACT_ID>",
    "req": {
      "phone": "+5491134567890",
      "phoneVisibility": "PUBLIC",
      "instagram": "@maxi.dev",
      "instagramVisibility": "FRIENDS",
      "facebook": "maxi.facebook",
      "facebookVisibility": "CONTACTS",
      "x": "@maxi_x",
      "xVisibility": "REGISTERED",
      "website": "https://maxi.dev",
      "websiteVisibility": "PUBLIC",
      "profesion": {
        "label": "Software Engineer",
        "visibility": "PUBLIC"
      },
      "curriculum": {
        "ref": "https://storage.googleapis.com/.../cv.pdf",
        "visibility": "CONTACTS"
      },
      "description": {
        "text": "Programador con foco en backend Node/Nest.",
        "visibility": "FRIENDS"
      },
      "links": [
        { "url": "https://github.com/maxi", "label": "GitHub", "visibility": "PUBLIC" },
        { "url": "https://linkedin.com/in/maxi", "label": "LinkedIn", "visibility": "REGISTERED" },
        { "url": "https://maxi.dev/blog", "label": "Blog", "visibility": "TOPFRIENDS" }
      ]
    }
  }
}
```

**Esperado:** `data.updateContactById === "Contact updated"`

### 1.2 Update parcial — solo `description`

```json
{
  "query": "mutation UpdateContact($contactId: String!, $req: UpdateContactRequest!) { updateContactById(contactId: $contactId, updateRequest: $req) }",
  "variables": {
    "contactId": "<CONTACT_ID>",
    "req": {
      "description": {
        "text": "Solo cambio la descripción.",
        "visibility": "TOPFRIENDS"
      }
    }
  }
}
```

**Verificar:** los demás campos deben quedar intactos (chequear con query 3.1 abajo).

### 1.3 Update parcial — solo `links` (reemplaza el array)

```json
{
  "query": "mutation UpdateContact($contactId: String!, $req: UpdateContactRequest!) { updateContactById(contactId: $contactId, updateRequest: $req) }",
  "variables": {
    "contactId": "<CONTACT_ID>",
    "req": {
      "links": [
        { "url": "https://nuevoLink.com", "label": "Nuevo", "visibility": "PUBLIC" }
      ]
    }
  }
}
```

### 1.4 Update parcial — solo `profesion` o `curriculum`

```json
{
  "query": "mutation UpdateContact($contactId: String!, $req: UpdateContactRequest!) { updateContactById(contactId: $contactId, updateRequest: $req) }",
  "variables": {
    "contactId": "<CONTACT_ID>",
    "req": {
      "profesion": { "label": "CTO", "visibility": "PUBLIC" },
      "curriculum": { "ref": "https://nuevo.cv/maxi.pdf", "visibility": "FRIENDS" }
    }
  }
}
```

### 1.5 Update parcial — cambiar solo visibility de un campo

```json
{
  "query": "mutation UpdateContact($contactId: String!, $req: UpdateContactRequest!) { updateContactById(contactId: $contactId, updateRequest: $req) }",
  "variables": {
    "contactId": "<CONTACT_ID>",
    "req": {
      "phoneVisibility": "TOPFRIENDS"
    }
  }
}
```

---

## 2) REST — `PUT /user/personal/:username` y `/user/business/:username`

Estos endpoints aceptan `description` dentro del payload y el `UserService` la rutea automáticamente al `Contact` asociado del usuario.

### 2.1 Update Personal con `description`

**URL:** `PUT http://localhost:3001/user/personal/<USERNAME>`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <TOKEN>
```

**Body:**
```json
{
  "birthDate": "1990-05-12",
  "gender": "M",
  "countryRegion": "AR",
  "dni": "12345678",
  "addressPrivacy": "public",
  "description": {
    "text": "Descripción nueva desde PUT personal",
    "visibility": "friends"
  }
}
```

**Esperado:**
- 200 OK con el user actualizado.
- En Mongo, `users.<USERNAME>.description` (legacy) NO debe haber cambiado a este texto (el ruteo va a Contact).
- En Mongo, `contacts.<CONTACT_ID>.description = { text: "Descripción nueva desde PUT personal", visibility: "friends" }`.

### 2.2 Update Personal SIN `description`

```json
{
  "countryRegion": "UY"
}
```

**Esperado:** solo cambia `countryRegion`. No se llama a contactService (verificar logs). El campo `description` del Contact NO se toca.

### 2.3 Update Business con `description`

**URL:** `PUT http://localhost:3001/user/business/<USERNAME>`

**Body:**
```json
{
  "businessName": "Mi Negocio S.A.",
  "countryRegion": "AR",
  "dni": "20-12345678-9",
  "addressPrivacy": "registered",
  "description": {
    "text": "Negocio de software a medida.",
    "visibility": "public"
  }
}
```

### 2.4 Caso edge — user sin Contact asociado

Si el `<USERNAME>` no tiene `contact` ref (caso muy raro, usuarios viejos rotos), debería:
- Loguear warn: `User without contact reference, skipping description update: <USERNAME>`
- Aplicar el resto de los campos del payload normalmente.

---

## 3) GET — verificar que el read aplica el fallback

### 3.1 REST `GET /user/personal-data/:username`

**URL:** `GET http://localhost:3001/user/personal-data/<USERNAME>`

**Headers:**
```
Authorization: Bearer <TOKEN>
```

**Esperado:**
- `contact.description` viene como `{ text, visibility }` (forma nueva).
- `description` top-level (compat) viene como string igual a `contact.description.text`.
- Todos los nuevos campos: `profesion`, `curriculum`, `links`, y todos los `*Visibility` están presentes.

### 3.2 GraphQL `findUserById`

**URL:** `POST http://localhost:3001/graphql`

**Body:**
```json
{
  "query": "query FindUser($id: String!) { findUserById(_id: $id) { _id username description contact { _id phone phoneVisibility instagram instagramVisibility facebook facebookVisibility x xVisibility website websiteVisibility profesion { label visibility } curriculum { ref visibility } description { text visibility } links { url label visibility } } } }",
  "variables": { "id": "<USER_ID>" }
}
```

**Esperado (data.findUserById):**
```json
{
  "_id": "<USER_ID>",
  "username": "<USERNAME>",
  "description": "Programador con foco en backend Node/Nest.",
  "contact": {
    "_id": "<CONTACT_ID>",
    "phone": "+5491134567890",
    "phoneVisibility": "public",
    "instagram": "@maxi.dev",
    "instagramVisibility": "friends",
    "...": "...",
    "description": {
      "text": "Programador con foco en backend Node/Nest.",
      "visibility": "friends"
    },
    "links": [
      { "url": "https://github.com/maxi", "label": "GitHub", "visibility": "public" }
    ]
  }
}
```

> Notar que `description` top-level y `contact.description.text` deben coincidir (eso es el `applyContactDescriptionFallback` haciendo su trabajo).

---

## 4) Casos de validación crítica (chequear post-deploy)

### 4.1 Usuario legacy SIN `contact.description.text` (pre-migración)

Crear/buscar un usuario que tenga `User.description = "algo viejo"` y `contacts.<id>.description = undefined`. Al hacer GET:

- `contact.description` debería venir como `{ text: "algo viejo", visibility: "public" }` (fallback automático).
- `description` top-level: `"algo viejo"`.

### 4.2 Usuario nuevo (post-migración)

Crear un user, luego mutate `updateContactById` con `description: { text: "X", visibility: "friends" }`. Al hacer GET:

- `contact.description = { text: "X", visibility: "friends" }`.
- `description` top-level: `"X"` (el fallback siempre copia el text del contact al top level).

### 4.3 Borrar `description` (text vacío)

```json
{
  "query": "mutation UpdateContact($contactId: String!, $req: UpdateContactRequest!) { updateContactById(contactId: $contactId, updateRequest: $req) }",
  "variables": {
    "contactId": "<CONTACT_ID>",
    "req": {
      "description": { "text": "", "visibility": "PUBLIC" }
    }
  }
}
```

**Esperado:** Si `User.description` (legacy) está vacío también, `contact.description.text` queda `""`. Si el legacy tiene texto, el fallback en lectura va a usar ese legacy y mappearlo (ver caso del unit test).

---

## 5) Verificación directa en Mongo (opcional)

Conectado al cluster QA:

```js
// El user debe tener contact ref
db.users.findOne({ username: "<USERNAME>" }, { username:1, description:1, contact:1 })

// El contact debe tener todos los campos nuevos persistidos
db.contacts.findOne({ _id: ObjectId("<CONTACT_ID>") })
```

Esperado en `db.contacts`:
```js
{
  _id: ObjectId("..."),
  phone: "+54...",
  phoneVisibility: "public",
  instagram: "@maxi.dev",
  instagramVisibility: "friends",
  facebook: "...",
  facebookVisibility: "contacts",
  x: "...",
  xVisibility: "registered",
  website: "...",
  websiteVisibility: "public",
  profesion: { label: "Software Engineer", visibility: "public" },
  curriculum: { ref: "https://...", visibility: "contacts" },
  description: { text: "...", visibility: "friends" },
  links: [
    { url: "...", label: "GitHub", visibility: "public" }
  ]
}
```

---

## Checklist rápido

- [ ] `updateContactById` actualiza todos los campos nuevos (1.1)
- [ ] `updateContactById` parcial preserva los campos no enviados (1.2, 1.3, 1.5)
- [ ] `PUT /user/personal/:username` con `description` → llega al Contact (2.1)
- [ ] `PUT /user/personal/:username` sin `description` → no toca el Contact (2.2)
- [ ] `PUT /user/business/:username` con `description` → llega al Contact (2.3)
- [ ] `GET /user/personal-data/:username` devuelve todos los nuevos campos (3.1)
- [ ] `findUserById` GraphQL devuelve `description` top-level == `contact.description.text` (3.2)
- [ ] Usuario legacy: fallback se aplica (4.1)
- [ ] Validación enum `Visibility`: probar valor inválido → debe rechazar la mutation
