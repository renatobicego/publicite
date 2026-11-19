# Plan — Identidad verificada al registrarse (DNI con RENAPER)

> **Versión decidida (2026-11-19).** Pedido: al registrarse, garantizar que el **DNI es válido y existe**
> (RENAPER), con **Didit**.
>
> **Decisiones:**
> - **Propuesta A:** sólo datos (DNI, sexo y fecha de nacimiento), **sin DNI físico ni selfie**.
> - **Si la verificación falla, se bloquea el registro.** No hay cuentas "sin verificar". También se
>   bloquea si RENAPER o Didit no responden (el usuario reintenta más tarde).
> - **La razón social queda afuera.** Las cuentas de empresa se registran igual que antes.
>
> Los datos de Didit salen de su documentación pública, leída el 19/11 (fuentes en §6). Precios y
> cobertura los informa Didit; hay que confirmarlos con ellos.

---

## 1. Qué se verifica

El server consulta el servicio `arg_renaper_data` de Didit
(`POST https://verification.didit.me/v3/database-validation/`, header `x-api-key`) con:

- `document_number`: el DNI (7-8 dígitos, sin puntos);
- `gender`: el sexo del formulario (`M`, `F`; `O` y `X` se mandan como `X`);
- `date_of_birth`: la fecha de nacimiento (`YYYY-MM-DD`);
- `vendor_data`: el `clerkId`, para encontrar la consulta en el panel de Didit.

**No se manda el nombre.** Viene de Clerk y puede no ser el del DNI (apodos, segundos nombres), lo que
daría rechazos falsos.

**Garantiza:** que el DNI existe en RENAPER y corresponde a ese sexo y esa fecha de nacimiento.
**No garantiza:** que quien se registra sea el titular (para eso harían falta la selfie o el DNI físico,
propuestas B/C del borrador anterior, descartadas por ahora).

**Costo:** USD 0,20 por consulta exitosa. No se cobran las que fallan por RENAPER caído o datos mal
formados. Cada cuenta de Didit tiene USD 10 de crédito gratis por mes (~50 registros).

## 2. Reglas

| Resultado de Didit | Qué pasa | Mensaje |
|---|---|---|
| `MATCH` | Se crea la cuenta y se guarda `User.identityVerification` | — |
| `PARTIAL_MATCH` con DNI, fecha y sexo coincidentes | Igual que `MATCH` | — |
| `PARTIAL_MATCH` (otro), `NO_MATCH` | Se bloquea (400) | Los datos no coinciden con los de RENAPER… |
| `DOCUMENT_NOT_FOUND`, `INVALID_DOCUMENT_FORMAT` | Se bloquea (400) | No encontramos ese DNI en RENAPER… |
| `MINOR_BLOCKED` | Se bloquea (400) | Tenés que ser mayor de edad… |
| `DECEASED` y otros | Se bloquea (400) | No pudimos verificar tu identidad… |
| `INCONCLUSIVE`, `REGISTRY_UNAVAILABLE`, `REGISTRY_ERROR`, error HTTP, timeout, sin clave | Se bloquea (503) | No pudimos verificar tu DNI en este momento… |

- **Un DNI verificado es una sola cuenta.** Antes de consultar (para no pagar la consulta) se revisa que
  no haya otra persona verificada con ese DNI, y un índice único parcial sobre `dni` (sólo de los
  usuarios con `identityVerification.verifiedAt`) lo garantiza en la base. Las cuentas anteriores y las
  de empresa pueden repetir DNI como hasta ahora.
- **Sólo cuentas de persona.** Las de empresa no se verifican.
- **Cuentas ya registradas:** no se tocan (no tienen `identityVerification`).

## 3. Implementación

**Server** — `server/src/contexts/module_user/identity/`:

- `domain/`: tipos (`IdentityCheckResult`, `IdentityVerificationRecord`) y el puerto
  `IdentityVerifierInterface` (token `IdentityVerifierInterface`).
- `application/identity.config.ts`: env vars (§4).
- `application/functions/evaluateDiditResponse.ts`: traduce la respuesta de Didit a
  `approved` / `declined` / `unavailable`; acepta los datos arriba o dentro de `database_validation`
  (la documentación muestra las dos formas). `identityMessages.ts`: mensajes para el usuario.
- `application/service/identity.verification.service.ts` (`IdentityVerificationServiceInterface`):
  valida formato, revisa el DNI duplicado, consulta y lanza `BadRequestException` /
  `ServiceUnavailableException` si no aprueba.
- `infraestructure/adapters/`: `DiditIdentityVerifier` (fetch, timeout 15 s) y `MockIdentityVerifier`.
  `identity.providers.ts` elige uno y se registra en `UserModule`.
- `UserAdapter.createUser` verifica a las personas **antes** de crear nada y pasa el resultado a
  `UserService.createUser` → `UserRepository.save`, que lo guarda en la misma transacción del alta.
- `User.identityVerification`: `{ provider, method: 'renaperData', requestId, verifiedAt }`. No se
  guardan los datos que devuelve RENAPER.
- Tests: `module_user/identity/test/identity.verification.spec.ts` (sin base).

**Cliente:**

- `onboarding/_actions.ts` muestra el mensaje del server cuando rechaza el alta (antes se perdía y se
  veía un error genérico).
- Con `NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED=true`, los campos DNI y sexo avisan que se verifican
  con RENAPER (`utils/functions/identityVerification.ts`).

## 4. Configuración

| Variable | Dónde | Default | Para qué |
|---|---|---|---|
| `IDENTITY_VERIFICATION_ENABLED` | server | `false` | Exige la verificación para registrar personas |
| `DIDIT_API_KEY` | server | — | Clave de Didit. Prendida sin clave = registro de personas bloqueado |
| `DIDIT_API_URL` | server | `https://verification.didit.me` | — |
| `IDENTITY_MOCK` | server (sólo `NODE_ENV=qa`) | `false` | No llama a Didit: DNI que termina en `00` → no coincide; `01` → inexistente; `99` → RENAPER caído; otro → aprobado |
| `NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED` | client | `false` | Sólo textos del onboarding |

## 5. Para salir a producción

1. Crear la cuenta en Didit y la clave de API; probar con la clave de sandbox (devuelve siempre
   `full_match`) y luego con DNIs reales.
2. Confirmar en una consulta real la forma de la respuesta (arriba o dentro de `database_validation`) y
   qué pasa con `PARTIAL_MATCH` cuando no se manda nombre. El código acepta las dos formas.
3. Cargar `DIDIT_API_KEY` y `IDENTITY_VERIFICATION_ENABLED=true` en el server y
   `NEXT_PUBLIC_IDENTITY_VERIFICATION_ENABLED=true` en el cliente.
4. Cargar crédito en Didit: sin crédito responde 403 y el registro de personas queda bloqueado.

## 6. Fuentes

- [Didit — Argentina, DNI con RENAPER (sin selfie)](https://docs.didit.me/api-reference/database-validation/argentina/renaper-data)
- [Didit — Database Validation API](https://docs.didit.me/standalone-apis/database-validation)
- [Didit — Verificación de identidad en Argentina (precios)](https://didit.me/solutions/countries/argentina/)
