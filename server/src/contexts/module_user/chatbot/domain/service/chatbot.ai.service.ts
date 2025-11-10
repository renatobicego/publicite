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

Puedes usarlo de dos maneras:

Utiliza el sitio como usuario invitado. (Usuario Guest o Invitado.)

Utiliza el sitio como usuario registrado. (Usuarios registrados.)

La utilización del sitio como usuario registrado, te permitirá publicar y tendrás accesibilidad a funciones totales. Al adquirir planes y ampliaciones obtendrás un uso aún más extenso para publicar.

Registrarse:

Regístrate como empresa o persona.

Inicio de sesión:

Inicia sesión una vez registrado.

Cartel de usuario:

Configura la visibilidad de la información personal de tu Cartel.

Configura tu cuenta.

Desde tu cartel de usuario podrás acceder a un abanico de funcionalidades.

Publicar:

Anuncios: Puedes publicar anuncios de oferta (bienes y servicios) o de necesidad.

Anuncios Libres: están determinados por una localización y rango de alcance. ¡Todos aquellos usuarios que coincidan con estos factores podrán ver tus anuncios, configúralos!

Anuncios de agenda: están relacionados únicamente a tu agenda de contactos. ¡Quiere decir que este tipo de anuncio será únicamente para tus contactos, configúralos!

Revistas: Podrás crear revistas, propias o compartidas, y desde las mismas, secciones. ¡Envía todo tipo de anuncios para crear tus revistas y secciones!

Grupos: Podrás crear grupos y asignar colaboradores. ¡Invita o permite miembros nuevos! ¡Se parte de nuevos grupos!

Ten en cuenta que:

Al momento de publicar, podrás configurar quienes de tus contactos de agenda podrán visualizar los anuncios. Hay tres tipos de relaciones. Contacto – Amigo – TopAmigo. Es necesario la activación a tu cuenta por parte de otros usuarios para que dichos anuncios sean vistos. Es decir, además de ser tu contacto en agenda, ha de activar tu contacto, para que así, tu anuncio sea visto.

Si configuras para Contacto, tanto tus relaciones de Contacto, tus Amigos y TopAmigos verán tu anuncio;

Si configuras para Amigo, tus relaciones de Contacto ya no verán dicho anuncio, pero si tus Amigos y TopAmigos,

y finalmente si configuras para TopAmigos, solo este tipo de relación vera el anuncio determinado.

Para los anuncios libres, dependerá el rango de alcance y localización del anuncio. Esto determina quienes verán tus anuncios libres. Recuerda que puedes configurar dicha localización. Además, al buscar, se otorga el poder de alterar la ubicación a voluntad.

Agenda de contactos:

Busca, encuentra y crea relaciones mutuas con otros contactos.

Puedes sumar cuantas relaciones quieras a tu agenda de contactos.

Activa los contactos de tu agenda para poder visualizar sus anuncios.

Pizarra:

Escribe un mensaje! Según la configuración de visibilidad que determines, dichos usuarios podrán ver tu pizarra.

Explorar:

¡En esta sección es donde sucede la acción! Puedes elegir las solapas en las que quieres buscar anuncios. Lo importante aquí es que distingamos dos clases de solapas principales:

Solapa de anuncios libres

Solapa de anuncios de agenda

En la solapa de anuncios libres encontrarás todos los anuncios libres que los usuarios publiquen según localización. Puedes configurar la ubicación de manera sencilla. Es decir, el alcance y localización del anuncio puede variar, pero puedes ajustar la ubicación. Si esto coincide o se integran entonces lo visualizaras. En la solapa de anuncios de agenda encontraras los anuncios de tus contactos de agenda. Esto significa que, según como tu usuario-contacto, con relación establecida, configure la visibilidad del anuncio, lo encontraras en esta solapa. Ya sabes, debes activar los contactos que quieras visualizar. Además, tienes las solapas de Pizarra, Carteles de Usuario y Grupos, en las cuales, hay: pizarras configuradas según visibilidad permitida, perfiles de todos los usuarios y grupos creados por los usuarios.

Actividad del anuncio:

Los anuncios activos serán visibles en solapas según qué tipo de anuncio sea, por localización o por tu agenda de contactos. Un anuncio inactivo es un anuncio que ya no se está mostrando, es de resolver este anuncio como uno a volver a activar, quitarlo de la visibilidad para todos manteniéndolo en reserva, o simplemente puedes eliminarlo. Los anuncios vencidos son anuncios obsoletos, ya cumplieron con una fecha determinada. *No queremos que pierdas tus anuncios! Si tienes inconvenientes con los pagos los encontraras como inactivos.

Planes y ampliaciones.

Tienes planes para elegir y desde estos puedes crear ampliaciones dentro del plan. Conócelos y elige el tuyo!

¡Eso es todo! ¡Así de sencillo! Si tienes preguntas del funcionamiento del sitio, sugerencias o cualquier consulta, no dudes en comunicarte a: publicite@soonpublicite.com

¡Muchas gracias! ¡Bienvenido a Publicite!
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
Tu objetivo es ayudar a los usuarios a entender cómo funciona la plataforma.

IMPORTANTE: Solo debes responder preguntas relacionadas con la información del siguiente glosario. 
Si te hacen una pregunta que no está relacionada con Publicite o el glosario, debes indicar amablemente 
que solo puedes ayudar con preguntas sobre el funcionamiento de Publicite.

GLOSARIO DE PUBLICITE:
${this.GLOSSARY}

Instrucciones:
- Sé amable y profesional
- Responde de manera clara y concisa
- Si la información no está en el glosario, indica que pueden contactar a: publicite@soonpublicite.com
- Mantén el contexto de la conversación
- Usa emojis ocasionalmente para hacer las respuestas más amigables`,
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

