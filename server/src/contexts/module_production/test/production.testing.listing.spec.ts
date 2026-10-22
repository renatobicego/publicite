import { TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestGroup,
  createTestUser,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
  relateUsers,
  blogRequest,
  TEST_GEO,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import {
  ProductionAccessFilter,
  ProductionBehaviourType,
  ProductionModerationStatus,
  ProductionRole,
  ProductionVisibility,
} from '../production/domain/entity/enum/production.enums';
import { Visibility_Of_Find } from '../../module_post/post/domain/entity/enum/post-visibility.enum';

// Base remota de QA: cada test hace varias idas y vueltas.
jest.setTimeout(60_000);

describe('Mis Producciones - Fase 2: listado, búsqueda y destacadas', () => {
  let moduleRef: TestingModule;
  let service: ProductionService;
  let models: ProductionTestModels;

  beforeAll(async () => {
    moduleRef = await mapModuleTesting.get('production')!();
    service = moduleRef.get<ProductionService>('ProductionServiceInterface');
    models = getProductionTestModels(moduleRef);
  });

  afterAll(async () => {
    await cleanProductionTestData(models);
    await moduleRef.close();
  });

  afterEach(async () => {
    await cleanProductionTestData(models);
  });

  const createBlog = async (
    userId: string,
    title: string,
    extra: {
      visibility?: ProductionVisibility;
      description?: string;
      groupId?: string;
      geoLocation?: typeof TEST_GEO;
    } = {},
  ) => (await service.createProduction(blogRequest({ title, ...extra }), userId))._id;

  const titlesOf = (list: { title: string }[]) =>
    list.map((p) => p.title).sort();

  it('sin sesión sólo lista lo público (NAV-02)', async () => {
    const ownerA = await createTestUser(models);
    const ownerB = await createTestUser(models);
    await createBlog(ownerA, 'Público');
    await createBlog(ownerB, 'Registrados', { visibility: ProductionVisibility.registered });

    const { productions } = await service.findAllProductions(1, 10);
    expect(titlesOf(productions)).toEqual(['Público']);
  });

  it('con sesión amplía según registro, agenda y propiedad (VIS-01)', async () => {
    const viewer = await createTestUser(models);
    const friend = await createTestUser(models);
    const stranger = await createTestUser(models);
    await relateUsers(models, viewer, friend, 'friends');

    await createBlog(friend, 'De amigo', { visibility: ProductionVisibility.friends });
    await createBlog(stranger, 'Top ajeno', { visibility: ProductionVisibility.topfriends });
    await createBlog(viewer, 'Mío privado', {
      visibility: ProductionVisibility.topfriends,
    });
    const anotherOwner = await createTestUser(models);
    await createBlog(anotherOwner, 'Registrados', {
      visibility: ProductionVisibility.registered,
    });

    const { productions } = await service.findAllProductions(1, 10, viewer);
    expect(titlesOf(productions)).toEqual(['De amigo', 'Mío privado', 'Registrados']);

    const mine = productions.find((p) => p.title === 'Mío privado')!;
    expect(mine.viewer.role).toBe(ProductionRole.admin);
    expect(mine.ownerInfo?._id).toBe(viewer);
  });

  it('los contactos no ven lo que es sólo para amigos', async () => {
    const viewer = await createTestUser(models);
    const owner = await createTestUser(models);
    await relateUsers(models, viewer, owner, 'contacts');
    await createBlog(owner, 'Para amigos', { visibility: ProductionVisibility.friends });

    const { productions } = await service.findAllProductions(1, 10, viewer);
    expect(productions).toHaveLength(0);
  });

  it('lista los blogs con clave (bloqueados) pero excluye los moderados del listado global', async () => {
    const owner = await createTestUser(models);
    const other = await createTestUser(models);
    const withKey = await createBlog(owner, 'Con clave');
    const hidden = await createBlog(other, 'Oculto');
    await models.production.updateOne(
      { _id: withKey },
      { $set: { accessKeyHash: 'scrypt$00$00' } },
    );
    await models.production.updateOne(
      { _id: hidden },
      { $set: { moderationStatus: ProductionModerationStatus.hidden } },
    );

    // El blog con clave aparece en el listado/búsqueda, pero con el contenido
    // bloqueado hasta ingresar la clave (VIS-05). El moderado no se lista.
    const { productions } = await service.findAllProductions(1, 10);
    expect(productions.map((p) => p.title)).toEqual(['Con clave']);
    expect(productions[0].hasAccessKey).toBe(true);
    expect(productions[0].viewer.canViewContent).toBe(false);
    expect(productions[0].showcase).toEqual([]);

    // En el cartel del dueño el blog con clave también aparece, para ingresarla.
    const onProfile = await service.findProductionsByOwner(owner, undefined);
    expect(onProfile.map((p) => p.title)).toEqual(['Con clave']);
    expect(onProfile[0].hasAccessKey).toBe(true);
    expect(onProfile[0].showcase).toEqual([]);
  });

  it('pagina el listado', async () => {
    for (let i = 0; i < 3; i++) {
      const owner = await createTestUser(models);
      await createBlog(owner, `Blog ${i}`);
    }
    const first = await service.findAllProductions(1, 2);
    const second = await service.findAllProductions(2, 2);
    expect(first.productions).toHaveLength(2);
    expect(first.hasMore).toBe(true);
    expect(second.productions).toHaveLength(1);
    expect(second.hasMore).toBe(false);
  });

  it('busca por título y descripción, sin acentos ni mayúsculas (NAV-05)', async () => {
    const a = await createTestUser(models);
    const b = await createTestUser(models);
    const c = await createTestUser(models);
    await createBlog(a, 'Fotografía Nocturna');
    await createBlog(b, 'Cocina', { description: 'Recetas de fotografía gastronómica' });
    await createBlog(c, 'Música');

    const { productions } = await service.findAllProductions(1, 10, undefined, 'FOTOGRAFIA');
    expect(titlesOf(productions)).toEqual(['Cocina', 'Fotografía Nocturna']);

    const noTerms = await service.findAllProductions(1, 10, undefined, 'de');
    expect(noTerms.productions).toHaveLength(0);

    const special = await service.findAllProductions(1, 10, undefined, 'c++ (');
    expect(special.productions).toHaveLength(0);
  });

  it('destacadas: primero las marcadas por un admin y después por fans (NAV-03)', async () => {
    expect(await service.findFeaturedProductions(5)).toEqual([]);

    const a = await createTestUser(models);
    const b = await createTestUser(models);
    const c = await createTestUser(models);
    const popular = await createBlog(a, 'Popular');
    await createBlog(b, 'Nueva');
    const pinned = await createBlog(c, 'Elegida');
    await models.production.updateOne({ _id: popular }, { $set: { fansCount: 50 } });

    await service.setProductionFeatured(pinned, true);

    const featured = await service.findFeaturedProductions(2);
    expect(featured.map((p) => p.title)).toEqual(['Elegida', 'Popular']);
    expect(featured[0].isFeatured).toBe(true);
  });

  it('los miembros ven el blog del grupo en el listado aunque sea restringido', async () => {
    const creator = await createTestUser(models);
    const member = await createTestUser(models);
    const outsider = await createTestUser(models);
    await givePlanToUser(models, creator, { groupBlogsCount: 1 });
    const groupId = await createTestGroup(models, {
      creator,
      members: [member],
    });
    await createBlog(creator, 'Blog del grupo', {
      groupId,
      visibility: ProductionVisibility.topfriends,
    });

    const asMember = await service.findAllProductions(1, 10, member);
    expect(asMember.productions.map((p) => p.title)).toEqual(['Blog del grupo']);
    expect(asMember.productions[0].viewer.role).toBe(ProductionRole.viewer);

    const asOutsider = await service.findAllProductions(1, 10, outsider);
    expect(asOutsider.productions).toHaveLength(0);
  });

  describe('Solapas del explorar: Todas / Libres / Agenda (como Anuncios)', () => {
    // A ~400 km del Obelisco (Mar del Plata): fuera del radio de 5 km.
    const FAR = { latitude: -38.0055, longitude: -57.5426 };
    const NEAR = { latitude: TEST_GEO.latitude, longitude: TEST_GEO.longitude };

    it('Libres: blogs libres de otros, públicos y dentro del radio', async () => {
      const viewer = await createTestUser(models);
      const other = await createTestUser(models);
      const friend = await createTestUser(models);
      await relateUsers(models, viewer, friend, 'friends');
      await createBlog(other, 'Libre cerca');
      await createBlog(viewer, 'Mío libre');
      await createBlog(friend, 'Agenda de amigo', {
        visibility: ProductionVisibility.friends,
      });

      const near = await service.findAllProductions(1, 10, viewer, undefined, {
        behaviourType: ProductionBehaviourType.libre,
        userLocation: NEAR,
      });
      expect(titlesOf(near.productions)).toEqual(['Libre cerca']);
      expect(near.productions[0].behaviourType).toBe(ProductionBehaviourType.libre);

      const far = await service.findAllProductions(1, 10, viewer, undefined, {
        behaviourType: ProductionBehaviourType.libre,
        userLocation: FAR,
      });
      expect(far.productions).toHaveLength(0);
    });

    it('Agenda: sólo blogs de agenda de los contactos, filtrables por relación', async () => {
      const viewer = await createTestUser(models);
      const friend = await createTestUser(models);
      const contact = await createTestUser(models);
      const stranger = await createTestUser(models);
      await relateUsers(models, viewer, friend, 'friends');
      await relateUsers(models, viewer, contact, 'contacts');
      await createBlog(friend, 'Agenda de amigo', {
        visibility: ProductionVisibility.contacts,
      });
      await createBlog(contact, 'Agenda de contacto', {
        visibility: ProductionVisibility.contacts,
      });
      await createBlog(contact, 'Libre de contacto');
      await createBlog(stranger, 'Agenda ajena', {
        visibility: ProductionVisibility.contacts,
      });

      const all = await service.findAllProductions(1, 10, viewer, undefined, {
        behaviourType: ProductionBehaviourType.agenda,
        userLocation: FAR,
      });
      expect(titlesOf(all.productions)).toEqual([
        'Agenda de amigo',
        'Agenda de contacto',
      ]);

      const onlyFriends = await service.findAllProductions(1, 10, viewer, undefined, {
        behaviourType: ProductionBehaviourType.agenda,
        relation: Visibility_Of_Find.friends,
      });
      expect(titlesOf(onlyFriends.productions)).toEqual(['Agenda de amigo']);

      const anonymous = await service.findAllProductions(1, 10, undefined, undefined, {
        behaviourType: ProductionBehaviourType.agenda,
      });
      expect(anonymous.productions).toHaveLength(0);
    });

    it('sub-solapas por ticket del blog: gratuitos, ticket gratis y ticket pago', async () => {
      const viewer = await createTestUser(models);
      const owner = await createTestUser(models);
      await givePlanToUser(models, owner, { personalBlogsLibreCount: 3 });
      await createBlog(owner, 'Sin ticket');
      const freeTicket = await createBlog(owner, 'Ticket gratis');
      const paidTicket = await createBlog(owner, 'Ticket pago');
      const tickets = models.connection.collection('productiontickets');
      const ticketOf = (production: string, isPaid: boolean) => ({
        production: new Types.ObjectId(production),
        target: null,
        isPaid,
        price: isPaid ? 1000 : 0,
        createdBy: new Types.ObjectId(owner),
      });
      await tickets.insertMany([
        ticketOf(freeTicket, false),
        ticketOf(paidTicket, true),
        // Un ticket de una carpeta no cambia cómo se entra al blog.
        { ...ticketOf(freeTicket, true), target: new Types.ObjectId() },
      ]);

      const list = async (access?: ProductionAccessFilter) =>
        titlesOf(
          (
            await service.findAllProductions(1, 10, viewer, undefined, {
              behaviourType: ProductionBehaviourType.libre,
              access,
            })
          ).productions,
        );

      expect(await list()).toEqual(['Sin ticket', 'Ticket gratis', 'Ticket pago']);
      expect(await list(ProductionAccessFilter.free)).toEqual(['Sin ticket']);
      expect(await list(ProductionAccessFilter.freeTicket)).toEqual(['Ticket gratis']);
      expect(await list(ProductionAccessFilter.paidTicket)).toEqual(['Ticket pago']);
    });

    it('Todas: el radio filtra los libres ajenos, no la agenda ni los propios', async () => {
      const viewer = await createTestUser(models);
      const friend = await createTestUser(models);
      const other = await createTestUser(models);
      await relateUsers(models, viewer, friend, 'friends');
      await createBlog(other, 'Libre lejos');
      await createBlog(viewer, 'Mío libre');
      await createBlog(friend, 'Agenda de amigo', {
        visibility: ProductionVisibility.friends,
      });

      const far = await service.findAllProductions(1, 10, viewer, undefined, {
        userLocation: FAR,
      });
      expect(titlesOf(far.productions)).toEqual(['Agenda de amigo', 'Mío libre']);

      const near = await service.findAllProductions(1, 10, viewer, undefined, {
        userLocation: NEAR,
      });
      expect(titlesOf(near.productions)).toEqual([
        'Agenda de amigo',
        'Libre lejos',
        'Mío libre',
      ]);
    });
  });
});
