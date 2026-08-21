import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Avatar } from '../../domain/entity/avatar.entity';
import { AvatarRepositoryInterface } from '../../domain/repository/avatar.repository.interface';
import { AvatarServiceInterface } from '../../domain/service/avatar.service.interface';
import { CreateAvatarRequest } from '../dto/HTTP-REQUEST/create.avatar.request';
import { UpdateAvatarRequest } from '../dto/HTTP-REQUEST/update.avatar.request';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

const NAME_MAX_LENGTH = 60;
const CONTEXT_MAX_LENGTH = 1000;
const DEFAULT_MAX_AVATARS = 10;

@Injectable()
export class AvatarService implements AvatarServiceInterface {
  constructor(
    @Inject('AvatarRepositoryInterface')
    private readonly avatarRepository: AvatarRepositoryInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async getUserAvatars(userId: string): Promise<Avatar[]> {
    this.requireUser(userId);
    return await this.avatarRepository.findByUserId(userId);
  }

  async createAvatar(
    userId: string,
    input: CreateAvatarRequest,
  ): Promise<Avatar> {
    this.requireUser(userId);

    const name = this.cleanName(input.name);
    const context = this.cleanContext(input.context);

    const total = await this.avatarRepository.countByUserId(userId);
    if (total >= this.maxAvatarsPerUser()) {
      throw new BadRequestException(
        `Llegaste al máximo de ${this.maxAvatarsPerUser()} avatares. Eliminá uno para crear otro.`,
      );
    }

    try {
      // El seed lo asigna el repositorio con el _id del nuevo documento.
      const created = await this.avatarRepository.create(
        new Avatar(userId, name, context, ''),
      );
      this.logger.log(`Avatar creado (${created.getId}) por el usuario ${userId}`);
      return created;
    } catch (error: any) {
      throw this.mapDuplicateName(error);
    }
  }

  async updateAvatar(
    userId: string,
    input: UpdateAvatarRequest,
  ): Promise<Avatar> {
    this.requireUser(userId);

    const avatar = await this.findOwned(input.avatarId, userId);

    const changes: { name?: string; context?: string } = {};
    if (input.name !== undefined) changes.name = this.cleanName(input.name);
    if (input.context !== undefined) {
      changes.context = this.cleanContext(input.context);
    }

    if (Object.keys(changes).length <= 0) return avatar;

    try {
      const updated = await this.avatarRepository.update(
        input.avatarId,
        changes,
      );
      if (!updated) throw new NotFoundException('Avatar no encontrado');
      return updated;
    } catch (error: any) {
      throw this.mapDuplicateName(error);
    }
  }

  async deleteAvatar(userId: string, avatarId: string): Promise<boolean> {
    this.requireUser(userId);
    await this.findOwned(avatarId, userId);
    return await this.avatarRepository.delete(avatarId);
  }

  /**
   * Resuelve el contexto de un avatar para inyectarlo en el chat.
   *
   * A diferencia del CRUD, acá un avatar ajeno o inexistente no rompe la
   * conversación: se ignora y el chat sigue en modo general. El mensaje del
   * usuario no se pierde por un avatarId viejo en el sessionStorage.
   */
  async resolveContextForUser(
    avatarId: string,
    userId?: string,
  ): Promise<string | undefined> {
    if (!avatarId || !userId) return undefined;

    const avatar = await this.avatarRepository.findById(avatarId);
    if (!avatar) {
      this.logger.warn(`Avatar ${avatarId} no encontrado, se ignora`);
      return undefined;
    }
    if (!avatar.belongsTo(userId)) {
      this.logger.warn(
        `Avatar ${avatarId} no pertenece al usuario ${userId}, se ignora`,
      );
      return undefined;
    }
    return avatar.getContext;
  }

  private async findOwned(avatarId: string, userId: string): Promise<Avatar> {
    const avatar = await this.avatarRepository.findById(avatarId);
    if (!avatar) {
      throw new NotFoundException('Avatar no encontrado');
    }
    if (!avatar.belongsTo(userId)) {
      throw new ForbiddenException('Este avatar no te pertenece');
    }
    return avatar;
  }

  private requireUser(userId?: string): void {
    if (!userId) {
      throw new ForbiddenException('Necesitás iniciar sesión');
    }
  }

  private cleanName(name: string): string {
    const clean = (name ?? '').trim();
    if (!clean) {
      throw new BadRequestException('El nombre del avatar es obligatorio');
    }
    return clean.slice(0, NAME_MAX_LENGTH);
  }

  private cleanContext(context: string): string {
    const clean = (context ?? '').trim();
    if (!clean) {
      throw new BadRequestException('El contexto del avatar es obligatorio');
    }
    return clean.slice(0, CONTEXT_MAX_LENGTH);
  }

  private maxAvatarsPerUser(): number {
    const configured = Number(process.env.MAX_AVATARS_PER_USER);
    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_MAX_AVATARS;
  }

  /** El índice único (userId, name) devuelve 11000; lo traducimos a 409. */
  private mapDuplicateName(error: any): any {
    if (error?.code === 11000) {
      return new ConflictException('Ya tenés un avatar con ese nombre');
    }
    return error;
  }
}
