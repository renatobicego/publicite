## Documentacion importante para entender la arquitectura



## Diferencia entre la Lógica de Aplicación y la Lógica de Negocio en la Arquitectura Hexagonal

En la arquitectura hexagonal, también conocida como arquitectura de puertos y adaptadores, se realiza una separación clara entre la lógica de la aplicación y la lógica del negocio. Aquí te explico las diferencias:

### Lógica de Negocio (Business Logic)
- **Definición:** La lógica de negocio se encarga de las reglas, procesos y políticas que definen cómo se deben manejar los datos dentro del dominio de la aplicación. Es la parte que contiene el conocimiento específico del dominio y las reglas de negocio que determinan cómo deben funcionar las operaciones.
- **Responsabilidad:** Incluye la implementación de las reglas del negocio, las validaciones y los cálculos necesarios para cumplir con los requisitos del dominio.
- **Ejemplo:** En una aplicación de comercio electrónico, la lógica de negocio podría gestionar la aplicación de descuentos, la validación de métodos de pago, o la gestión del inventario.

### Lógica de Aplicación (Application Logic)
- **Definición:** La lógica de aplicación se encarga de coordinar la interacción entre la lógica de negocio y los componentes externos, como interfaces de usuario, bases de datos, o servicios externos. No contiene reglas de negocio en sí, sino que orquesta cómo se deben ejecutar las operaciones según las reglas del negocio.
- **Responsabilidad:** Gestiona los casos de uso de la aplicación, maneja las peticiones y respuestas, y asegura que la lógica de negocio se ejecute correctamente en el contexto de la aplicación.
- **Ejemplo:** En una aplicación de comercio electrónico, la lógica de aplicación podría coordinar el proceso de realizar un pedido, llamando a la lógica de negocio para aplicar descuentos y gestionar el inventario, y luego interactuar con la base de datos para almacenar la información del pedido.

### En la Arquitectura Hexagonal
- **Lógica de Negocio:** Se encuentra en el núcleo del sistema, aislada de las preocupaciones externas. Esto permite que la lógica de negocio esté desacoplada de la infraestructura, facilitando su mantenimiento y prueba.
- **Lógica de Aplicación:** Se encuentra en el lado de los adaptadores, manejando la comunicación entre el núcleo de la aplicación y el exterior. Permite que los casos de uso específicos se ejecuten, y coordina cómo interactúa la lógica de negocio con los componentes externos.

Esta separación asegura que el núcleo de la aplicación pueda evolucionar y adaptarse a cambios sin verse afectado por las variaciones en las interfaces de usuario, las bases de datos, o cualquier otro componente externo.



1. **Controlador (Controller)**: El controlador se encuentra en la capa de infraestructura y es el punto de entrada para las solicitudes externas, como las peticiones HTTP. Su función principal es recibir las solicitudes, validarlas, y luego delegar la lógica al servicio correspondiente.

2. **Adaptador (Adapter)**: El controlador no interactúa directamente con el servicio de la capa de aplicación. En su lugar, utiliza un adaptador si es necesario. El adaptador es responsable de convertir los datos de entrada (por ejemplo, una petición HTTP) en un formato que el servicio pueda procesar. También puede encargarse de convertir la respuesta del servicio en un formato adecuado para la capa de infraestructura (como una respuesta HTTP).

3. **Servicio (Service)**: El servicio se encuentra en la capa de aplicación y contiene la lógica de negocio o de aplicación que implementa los casos de uso. El adaptador llama al servicio para ejecutar la lógica necesaria. 

En resumen:

- **Controlador** → **Adaptador** → **Servicio (Application Layer)**

Este flujo garantiza que cada capa cumpla con su responsabilidad específica y mantiene el código organizado y desacoplado. Así, la lógica de negocio se mantiene independiente de los detalles de la infraestructura (como las tecnologías de comunicación o las bases de datos), facilitando su testeo y mantenimiento.