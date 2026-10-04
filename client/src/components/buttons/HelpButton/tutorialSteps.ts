export const homePageSteps = [
  {
    target: "#navbar",
    content:
      "Este es el menú de navegación, puedes navegar por las diferentes secciones de la app.",
    skipBeacon: true,
  },
  {
    target: "#search",
    content:
      "Usaremos esta barra de busqueda para buscar anuncios y contenidos.",
    skipBeacon: true,
  },
  {
    target: "#solapas-button",
    content:
      "Aquí podrás seleccionar las opciones de búsqueda, a las que llamamos Solapas.",
    skipBeacon: true,
  },
  {
    target: "#user-options",
    content:
      "Aquí podrás ver tus notificaciones, gestionar tu perfil y administrar tus suscripciones.",
    skipBeacon: true,
  },
  {
    target: "body",
    content:
      "Aquí podrás ver algunos anuncios recomendados cerca tuyo. Podrás ver anuncios de tipo Bien, Servicio y Necesidad. Es importante que podamos acceder a tu ubicación para mostrarte anuncios, por lo que puedes darnos permisos de ubicación o seleccionar la ubicación manualmente.",
    skipBeacon: true,
  },
];

export const explorePostsSteps = [
  {
    target: "body",
    content:
      "Aquí podrás encontrar anuncios de tipo Bien, Servicio y Necesidad, y filtrarlos según tu necesidad. Es importante que sepas que en la solapa Recomendados te aparecerán anuncios de tipo Libre (consultar glosario).",
    skipBeacon: true,
  },
  {
    target: "#select-post-type",
    content: "Aquí podrás filtrar por Bien, Servicio y Necesidad.",
    skipBeacon: true,
  },
  {
    target: "#manual-location-button",
    content: "Aquí podrás seleccionar tu ubicación manualmente.",
    skipBeacon: true,
  },
  {
    target: "#post-list-header",
    content:
      "Aquí podrás refinar tu búsqueda aun más; filtrando, ordenando y agregando fases de búsqueda a los resultados obtenidos de la búsqueda general.",
  },
];

export const exploreAgendaPostsSteps = [
  {
    target: "body",
    content:
      "Aquí podrás encontrar anuncios de tipo Bien, Servicio y Necesidad, y filtrarlos según tu necesidad. Es importante que sepas que en la solapa Agenda de Contactos te aparecerán anuncios de tipo Agenda (consultar glosario).",
    skipBeacon: true,
  },
  {
    target: "#select-post-type",
    content: "Aquí podrás filtrar por Bien, Servicio y Necesidad.",
    skipBeacon: true,
  },
  {
    target: "#manual-location-button",
    content: "Aquí podrás seleccionar tu ubicación manualmente.",
    skipBeacon: true,
  },
  {
    target: "#post-list-header",
    content:
      "Aquí podrás refinar tu búsqueda aun más; filtrando, ordenando y agregando fases de búsqueda a los resultados obtenidos de la búsqueda general.",
  },
];

export const exploreBoardsSteps = [
  {
    target: "body",
    content:
      "Aquí podrás encontrar pizarras, que son lugares donde los usuarios pueden compartir anotaciones.",
    skipBeacon: true,
  },
];

export const exploreProfilesSteps = [
  {
    target: "body",
    content: "Aquí podrás encontrar perfiles de usuarios registrados.",
    skipBeacon: true,
  },
];

export const exploreGroupsSteps = [
  {
    target: "body",
    content:
      "Aquí podrás encontrar grupos, donde podrás compartir anuncios y participar en revistas de grupo.",
    skipBeacon: true,
  },
];

export const createSteps = [
  {
    target: "body",
    content:
      "Aquí podrás seleccionar para poder crear anuncios, necesidades, grupos o revistas.",
    skipBeacon: true,
  },
];

export const createPostSteps = [
  {
    target: "#create-post",
    content: "Aquí podrás crear anuncios de tipo bienes o servicios.",
    skipBeacon: true,
  },
  {
    target: "#post-behaviour",
    content:
      "Debes seleccionar si el anuncio es de tipo Libre o Agenda (ver glosario para una explicación detallada).",
    skipBeacon: true,
  },
  {
    target: "#create-post-form",
    content:
      "Aquí tendrás que completar los datos del anuncio. Los campos que tienen * son obligatorios.",
    skipBeacon: true,
  },
];

export const createNeedPostSteps = [
  {
    target: "#create-need",
    content:
      "Aquí podrás crear anuncios de tipo necesidad, los cuales tienen como objetivo que encuentres personas que puedan ofrecerte el bien o servicio que buscas.",
    skipBeacon: true,
  },
  {
    target: "#create-need-form",
    content:
      "Aquí tendrás que completar los datos del anuncio de necesidad. Los campos que tienen * son obligatorios.",
    skipBeacon: true,
  },
];

export const createMagazineSteps = [
  {
    target: "#create-magazine",
    content:
      "Aquí podrás crear revistas, los cuales tienen como objetivo que guardes y organices anuncios.",
    skipBeacon: true,
  },
  {
    target: "#create-magazine-form",
    content:
      "Aquí tendrás que completar los datos de la revista. Los campos que tienen * son obligatorios.",
    skipBeacon: true,
  },
];

export const createGroupSteps = [
  {
    target: "#create-group",
    content:
      "Aquí podrás crear grupos, los cuales tienen como objetivo que compartir anuncios y participar en revistas de grupo.",
    skipBeacon: true,
  },
];

export const editPostSteps = [
  {
    target: "body",
    content: "Aquí podrás crear anuncios de tipo bienes o servicios.",
    skipBeacon: true,
  },
  {
    target: "#edit-post-form",
    content:
      "Aquí podrás editar los datos del anuncio. Los campos que tienen * son obligatorios.",
    skipBeacon: true,
  },
  {
    target: "#post-behaviour",
    content:
      "Aquí podrás editar el comportamiento del anuncio (ver glosario para una explicación detallada).",
    skipBeacon: true,
  },
];

export const editNeedPostSteps = [
  {
    target: "body",
    content:
      "Aquí podrás editar tu anuncio de tipo necesidad, los cuales tienen como objetivo que encuentres personas que puedan ofrecerte el bien o servicio que buscas.",
    skipBeacon: true,
  },
  {
    target: "#edit-need-form",
    content:
      "Aquí podrás editar los datos del anuncio de necesidad. Los campos que tienen * son obligatorios.",
    skipBeacon: true,
  },
];

export const editMagazineSteps = [
  {
    target: "body",
    content:
      "Aquí podrás editar tu revista, los cuales tienen como objetivo que guardes y organices anuncios.",
    skipBeacon: true,
  },
  {
    target: "#edit-magazine-form",
    content:
      "Aquí podrás editar los datos de la revista. Los campos que tienen * son obligatorios.",
    skipBeacon: true,
  },
];

export const editGroupSteps = [
  {
    target: "body",
    content:
      "Aquí podrás editar tu grupo, los cuales tienen como objetivo que compartir anuncios y participar en revistas de grupo.",
    skipBeacon: true,
  },
];

export const profileSteps = [
  {
    target: "body",
    content:
      "Aquí podrás ver un perfil de un usuario, de tipo persona o empresa.",
    skipBeacon: true,
  },
  {
    target: "#user-info-container",
    content:
      "Aquí podrás ver los datos del usuario, con opciones para interactuar y su pizarra.",
    skipBeacon: true,
  },
  {
    target: "#user-info",
    content:
      "Aquí podrás ver los datos del usuario e interactuar, como enviar solicitud de agenda de contacto y compartir su perfil.",
    skipBeacon: true,
  },
  {
    target: "#my-info",
    content:
      "Aquí podrás ver tus datos personales, con opciones para ver las peticiones de contacto (los usuarios que te han contactado por tus anuncios). Para editar tu perfil, puedes hacerlo en la sección de Configuración.",
    skipBeacon: true,
  },
  {
    target: "#board",
    content: "Aquí podrás ver la pizarra, donde hay anotaciones del usuario.",
    skipBeacon: true,
  },
  {
    target: "#user-tabs",
    content: "Aquí podrás seleccionar las distintas solapas del usuario.",
    skipBeacon: true,
  },
];

export const postSteps = [
  {
    target: "body",
    content: "Aquí podrás los detalles de un anuncio.",
    skipBeacon: true,
  },
  {
    target: "#post-data",
    content:
      "Aquí podrás ver los datos del anuncio. Podrás contactar al anunciante, compartir el anuncio o guardarlo en una revista. En caso de que tu hayas publicado el mismo anuncio, podrás editarlo.",
    skipBeacon: true,
  },
  {
    target: "#contact-button",
    content:
      "Aquí podrás contactar al anunciante por el anuncio, donde luego te contactará para lograr la venta o compra de manera externa a la plataforma Publicité.",
    skipBeacon: true,
  },
  {
    target: "#contact-petitions-button",
    content:
      "Aquí podrás ver las peticiones de contacto que has recibido por el anuncio. En caso de que completes una venta, luego de 3 días de realizada la petición de contacto, podrás solicitar una calificación al usuario que contactó (deberá estar registrado).",
  },
  {
    target: "#accordion-post-data",
    content: "Aquí podrás desplegar mas información del anuncio.",
    skipBeacon: true,
  },
  {
    target: "#post-comments",
    content:
      "Aquí podrás ver y dejar comentarios, donde el anunciante podrá responderte, y anuncios recomendados a partir del anuncio que estás visualizando.",
    skipBeacon: true,
  },
];

export const magazineSteps = [
  {
    target: "body",
    content: "Aquí podrás los detalles de una revista.",
    skipBeacon: true,
  },
  {
    target: "#magazine-data",
    content:
      "Aquí podrás ver los datos de la revista, donde podrás compartirla.",
    skipBeacon: true,
  },
  {
    target: "#grid-posts-magazines",
    content:
      "Aquí podrás ver los anuncios guardados en la revista por los colaboradores.",
    skipBeacon: true,
  },
  {
    target: "#sections",
    content:
      "Aquí podrás ver las secciones de la revista, que al tocarlas, desplegaran sus anuncios guardados dentro.",
    skipBeacon: true,
  },
];

export const groupSteps = [
  {
    target: "body",
    content:
      "Aquí podrás los detalles de un grupo, donde podrás unirte, compartir tus anuncios y crear revistas de grupo.",
    skipBeacon: true,
  },
  {
    target: "#group-info",
    content: "Aquí podrás ver los datos del grupo y las acciones disponibles.",
    skipBeacon: true,
  },
  {
    target: "#group-note",
    content:
      "Aquí podrás ver la nota del grupo, donde los administradores podrán anotar información relevante.",
    skipBeacon: true,
  },
  {
    target: "#group-actions",
    content:
      "Aquí podrás ver las acciones disponibles para el grupo, como unirse y compartirlo, o editarlo en caso de ser administrador.",
    skipBeacon: true,
  },
  {
    target: "#group-solapas",
    content:
      "Aquí podrás seleccionar las distintas solapas del grupo, donde podrás ver los anuncios de miembros del grupo y las revistas de grupo.",
    skipBeacon: true,
  },
];

export const subscriptionSteps = [
  {
    target: "body",
    content:
      "Aquí podrás los planes de suscripción disponibles y sus detalles. Para suscribirte, puedes hacerlo clickando en el botón de suscripción.",
    skipBeacon: true,
  },
];

export const packsSteps = [
  {
    target: "body",
    content:
      "Aquí podrás los packs de publicaciones disponibles y sus detalles, donde podrás aumentar tus limites de publicaciones. En caso de tener una suscripción de un plan activo, se sumarán al limite de publicaciones actual. Para suscribirte, puedes hacerlo clickando en el botón de suscripción.",
    skipBeacon: true,
  },
];

export const changeBehaviourSteps = [
  {
    target: "body",
    content:
      "Aquí podrás cambiar el comportamiento del anuncio. El anuncio de Agenda lo verán solo tu agenda de contactos, y los anuncios Libres lo verá cualquier usuario que se encuentre dentro del rango geográfico (ver glosario para una explicación detallada).",
    skipBeacon: true,
  },
];
