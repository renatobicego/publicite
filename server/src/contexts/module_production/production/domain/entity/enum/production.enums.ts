import { registerEnumType } from '@nestjs/graphql';

import { ProductionOwnerType } from 'src/contexts/module_shared/production-limits/production.owner-type.enum';
import { ProductionBehaviourType } from 'src/contexts/module_shared/production-limits/production.behaviour-type.enum';

export { ProductionOwnerType, ProductionBehaviourType };

registerEnumType(ProductionOwnerType, {
  name: 'ProductionOwnerType',
  description: 'Dueño del blog: usuario (blog personal) o grupo (blog de grupo)',
});

registerEnumType(ProductionBehaviourType, {
  name: 'ProductionBehaviourType',
  description:
    'Comportamiento de un blog personal (como Anuncios): libre (público, por radio de ubicación) o agenda (sólo tu agenda de contactos)',
});

/**
 * Sub-solapas del explorar por cómo se entra al blog completo: sin ticket,
 * con ticket gratuito o con ticket pago. Sólo cuenta el ticket del blog
 * (`target: null`); los de carpetas o archivos no lo cambian.
 */
export enum ProductionAccessFilter {
  free = 'free',
  freeTicket = 'freeTicket',
  paidTicket = 'paidTicket',
}

registerEnumType(ProductionAccessFilter, {
  name: 'ProductionAccessFilter',
  description:
    'Acceso al blog completo: free (sin ticket), freeTicket (ticket gratuito) o paidTicket (ticket pago)',
});

/**
 * Alcance de un blog o de un ítem (VIS-01). Son los mismos niveles que el
 * `Visibility` de Anuncios más `onlyMe` ("Sólo yo"): lo ve únicamente el
 * staff del blog (el dueño, o creador y admins del grupo). `onlyMe` no se
 * puede pisar desde abajo: si una carpeta es privada, todo lo que tiene
 * adentro también.
 */
export enum ProductionVisibility {
  public = 'public',
  registered = 'registered',
  contacts = 'contacts',
  friends = 'friends',
  topfriends = 'topfriends',
  onlyMe = 'onlyMe',
}

registerEnumType(ProductionVisibility, {
  name: 'ProductionVisibility',
  description:
    'Alcance de un blog o ítem: público, registrados, contactos, amigos, top amigos o sólo yo',
});

/** Tipo de nodo del árbol Blog → Carpetas → Subcarpetas → Archivos (BLG-07). */
export enum ProductionItemKind {
  folder = 'folder',
  file = 'file',
  article = 'article',
}

registerEnumType(ProductionItemKind, {
  name: 'ProductionItemKind',
  description: 'Tipo de ítem del árbol de una producción',
});

/**
 * Tipo de archivo subido a UploadThing (BLG-08..11). `writing` es un PDF (se
 * muestra embebido); `document` es un archivo de Office u OpenDocument, que el
 * navegador no sabe mostrar y se ofrece para descargar.
 */
export enum ProductionFileType {
  photo = 'photo',
  video = 'video',
  writing = 'writing',
  audio = 'audio',
  document = 'document',
}

registerEnumType(ProductionFileType, {
  name: 'ProductionFileType',
  description: 'Foto (postal), video, escrito (PDF), audio o documento de Office',
});

/** Categorías de la Estantería / Board de Links (BLG-03). */
export enum ProductionShelfCategory {
  movies = 'movies',
  books = 'books',
  websites = 'websites',
  youtube = 'youtube',
  games = 'games',
  places = 'places',
}

registerEnumType(ProductionShelfCategory, {
  name: 'ProductionShelfCategory',
  description: 'Pelis, Libros, Sitios web, Youtube, Games, Places',
});

/**
 * Rol del usuario que consulta un blog (GRP-04..07, RNF-12). Se deriva del
 * dueño del blog y, en blogs de grupo, de las listas del grupo; no hay roles
 * nuevos persistidos.
 */
export enum ProductionRole {
  admin = 'admin',
  moderator = 'moderator',
  viewer = 'viewer',
  visitor = 'visitor',
}

registerEnumType(ProductionRole, {
  name: 'ProductionRole',
  description:
    'admin (dueño o creator del grupo), moderator (admins del grupo), viewer (miembros del grupo), visitor (resto)',
});

/** Estado de moderación de un blog o ítem (DEN-02/03). */
export enum ProductionModerationStatus {
  active = 'active',
  hidden = 'hidden',
  blocked = 'blocked',
}

registerEnumType(ProductionModerationStatus, {
  name: 'ProductionModerationStatus',
  description:
    'active, hidden (oculto por denuncias, pendiente de revisión) o blocked (bloqueado por un admin)',
});

/** Motivo por el que un visitante no puede ver el contenido de un ítem. */
export enum ProductionLockReason {
  accessKey = 'accessKey',
  visibility = 'visibility',
  ticket = 'ticket',
  pendingReview = 'pendingReview',
  moderation = 'moderation',
}

registerEnumType(ProductionLockReason, {
  name: 'ProductionLockReason',
  description:
    'accessKey (falta la clave), visibility (fuera del alcance), ticket (requiere ticket), pendingReview (reseña pendiente), moderation (oculto o bloqueado)',
});
