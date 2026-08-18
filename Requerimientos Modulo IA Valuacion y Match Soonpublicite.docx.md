# **Desarrollo 2.4.2 \- Valuación IA y Match IA**

# **Hoja de Requerimientos**

## **1\. Valuación IA**

### **Historia de Usuario**

Como usuario de Soonpublicité quiero poder enviar fotografías y una descripción de un bien o servicio para que la IA realice una valuación estructurada y me devuelva un análisis descriptivo y fotográfico, permitiéndome conocer el estado, calidad y una valoración objetiva antes de publicar el anuncio o utilizar esa información dentro de la plataforma.

### **1.1 Descripción del Flujo**

La funcionalidad de Valuación IA estará disponible desde una nueva sección dentro del asistente IA ('Cubito') y también desde la pantalla de creación/edición de anuncios.

El usuario podrá subir una o varias imágenes junto con una descripción libre. La IA iniciará una conversación para completar un Brief estructurado y generará dos resultados independientes:

• Análisis Fotográfico  
• Análisis Descriptivo

La precisión del resultado dependerá de la información proporcionada por el usuario. Los resultados podrán guardarse, descartarse o asociarse posteriormente al anuncio.

Al abrir Cubito o seleccionar el botón "Valuación IA", Cubito saluda y guía al usuario: "¡Hola\! ¡Comencemos\! ¿qué querés valuar?", presentando un selector de categoría (Imagen / Objeto / Servicio / Bien / Otro) antes de iniciar el Brief.

El resultado de la Valuación IA es un Sticker de formato fijo e inmodificable, igual para todas las valuaciones, de manera que los resultados puedan compararse entre sí. El sticker releva la mayor cantidad posible de características.

### **Flujo de Pantalla**

La interfaz estará compuesta por cuatro áreas:

• Panel izquierdo: referencias (imágenes, videos, información y anuncios).  
• Panel central: tablero principal donde la IA genera análisis y resultados.  
• Panel derecho: tablero de resultados para guardar, descargar, compartir, publicar o restaurar resultados.  
• Chat inferior: conversación con Cubito.

### **Sistema de Capas de Valuación**

La Valuación IA se organiza en 3 capas según el porcentaje de información completada por el usuario. A mayor información brindada, mayor profundidad y confianza tiene el resultado.

| Capa | Cobertura | Confianza | Descripción |
| :---- | :---- | :---- | :---- |
| Capa 1 – Inicial | 0% – 33% | Baja | Solo una foto o información limitada. |
| Capa 2 – Intermedia | 34% – 66% | Media | Más fotos e información básica. |
| Capa 3 – Completa | 67% – 100% | Alta | Análisis fotográfico y descriptivo completo. |

Cubito siempre ofrece la opción de omitir una pregunta del Brief; el usuario puede decidir omitir pasos, pero esto reduce la capa de valuación alcanzada.

### **Círculo de Valoración**

El resultado se representa gráficamente mediante un círculo de valoración (gráfico de radar), donde cada eje corresponde a un ítem calificado de 1 a 5 estrellas. Los ejes se agrupan en dos lados:

* Análisis Fotográfico: Estado, Marca, Mercado, Rareza.  
* Análisis Descriptivo: Uso, Vida útil, Mantenimiento, Documentación.

Los puntos de cada eje se conectan formando una figura. La puntuación final es el promedio de todos los ítems fotográficos y descriptivos.

### **Devoluciones de la IA**

La IA entrega dos devoluciones independientes, cada una con su propio puntaje en estrellas:

* Devolución Fotográfica: descripción de lo observado, identificación de marca/modelo cuando sea posible, estado visual y detalles relevantes, componentes y posibles daños o desgastes.  
* Devolución Descriptiva: resumen de las respuestas del usuario (uso, mantenimiento, documentación, historial) y el nivel de confianza de la información brindada.

### **Fuentes de Información**

Cada dato incorporado al informe queda etiquetado según su origen, para transparentar cómo se construyó el resultado:

* Fotográfica: información obtenida directamente de las imágenes.  
* Descriptiva: información proporcionada por el usuario (respuestas y descripción).  
* Inferencia IA: información estimada o calculada por la inteligencia artificial.

### **Consideraciones Funcionales**

* Los resultados podrán evolucionar en distintas etapas hasta ser aceptados.  
* Los resultados aceptados pasarán al tablero derecho.  
* La página del anuncio deberá incorporar un espacio para poder generar una Valuación IA.

* El usuario podrá subir el sticker de valuación a un anuncio existente o crear un anuncio nuevo por defecto.  
* Desde el panel derecho, el usuario podrá subir, descargar, sumar a la página del anuncio y compartir el resultado.

### **1.2 Criterios de Aceptación — Valuación IA**

| ID | Dado que... | Cuando... | Entonces... |
| :---- | :---- | :---- | :---- |
| AC01 | un usuario accede al módulo IA | selecciona Valuación IA | Cubito inicia el flujo de valuación. |
| AC02 | el usuario sube imágenes | envía la información | la IA realiza el análisis fotográfico y descriptivo. |
| AC03 | el usuario completa el Brief | confirma la información | la IA devuelve la valuación. |
| AC04 | existen resultados | el usuario guarda uno | el resultado pasa al tablero derecho. |
| AC05 | un resultado fue guardado | el usuario desea seguir editándolo | puede devolverlo al tablero central. |
| AC06 | hay resultados | el usuario los elimina | el sistema lo elimina |
| AC07 | la valuación fue aceptada | finaliza el flujo | queda asociada al anuncio. |
| AC08 | el usuario completa parcialmente el Brief | omite algunos puntos | la valuación se genera en una capa menor (Inicial o Intermedia) con menor confianza. |
| AC09 | se genera un resultado | se calculan los ítems fotográficos y descriptivos | el sistema muestra el Círculo de Valoración con la puntuación final promedio. |
| AC10 | la valuación fue generada | el usuario la revisa | el sistema muestra los valores estimados (Liquidación, Mercado, Premium) y el % de Confianza IA. |

## **2\. Match IA**

### **Historia de Usuario**

Como usuario de Soonpublicité quiero enviar un anuncio, un enlace, imágenes o una descripción para que la IA encuentre publicaciones similares dentro de la plataforma y me proponga coincidencias relevantes.

### **2.1 Descripción del Flujo**

El usuario podrá enviar:

• Un anuncio  
• Una descripción  
• Imágenes  
• Una necesidad  
• Un producto  
• Un servicio

La IA realizará un análisis semántico y visual para encontrar anuncios similares dentro de Soonpublicité. Los resultados se mostrarán ordenados por relevancia y podrán guardarse o descartarse.

### **2.2 Criterios de Aceptación — Match IA**

| ID | Dado que... | Cuando... | Entonces... |
| :---- | :---- | :---- | :---- |
| AC01 | un usuario accede al módulo IA | selecciona Generar Match | Cubito cambia al modo Match. |
| AC02 | el usuario envía un anuncio | solicita coincidencias | la IA busca anuncios similares. |
| AC03 | el usuario envía una descripción | solicita un Match | la IA utiliza búsqueda semántica. |
| AC04 | el usuario envía imágenes | solicita un Match | la IA utiliza análisis visual. |
| AC05 | existen resultados | el usuario selecciona uno | puede abrir el anuncio correspondiente. |
| AC06 | hay resultados | el usuario los guarda | quedan almacenados en el tablero derecho. |

## **3\. Tablero de Trabajo**

### **Descripción General**

El Tablero de Trabajo es el espacio de trabajo compartido por los módulos de Valuación IA y Match IA, ubicado en el panel central de la pantalla. Permite al usuario preparar la información de entrada, interactuar con Cubito y gestionar los resultados generados por la IA.

### **Estructura del Tablero**

* El tablero de trabajo ocupa el espacio central de la pantalla.  
* Cubito se posiciona por encima del tablero y puede aconsejar al usuario durante el proceso.  
* Debajo del tablero, el usuario cuenta con un espacio de texto para escribir.  
* Junto al espacio de texto se ubican botones que activan formatos predefinidos (por ejemplo, "Valuación IA"), correspondientes a prompts configurados en el backend o a prompts libres escritos por el usuario.

### **Panel Izquierdo y Panel Derecho**

* Panel izquierdo (Preparación): reúne las referencias con las que se trabajará en el tablero (imágenes, videos, información y anuncios).  
* Panel derecho (Resultado): contiene el resultado descargable, compartible y editable; el resultado puede volver al tablero central para continuar su edición.

### **Pallet de Edición de Imágenes**

El panel de trabajo incluye un pallet de edición de imágenes: una barra de herramientas simples (lápiz, color, recorte, entre otras) que permite al usuario editar la imagen subida. Al aplicar una edición, la imagen resultante puede volver a ser procesada por la IA.

### **Integración con Anuncios**

Los resultados generados en el tablero podrán subirse o asociarse a anuncios, ya sea creando un anuncio nuevo o incorporándose como sumatoria/actualización de un anuncio existente.

### **3.1 Criterios de Aceptación — Tablero de Trabajo**

| ID | Dado que... | Cuando... | Entonces... |
| :---- | :---- | :---- | :---- |
| AC01 | el usuario ingresa al asistente IA | accede al Tablero de Trabajo | el sistema muestra el panel izquierdo, el tablero central y el panel derecho. |
| AC02 | el usuario selecciona un formato (botón de prompt) | inicia la conversación con Cubito | Cubito guía al usuario según el prompt seleccionado. |
| AC03 | el usuario agrega referencias en el panel izquierdo | continúa trabajando en el tablero central | las referencias quedan disponibles para su uso durante la sesión. |
| AC04 | existe un resultado en el panel derecho | el usuario decide editarlo | el resultado vuelve al tablero central para su edición. |
| AC05 | existe un resultado en el panel derecho | el usuario lo asocia a un anuncio | el resultado se sube como anuncio nuevo o se suma a uno existente. |
| AC06 | el usuario elimina un resultado | el sistema aplica soft delete | el resultado no se elimina por completo y no se descartan los tokens ya utilizados. |
| AC07 | el usuario edita una imagen con el pallet | guarda los cambios | la IA reprocesa la imagen editada y actualiza el resultado correspondiente. |

## **4\. Modos y Entrenamientos de Cubito**

### **4.1 Modos de Entrenamiento en el Chat**

Cubito es siempre la misma IA (no hay agentes distintos); lo que cambia según el modo elegido es el archivo de contexto que se le pasa por detrás. El usuario podrá activar un modo o especialidad determinada mediante un botón, select o checklist, para orientar las respuestas de Cubito según el tipo de análisis requerido, por ejemplo:

* Diseñador Gráfico  
* Marketing  
* Especialista en Negocios  
* Cliente B2B

Además, el usuario podrá enviar un prompt libre a Cubito para indicarle un rol o enfoque particular (por ejemplo: "Analizá esta imagen como si fueras un diseñador especialista en marketing digital"); en este caso el prompt libre se suma como contexto adicional para esa consulta, sin cambiar de IA ni crear un agente nuevo.

### **4.2 Consumo de Tokens**

La interfaz mostrará un ícono con la cantidad de tokens utilizados, permitiendo al usuario tener noción del consumo por cada consulta realizada a la IA.

### **4.3 Criterios de Aceptación — Modos y Entrenamientos**

| ID | Dado que... | Cuando... | Entonces... |
| :---- | :---- | :---- | :---- |
| AC01 | el usuario está en el chat con Cubito | selecciona un modo/especialidad | Cubito ajusta sus respuestas según la especialidad elegida. |
| AC02 | el usuario envía un prompt libre de rol | Cubito lo recibe | Cubito responde adoptando el rol indicado. |
| AC03 | el usuario accede a la página del anuncio | activa el modo Entrenamiento Publicitario | el sistema aplica el Prompt Fijo correspondiente. |
| AC04 | el modo Entrenamiento Publicitario está activo | el usuario escribe un Prompt Sugerido | el sistema suma el Prompt Sugerido al Prompt Fijo antes de enviarlo a la IA. |
| AC05 | el usuario realiza una consulta a la IA | se procesa la consulta | el sistema muestra la cantidad de tokens utilizados. |

## **5\. Requerimientos Adicionales**

* Historial de valuaciones y versiones (fotos, respuestas y resultados anteriores).  
* Notificaciones y recordatorios para completar información pendiente de una valuación.  
* Exportación o compartición del informe de valuación.  
* Panel estadístico para seguimiento de precisión y mejoras del sistema.

## **Consideraciones Técnicas**

• Ambos módulos reutilizan la interfaz del asistente IA (Cubito).  
• El chat mantiene el contexto de la conversación durante toda la sesión.  
• Los resultados son iterativos y pueden evolucionar en distintas etapas antes de ser aceptados.

## **Estimación General**

| \# | Funcionalidad | Horas | Presupuesto |
| :---- | :---- | :---- | :---- |
| 1 | Valuación IA | 25 h | 375 USD |
| 2 | Match IA | 10 h | 150 USD |
| 3 | Tablero de Trabajo | 10 h | 150 USD |
|  | Subtotal estimado | 45 h | 675 USD |

Descuento por cliente frecuente: \- 75 USD

**Total: 40 h — 600 USD**