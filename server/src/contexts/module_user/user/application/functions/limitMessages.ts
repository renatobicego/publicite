/*
Mensajes de "no hay cupo" con la cuenta de cuántos sobran.

Cuando vence el extra temporal de un cambio de plan (o se cancela un plan) los
límites bajan, pero lo que ya estaba publicado sigue activo. El usuario no puede
crear más hasta quedar por debajo del límite, y se le dice cuántos tiene de más.
Al usuario se le dice "geolocalizados", nunca "libres".
*/

const plural = (count: number, singular: string, pluralForm: string) =>
  count === 1 ? singular : pluralForm;

/** Cuántos hay que dar de baja para que entre uno nuevo (mínimo 1). */
export const howManyToFree = (count: number, limit: number): number =>
  Math.max(1, count - limit + 1);

export function buildPostLimitMessage(
  behaviourType: string,
  count: number,
  limit: number,
  action: 'publicar uno nuevo' | 'activar este',
): string {
  const isAgenda = behaviourType === 'agenda';
  const what = (n: number) =>
    isAgenda
      ? plural(n, 'anuncio de agenda activo', 'anuncios de agenda activos')
      : plural(n, 'anuncio geolocalizado activo', 'anuncios geolocalizados activos');
  const toFree = howManyToFree(count, limit);
  return (
    `Tenés ${count} ${what(count)} y tu límite es ${limit}. ` +
    `Desactivá ${toFree} para ${action}, o sumá un pack o mejorá tu plan.`
  );
}

export function buildContactLimitMessage(requested: number, limit: number): string {
  const toRemove = Math.max(1, requested - limit);
  return (
    `Elegiste ${requested} ${plural(requested, 'contacto activo', 'contactos activos')} y tu límite es ${limit}. ` +
    `Quitá ${toRemove} para guardar, o mejorá tu plan.`
  );
}

export function buildBlogLimitMessage(
  kind: 'group' | 'agenda' | 'libre',
  count: number,
  limit: number,
): string {
  const labelFor = (n: number) =>
    kind === 'group'
      ? plural(n, 'blog de grupo', 'blogs de grupo')
      : kind === 'agenda'
        ? plural(n, 'blog de mi agenda', 'blogs de mi agenda')
        : plural(n, 'blog geolocalizado', 'blogs geolocalizados');
  const extra = kind === 'group' ? 'mejorá tu plan' : 'sumá un pack o mejorá tu plan';
  if (count > limit) {
    const toFree = howManyToFree(count, limit);
    return (
      `Tenés ${count} ${labelFor(count)} y tu límite es ${limit}. ` +
      `Para crear otro, borrá ${toFree} o ${extra}.`
    );
  }
  return `Alcanzaste el límite de ${limit} ${labelFor(limit)} de tu plan. Para crear más, ${extra}.`;
}
