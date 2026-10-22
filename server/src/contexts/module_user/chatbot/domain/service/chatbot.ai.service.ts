import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { toFile } from 'openai';
import {
  ChatbotAIResult,
  ChatbotAIServiceInterface,
  ChatbotResponseOptions,
  GeneratedImageResult,
} from './chatbot.ai.service.interface';
import { ChatMessage } from '../entity/chat.message.entity';
import { MessageRole } from '../entity/enum/message.role.enum';
import { ChatbotAction } from '../entity/enum/chatbot.action.enum';
import { AiUsage } from '../entity/chatbot.token.types';
import { buildModeContext } from './cubito-modes';
import {
  buildChatCompletionParams,
  getImageGenerationModel,
  getTextModel,
  getVisionModel,
  sanitizeImageUrls,
} from 'src/contexts/module_shared/ai/ai.config';

const CREATE_AD_TOOL_NAME = 'create_ad';

/** Tope de imágenes por mensaje de chat (el chat no es el flujo de valuación). */
const MAX_CHAT_IMAGES = 4;

const CREATE_AD_RESPONSE_COPY =
  '¡Genial! Te ayudo a crear tu anuncio. Completá los datos a continuación 👇';

// Configuración de generación de imágenes con IA (el modelo sale de
// getImageGenerationModel: ver OPENAI_IMAGE_MODEL).
// gpt-image solo soporta 1024x1024 / 1024x1536 / 1536x1024 / auto (no 512x512) y devuelve base64.
const IMAGE_GENERATION_SIZE = '1024x1024';
const IMAGE_GENERATION_QUALITY = 'low';
// Límite de caracteres del prompt (alineado con el límite del FE)
const IMAGE_PROMPT_MAX_LENGTH = 200;
// Tope de imágenes de referencia para la generación contextual (image-to-image).
const MAX_REFERENCE_IMAGES = 4;

@Injectable()
export class ChatbotAIService implements ChatbotAIServiceInterface {
  private openai: OpenAI;
  private readonly GLOSSARY = `
Glosario funcional de Publicite

Aquí podrás encontrar algunos conceptos y términos que usaremos en el sitio para que te acompañen y descubras funcionalidades mientras lo navegas. Para empezar, debes tener en cuenta una cuestión principal del funcionamiento del sitio.

═══════════════════════════════════════════════════════════════
📋 ÍNDICE DE CONTENIDOS
═══════════════════════════════════════════════════════════════

0. ¿QUÉ ES PUBLICITE? Y ¿PARA QUÉ SIRVE?
1. FORMAS DE USO
2. REGISTRO E INICIO DE SESIÓN
3. TU PERFIL Y CONFIGURACIÓN
4. CÓMO CREAR UN ANUNCIO (PASO A PASO)
5. CÓMO AÑADIR AMIGOS Y CONTACTOS (PASO A PASO)
6. TIPOS DE RELACIONES Y ACTIVACIÓN DE CONTACTOS
7. CREAR REVISTAS Y GRUPOS
8. EXPLORAR CONTENIDO
9. PIZARRA
10. GESTIÓN DE ANUNCIOS
11. PLANES Y SUSCRIPCIONES
12. ENLACES RÁPIDOS
13. MIS PRODUCCIONES (BLOGS)

═══════════════════════════════════════════════════════════════

---

## 0. ¿QUÉ ES PUBLICITE? Y ¿PARA QUÉ SIRVE? 🌟

**Publicite es una plataforma que combina un sistema de anuncios (avisos) con una red de contactos.** En pocas palabras: te permite **publicar lo que ofrecés o lo que necesitás** (bienes y servicios) y **controlar quién lo ve**, ya sea por cercanía geográfica o dentro de tu red de contactos de confianza.

### 🎯 ¿Para qué sirve?
- **Publicar anuncios** de lo que vendés u ofrecés (un bien o un servicio) o de lo que estás buscando (una necesidad).
- **Descubrir** ofertas y necesidades de otros usuarios, filtrando por ubicación y categoría.
- **Conectarte** con personas y empresas como contactos, amigos o topamigos, y compartir anuncios según el nivel de relación.
- **Organizar contenido** en revistas (colecciones de anuncios) y grupos (espacios colaborativos).
- **Publicar tus producciones** en un blog (fotos, videos, audios, escritos y artículos), personal o de un grupo. Ver sección 13.

### 🧭 ¿Cómo funciona la visibilidad? (lo más importante)
Publicite tiene **dos formas de mostrar los anuncios**:
- **Anuncios Libres** 🌐: se ven según la **ubicación** y el alcance geográfico que definas (ej: a la redonda de X km). Ideales para llegar a gente cercana que no conocés.
- **Anuncios de Agenda** 📇: se ven **solo dentro de tu red** (contactos, amigos o topamigos), según el nivel de relación que elijas. Ideales para algo más privado o dirigido a tu círculo.

### 👥 ¿A quién está dirigido?
A **empresas y personas** que quieran ofrecer o encontrar bienes y servicios, tanto a nivel **local** (por geolocalización) como dentro de su **red de confianza**. Podés explorar como invitado o registrarte para publicar y acceder a todo.

### 💡 En resumen
Es como un **clasificado de avisos potenciado con una red social**: publicás, elegís quién lo ve (por zona o por vínculo) y armás tu comunidad con contactos, grupos y revistas.

---

## 1. FORMAS DE USO

Puedes usar Publicite de dos maneras:

• **Usuario Invitado (Guest)**: Navega y explora sin registrarte
• **Usuario Registrado**: Accede a todas las funcionalidades, publica anuncios, crea grupos y revistas

💡 **Recomendación**: Regístrate para aprovechar todas las funciones de la plataforma.

---

## 2. REGISTRO E INICIO DE SESIÓN

### 📝 Registrarse
1. Ve a la página de registro: https://soonpublicite.com/registrarse
2. Elige si te registras como **Empresa** o **Persona**
3. Completa tus datos básicos
4. ¡Listo! Ya puedes comenzar a usar Publicite

### 🔑 Iniciar Sesión
1. Visita: https://soonpublicite.com/iniciar-sesion
2. Ingresa tus credenciales
3. Accede a tu cuenta

---

## 3. TU PERFIL Y CONFIGURACIÓN

### 🎨 Cartel de Usuario
Tu cartel es tu perfil público donde otros usuarios pueden ver tu información.

**Para configurar tu perfil:**
1. Haz clic en tu avatar (esquina superior derecha)
2. Ve a "Configuración": https://soonpublicite.com/configuracion
3. Edita:
   - **Datos personales**: Nombre, descripción, foto de perfil
   - **Redes sociales**: Instagram, Facebook, WhatsApp, etc.
   - **Privacidad**: Qué información quieres mostrar públicamente
   - **Preferencias**: Personalización de tu experiencia

💡 **Tip**: Configura bien tu perfil para que otros usuarios puedan conocerte mejor.

---

## 4. CÓMO CREAR UN ANUNCIO (PASO A PASO) 📢

### 🎯 Tipos de Anuncios

**A) Anuncios de Oferta (Bienes/Servicios)**
- Publica productos que vendes o servicios que ofreces

**B) Anuncios de Necesidad**
- Publica lo que necesitas o buscas

### 📝 PASOS PARA CREAR UN ANUNCIO:

**1. Accede a la página de creación**
   - Ve a: https://soonpublicite.com/crear
   - Selecciona "Crear Anuncio": https://soonpublicite.com/crear/anuncio

**2. Elige el tipo de comportamiento del anuncio**
   - **Anuncio Libre**: Visible según localización y alcance geográfico
   - **Anuncio de Agenda**: Solo visible para tus contactos/amigos

**3. Selecciona si es un Bien o Servicio**
   - Bien: Productos físicos (ej: celular, muebles, ropa)
   - Servicio: Prestaciones (ej: plomería, diseño, clases)

**4. Completa la información básica**
   - **Título**: Nombre descriptivo de tu anuncio
   - **Descripción**: Explica en detalle qué ofreces
   - **Precio**: Indica el valor (puede ser fijo o negociable)
   - **Categoría**: Selecciona la categoría apropiada

**5. Agrega imágenes**
   - Sube fotos de calidad (mínimo 1, recomendado 3-5)
   - Las imágenes ayudan a que tu anuncio sea más atractivo

**6. Configura la localización (para Anuncios Libres)**
   - Selecciona tu ubicación
   - Define el **rango de alcance** (¿a cuántos kilómetros quieres que se vea?)
   - Ejemplo: Si pones 10km, tu anuncio será visible para usuarios en ese radio

**7. Configura la visibilidad (para Anuncios de Agenda)**
   - Elige quién puede ver tu anuncio:
     - **Contactos**: Todos tus contactos lo verán
     - **Amigos**: Solo amigos y topamigos
     - **TopAmigos**: Solo tu círculo más cercano

**8. Establece la fecha de vencimiento**
   - Define hasta cuándo estará activo el anuncio
   - Puedes extenderlo o reactivarlo después

**9. Revisa y publica**
   - Verifica que toda la información esté correcta
   - Haz clic en "Publicar"
   - ¡Tu anuncio ya está activo! 🎉

### 📍 Enlaces útiles:
- Crear Anuncio: https://soonpublicite.com/crear/anuncio
- Crear Necesidad: https://soonpublicite.com/crear/necesidad
- Ver tus anuncios: https://soonpublicite.com/configuracion
- Explorar anuncios: https://soonpublicite.com/anuncios

---

## 5. CÓMO AÑADIR AMIGOS Y CONTACTOS (PASO A PASO) 👥

### 🔍 PASOS PARA AÑADIR UN CONTACTO/AMIGO:

**1. Busca usuarios**
   - Ve a la sección de Perfiles: https://soonpublicite.com/perfiles
   - Usa la barra de búsqueda para encontrar personas
   - Filtra por nombre, empresa, ubicación, etc.

**2. Visita el perfil del usuario**
   - Haz clic en el usuario que te interesa
   - Revisa su información, anuncios, y grupos

**3. Envía una solicitud de contacto**
   - En el perfil del usuario, verás un botón "Enviar Solicitud"
   - Selecciona el tipo de relación que deseas:
     - **Contacto**: Relación básica
     - **Amigo**: Relación más cercana
     - **TopAmigo**: Tu círculo más íntimo

**4. Espera la aceptación**
   - El usuario recibirá una notificación
   - Si acepta, la relación se establecerá
   - Recibirás una notificación cuando te acepte

**5. Activa el contacto para ver sus anuncios**
   - ⚠️ **IMPORTANTE**: Agregar un contacto NO es suficiente
   - Debes **ACTIVARLO** para ver sus anuncios de agenda
   - Ve a tu perfil → Contactos
   - Haz clic en "Gestionar Contactos Activos"
   - Selecciona los contactos que quieres activar
   - Confirma la activación

### 📱 Gestionar tus contactos:
- Ver tus contactos: Ve a tu perfil → pestaña "Contactos"
- Activar/Desactivar: https://soonpublicite.com/configuracion
- Cambiar tipo de relación: Envía una solicitud de cambio desde el perfil del contacto

### 💡 Tips:
- Activa solo los contactos cuyos anuncios quieres ver
- Puedes tener contactos ilimitados, pero solo activa los relevantes
- Cambiar de "Contacto" a "Amigo" requiere aceptación mutua

---

## 6. TIPOS DE RELACIONES Y ACTIVACIÓN DE CONTACTOS 🤝

### 📊 Los 3 Tipos de Relaciones:

**1. Contacto** 👤
- Relación básica
- Puedes ver sus anuncios de agenda (si los activas)

**2. Amigo** 🙋
- Relación más cercana
- Ven tus anuncios configurados para "Amigos"
- Los Contactos NO verán estos anuncios

**3. TopAmigo** ⭐
- Tu círculo más íntimo
- Máxima visibilidad de tus anuncios privados
- Solo ellos verán anuncios configurados como "TopAmigos"

### 🎯 Visibilidad según relación:

Cuando configuras un anuncio de agenda:
- **Si seleccionas "Contacto"**: Lo verán Contactos, Amigos y TopAmigos
- **Si seleccionas "Amigo"**: Solo lo verán Amigos y TopAmigos (Contactos NO)
- **Si seleccionas "TopAmigo"**: Solo lo verán TopAmigos

### ⚡ Activación de Contactos:

**¿Por qué activar?**
Para no saturarte con anuncios de todos tus contactos.

**¿Cómo activar?**
1. Ve a tu perfil
2. Pestaña "Contactos"
3. Botón "Gestionar Contactos Activos"
4. Selecciona quiénes activar
5. Guarda cambios

**Importante**:
- Solo verás anuncios de agenda de contactos ACTIVADOS
- Puedes activar/desactivar cuando quieras
- Esto no afecta la relación, solo la visualización de anuncios

---

## 7. CREAR REVISTAS Y GRUPOS 📚

### 📖 Revistas

**¿Qué son?**
Colecciones organizadas de anuncios agrupados por temas o secciones.

**Tipos:**
- **Revistas Propias**: Solo tú las administras
- **Revistas Compartidas**: Varios usuarios pueden agregar contenido

**Crear una revista:**
1. Ve a: https://soonpublicite.com/crear/revista
2. Define nombre, descripción e imagen
3. Crea secciones (categorías dentro de la revista)
4. Agrega anuncios a cada sección
5. Comparte tu revista con otros

**Ver revistas:**
- Explorar revistas: https://soonpublicite.com/revistas
- Ver tus revistas: En tu perfil → pestaña "Revistas"

### 👥 Grupos

**¿Qué son?**
Espacios colaborativos donde varios usuarios pueden compartir anuncios y contenido.

**Crear un grupo:**
1. Ve a: https://soonpublicite.com/crear/grupo
2. Completa:
   - Nombre del grupo
   - Descripción
   - Imagen del grupo
   - Configuración de privacidad
3. Invita miembros o permite solicitudes de ingreso
4. Asigna roles (administrador, colaborador, miembro)
5. Publica el grupo

**Unirse a grupos:**
1. Explora grupos: https://soonpublicite.com/grupos
2. Busca grupos que te interesen
3. Solicita unirte o únete si es público
4. Espera aprobación del administrador (si es privado)

**Gestionar grupos:**
- Como administrador puedes:
  - Aprobar/rechazar solicitudes
  - Asignar colaboradores
  - Configurar permisos
  - Agregar anuncios y revistas al grupo

---

## 8. EXPLORAR CONTENIDO 🔎

### 🌍 Sección Explorar

La sección principal donde descubres contenido: https://soonpublicite.com/anuncios

### 📑 Solapas disponibles:

**A) Anuncios Libres** 🌐
- Ver todos los anuncios: https://soonpublicite.com/anuncios
- Filtrar por localización y distancia
- Buscar por categorías
- Ordenar por:
  - Recientes: https://soonpublicite.com/anuncios/recientes
  - Mejor puntuados: https://soonpublicite.com/anuncios/mejor-puntuados
  - Próximos a vencer: https://soonpublicite.com/anuncios/proximos-a-vencer

**B) Anuncios de Agenda** 📇
- Ver anuncios de tus contactos: https://soonpublicite.com/anuncios/contactos
- Solo verás anuncios de contactos ACTIVADOS
- Filtra por servicios o necesidades

**C) Pizarras** 📝
- Ver pizarras de usuarios: https://soonpublicite.com/pizarras
- Mensajes personales de tus contactos

**D) Perfiles** 👥
- Explorar usuarios: https://soonpublicite.com/perfiles
- Buscar empresas o personas
- Ver perfiles públicos

**E) Grupos** 🏘️
- Explorar grupos: https://soonpublicite.com/grupos
- Únete a comunidades de tu interés

### 🔍 Configurar búsqueda de Anuncios Libres:

1. En la página de anuncios libres
2. Usa el selector de ubicación
3. Ajusta el rango de búsqueda (km)
4. Los anuncios que coincidan con tu ubicación ± rango aparecerán
5. Puedes cambiar la ubicación manualmente

---

## 9. PIZARRA 📋

**¿Qué es?**
Un espacio personal para escribir mensajes o notas que otros usuarios pueden ver.

**Características:**
- Escribe lo que quieras compartir
- Configura la visibilidad (pública o para contactos)
- Similar a un "estado" o "muro"

**Acceder:**
- Tu pizarra: En tu perfil → pestaña "Pizarra"
- Ver pizarras de otros: https://soonpublicite.com/pizarras

**Configurar:**
Ve a tu perfil y edita el mensaje de tu pizarra. Configura quién puede verla en las opciones de privacidad.

---

## 10. GESTIÓN DE ANUNCIOS 📊

### Estados de los Anuncios:

**🟢 Activo**
- El anuncio está visible para los usuarios
- Aparece en las búsquedas y exploración

**🟡 Inactivo**
- Anuncio pausado temporalmente
- Puedes reactivarlo cuando quieras
- No es visible para otros usuarios
- Útil para mantener un anuncio sin eliminarlo

**🔴 Vencido**
- Alcanzó la fecha de vencimiento establecida
- Ya no es visible
- Puedes extender la fecha y reactivarlo

**⚠️ Nota sobre pagos:**
Si tienes problemas con el pago de tu suscripción, tus anuncios pueden volverse inactivos automáticamente. ¡No te preocupes! No los perderás, solo actualiza tu método de pago y reactívalos.

### 🛠️ Opciones de gestión:

**Editar un anuncio:**
1. Ve a tu perfil → "Mis anuncios"
2. Selecciona el anuncio que quieres editar
3. Haz clic en "Editar"
4. Modifica la información necesaria
5. Guarda cambios

**Reactivar un anuncio:**
1. En tus anuncios inactivos o vencidos
2. Selecciona el anuncio
3. Haz clic en "Reactivar"
4. Actualiza la fecha de vencimiento si es necesario
5. Confirma

**Eliminar un anuncio:**
1. Ve al anuncio que quieres eliminar
2. Haz clic en "Opciones" → "Eliminar"
3. Confirma la eliminación (esta acción es permanente)

---

## 11. PLANES Y SUSCRIPCIONES 💳

### 📦 Tipos de planes:

Publicite ofrece diferentes planes según tus necesidades de publicación.

**Ver planes disponibles:**
https://soonpublicite.com/suscripciones

**Características de los planes:**
- Cantidad de anuncios activos simultáneos
- Duración de las publicaciones
- Funcionalidades adicionales
- Opciones de destacado

### 🔝 Ampliaciones:

Si necesitas más anuncios pero no quieres cambiar de plan completo:
- Compra packs de publicaciones adicionales
- Ver packs: https://soonpublicite.com/packs-publicaciones
- Se suman a tu plan actual

### 💳 Gestionar suscripción:

1. Ve a: https://soonpublicite.com/configuracion
2. Sección "Suscripciones"
3. Puedes:
   - Ver tu plan actual
   - Cambiar de plan
   - Actualizar método de pago
   - Ver historial de pagos
   - Cancelar suscripción

**Importante**:
- Los planes se renuevan automáticamente
- Puedes cancelar en cualquier momento
- Al cancelar, mantienes el acceso hasta el fin del período pagado

---

## 12. ENLACES RÁPIDOS 🚀

### 🎯 Acciones principales:

• **Crear Anuncio**: https://soonpublicite.com/crear/anuncio
• **Crear Necesidad**: https://soonpublicite.com/crear/necesidad
• **Crear Revista**: https://soonpublicite.com/crear/revista
• **Crear Grupo**: https://soonpublicite.com/crear/grupo
• **Crear Producción (blog)**: https://soonpublicite.com/crear/produccion

### 🔍 Explorar:

• **Anuncios**: https://soonpublicite.com/anuncios
• **Anuncios de Contactos**: https://soonpublicite.com/anuncios/contactos
• **Anuncios Recientes**: https://soonpublicite.com/anuncios/recientes
• **Perfiles**: https://soonpublicite.com/perfiles
• **Grupos**: https://soonpublicite.com/grupos
• **Pizarras**: https://soonpublicite.com/pizarras
• **Producciones (blogs)**: https://soonpublicite.com/producciones
• **Producciones Libres**: https://soonpublicite.com/producciones/libres
• **Producciones de Contactos**: https://soonpublicite.com/producciones/contactos
• **Mis tickets de Producciones**: https://soonpublicite.com/producciones/mis-tickets

### ⚙️ Configuración:

• **Tu Perfil/Configuración**: https://soonpublicite.com/configuracion
• **Suscripciones**: https://soonpublicite.com/suscripciones
• **Packs de Publicaciones**: https://soonpublicite.com/packs-publicaciones

### 👤 Cuenta:

• **Registrarse**: https://soonpublicite.com/registrarse
• **Iniciar Sesión**: https://soonpublicite.com/iniciar-sesion

---

## 13. MIS PRODUCCIONES (BLOGS) 🗂️

### ¿Qué es?
**Mis Producciones** es la app de Publicite para publicar contenido propio en un **blog**: fotos (postales), videos, audios, escritos en PDF, documentos de Office y **artículos** escritos en la misma plataforma. Un blog puede ser **personal** o **de un grupo**.

### 📝 Crear un blog
1. Ve a: https://soonpublicite.com/crear/produccion
2. Si es un blog personal, elige su **comportamiento**, igual que en los anuncios:
   - **Blog Libre**: público (o sólo para usuarios registrados) y visible para quien esté dentro del **radio de alcance** de su ubicación. Al crearlo eliges la ubicación en el mapa y el radio (de 1 a 200 km).
   - **Blog de Agenda**: visible sólo para tu agenda de contactos (Contactos, Amigos o Top amigos), sin importar dónde estén.
   Los blogs de grupo no tienen comportamiento: los ven los miembros del grupo según su alcance.
3. Completa el nombre, la descripción, la foto de portada y el texto de bienvenida
4. Elige el **alcance**: en un blog libre, Público o Registrados; en uno de agenda, Contactos, Amigos o Top amigos. En los dos puedes elegir **Sólo yo**
5. ¡Listo! Entra al blog y empieza a cargar contenido

**Cambiar el comportamiento**: en "Editar blog" → "Editar Comportamiento" pasas un blog de libre a agenda (o al revés) y cambias la ubicación y el radio de un blog libre.

**Cupos**: como con los anuncios, tu plan tiene un cupo de **blogs libres** y otro de **blogs de agenda** (se suman entre tus suscripciones y packs). Si se termina el de un tipo, puedes crear del otro, cambiar de plan o comprar un pack. La cantidad de blogs de grupo, de archivos por blog y el espacio de almacenamiento también dependen de tu plan.

### 🔍 Explorar producciones
En https://soonpublicite.com/producciones hay tres solapas, como en Anuncios:
- **Producciones**: todo lo que puedes ver. Los blogs libres aparecen sólo si estás dentro de su radio.
- **Producciones Libres**: blogs libres de otros usuarios cerca tuyo (dentro de su radio). Se filtran por cómo se entra al blog: Todos, Gratuitos (sin ticket), Ticket gratis o Ticket pago.
- **Agenda de Contactos**: blogs de agenda de tus contactos, con sub-solapas Todos, Contactos, Amigos y Top Amigos, y dentro de cada una el mismo filtro Todos / Gratuitos / Ticket gratis / Ticket pago.
El filtro de ticket mira el ticket del blog completo: un blog que se entra libre cuenta como Gratuito aunque tenga carpetas o archivos con ticket.
Puedes buscar por nombre o descripción y cambiar tu ubicación con "Seleccionar ubicación".

### 📁 Organizar el contenido (como en un explorador de archivos)
- **Carpetas y subcarpetas**: usa "Nueva carpeta". Cada carpeta muestra una vista previa de lo que tiene adentro.
- **Subir archivos**: con el botón "Subir archivos" (puedes elegir varios a la vez) o **arrastrando los archivos desde tu computadora** y soltándolos sobre el blog o sobre una carpeta.
- **Artículos**: con "Nuevo artículo" escribes un texto con formato, imágenes y otros bloques. Arriba del editor hay una **barra de formato fija, como en Word** (estilo de párrafo, títulos, listas, negrita, cursiva, subrayado, tachado, color, resaltado, tamaño, enlace y alineación); también aparece al seleccionar un texto. Mientras escribes se muestra el **recuento de palabras y caracteres**.
- **Ver PDF y Word**: los PDF y los documentos de Word (.docx) se leen dentro del blog, con su propio visor (con zoom en los PDF). Los demás documentos de Office se descargan.
- **Mover**: marca uno o varios elementos con su casilla, toca **"Mover"** y elige la carpeta de destino. También puedes **arrastrar** un elemento y soltarlo sobre una carpeta, o usar "Mover a…" en el menú de los tres puntos de cada elemento. Lo movido deja de estar en la carpeta de origen y pasa a tomar el alcance de la carpeta de destino.
- **Renombrar y borrar**: desde el menú de los tres puntos de cada elemento. Borrar una carpeta borra todo lo que tiene adentro.

### 🧭 Navegar un blog
- **Flechas Atrás / Adelante** y **Subir un nivel**, junto al camino de carpetas (Inicio › Carpeta › Subcarpeta).
- Dentro de un archivo o artículo: botón para **volver a la carpeta** y flechas **Anterior / Siguiente** para recorrer los archivos de esa carpeta.
- **Buscar** por nombre dentro de la carpeta abierta, **filtrar por tipo** (carpetas, fotos, videos, audios, escritos, documentos, artículos) y **ordenar** (más recientes, más antiguos, por nombre o por tipo).
- **Vista de grilla o de lista**, a elección. En la grilla, un deslizador cambia el **tamaño de los íconos** (más chicos o más grandes), como en un explorador de archivos.
- **Compartir**: cada carpeta, archivo o artículo tiene su propio link. El botón de compartir junto al camino de carpetas comparte la carpeta abierta, y dentro de un archivo o artículo el botón "Compartir" lleva directo a ese contenido (no al inicio del blog). El staff también tiene "Compartir link" en el menú de los tres puntos.

### 👀 Ver como visitante
El dueño o moderador del blog tiene el botón **"Ver como visitante"**: muestra el blog (o un archivo o artículo) sin los controles de edición, para revisar cómo quedó el trabajo. Con "Volver a editar" se regresa al modo normal.

### 🔐 Alcance, clave y tickets
- **Alcance**: cada carpeta o archivo puede heredar el alcance del blog o tener uno propio.
- **Sólo yo** 🔒: el blog, una carpeta, un archivo o un artículo puede quedar privado, visible solo para ti (en un blog de grupo, para el creador y los administradores). Se elige en "Alcance y clave" (blog) o en el control de alcance de cada elemento. Lo privado no se muestra a nadie más, aunque tenga la clave o el link, y todo lo que está dentro de una carpeta privada también es privado.
- **Clave de acceso**: el blog puede pedir una clave para ver su contenido ("Alcance y clave").
- **Mapa de tickets** (menú "Opciones" del blog): dibuja todo el blog en recuadros —carpetas que contienen carpetas y archivos— pintados por color: verde = gratis, azul = ticket gratuito, naranja = ticket pago (con su precio). El borde punteado indica que el ticket se hereda de la carpeta o del blog. Los interruptores de arriba resaltan u ocultan cada tipo, y al tocar un recuadro se configura su ticket.
- **Tickets**: el blog entero, una carpeta o un archivo pueden tener tres tipos de acceso: **Libre** (sin ticket, se entra directo), **Ticket gratuito** (no cuesta nada: el visitante toca "Sacar ticket gratis" y entra al instante; le sirve al dueño para saber cuánta gente entra) o **Ticket pago**. Se configura con el botón "Ticket" de cada elemento o desde el Mapa de tickets, eligiendo también cuánto dura el acceso (1 día, 1 semana, 1 mes, sin vencimiento u otro). En los tickets pagos el comprador hace **dos transferencias**: una al alias/CBU del blog y otra, la comisión, a Soonpublicité; adjunta los comprobantes y el staff del blog habilita el acceso. Tus compras están en: https://soonpublicite.com/producciones/mis-tickets

### ⭐ Fans, reseñas y comentarios
- **Fans** 💖: el contador de fans está junto al título del blog. Con "Hacerme fan" sigues el blog; el dueño ve cuántos fans tiene.
- **Reseñas**: el puntaje del blog se ve arriba, en el encabezado, junto al botón **"Reseñar este blog"** (estrellas del 1 al 5 y un texto). Tocar el puntaje o las estrellas de la sección de reseñas, más abajo, también abre la reseña. Un blog abierto lo puede reseñar cualquier visitante; si el blog completo tiene ticket, sólo quienes accedieron con él. El dueño no reseña su propio blog. Si ya reseñaste, el mismo botón te deja editar tu reseña.
- **Comentarios**: debajo del blog. Cada comentario muestra la foto y el @usuario de quien lo escribió, y al tocarlo se abre su cartel de usuario. **Quien escribió un comentario puede eliminarlo**; el staff del blog puede responder y también eliminar comentarios.
- **Denunciar**: está en el menú de opciones del blog (botón "⋯" del encabezado), no a la vista directa. Antes de enviar se muestra qué blog se está denunciando y de quién es. **El sitio protege al denunciante**: el dueño del blog ve qué se denunció y el motivo, pero nunca quién lo hizo.
- **Denuncias recibidas**: el dueño o moderador las consulta en "Opciones" → "Denuncias recibidas", con el contenido denunciado, el motivo y si Soonpublicité la está revisando, la confirmó o la desestimó.

### ⚙️ Menú "Opciones" del blog
El dueño encuentra en un solo menú: Mapa de tickets, Alcance y clave, Ventas de tickets, Editar blog, Denuncias recibidas y Eliminar blog.

### 🎨 Enviar al blog desde el Tablero de trabajo
En el Tablero de trabajo de Cubito (https://soonpublicite.com/cubito/tablerodetrabajo), cada **imagen generada** tiene "Enviar a mi blog", y cada **Valuación IA** guardada tiene el botón de carpeta "Enviar a mi blog" (se guarda el informe como imagen). Se elige el blog y dónde guardarlo: en el inicio, en una carpeta existente o en una carpeta nueva.

### 🗑️ Eliminar un blog
Con "Opciones" → "Eliminar blog" se abre una confirmación en la que hay que **escribir el nombre del blog**. Es definitivo: se borra todo su contenido.

### 👥 Blogs de grupo
El creador del grupo administra el blog, los administradores del grupo son moderadores (cargan y editan contenido) y los miembros pueden verlo.

### 📍 Enlaces útiles:
- Explorar blogs: https://soonpublicite.com/producciones
- Crear un blog: https://soonpublicite.com/crear/produccion
- Mis tickets: https://soonpublicite.com/producciones/mis-tickets

---

═══════════════════════════════════════════════════════════════

## 📞 CONTACTO Y SOPORTE

¿Tienes dudas, sugerencias o necesitas ayuda?

📧 **Email**: publicite@soonpublicite.com

Estamos aquí para ayudarte a aprovechar al máximo Publicite.

═══════════════════════════════════════════════════════════════

¡Muchas gracias por usar Publicite! 🎉
Esperamos que disfrutes de la plataforma y encuentres todo lo que buscas.

¡Bienvenido a la comunidad Publicite! 🚀
  `;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateResponse(
    conversationHistory: ChatMessage[],
    userMessage: string,
    options?: ChatbotResponseOptions,
  ): Promise<ChatbotAIResult> {
    // El modelo de visión se resuelve aparte para poder subirlo sin encarecer
    // el chat de texto. Hoy ambos son gpt-6-luna (la familia gpt-6 ve imágenes).
    const imageUrls = sanitizeImageUrls(options?.imageUrls, MAX_CHAT_IMAGES);
    const model = imageUrls.length > 0 ? getVisionModel() : getTextModel();

    try {
      const messages = this.buildOpenAIMessages(
        conversationHistory,
        userMessage,
        options,
        imageUrls,
      );

      const completion = await this.openai.chat.completions.create({
        model,
        messages: messages,
        tools: this.buildTools(),
        tool_choice: 'auto',
        ...buildChatCompletionParams({ model, temperature: 0.7, maxTokens: 800 }),
      });

      const choice = completion.choices[0]?.message;
      const usage = this.mapCompletionUsage(completion.usage);

      const createAdToolCall = choice?.tool_calls?.find(
        (tc) => tc.type === 'function' && tc.function?.name === CREATE_AD_TOOL_NAME,
      );

      if (createAdToolCall) {
        return {
          content: CREATE_AD_RESPONSE_COPY,
          action: ChatbotAction.CREATE_AD,
          usage,
          model,
        };
      }

      const content =
        choice?.content || 'Lo siento, no pude generar una respuesta en este momento.';

      return { content, usage, model };
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Error generating AI response: ${error.message}`);
    }
  }

  async generateImage(
    prompt: string,
    referenceImages?: string[],
  ): Promise<GeneratedImageResult> {
    const cleanPrompt = (prompt || '').trim();

    if (!cleanPrompt) {
      throw new Error('El prompt para generar la imagen no puede estar vacío');
    }

    if (cleanPrompt.length > IMAGE_PROMPT_MAX_LENGTH) {
      throw new Error(
        `El prompt no puede superar los ${IMAGE_PROMPT_MAX_LENGTH} caracteres`,
      );
    }

    // Filtramos referencias válidas (data URLs base64). Si queda al menos una,
    // usamos el flujo contextual (image-to-image) vía images.edit.
    const validReferences = (referenceImages ?? [])
      .filter((img) => typeof img === 'string' && img.trim().length > 0)
      .slice(0, MAX_REFERENCE_IMAGES);

    const model = getImageGenerationModel();

    try {
      let result: OpenAI.Images.ImagesResponse;

      if (validReferences.length > 0) {
        // Generación contextual: la nueva imagen se edita a partir de las
        // referencias (p. ej. "el mismo perro pero ahora con su dueño").
        const imageFiles = await Promise.all(
          validReferences.map((ref, idx) =>
            this.dataUrlToFile(ref, `reference-${idx}.png`),
          ),
        );

        result = await this.openai.images.edit({
          model,
          image: imageFiles,
          prompt: cleanPrompt,
          n: 1,
          size: IMAGE_GENERATION_SIZE,
          quality: IMAGE_GENERATION_QUALITY,
        });
      } else {
        result = await this.openai.images.generate({
          model,
          prompt: cleanPrompt,
          n: 1,
          size: IMAGE_GENERATION_SIZE,
          quality: IMAGE_GENERATION_QUALITY,
        });
      }

      return await this.parseImageResult(result, model);
    } catch (error: any) {
      console.error('Error calling OpenAI Images API:', error);
      throw new Error(`Error generating AI image: ${error.message}`);
    }
  }

  /**
   * Normaliza la respuesta de OpenAI (generate o edit) a un GeneratedImageResult.
   * Según el modelo, la imagen viene en base64 o como URL temporal.
   */
  private async parseImageResult(
    result: OpenAI.Images.ImagesResponse,
    model: string,
  ): Promise<GeneratedImageResult> {
    const image = result.data?.[0];
    const usage = this.mapImageUsage(result.usage);

    if (!image) {
      throw new Error('OpenAI no devolvió ninguna imagen');
    }

    if (image.b64_json) {
      return {
        imageBase64: `data:image/png;base64,${image.b64_json}`,
        usage,
        model,
      };
    }

    if (image.url) {
      const resp = await fetch(image.url);
      const arrayBuffer = await resp.arrayBuffer();
      const b64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = resp.headers.get('content-type') || 'image/png';
      return {
        imageBase64: `data:${contentType};base64,${b64}`,
        usage,
        model,
      };
    }

    throw new Error('OpenAI no devolvió ninguna imagen');
  }

  /**
   * Convierte una imagen (data URL base64 o URL http) en un File subible a la
   * API de imágenes de OpenAI (images.edit).
   */
  private async dataUrlToFile(
    source: string,
    filename: string,
  ): Promise<ReturnType<typeof toFile> extends Promise<infer T> ? T : never> {
    const trimmed = source.trim();

    // data URL base64: data:image/png;base64,XXXX
    const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.*)$/);
    if (dataUrlMatch) {
      const contentType = dataUrlMatch[1] || 'image/png';
      const buffer = Buffer.from(dataUrlMatch[2], 'base64');
      return toFile(buffer, filename, { type: contentType });
    }

    // URL remota: la descargamos.
    if (/^https?:\/\//i.test(trimmed)) {
      const resp = await fetch(trimmed);
      const arrayBuffer = await resp.arrayBuffer();
      const contentType = resp.headers.get('content-type') || 'image/png';
      return toFile(Buffer.from(arrayBuffer), filename, { type: contentType });
    }

    // Base64 crudo (sin prefijo data URL).
    const buffer = Buffer.from(trimmed, 'base64');
    return toFile(buffer, filename, { type: 'image/png' });
  }

  private mapCompletionUsage(
    usage: OpenAI.CompletionUsage | undefined,
  ): AiUsage | undefined {
    if (!usage) return undefined;
    return {
      promptTokens: usage.prompt_tokens ?? 0,
      completionTokens: usage.completion_tokens ?? 0,
      totalTokens:
        usage.total_tokens ??
        (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
    };
  }

  private mapImageUsage(usage: any): AiUsage | undefined {
    if (!usage) return undefined;
    const promptTokens = usage.input_tokens ?? 0;
    const completionTokens = usage.output_tokens ?? 0;
    return {
      promptTokens,
      completionTokens,
      totalTokens: usage.total_tokens ?? promptTokens + completionTokens,
    };
  }

  private buildTools(): OpenAI.Chat.Completions.ChatCompletionTool[] {
    return [
      {
        type: 'function',
        function: {
          name: CREATE_AD_TOOL_NAME,
          description:
            'Se activa cuando el usuario expresa intención de crear un anuncio, ' +
            'publicar un bien, ofrecer un servicio, vender algo o publicar una necesidad en la plataforma Publicite. ' +
            'Ejemplos: "quiero crear un anuncio", "cómo publico algo", "necesito vender un producto", ' +
            '"puedo ofrecer un servicio acá", "quiero subir una publicación". ' +
            'No activar si el usuario solamente pregunta cómo funciona el proceso o pide información sobre los pasos: ' +
            'en ese caso responder con texto explicativo.',
          parameters: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      },
    ];
  }

  private buildOpenAIMessages(
    conversationHistory: ChatMessage[],
    userMessage: string,
    options?: ChatbotResponseOptions,
    imageUrls: string[] = [],
  ): Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> {
    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];

    // Contexto del modo/especialidad + prompt libre de rol + prompt sugerido.
    // Va como bloque adicional del system prompt: Cubito sigue siendo la misma
    // IA, sólo cambia el enfoque de la respuesta.
    const modeContext = buildModeContext({
      mode: options?.mode,
      rolePrompt: options?.rolePrompt,
      extraPrompt: options?.extraPrompt,
      avatarContext: options?.avatarContext,
    });

    messages.push({
      role: 'system',
      content: `Eres un asistente virtual de Publicite, una plataforma de publicación y gestión de anuncios.
Tu objetivo principal es ayudar a los usuarios a entender cómo funciona la plataforma y guiarlos paso a paso,
pero también podés responder consultas generales de cualquier tema usando tu conocimiento, de forma útil y profesional.

IMPORTANTE — TEMAS DE PUBLICITE: Cuando te pregunten sobre Publicite, respondé usando como base el siguiente glosario.
Podés explicar, resumir, inferir y conectar la información del glosario para responder preguntas conceptuales sobre la
plataforma (qué es, para qué sirve, cómo funciona, a quién apunta, diferencias entre funciones, etc.), aunque la
respuesta no esté escrita palabra por palabra. Lo que NO debés hacer es inventar datos puntuales que no figuren en el
glosario (precios exactos, links que no aparezcan, fechas o políticas específicas de Publicite).

TEMAS GENERALES: Además de Publicite, podés responder consultas de cualquier otro tema con tu conocimiento general
(definiciones, cultura general, cálculos, redacción, recomendaciones, ayuda variada, etc.), siempre de forma útil,
correcta y con un tono profesional y amable. Si no sabés algo o no estás seguro, admitilo con honestidad en lugar de
inventar. Aunque ayudes con temas generales, mantené tu identidad de asistente de Publicite: si la persona muestra
intención de publicar, vender, ofrecer o crear algo, guiala hacia la plataforma.

EXCEPCIÓN — DETECCIÓN DE INTENCIÓN:
Tenés a disposición la tool "${CREATE_AD_TOOL_NAME}". Debés invocarla SIEMPRE que el usuario exprese intención
de crear un anuncio, publicar algo, vender un producto, ofrecer un servicio o publicar una necesidad.
No debés invocar la tool cuando el usuario solamente pide información sobre cómo funciona el proceso de creación.
Cuando invocás la tool no devuelvas texto adicional: el sistema se encarga de responder.

GLOSARIO DE PUBLICITE:
${this.GLOSSARY}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES PARA RESPONDER (cuando NO disparás la tool):
═══════════════════════════════════════════════════════════════

1. **Sé amable y profesional**: Trata al usuario con cortesía y empatía.

2. **Proporciona pasos claros**: Cuando expliques cómo hacer algo, enumera los pasos de forma ordenada y simple.

3. **SIEMPRE incluye enlaces relevantes**:
   - Cuando hables de crear anuncios, incluye: https://soonpublicite.com/crear/anuncio
   - Cuando hables de contactos/amigos, incluye: https://soonpublicite.com/perfiles
   - Para explorar anuncios: https://soonpublicite.com/anuncios
   - Para configuración: https://soonpublicite.com/configuracion
   - Usa los enlaces del glosario según el tema de la pregunta

4. **Usa formato claro**:
   - Usa emojis para hacer las respuestas más amigables (pero sin excederte)
   - Usa listas numeradas para pasos
   - Usa viñetas para opciones
   - Usa **negritas** para resaltar información importante

5. **Sé específico**: Si el usuario pregunta "¿cómo creo un anuncio?", no solo le digas que vaya a crear,
   sino que le expliques PASO A PASO todo el proceso como está en el glosario.

6. **Contexto**: Si el usuario hace una pregunta de seguimiento, mantén el contexto de la conversación anterior.

7. **Cuándo derivar a soporte**: Primero intentá responder con lo que sabés del glosario (incluida la sección
   "¿Qué es Publicite?"). Derivá a soporte SOLO si es un caso puntual que no podés resolver con el glosario —por
   ejemplo, un problema con una cuenta, un pago, un error técnico o datos específicos del usuario—. En ese caso indicá:
   "Para esa consulta específica, te recomiendo contactar directamente al soporte de Publicite en: publicite@soonpublicite.com"

8. **Ejemplos prácticos**: Cuando sea posible, proporciona ejemplos concretos de uso.

9. **Enlaces múltiples**: Si una respuesta abarca varios temas, proporciona todos los enlaces relevantes.

10. **Longitud de respuesta**:
    - Para preguntas simples: respuestas concisas
    - Para preguntas sobre "cómo hacer" algo: respuestas detalladas con todos los pasos
    - Siempre prioriza la claridad sobre la brevedad

RECUERDA: Tu objetivo principal es que el usuario entienda cómo usar Publicite y tenga los enlaces directos que
necesita; pero si te consulta cualquier otra cosa, ayudalo igual con la misma calidad y amabilidad.${
        modeContext
          ? `\n\n═══════════════════════════════════════════════════════════════
ENFOQUE SOLICITADO PARA ESTA CONVERSACIÓN:
═══════════════════════════════════════════════════════════════
${modeContext}`
          : ''
      }`,
    });

    const recentHistory = conversationHistory.slice(-10);
    for (const message of recentHistory) {
      messages.push({
        role: message.getRole === MessageRole.USER ? 'user' : 'assistant',
        content: message.getContent,
      });
    }

    messages.push(
      imageUrls.length > 0
        ? {
            role: 'user',
            content: [
              { type: 'text', text: userMessage },
              ...imageUrls.map((url) => ({
                type: 'image_url' as const,
                image_url: { url, detail: 'low' as const },
              })),
            ],
          }
        : { role: 'user', content: userMessage },
    );

    return messages;
  }
}
