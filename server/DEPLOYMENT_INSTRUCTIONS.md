# 🚀 Instrucciones de Despliegue - Mejoras del Chatbot

## 📋 Resumen

Este documento contiene las instrucciones para desplegar las mejoras del glosario del chatbot de Publicite.

---

## ✅ Cambios Realizados

### Archivo Modificado:

**Ubicación**: `server/src/contexts/module_user/chatbot/domain/service/chatbot.ai.service.ts`

**Modificaciones**:
1. Actualización de la propiedad `GLOSSARY` (líneas 11-437)
2. Actualización del prompt del sistema en el método `buildOpenAIMessages` (líneas 443-479)

### Archivos de Documentación Creados:

1. `server/CHATBOT_GLOSSARY_UPDATE.md` - Documentación técnica completa
2. `server/CHATBOT_TEST_EXAMPLES.md` - 23 casos de prueba
3. `server/RESUMEN_MEJORAS_CHATBOT.md` - Resumen ejecutivo
4. `server/EJEMPLO_RESPUESTAS_CHATBOT.md` - Ejemplos visuales de respuestas
5. `server/DEPLOYMENT_INSTRUCTIONS.md` - Este archivo

---

## 🔍 Pre-Despliegue: Verificaciones

### 1. Verificar que no hay errores de sintaxis

```bash
cd server
npm run build
```

**Resultado esperado**: ✅ Compilación exitosa sin errores

### 2. Ejecutar linter

```bash
npm run lint
```

**Resultado esperado**: ✅ Sin errores de linting

### 3. Verificar archivo modificado

```bash
git status
```

**Resultado esperado**: 
```
modified:   src/contexts/module_user/chatbot/domain/service/chatbot.ai.service.ts
```

---

## 🧪 Fase de Pruebas (Recomendado)

### Opción 1: Pruebas en Entorno de Desarrollo

1. **Iniciar servidor en modo desarrollo**:
```bash
cd server
npm run start:dev
```

2. **Acceder al chatbot** en la aplicación cliente

3. **Realizar pruebas básicas**:
   - "¿Cómo creo un anuncio?"
   - "¿Cómo añado un amigo?"
   - "¿Qué es activar un contacto?"
   - "Dame todos los enlaces"

4. **Verificar**:
   - ✅ Las respuestas incluyen pasos numerados
   - ✅ Se muestran enlaces clickeables
   - ✅ El formato es claro (emojis, listas, negritas)
   - ✅ La información es correcta

### Opción 2: Pruebas Exhaustivas

Usar el archivo `CHATBOT_TEST_EXAMPLES.md` que contiene 23 casos de prueba detallados.

---

## 📦 Despliegue a QA (Ambiente de Pruebas)

### 1. Commit de Cambios

```bash
cd server

# Añadir archivos modificados
git add src/contexts/module_user/chatbot/domain/service/chatbot.ai.service.ts

# Añadir documentación (opcional pero recomendado)
git add CHATBOT_GLOSSARY_UPDATE.md
git add CHATBOT_TEST_EXAMPLES.md
git add RESUMEN_MEJORAS_CHATBOT.md
git add EJEMPLO_RESPUESTAS_CHATBOT.md
git add DEPLOYMENT_INSTRUCTIONS.md

# Crear commit
git commit -m "feat(chatbot): Mejora glosario con enlaces accesibles y guías paso a paso

- Agrega índice estructurado con 12 secciones
- Implementa guía detallada para crear anuncios (9 pasos)
- Implementa guía detallada para añadir amigos (5 pasos)
- Agrega 25+ enlaces funcionales a funcionalidades
- Mejora instrucciones del sistema para IA
- Incluye explicaciones de activación de contactos
- Agrega tablas de visibilidad de relaciones
- Mejora formato visual con emojis y estructura
- Incluye documentación completa y casos de prueba"
```

### 2. Push a Branch

```bash
# Si estás en una rama de feature
git push origin nombre-de-tu-rama

# O si trabajas directo en develop/main (no recomendado)
git push origin develop
```

### 3. Desplegar a QA

**Opción A: Usando script de deploy**

```bash
# Desde la carpeta server
bash deploy-qa.sh
```

**Opción B: Deploy manual**

```bash
# Build
npm run build

# Deploy a Firebase Functions (QA)
firebase use publicite-qa
firebase deploy --only functions

# O deploy específico del módulo de chatbot si está separado
firebase deploy --only functions:chatbot
```

### 4. Verificación en QA

1. Acceder a: `https://qa.soonpublicite.com` (o tu URL de QA)
2. Abrir el chatbot
3. Realizar pruebas básicas
4. Verificar logs en Firebase/GCP:
   ```bash
   firebase functions:log --only chatbot
   ```

---

## 🚀 Despliegue a Producción

### ⚠️ ANTES DE DESPLEGAR A PRODUCCIÓN:

- [ ] ✅ Pruebas en QA completadas exitosamente
- [ ] ✅ Sin errores reportados
- [ ] ✅ Validación del equipo/stakeholders
- [ ] ✅ Backup de la versión actual (si aplica)
- [ ] ✅ Documentación revisada

### 1. Merge a Rama Principal

```bash
# Si usas pull requests (recomendado)
# Crear PR desde tu branch hacia main/master

# O merge directo
git checkout main
git merge nombre-de-tu-rama
git push origin main
```

### 2. Deploy a Producción

**Opción A: Usando script de deploy**

```bash
# Desde la carpeta server
bash deploy-prod.sh
```

**Opción B: Deploy manual**

```bash
# Build de producción
npm run build

# Deploy a Firebase Functions (Production)
firebase use publicite-prod
firebase deploy --only functions

# O deploy específico
firebase deploy --only functions:chatbot
```

### 3. Verificación Post-Deploy

**Inmediatamente después del deploy:**

1. **Verificar que el servicio está corriendo**:
   ```bash
   firebase functions:log --only chatbot
   ```

2. **Prueba rápida en producción**:
   - Abrir chatbot en: https://soonpublicite.com
   - Hacer pregunta simple: "¿Cómo creo un anuncio?"
   - Verificar que responde correctamente con enlaces

3. **Monitorear logs por 10-15 minutos**:
   - Buscar errores inesperados
   - Verificar tiempos de respuesta
   - Revisar uso de tokens de OpenAI

---

## 📊 Monitoreo Post-Despliegue

### Métricas a Monitorear (Primeros 7 días):

1. **Tasa de éxito de respuestas**:
   - % de consultas respondidas sin error
   - Meta: >99%

2. **Tiempo de respuesta**:
   - Tiempo promedio de respuesta del chatbot
   - Meta: <3 segundos

3. **Uso de OpenAI**:
   - Número de requests
   - Tokens consumidos
   - Costo estimado

4. **Feedback de usuarios** (si existe):
   - Satisfacción con respuestas
   - Problemas reportados

5. **Logs de errores**:
   - Revisar daily por la primera semana
   - Buscar patrones de error

### Herramientas de Monitoreo:

```bash
# Ver logs en tiempo real
firebase functions:log --only chatbot

# Ver logs con filtros
firebase functions:log --only chatbot --limit 100

# GCP Console
# Ir a: Cloud Functions → chatbot → Logs
```

---

## 🔧 Troubleshooting

### Problema 1: "Respuestas no incluyen enlaces"

**Causa posible**: El glosario no se cargó correctamente

**Solución**:
1. Verificar que el archivo se deployó correctamente
2. Revisar que `GLOSSARY` tiene el contenido actualizado
3. Hacer redeploy si es necesario

### Problema 2: "Error al generar respuesta"

**Causa posible**: Problema con OpenAI API

**Solución**:
1. Verificar que `OPENAI_API_KEY` está configurada:
   ```bash
   firebase functions:config:get
   ```
2. Verificar límites/cuota de OpenAI
3. Revisar logs para error específico

### Problema 3: "Respuestas muy largas/cortadas"

**Causa posible**: Límite de tokens

**Configuración actual**: `max_tokens: 800`

**Solución si se necesita ajustar**:
1. Modificar en `chatbot.ai.service.ts` línea 124
2. Recomendación: mantener entre 500-1000
3. Redeploy

### Problema 4: "Build falla"

**Solución**:
```bash
# Limpiar y rebuild
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

---

## 🔄 Rollback (Si algo sale mal)

### Opción 1: Rollback Git

```bash
# Ver commits recientes
git log --oneline

# Revertir al commit anterior
git revert HEAD
git push origin main

# Redeploy
firebase deploy --only functions
```

### Opción 2: Rollback Firebase

```bash
# Firebase Functions permite rollback a versiones anteriores
# Desde la consola de Firebase:
# Functions → chatbot → Acciones → Revertir a versión anterior
```

### Opción 3: Hotfix Manual

Si solo necesitas el glosario anterior:
1. Hacer checkout del archivo anterior
2. Commit como hotfix
3. Deploy rápido

---

## ✅ Checklist Final de Despliegue

### Pre-Deploy:
- [ ] Código compilado sin errores
- [ ] Sin errores de linting
- [ ] Pruebas locales exitosas
- [ ] Documentación completa
- [ ] Commit con mensaje descriptivo

### Deploy QA:
- [ ] Código pusheado a repositorio
- [ ] Deploy a QA ejecutado
- [ ] Pruebas básicas en QA exitosas
- [ ] No hay errores en logs
- [ ] Validación de stakeholders

### Deploy Producción:
- [ ] Merge a rama principal
- [ ] Deploy a producción ejecutado
- [ ] Prueba rápida en producción exitosa
- [ ] Monitoreo activo de logs
- [ ] Equipo notificado del deploy

### Post-Deploy:
- [ ] Métricas monitoreadas (primeras 24h)
- [ ] Sin errores críticos reportados
- [ ] Usuarios recibiendo respuestas mejoradas
- [ ] Documentación accesible para el equipo

---

## 📞 Contactos de Soporte

**En caso de problemas durante el deploy**:

- **Equipo de DevOps**: [email/slack]
- **Responsable del Backend**: [email/slack]
- **Responsable del Chatbot**: [email/slack]

---

## 📚 Referencias

- Documentación técnica: `CHATBOT_GLOSSARY_UPDATE.md`
- Casos de prueba: `CHATBOT_TEST_EXAMPLES.md`
- Resumen ejecutivo: `RESUMEN_MEJORAS_CHATBOT.md`
- Ejemplos de respuestas: `EJEMPLO_RESPUESTAS_CHATBOT.md`

---

## 📝 Notas Adicionales

### Dependencias:

El chatbot depende de:
- OpenAI API (gpt-6-luna)
- Firebase Functions
- Variables de entorno: `OPENAI_API_KEY`. Opcionales, para cambiar de modelo sin
  tocar código: `OPENAI_TEXT_MODEL`, `OPENAI_VISION_MODEL`, `OPENAI_IMAGE_MODEL`,
  `VALUACION_BRIEF_MODEL`, `VALUACION_RESULT_MODEL`

### Configuración de OpenAI:

```typescript
model: 'gpt-6-luna'          // texto y visión (OPENAI_TEXT_MODEL)
max_completion_tokens: 800   // NO max_tokens: no está soportado
reasoning_effort: 'none'     // obligatorio para function tools en chat.completions
// temperature NO se manda: sólo admite el default (1)
```

Imágenes: `gpt-image-2.5-sunburst`, 1024x1024, quality `low`.

> Los modelos quedan centralizados en
> `src/contexts/module_shared/ai/ai.config.ts`. Si se cambia un modelo por
> variable de entorno, agregar su multiplicador de costo en
> `chatbot.tokens.config.ts`: si no, el consumo se descuenta al factor 1 y la
> bolsa comunitaria de tokens se vacía más rápido de lo previsto.

### No hay cambios en:
- Base de datos
- Esquemas GraphQL
- APIs públicas
- Dependencias npm (package.json)

### Compatibilidad:
- ✅ Compatible con versión actual del backend
- ✅ No requiere cambios en el cliente
- ✅ No requiere migraciones de datos
- ✅ Cambio retrocompatible

---

**Versión**: 1.0  
**Fecha**: Diciembre 16, 2025  
**Creado por**: AI Assistant  
**Última actualización**: Diciembre 16, 2025

