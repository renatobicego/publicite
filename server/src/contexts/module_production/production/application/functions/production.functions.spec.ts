import { describe, expect, it } from '@jest/globals';

import {
  evaluateItemAccess,
  evaluateProductionAccess,
  isWithinVisibility,
  ProductionViewerContext,
  resolveEffectiveTicket,
  resolveEffectiveVisibility,
} from './production.access';
import { ProductionPermissions, resolveProductionRole } from './production.roles';
import { hashAccessKey, verifyAccessKey } from './production.access-key';
import { buildProductionUrl, slugifyProductionTitle } from './production.url';
import { buildProductionSearchRegex, normalizeFileName } from './production.text';
import {
  ProductionLockReason,
  ProductionModerationStatus,
  ProductionOwnerType,
  ProductionRole,
} from '../../domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

const viewer = (
  overrides: Partial<ProductionViewerContext> = {},
): ProductionViewerContext => ({
  userId: 'visitor',
  isRegistered: true,
  role: ProductionRole.visitor,
  relationVisibilities: [],
  hasKeyAccess: true,
  activeTicketIds: new Set(),
  pendingReviewProductionId: null,
  ...overrides,
});

describe('Roles del blog (GRP-04..07)', () => {
  const group = { creator: 'c', admins: ['a'], members: ['m'] };

  it('en un blog personal sólo el dueño es admin', () => {
    const base = { ownerType: ProductionOwnerType.User, ownerId: 'owner' };
    expect(resolveProductionRole({ ...base, userId: 'owner' })).toBe(
      ProductionRole.admin,
    );
    expect(resolveProductionRole({ ...base, userId: 'otro' })).toBe(
      ProductionRole.visitor,
    );
    expect(resolveProductionRole({ ...base, userId: undefined })).toBe(
      ProductionRole.visitor,
    );
  });

  it('en un blog de grupo deriva los roles de las listas del grupo', () => {
    const base = { ownerType: ProductionOwnerType.Group, ownerId: 'g', group };
    expect(resolveProductionRole({ ...base, userId: 'c' })).toBe(ProductionRole.admin);
    expect(resolveProductionRole({ ...base, userId: 'a' })).toBe(
      ProductionRole.moderator,
    );
    expect(resolveProductionRole({ ...base, userId: 'm' })).toBe(ProductionRole.viewer);
    expect(resolveProductionRole({ ...base, userId: 'x' })).toBe(
      ProductionRole.visitor,
    );
  });

  it('el moderador opera el contenido pero no borra ni cobra; el miembro sólo lee', () => {
    const { moderator, viewer: member, admin } = ProductionRole;
    expect(ProductionPermissions.canEditContent(moderator)).toBe(true);
    expect(ProductionPermissions.canManageAccess(moderator)).toBe(true);
    expect(ProductionPermissions.canDeleteBlog(moderator)).toBe(false);
    expect(ProductionPermissions.canManagePayout(moderator)).toBe(false);
    expect(ProductionPermissions.canDeleteBlog(admin)).toBe(true);
    expect(ProductionPermissions.canManagePayout(admin)).toBe(true);
    expect(ProductionPermissions.canViewAll(member)).toBe(true);
    expect(ProductionPermissions.canEditContent(member)).toBe(false);
  });
});

describe('Alcance y herencia (VIS-01..04)', () => {
  it('evalúa cada alcance', () => {
    const anonymous = { isRegistered: false, relationVisibilities: [] };
    const friend = { isRegistered: true, relationVisibilities: ['friends', 'contacts'] };

    expect(isWithinVisibility(Visibility.public, anonymous)).toBe(true);
    expect(isWithinVisibility(Visibility.registered, anonymous)).toBe(false);
    expect(isWithinVisibility(Visibility.registered, friend)).toBe(true);
    expect(isWithinVisibility(Visibility.contacts, friend)).toBe(true);
    expect(isWithinVisibility(Visibility.friends, friend)).toBe(true);
    expect(isWithinVisibility(Visibility.topfriends, friend)).toBe(false);
  });

  it('hereda del ancestro más cercano y, si no hay, del blog', () => {
    expect(
      resolveEffectiveVisibility([null, Visibility.friends, Visibility.public], Visibility.registered),
    ).toBe(Visibility.friends);
    expect(resolveEffectiveVisibility([Visibility.contacts, Visibility.friends], Visibility.public)).toBe(
      Visibility.contacts,
    );
    expect(resolveEffectiveVisibility([null, undefined], Visibility.registered)).toBe(
      Visibility.registered,
    );
  });
});

describe('Ticket efectivo (TKT-01)', () => {
  const tickets = [
    { _id: 't-folder', target: 'folder' },
    { _id: 't-blog', target: null },
  ];

  it('usa el ticket del ancestro más cercano, o el del blog', () => {
    expect(resolveEffectiveTicket(['file', 'folder', 'root'], tickets)?._id).toBe(
      't-folder',
    );
    expect(resolveEffectiveTicket(['other'], tickets)?._id).toBe('t-blog');
    expect(resolveEffectiveTicket(['other'], [])).toBeUndefined();
  });
});

describe('Evaluación de acceso', () => {
  const production = { _id: 'p', visibility: Visibility.public, hasAccessKey: false };

  it('el staff y los miembros ven todo', () => {
    const decision = evaluateItemAccess({
      production,
      chain: [{ _id: 'i', visibility: Visibility.topfriends, moderationStatus: 'hidden' }],
      tickets: [{ _id: 't', target: 'i' }],
      viewer: viewer({ role: ProductionRole.viewer }),
    });
    expect(decision).toEqual({ listed: true, canViewContent: true });
  });

  it('lo moderado no se lista a visitantes (DEN-02)', () => {
    const decision = evaluateItemAccess({
      production,
      chain: [
        { _id: 'i' },
        { _id: 'folder', moderationStatus: ProductionModerationStatus.hidden },
      ],
      tickets: [],
      viewer: viewer(),
    });
    expect(decision.listed).toBe(false);
    expect(decision.lockReason).toBe(ProductionLockReason.moderation);
  });

  it('lo que queda fuera del alcance no se lista', () => {
    const decision = evaluateItemAccess({
      production,
      chain: [{ _id: 'i' }, { _id: 'folder', visibility: Visibility.friends }],
      tickets: [],
      viewer: viewer(),
    });
    expect(decision.listed).toBe(false);
  });

  it('con clave, el alcance no se evalúa (VIS-05)', () => {
    const decision = evaluateItemAccess({
      production: { ...production, hasAccessKey: true },
      chain: [{ _id: 'i', visibility: Visibility.topfriends }],
      tickets: [],
      viewer: viewer(),
    });
    expect(decision.canViewContent).toBe(true);
  });

  it('sin ticket activo el ítem se lista bloqueado; con ticket se ve', () => {
    const params = {
      production,
      chain: [{ _id: 'i' }, { _id: 'folder' }],
      tickets: [{ _id: 't', target: 'folder' }],
    };
    const locked = evaluateItemAccess({ ...params, viewer: viewer() });
    expect(locked).toEqual({
      listed: true,
      canViewContent: false,
      lockReason: ProductionLockReason.ticket,
      ticketId: 't',
    });

    const unlocked = evaluateItemAccess({
      ...params,
      viewer: viewer({ activeTicketIds: new Set(['t']) }),
    });
    expect(unlocked.canViewContent).toBe(true);
  });

  it('a nivel blog: clave, reseña pendiente y alcance', () => {
    const base = {
      productionId: 'p',
      hasAccessKey: false,
      visibility: Visibility.public,
    };
    expect(
      evaluateProductionAccess({
        ...base,
        hasAccessKey: true,
        viewer: viewer({ hasKeyAccess: false }),
      }).lockReason,
    ).toBe(ProductionLockReason.accessKey);
    expect(
      evaluateProductionAccess({
        ...base,
        viewer: viewer({ pendingReviewProductionId: 'otra' }),
      }).lockReason,
    ).toBe(ProductionLockReason.pendingReview);
    // La producción con la reseña pendiente sí se puede visitar.
    expect(
      evaluateProductionAccess({
        ...base,
        viewer: viewer({ pendingReviewProductionId: 'p' }),
      }).canViewContent,
    ).toBe(true);
    expect(
      evaluateProductionAccess({
        ...base,
        visibility: Visibility.registered,
        viewer: viewer({ isRegistered: false, userId: undefined }),
      }).listed,
    ).toBe(false);
  });
});

describe('Clave de acceso (RNF-13)', () => {
  it('guarda un hash con salt y valida la clave correcta', async () => {
    const hash = await hashAccessKey('  clave-zoom ');
    expect(hash).toMatch(/^scrypt\$[a-f0-9]+\$[a-f0-9]+$/);
    expect(hash).not.toContain('clave-zoom');
    expect(await verifyAccessKey('clave-zoom', hash)).toBe(true);
    expect(await verifyAccessKey('otra', hash)).toBe(false);
    expect(await verifyAccessKey(undefined, hash)).toBe(false);
    expect(await verifyAccessKey('clave-zoom', 'basura')).toBe(false);
  });

  it('dos hashes de la misma clave son distintos', async () => {
    expect(await hashAccessKey('abcd')).not.toBe(await hashAccessKey('abcd'));
  });

  it('rechaza claves muy cortas', async () => {
    await expect(hashAccessKey('abc')).rejects.toThrow();
  });
});

describe('URL, búsqueda e ID de archivo', () => {
  it('arma slugs legibles', () => {
    expect(slugifyProductionTitle('Música & Fotografía 2024!')).toBe(
      'musica-fotografia-2024',
    );
    expect(slugifyProductionTitle('🚀🚀')).toBe('blog');
    expect(buildProductionUrl('Mi Blog')).toMatch(/^mi-blog-[a-f0-9]{6}$/);
  });

  it('escapa caracteres especiales en la búsqueda', () => {
    const regex = buildProductionSearchRegex('c++ (avanzado)');
    expect(regex).not.toBeNull();
    expect(() => new RegExp(regex!)).not.toThrow();
    expect(new RegExp(regex!, 'i').test('curso de c++ (avanzado)')).toBe(true);
    expect(buildProductionSearchRegex('de')).toBeNull();
  });

  it('normaliza y valida el ID de archivo', () => {
    expect(normalizeFileName('  FOTO   01 ')).toBe('FOTO 01');
    expect(() => normalizeFileName('   ')).toThrow();
    expect(() => normalizeFileName('x'.repeat(81))).toThrow();
  });
});
