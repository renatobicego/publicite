import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

import mapModuleTesting from './production.test.module';
import {
  cleanProductionTestData,
  createTestUser,
  findDoc,
  getProductionTestModels,
  ProductionTestModels,
  relateUsers,
} from './production.test.helpers';
import { ProductionService } from '../production/application/service/production.service';
import {
  ProductionFileType,
  ProductionLockReason,
} from '../production/domain/entity/enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

describe('Mis Producciones - Fase 3: visibilidad y acceso por clave', () => {
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
    delete process.env.PRODUCTION_ACCESS_KEY_MAX_ATTEMPTS;
    await cleanProductionTestData(models);
  });

  /** Blog con carpeta "Amigos" (friends) que contiene una foto y una subcarpeta pública. */
  const buildTree = async (ownerId: string) => {
    const { _id: productionId } = await service.createProduction(
      { title: 'Blog con alcance' },
      ownerId,
    );
    const friendsFolder = await service.createFolder(
      { productionId, name: 'Amigos', visibility: Visibility.friends },
      ownerId,
    );
    const photo = await service.uploadFile(
      {
        productionId,
        parentId: friendsFolder._id,
        fileType: ProductionFileType.photo,
        key: 'key-amigos',
      },
      ownerId,
    );
    const publicSub = await service.createFolder(
      {
        productionId,
        parentId: friendsFolder._id,
        name: 'Abierta',
        visibility: Visibility.public,
      },
      ownerId,
    );
    return { productionId, friendsFolder, photo, publicSub };
  };

  describe('Herencia y override (VIS-03/04)', () => {
    it('los hijos heredan el alcance de la carpeta y el override lo reemplaza', async () => {
      const owner = await createTestUser(models);
      const friend = await createTestUser(models);
      const stranger = await createTestUser(models);
      await relateUsers(models, friend, owner, 'friends');
      const { productionId, friendsFolder, photo, publicSub } = await buildTree(owner);

      // El extraño no ve la carpeta de amigos en la raíz...
      const strangerRoot = await service.getProductionItems(productionId, undefined, stranger);
      expect(strangerRoot.items).toHaveLength(0);
      // ...ni puede entrar a ella ni a su foto.
      await expect(
        service.getProductionItems(productionId, friendsFolder._id, stranger),
      ).rejects.toBeInstanceOf(NotFoundException);
      await expect(
        service.getProductionItemById(photo._id, stranger),
      ).rejects.toBeInstanceOf(NotFoundException);
      // La subcarpeta con alcance propio público sí es visible.
      const openFolder = await service.getProductionItemById(publicSub._id, stranger);
      expect(openFolder.effectiveVisibility).toBe(Visibility.public);

      // El amigo ve todo y la foto hereda "friends".
      const friendLevel = await service.getProductionItems(
        productionId,
        friendsFolder._id,
        friend,
      );
      const friendPhoto = friendLevel.items.find((i) => i._id === photo._id)!;
      expect(friendPhoto.visibility).toBeNull();
      expect(friendPhoto.effectiveVisibility).toBe(Visibility.friends);
      expect(friendPhoto.key).toBe('key-amigos');
    });

    it('quitar el override vuelve a heredar', async () => {
      const owner = await createTestUser(models);
      const stranger = await createTestUser(models);
      const { publicSub } = await buildTree(owner);

      const updated = await service.setProductionItemVisibility(
        publicSub._id,
        null,
        owner,
      );
      expect(updated.visibility).toBeNull();
      expect(updated.effectiveVisibility).toBe(Visibility.friends);
      await expect(
        service.getProductionItemById(publicSub._id, stranger),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('el alcance del blog aplica a lo que no define uno propio (VIS-01)', async () => {
      const owner = await createTestUser(models);
      const visitor = await createTestUser(models);
      const { _id: productionId } = await service.createProduction(
        { title: 'Blog' },
        owner,
      );
      const photo = await service.uploadFile(
        { productionId, fileType: ProductionFileType.photo, key: 'k' },
        owner,
      );

      await service.setProductionVisibility(productionId, Visibility.contacts, owner);

      await expect(service.findProductionById(productionId, visitor)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await relateUsers(models, visitor, owner, 'contacts');
      const item = await service.getProductionItemById(photo._id, visitor);
      expect(item.effectiveVisibility).toBe(Visibility.contacts);
    });

    it('sólo el staff cambia el alcance', async () => {
      const owner = await createTestUser(models);
      const other = await createTestUser(models);
      const { productionId, photo } = await buildTree(owner);
      await expect(
        service.setProductionVisibility(productionId, Visibility.public, other),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.setProductionItemVisibility(photo._id, Visibility.public, other),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('Acceso por clave (INV-01/02, VIS-05, RNF-13)', () => {
    const setupKeyBlog = async () => {
      const owner = await createTestUser(models);
      const tree = await buildTree(owner);
      await service.setProductionAccessKey(tree.productionId, 'clave-secreta', owner);
      return { owner, ...tree };
    };

    it('guarda sólo el hash y bloquea el contenido sin la clave', async () => {
      const { productionId } = await setupKeyBlog();
      const visitor = await createTestUser(models);

      const stored = await findDoc(models.production, productionId);
      expect(stored.accessKeyHash).toMatch(/^scrypt\$/);
      expect(stored.accessKeyHash).not.toContain('clave-secreta');

      const locked = await service.getProductionItems(productionId, undefined, visitor);
      expect(locked.production.hasAccessKey).toBe(true);
      expect(locked.production.viewer.canViewContent).toBe(false);
      expect(locked.production.viewer.lockReason).toBe(ProductionLockReason.accessKey);
      expect(locked.items).toHaveLength(0);
      expect(JSON.stringify(locked)).not.toContain('scrypt');
    });

    it('la clave reemplaza al alcance: con clave se ve aunque sea sólo para amigos', async () => {
      const { productionId, friendsFolder, photo } = await setupKeyBlog();
      const stranger = await createTestUser(models);

      const unlocked = await service.unlockProductionWithKey(
        productionId,
        'clave-secreta',
        stranger,
      );
      expect(unlocked.viewer.canViewContent).toBe(true);

      // Queda habilitado sin volver a mandar la clave.
      const level = await service.getProductionItems(
        productionId,
        friendsFolder._id,
        stranger,
      );
      expect(level.items.map((i) => i._id)).toContain(photo._id);
      const detail = await service.getProductionItemById(photo._id, stranger);
      expect(detail.key).toBe('key-amigos');
    });

    it('también acepta la clave en la lectura, y exige sesión', async () => {
      const { productionId } = await setupKeyBlog();
      const visitor = await createTestUser(models);

      const withKey = await service.findProductionById(
        productionId,
        visitor,
        'clave-secreta',
      );
      expect(withKey.viewer.canViewContent).toBe(true);

      const anonymous = await service.findProductionById(
        productionId,
        undefined,
        'clave-secreta',
      );
      expect(anonymous.viewer.canViewContent).toBe(false);
      await expect(
        service.unlockProductionWithKey(productionId, 'clave-secreta', undefined),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rechaza una clave incorrecta', async () => {
      const { productionId } = await setupKeyBlog();
      const visitor = await createTestUser(models);
      await expect(
        service.unlockProductionWithKey(productionId, 'otra-clave', visitor),
      ).rejects.toBeInstanceOf(BadRequestException);
      const view = await service.findProductionById(productionId, visitor);
      expect(view.viewer.canViewContent).toBe(false);
    });

    it('bloquea tras varios intentos fallidos, aun con la clave correcta', async () => {
      process.env.PRODUCTION_ACCESS_KEY_MAX_ATTEMPTS = '3';
      const { productionId } = await setupKeyBlog();
      const attacker = await createTestUser(models);

      for (let i = 0; i < 2; i++) {
        await expect(
          service.unlockProductionWithKey(productionId, `intento-${i}`, attacker),
        ).rejects.toBeInstanceOf(BadRequestException);
      }
      await expect(
        service.unlockProductionWithKey(productionId, 'intento-3', attacker),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.unlockProductionWithKey(productionId, 'clave-secreta', attacker),
      ).rejects.toBeInstanceOf(ForbiddenException);

      // El bloqueo es por usuario: otro visitante sigue pudiendo entrar.
      const other = await createTestUser(models);
      await expect(
        service.unlockProductionWithKey(productionId, 'clave-secreta', other),
      ).resolves.toBeDefined();
    });

    it('cambiar la clave invalida los accesos y quitarla abre el blog', async () => {
      const { owner, productionId } = await setupKeyBlog();
      const visitor = await createTestUser(models);
      await service.unlockProductionWithKey(productionId, 'clave-secreta', visitor);

      await service.setProductionAccessKey(productionId, 'clave-nueva', owner);
      let view = await service.findProductionById(productionId, visitor);
      expect(view.viewer.canViewContent).toBe(false);

      await service.setProductionAccessKey(productionId, null, owner);
      view = await service.findProductionById(productionId, visitor);
      expect(view.hasAccessKey).toBe(false);
      expect(view.viewer.canViewContent).toBe(true);
    });

    it('el dueño no necesita la clave y un visitante no puede cambiarla', async () => {
      const { owner, productionId } = await setupKeyBlog();
      const visitor = await createTestUser(models);

      const asOwner = await service.getProductionItems(productionId, undefined, owner);
      expect(asOwner.items.length).toBeGreaterThan(0);

      await expect(
        service.setProductionAccessKey(productionId, null, visitor),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(
        service.setProductionAccessKey(productionId, 'abc', owner),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('borrar el blog borra los accesos otorgados', async () => {
      const { owner, productionId } = await setupKeyBlog();
      const visitor = await createTestUser(models);
      await service.unlockProductionWithKey(productionId, 'clave-secreta', visitor);
      expect(
        await models.connection.collection('productionaccessgrants').countDocuments(),
      ).toBe(1);

      await service.deleteProduction(productionId, owner);
      expect(
        await models.connection.collection('productionaccessgrants').countDocuments(),
      ).toBe(0);
    });
  });
});
