# **Documento de Requerimientos V2: Feature "Mis Producciones".**

Este documento ampliado detalla las especificaciones técnicas, funcionales y de interfaz visual para el desarrollo de la característica "Mis Producciones" (Desarrollo 3\) de Soonpublicite, integrando la reestructuración de la navegación y herramientas de gestión masiva .

## **1\. Arquitectura Conceptual y Reestructuración de Navegación.**

El sitio evoluciona de ser una "plataforma de anuncios" a un ecosistema contenedor de APPs . La arquitectura sigue el modelo: **SOON \> APPS \> SOLAPAS \> CONTENIDO** .

> * **Sistema de APPs y Paleta Cromática:** Cada App se identifica con un color único :  
  * Anuncios (A) \- Naranja   
  * Mis Producciones (MP) \- Magenta / Vino   
  * Publicite (P) \- Azul violáceo   
  * Promos (P) \- Verde lima   
  * Social (S) \- Celeste 


> * **El SuperButton ("Crear"):**   
>   Funciona de manera contextual . Al estar posicionado sobre una APP específica, permite crear entidades (anuncios, producciones, etc.) correspondientes a esa sección . 

> * **Uniformidad:** Las dinámicas de "Mis Producciones" replican la lógica, jerarquía y relación con usuarios registrados ya existente en el código de "Anuncios" .

## **2\. Layout Visual: El Panel de Control (Ex Cartel de Usuario).**

El "Cartel del Usuario" se re-conceptualiza como un Panel de Control estructurado en 10 capas visuales :

| \# Zona | Componente Visual | Descripción   |
| :---- | :---- | :---- |
| 1 | Header | Navegación principal: Explorar, Cubito, Buscar, Crear, Avatar. |
| 2 | Credencial \+ Board | Foto, rol, ubicación y el Número único de credencial, compartir QR (ID a la credencial expuesto). |
| 3 | Pizarra | Espacio para notas rápidas del usuario . |
| 4 | Espacio Libre | Reservado para notas sueltas (desarrollo aparte). |
| 5 | CONTROL del Blog | Acceso a la "Page del ticket", gestión de visibilidad y módulo de Fans . |
| 6 | CONTROL SeudoBase | Acceso a la base de datos tipo Excel para edición masiva. (REVISAR) |
| 7 | CONTROL Consumo | Monitoreo de Tokens y Almacenamiento (MB) . |
| 8 | Zona de APPs | Botonera (A \- MP \- P \- P \- S) que el usuario puede ocultar o visualizar . |
| 9 | Solapas | Categorías que cambian dinámicamente según la APP activa . |
| 10 | Contenido | Grilla de exhibición de archivos y producciones . |

## **3\. Anatomía del Blog y Representación de Archivos.**

El Blog es el núcleo de Mis Producciones. Su estructura visible para el visitante incluye:

> * **Header del Blog:** Foto, URL autogenerada, botón de compartir y texto/video de bienvenida .  
> * **Estantería (Board de Links):** Espacio que el propietario puede habilitar para mostrar recursos externos, organizados en filas scrolleables por categoría (Pelis, Libros, Sitios web, Youtube, Games, Places) .  
> * **Muestrario:** Funciona como "la cara de la expo". Es una selección destacada de los archivos de un contenedor.

### **Librerías Visuales y Tipos de Archivo.**

> * **Fotos (Postcards):** Tienen un formato de postal de dos caras . El frente muestra la imagen; el dorso expone coordenadas, información de autoría, dedicatoria, y un campo de descripción guiado ("¿Qué sentiste este día?") .  
> * **Videos:** Se representan visualmente en la interfaz como rectángulos .  
> * **Escritos/Textos:** Se representan visualmente como hojas de papel .  
> * **Audio**

Cada archivo deberá tener un ID estilo fileName, que el usuario puede setear.

## **4\. Lógica de Restricción: Visibilidad y Tickets.**

El sistema permite 12 combinaciones posibles de acceso basadas en una matriz de dos condiciones principales que decantan en solapas distintas en el Explorar:

> 1. **Primera Condición (Alcance):**  
>    Público (Todo Usuario Registrado \- UR) o   
>    restringido por la Agenda de Contactos (AGC) en tres grados: Contactos, Amigos o Top Amigos .  
> 2. **Segunda Condición (Cobro):**  
>    Acceso libre sin ticket, libre con ticket gratuito (para conteo de visitas), o acceso privado con ticket pago.  
> 3. Se puede asignar un ticket general a una carpeta padre completa, o tickets específicos a subcarpetas o archivos individuales (navegación híbrida).  
> 4. Los pagos de tickets realizados por los visitantes no tienen devoluciones.  
> 5. El 10% de la venta del ticket es para Soonpublicité.  
> 6. Al comprar el ticket, se podria tener que informar que cuenta con xxx numero de archivos.

**Page de Ticket y Toggle Button:**   
Toda la configuración se maneja desde la "Page de Ticket".   
El usuario puede aplicar modelos "Híbridos" y utilizar un "Toggle Button" (círculo naranja en la interfaz) para alternar rápidamente el contenido de toda una carpeta entera entre "Pago" o "Gratuito" .   
Todo ticket debe tener una duración configurada (mínimo 24 hs o hasta el cierre del blog) . ✅  
Si un usuario compra un ticket, se le tiene que advertir que no tiene devolución.

| Tipo de Plan | Capacidad de Uso del Blog | Monetización (Cobro de Tickets)   |
| :---- | :---- | :---- |
| Plan Gratuito  | Permite crear y usar el Blog con un límite de almacenamiento (ej. 1000 fotos o un límite en MB) . | No permite realizar cobros. Los tickets de acceso deben ser gratuitos . |
| Plan Pago  | Libera los límites de capacidad y aumenta el almacenamiento disponible . | Habilita la opción de cobrar por el acceso mediante Tickets Pagos . |

**Métodos de pago y confirmación de pago**

- El pago de los tickets se hará a través de una transferencia bancaria a la cuenta de Soonpublicité. El admin de Soonpublicité verificará el cobro y enviará el monto correspondiente al usuario creador del blog, descontando el 10% de la venta.   
- El administrador de Soonpublicité o el usuario creador del blog podrán darle acceso al usuario que compró el ticket luego de haber confirmado la operación bancaria.

## **5\. Herramientas de Soporte y Gestión Masiva.**

> * **SeudoBase (Gestión Masiva):**   
>   Se trata de un listado tipo tabla de Excel accesible desde el Panel de Control . Muestra las columnas (Foto, Nº, Título, Precio, etc.) permitiendo aplicar filtros, buscar información y realizar cambios destructivos masivos (ej. aumentar el precio de todas las selecciones un 5% o eliminar todo). El sistema requiere una alerta obligatoria de confirmación antes de aplicar los cambios. (REVISAR)  
> * **Control de Consumo:**   
>   Los planes gratuitos tienen límite de archivos (ej. 1000 fotos) o MB. Si el usuario excede la cuota al subir un archivo, se detiene la acción y aparece un Pop-Up incitando a la compra de packs o mejora del plan .

## **6\. Interacciones adicionales.**

> * **Sistema de Fans:**   
>   Los visitantes pueden convertirse en "Fans" de un blog, lo que los agrega a un listado visible tanto en el cartel del usuario propietario como en las solapas de la app .

> * **Reseñas y Comentarios:** Una vez que un visitante accede mediante un ticket, tiene la posibilidad de dejar una reseña, calificación o comentario sobre la producción . Si el ticket es pago, tiene que dejar una reseña obligatoriamente.

## **7\. Módulos Transversales y Futuros Desarrollos.**

*Nota: Los siguientes elementos forman parte del ecosistema pero están planeados como integraciones transversales para un desarrollo posterior. No bloquean la arquitectura inicial de Mis Producciones.*

> * **Sistema de Pagos y Contabilidad (Sooncoin y ARCA):**   
>   A futuro, la plataforma evolucionará para que las transacciones se manejen mediante un token interno (Sooncoin), integrando la facturación automática mediante ARCA y pasarelas internacionales para cobros al exterior . Se mantiene la base actual (ej. MercadoPago) de manera provisional .

> 

> * **Sistema de Denuncias:**   
>   Ante la subida de contenido de usuario (UGC), se implementará un flujo provisional de Denuncia \> Revisión \> Bloqueo, donde la acumulación de denuncias ocultará automáticamente el archivo .

## **Estimación General**

| \# | Funcionalidad | Horas | Presupuesto |
| :---- | :---- | :---- | :---- |
| 1 | Reestructuración de Navegación | 2 h | 30 USD |
| 2 | Panel de Control | 10 h | 150 USD |
| 3 | Blog \- Mis Producciones ( creación y edición) | 20 h | 300 USD |
| 4 | Visibilidad y tickets (**Alcance)** \- Mis Producciones | 2 h | 30 USD |
| 5 | Visibilidad y tickets (**Cobro)** \- Mis Producciones | 15 h | 225 USD |
| 6 | Herramientas de Soporte y Gestión Masiva (Seudobase) | 10 h | 150 USD |
| 7 | Sistema de Fans | 2 h | 30 USD |
| 8 | Reseñas y comentarios | 2 h | 30 USD |
| 9 | Sistema de denuncias | 2 h | 30 USD |
|  | Subtotal estimado | 65 h | 975 USD |

Descuento por cliente frecuente: \- 100 USD

**Total: 65 h — 875 USD**

