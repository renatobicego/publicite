const MAGAZINES = "/revistas";
const GROUPS = "/grupos";
const PROFILE = "/perfiles";
const CONFIGURATION = "/configuracion";
const POSTS = "/anuncios";
const TUTORIALS = "/tutoriales";
const SUBSCRIPTIONS = "/suscripciones";
const SUSCRIBE = "/suscribirse";
const PACKS = "/packs-publicaciones";
const CREATE = "/crear";
const CREATE_POST = "/crear/anuncio";
const CREATE_PETITION = "/crear/necesidad";
const CREATE_MAGAZINE = "/crear/revista";
const CREATE_GROUP = "/crear/grupo";
const POST_RECENTS = `${POSTS}/recientes`;
const POST_BEST = `${POSTS}/mejor-puntuados`;
const POST_NEXT_TO_EXPIRE = `${POSTS}/proximos-a-vencer`;
const BOARDS = "/pizarras";
const EDIT_POST = "/editar/anuncio";
const EDIT_PETITION = "/editar/necesidad";
const EDIT_MAGAZINE = "/editar/revista";
const EDIT_GROUP = "/editar/grupo";
const FILE_URL = process.env.NEXT_PUBLIC_UPLOADTHING_URL
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
export {
  MAGAZINES,
  GROUPS,
  PROFILE,
  CONFIGURATION,
  POSTS,
  TUTORIALS,
  SUBSCRIPTIONS,
  PACKS,
  CREATE,
  CREATE_POST,
  CREATE_PETITION,
  CREATE_MAGAZINE,
  CREATE_GROUP,
  SUSCRIBE,
  POST_RECENTS,
  POST_BEST,
  POST_NEXT_TO_EXPIRE,
  BOARDS,
  EDIT_POST,
  EDIT_PETITION,
  EDIT_MAGAZINE,
  EDIT_GROUP,
  FILE_URL,
  socketUrl
};
