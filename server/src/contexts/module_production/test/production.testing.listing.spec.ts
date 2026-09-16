import { TestingModule } from '@nestjs/testing';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestGroup,
  createTestUser,
  getProductionTestModels,
  givePlanToUser,
  ProductionTestModels,
  relateUsers,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import { ProductionModerationStatus, ProductionRole } from '../production/domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

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
    extra: { visibility?: Visibility; description?: string; groupId?: string } = {},
  ) => (await service.createProduction({ title, ...extra }, userId))._id;

  const titlesOf = (list: { title: string }[]) =>
    list.map((p) => p.title).sort();

  it('sin sesión sólo lista lo público (NAV-02)', async () => {
    const ownerA = await createTestUser(models);
    const ownerB = await createTestUser(models);
    await createBlog(ownerA, 'Público');
    await createBlog(ownerB, 'Registrados', { visibility: Visibility.registered });

    const { productions } = await service.findAllProductions(1, 10);
    expect(titlesOf(productions)).toEqual(['Público']);
  });

  it('con sesión amplía según registro, agenda y propiedad (VIS-01)', async () => {
    const viewer = await createTestUser(models);
    const friend = await createTestUser(models);
    const stranger = await createTestUser(models);
    await relateUsers(models, viewer, friend, 'friends');

    await createBlog(friend, 'De amigo', { visibility: Visibility.friends });
    await createBlog(stranger, 'Top ajeno', { visibility: Visibility.topfriends });
    await createBlog(viewer, 'Mío privado', {
      visibility: Visibility.topfriends,
    });
    const anotherOwner = await createTestUser(models);
    await createBlog(anotherOwner, 'Registrados', {
      visibility: Visibility.registered,
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
    await createBlog(owner, 'Para amigos', { visibility: Visibility.friends });

    const { productions } = await service.findAllProductions(1, 10, viewer);
    expect(productions).toHaveLength(0);
  });

  it('excluye los blogs con clave y los moderados del listado global', async () => {
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

    const { productions } = await service.findAllProductions(1, 10);
    expect(productions).toHaveLength(0);

    // En el cartel del dueño el blog con clave sí aparece, para ingresarla.
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
      visibility: Visibility.topfriends,
    });

    const asMember = await service.findAllProductions(1, 10, member);
    expect(asMember.productions.map((p) => p.title)).toEqual(['Blog del grupo']);
    expect(asMember.productions[0].viewer.role).toBe(ProductionRole.viewer);

    const asOutsider = await service.findAllProductions(1, 10, outsider);
    expect(asOutsider.productions).toHaveLength(0);
  });
});
