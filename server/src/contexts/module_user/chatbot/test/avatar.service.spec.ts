import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { AvatarService } from '../application/service/avatar.service';
import { Avatar } from '../domain/entity/avatar.entity';
import { AvatarRepositoryInterface } from '../domain/repository/avatar.repository.interface';

const OWNER = 'user-1';
const OTHER = 'user-2';

const silentLogger: any = {
  log: () => undefined,
  warn: () => undefined,
  error: () => undefined,
};

/** Repositorio en memoria: los tests son de reglas de negocio, no de Mongo. */
class FakeAvatarRepository implements AvatarRepositoryInterface {
  avatars: Avatar[] = [];
  /** Simula el índice único (userId, name) de Mongo. */
  enforceUniqueName = true;

  async create(avatar: Avatar): Promise<Avatar> {
    this.failIfDuplicate(avatar.getUserId, avatar.getName);
    const id = `avatar-${this.avatars.length + 1}`;
    const saved = new Avatar(
      avatar.getUserId,
      avatar.getName,
      avatar.getContext,
      id,
      id,
    );
    this.avatars.push(saved);
    return saved;
  }

  async findByUserId(userId: string): Promise<Avatar[]> {
    return this.avatars.filter((avatar) => avatar.getUserId === userId);
  }

  async findById(avatarId: string): Promise<Avatar | null> {
    return this.avatars.find((avatar) => avatar.getId === avatarId) ?? null;
  }

  async countByUserId(userId: string): Promise<number> {
    return (await this.findByUserId(userId)).length;
  }

  async update(
    avatarId: string,
    changes: { name?: string; context?: string },
  ): Promise<Avatar | null> {
    const index = this.avatars.findIndex((a) => a.getId === avatarId);
    if (index < 0) return null;

    const current = this.avatars[index];
    if (changes.name && changes.name !== current.getName) {
      this.failIfDuplicate(current.getUserId, changes.name);
    }

    const updated = new Avatar(
      current.getUserId,
      changes.name ?? current.getName,
      changes.context ?? current.getContext,
      current.getSeed,
      current.getId,
    );
    this.avatars[index] = updated;
    return updated;
  }

  async delete(avatarId: string): Promise<boolean> {
    const before = this.avatars.length;
    this.avatars = this.avatars.filter((avatar) => avatar.getId !== avatarId);
    return this.avatars.length < before;
  }

  private failIfDuplicate(userId: string, name: string): void {
    if (!this.enforceUniqueName) return;
    const exists = this.avatars.some(
      (avatar) => avatar.getUserId === userId && avatar.getName === name,
    );
    if (exists) {
      const error: any = new Error('E11000 duplicate key error');
      error.code = 11000;
      throw error;
    }
  }
}

describe('AvatarService', () => {
  let repository: FakeAvatarRepository;
  let service: AvatarService;

  beforeEach(() => {
    repository = new FakeAvatarRepository();
    service = new AvatarService(repository, silentLogger);
    delete process.env.MAX_AVATARS_PER_USER;
  });

  describe('createAvatar', () => {
    it('crea el avatar y usa el _id como seed de la imagen', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Diseñador UX',
        context: 'Sos un experto en diseño',
      });

      expect(avatar.getUserId).toBe(OWNER);
      expect(avatar.getName).toBe('Diseñador UX');
      expect(avatar.getSeed).toBe(avatar.getId);
    });

    it('recorta espacios del nombre y del contexto', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: '  Marketing  ',
        context: '  Enfocate en campañas  ',
      });

      expect(avatar.getName).toBe('Marketing');
      expect(avatar.getContext).toBe('Enfocate en campañas');
    });

    it('rechaza nombre o contexto vacíos', async () => {
      await expect(
        service.createAvatar(OWNER, { name: '   ', context: 'algo' }),
      ).rejects.toBeInstanceOf(BadRequestException);

      await expect(
        service.createAvatar(OWNER, { name: 'Nombre', context: '   ' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('trunca el contexto al máximo permitido', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Largo',
        context: 'a'.repeat(1500),
      });

      expect(avatar.getContext).toHaveLength(1000);
    });

    it('traduce el nombre duplicado a un 409', async () => {
      await service.createAvatar(OWNER, { name: 'Repetido', context: 'x' });

      await expect(
        service.createAvatar(OWNER, { name: 'Repetido', context: 'y' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('permite el mismo nombre en usuarios distintos', async () => {
      await service.createAvatar(OWNER, { name: 'Ventas', context: 'x' });

      await expect(
        service.createAvatar(OTHER, { name: 'Ventas', context: 'y' }),
      ).resolves.toBeDefined();
    });

    it('corta al llegar al límite de avatares por usuario', async () => {
      process.env.MAX_AVATARS_PER_USER = '2';

      await service.createAvatar(OWNER, { name: 'Uno', context: 'x' });
      await service.createAvatar(OWNER, { name: 'Dos', context: 'x' });

      await expect(
        service.createAvatar(OWNER, { name: 'Tres', context: 'x' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('exige usuario autenticado', async () => {
      await expect(
        service.createAvatar('', { name: 'Uno', context: 'x' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('updateAvatar / deleteAvatar', () => {
    it('sólo el dueño puede editar', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Propio',
        context: 'x',
      });

      await expect(
        service.updateAvatar(OTHER, {
          avatarId: avatar.getId as string,
          name: 'Robado',
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('sólo el dueño puede eliminar', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Propio',
        context: 'x',
      });

      await expect(
        service.deleteAvatar(OTHER, avatar.getId as string),
      ).rejects.toBeInstanceOf(ForbiddenException);

      await expect(
        service.deleteAvatar(OWNER, avatar.getId as string),
      ).resolves.toBe(true);
    });

    it('falla con 404 si el avatar no existe', async () => {
      await expect(
        service.updateAvatar(OWNER, { avatarId: 'no-existe', name: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('actualiza sólo los campos enviados', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Original',
        context: 'contexto original',
      });

      const updated = await service.updateAvatar(OWNER, {
        avatarId: avatar.getId as string,
        context: 'contexto nuevo',
      });

      expect(updated.getName).toBe('Original');
      expect(updated.getContext).toBe('contexto nuevo');
    });
  });

  describe('resolveContextForUser', () => {
    it('devuelve el contexto del avatar propio', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Consultor',
        context: 'Respondé como consultor de ventas',
      });

      await expect(
        service.resolveContextForUser(avatar.getId as string, OWNER),
      ).resolves.toBe('Respondé como consultor de ventas');
    });

    it('ignora (sin romper el chat) un avatar de otro usuario', async () => {
      const avatar = await service.createAvatar(OWNER, {
        name: 'Ajeno',
        context: 'x',
      });

      await expect(
        service.resolveContextForUser(avatar.getId as string, OTHER),
      ).resolves.toBeUndefined();
    });

    it('ignora un avatarId inexistente o un usuario anónimo', async () => {
      await expect(
        service.resolveContextForUser('no-existe', OWNER),
      ).resolves.toBeUndefined();

      await expect(
        service.resolveContextForUser('cualquiera', undefined),
      ).resolves.toBeUndefined();
    });
  });
});
