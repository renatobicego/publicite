import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatbotAIServiceInterface } from './chatbot.ai.service.interface';
import { ChatMessage } from '../entity/chat.message.entity';
import { MessageRole } from '../entity/enum/message.role.enum';

@Injectable()
export class ChatbotAIService implements ChatbotAIServiceInterface {
  private openai: OpenAI;
  private readonly GLOSSARY = `
Glosario funcional de Publicite

Aquí podrás encontrar algunos conceptos y términos que usaremos en el sitio para que te acompañen y descubras funcionalidades mientras lo navegas. Para empezar, debes tener en cuenta una cuestión principal del funcionamiento del sitio.

═══════════════════════════════════════════════════════════════
📋 ÍNDICE DE CONTENIDOS
═══════════════════════════════════════════════════════════════

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

═══════════════════════════════════════════════════════════════

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

### 🔍 Explorar:

• **Anuncios**: https://soonpublicite.com/anuncios
• **Anuncios de Contactos**: https://soonpublicite.com/anuncios/contactos
• **Anuncios Recientes**: https://soonpublicite.com/anuncios/recientes
• **Perfiles**: https://soonpublicite.com/perfiles
• **Grupos**: https://soonpublicite.com/grupos
• **Pizarras**: https://soonpublicite.com/pizarras

### ⚙️ Configuración:

• **Tu Perfil/Configuración**: https://soonpublicite.com/configuracion
• **Suscripciones**: https://soonpublicite.com/suscripciones
• **Packs de Publicaciones**: https://soonpublicite.com/packs-publicaciones

### 👤 Cuenta:

• **Registrarse**: https://soonpublicite.com/registrarse
• **Iniciar Sesión**: https://soonpublicite.com/iniciar-sesion

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
  ): Promise<string> {
    try {
      // Construir el historial de mensajes para OpenAI
      const messages = this.buildOpenAIMessages(conversationHistory, userMessage);

      // Llamar a la API de OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      });

      const response = completion.choices[0]?.message?.content || 
        'Lo siento, no pude generar una respuesta en este momento.';

      return response;
    } catch (error: any) {
      console.error('Error calling OpenAI API:', error);
      throw new Error(`Error generating AI response: ${error.message}`);
    }
  }

  private buildOpenAIMessages(
    conversationHistory: ChatMessage[],
    userMessage: string,
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    // Mensaje del sistema con el glosario
    messages.push({
      role: 'system',
      content: `Eres un asistente virtual de Publicite, una plataforma de publicación y gestión de anuncios. 
Tu objetivo es ayudar a los usuarios a entender cómo funciona la plataforma y guiarlos paso a paso.

IMPORTANTE: Solo debes responder preguntas relacionadas con la información del siguiente glosario. 
Si te hacen una pregunta que no está relacionada con Publicite o el glosario, debes indicar amablemente 
que solo puedes ayudar con preguntas sobre el funcionamiento de Publicite.

GLOSARIO DE PUBLICITE:
${this.GLOSSARY}

═══════════════════════════════════════════════════════════════
INSTRUCCIONES PARA RESPONDER:
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

7. **Información no disponible**: Si la información no está en el glosario, indica amablemente:
   "Para esa consulta específica, te recomiendo contactar directamente al soporte de Publicite en: publicite@soonpublicite.com"

8. **Ejemplos prácticos**: Cuando sea posible, proporciona ejemplos concretos de uso.

9. **Enlaces múltiples**: Si una respuesta abarca varios temas, proporciona todos los enlaces relevantes.

10. **Longitud de respuesta**: 
    - Para preguntas simples: respuestas concisas
    - Para preguntas sobre "cómo hacer" algo: respuestas detalladas con todos los pasos
    - Siempre prioriza la claridad sobre la brevedad

RECUERDA: Tu objetivo es que el usuario entienda perfectamente cómo usar Publicite y tenga enlaces 
directos para acceder a las funcionalidades que necesita.`,
    });

    // Agregar historial de conversación (últimos 10 mensajes para mantener contexto)
    const recentHistory = conversationHistory.slice(-10);
    for (const message of recentHistory) {
      messages.push({
        role: message.getRole === MessageRole.USER ? 'user' : 'assistant',
        content: message.getContent,
      });
    }

    // Agregar el mensaje actual del usuario
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }
}

