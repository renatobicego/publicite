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
import {
  sanitizeArticleBlocks,
  sanitizeInlineHtml,
} from './production.article-sanitize';
import { buildProductionSearchRegex, normalizeFileName } from './production.text';
import {
  computeTicketExpiration,
  computeTicketSplit,
  normalizeAliasCbu,
  validateTicketConfig,
} from './production.tickets';
import {
  ProductionLockReason,
  ProductionModerationStatus,
  ProductionOwnerType,
  ProductionRole,
  ProductionVisibility,
} from '../../domain/entity/enum/production.enums';

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

    expect(isWithinVisibility(ProductionVisibility.public, anonymous)).toBe(true);
    expect(isWithinVisibility(ProductionVisibility.registered, anonymous)).toBe(false);
    expect(isWithinVisibility(ProductionVisibility.registered, friend)).toBe(true);
    expect(isWithinVisibility(ProductionVisibility.contacts, friend)).toBe(true);
    expect(isWithinVisibility(ProductionVisibility.friends, friend)).toBe(true);
    expect(isWithinVisibility(ProductionVisibility.topfriends, friend)).toBe(false);
  });

  it('hereda del ancestro más cercano y, si no hay, del blog', () => {
    expect(
      resolveEffectiveVisibility([null, ProductionVisibility.friends, ProductionVisibility.public], ProductionVisibility.registered),
    ).toBe(ProductionVisibility.friends);
    expect(resolveEffectiveVisibility([ProductionVisibility.contacts, ProductionVisibility.friends], ProductionVisibility.public)).toBe(
      ProductionVisibility.contacts,
    );
    expect(resolveEffectiveVisibility([null, undefined], ProductionVisibility.registered)).toBe(
      ProductionVisibility.registered,
    );
  });
});

describe('Sólo yo (onlyMe)', () => {
  const { onlyMe, public: open } = ProductionVisibility;
  const privateFolderChain = [
    { _id: 'file', visibility: open },
    { _id: 'folder', visibility: onlyMe },
  ];

  it('gana en la herencia aunque un hijo pida otro alcance', () => {
    expect(resolveEffectiveVisibility([open, onlyMe], open)).toBe(onlyMe);
    expect(resolveEffectiveVisibility([open], onlyMe)).toBe(onlyMe);
  });

  it('el staff ve el contenido privado', () => {
    for (const role of [ProductionRole.admin, ProductionRole.moderator]) {
      expect(
        evaluateItemAccess({
          production: { _id: 'p', visibility: open, hasAccessKey: false },
          chain: privateFolderChain,
          tickets: [],
          viewer: viewer({ role }),
        }),
      ).toEqual({ listed: true, canViewContent: true });
    }
  });

  it('no lo ven los miembros del grupo ni los visitantes, aunque tengan la clave', () => {
    for (const role of [ProductionRole.viewer, ProductionRole.visitor]) {
      const decision = evaluateItemAccess({
        production: { _id: 'p', visibility: open, hasAccessKey: true },
        chain: privateFolderChain,
        tickets: [],
        viewer: viewer({ role, hasKeyAccess: true }),
      });
      expect(decision.listed).toBe(false);
      expect(decision.lockReason).toBe(ProductionLockReason.visibility);
    }
  });

  it('un blog privado no se lista para quien no es staff', () => {
    const params = {
      productionId: 'p',
      hasAccessKey: false,
      visibility: onlyMe,
    };
    expect(
      evaluateProductionAccess({ ...params, viewer: viewer({ role: ProductionRole.viewer }) })
        .listed,
    ).toBe(false);
    expect(
      evaluateProductionAccess({ ...params, viewer: viewer({ role: ProductionRole.admin }) }),
    ).toEqual({ listed: true, canViewContent: true });
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
  const production = { _id: 'p', visibility: ProductionVisibility.public, hasAccessKey: false };

  it('el staff y los miembros ven todo', () => {
    const decision = evaluateItemAccess({
      production,
      chain: [{ _id: 'i', visibility: ProductionVisibility.topfriends, moderationStatus: 'hidden' }],
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
      chain: [{ _id: 'i' }, { _id: 'folder', visibility: ProductionVisibility.friends }],
      tickets: [],
      viewer: viewer(),
    });
    expect(decision.listed).toBe(false);
  });

  it('con clave, el alcance no se evalúa (VIS-05)', () => {
    const decision = evaluateItemAccess({
      production: { ...production, hasAccessKey: true },
      chain: [{ _id: 'i', visibility: ProductionVisibility.topfriends }],
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
      visibility: ProductionVisibility.public,
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
        visibility: ProductionVisibility.registered,
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

describe('Tickets (TKT-02/03/06/11)', () => {
  afterEach(() => {
    delete process.env.PRODUCTION_TICKET_COMMISSION_PERCENT;
  });

  it('reparte 10% de comisión y 90% al creador, con centavos', () => {
    expect(computeTicketSplit(1000)).toEqual({
      commissionPercent: 10,
      commissionAmount: 100,
      creatorPayoutAmount: 900,
    });
    expect(computeTicketSplit(99.99)).toEqual({
      commissionPercent: 10,
      commissionAmount: 10,
      creatorPayoutAmount: 89.99,
    });
    process.env.PRODUCTION_TICKET_COMMISSION_PERCENT = '15';
    expect(computeTicketSplit(200).commissionAmount).toBe(30);
  });

  it('valida precio y duración', () => {
    expect(validateTicketConfig({ isPaid: false, price: 500, durationHours: 24 })).toEqual({
      isPaid: false,
      price: 0,
      durationHours: 24,
      untilClose: false,
    });
    expect(
      validateTicketConfig({ isPaid: true, price: 10.456, untilClose: true, durationHours: 1 }),
    ).toEqual({ isPaid: true, price: 10.46, durationHours: null, untilClose: true });
    expect(() => validateTicketConfig({ isPaid: true, price: 0, durationHours: 24 })).toThrow();
    expect(() => validateTicketConfig({ isPaid: false, durationHours: 23 })).toThrow();
    expect(() => validateTicketConfig({ isPaid: false })).toThrow();
  });

  it('calcula el vencimiento', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    expect(computeTicketExpiration(start, 48, false)?.toISOString()).toBe(
      '2026-01-03T00:00:00.000Z',
    );
    expect(computeTicketExpiration(start, 48, true)).toBeNull();
  });

  it('acepta alias o CBU/CVU', () => {
    expect(normalizeAliasCbu(' mi.alias-1 ')).toBe('mi.alias-1');
    expect(normalizeAliasCbu('0000003100000000000001')).toBe('0000003100000000000001');
    expect(() => normalizeAliasCbu('corto')).toThrow();
    expect(() => normalizeAliasCbu('000000310000000000000')).toThrow();
    expect(() => normalizeAliasCbu('con espacio')).toThrow();
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

describe('Sanitización de artículos', () => {
  const sanitizeData = (type: string, data: unknown) =>
    JSON.parse(
      sanitizeArticleBlocks([{ type, data: JSON.stringify(data) }])[0].data,
    );

  it('conserva el formato de texto del editor', () => {
    const html =
      '<b>a</b> <i>b</i> <u>c</u> <strike>d</strike> ' +
      '<span style="color: rgb(220, 38, 38);">e</span> ' +
      '<span style="background-color: rgb(254, 240, 138); font-size: x-large;">f</span> ' +
      '<a href="https://soonpublicite.com/x?a=1&amp;b=2">g</a> &nbsp;h<br>';
    // Lo único que cambia es el espaciado dentro de `style`.
    const clean = sanitizeInlineHtml(html);
    expect(clean).toBe(html.replace(/(color|size): /g, '$1:'));
    // Volver a pasar el filtro no cambia nada (el cliente lo aplica otra vez).
    expect(sanitizeInlineHtml(clean)).toBe(clean);
  });

  it('quita scripts, manejadores de eventos y enlaces peligrosos', () => {
    const dirty =
      'hola<script>alert(1)</script><img src=x onerror=alert(1)>' +
      '<a href="javascript:alert(1)" onclick="alert(1)">link</a>' +
      '<span style="color:red;background:url(javascript:alert(1))" onmouseover="x()">t</span>' +
      '<iframe src="https://evil.test"></iframe><svg onload=alert(1)>';
    const clean = sanitizeInlineHtml(dirty);
    expect(clean).not.toMatch(/<script|<img|<iframe|<svg|onerror|onclick|onmouseover|onload|javascript:|url\(/i);
    expect(clean).toContain('hola');
    // Un `style` con una declaración peligrosa se descarta entero.
    expect(clean).toBe('hola<a href>link</a><span style>t</span>');
  });

  it('sanitiza todo el JSON del bloque, incluidas listas anidadas y URLs', () => {
    const list = sanitizeData('list', {
      style: 'unordered',
      items: [
        { content: 'uno<script>x</script>', items: [{ content: '<b onclick="x()">dos</b>', items: [] }] },
      ],
    });
    expect(list.items[0].content).toBe('uno');
    expect(list.items[0].items[0].content).toBe('<b>dos</b>');

    const image = sanitizeData('image', {
      file: { url: 'javascript:alert(1)', key: 'abc123' },
      caption: '<img src=x onerror=alert(1)>pie',
      stretched: true,
    });
    expect(image).toEqual({
      file: { url: '', key: 'abc123' },
      caption: 'pie',
      stretched: true,
    });

    const media = sanitizeData('video', {
      file: { url: 'https://utfs.io/f/abc', key: 'abcvideo' },
    });
    expect(media.file.url).toBe('https://utfs.io/f/abc');
    expect(sanitizeData('linkTool', { link: 'data:text/html,x' }).link).toBe('');
  });

  it('un data que no es un objeto JSON se guarda vacío', () => {
    expect(
      sanitizeArticleBlocks([
        { type: 'paragraph', data: 'no es json' },
        { type: 'paragraph', data: '"<script>"' },
      ]).map((block) => block.data),
    ).toEqual(['{}', '{}']);
  });
});
