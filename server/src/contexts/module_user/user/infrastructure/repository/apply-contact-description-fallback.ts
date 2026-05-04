/**
 * Compat transición Contact.description ↔ User.description (legacy).
 *
 * - Si Contact.description.text tiene valor → ese gana y se copia también
 *   al `user.description` plano para no romper consumers viejos del schema
 *   GraphQL/REST que leen `description` top-level.
 * - Si Contact.description.text está vacío y User.description (legacy)
 *   tiene valor → se mappea a la nueva forma `{ text, visibility:"public" }`
 *   para que el front nuevo lo reciba donde lo espera.
 *
 * Quitar esta función después de la migración + cleanup del campo
 * `description` del UserSchema.
 */
export function applyContactDescriptionFallback(user: any): void {
  if (!user) return;
  const contact = user.contact;
  const legacyDescription =
    typeof user.description === 'string' ? user.description : undefined;
  const contactText = contact?.description?.text;

  if (contact && !contactText && legacyDescription) {
    contact.description = { text: legacyDescription, visibility: 'public' };
  }
  if (contactText) {
    user.description = contactText;
  }
}
