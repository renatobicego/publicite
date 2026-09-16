/**
 * Dueño de un blog de "Mis Producciones" (RNF-11).
 *
 * El blog es polimórfico: pertenece a un usuario o a un grupo. Vive en
 * `module_shared` porque el gate de cupo se resuelve en `module_user` (donde
 * están los planes) y el resto del dominio de MP vive en su propio módulo.
 */
export enum ProductionOwnerType {
  User = 'User',
  Group = 'Group',
}
