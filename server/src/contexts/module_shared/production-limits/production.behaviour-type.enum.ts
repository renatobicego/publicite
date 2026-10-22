/**
 * Comportamiento de un blog PERSONAL de "Mis Producciones", igual que
 * `PostBehaviourType` de Anuncios:
 *
 * - libre: público (o para registrados) y visible dentro del radio de su
 *   ubicación (`geoLocation`).
 * - agenda: visible sólo para la agenda de contactos del dueño (contactos,
 *   amigos o top amigos).
 *
 * Los blogs de grupo no tienen comportamiento (null): se comparten con los
 * miembros del grupo. Vive en `module_shared` porque el cupo por
 * comportamiento se calcula en `module_user`.
 */
export enum ProductionBehaviourType {
  libre = 'libre',
  agenda = 'agenda',
}
