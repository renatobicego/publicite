import { Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { ValuacionAdapterInterface } from '../../../application/adapter/valuacion.adapter.interface';
import {
  StartValuacionRequest,
  ValuacionMessageRequest,
} from '../../../application/dto/HTTP-REQUEST/valuacion.requests';
import {
  ValuacionListResponse,
  ValuacionMessageResponse,
  ValuacionResponse,
  ValuacionToPostDraftResponse,
} from '../../../application/dto/HTTP-RESPONSE/valuacion.response';

/**
 * Toda la valuación exige usuario autenticado: usa gpt-4o con visión, que es la
 * operación de IA más cara de la plataforma, y los anónimos no son limitables
 * de forma confiable.
 */
@Resolver()
@UseGuards(ClerkAuthGuard)
export class ValuacionResolver {
  constructor(
    @Inject('ValuacionAdapterInterface')
    private readonly valuacionAdapter: ValuacionAdapterInterface,
  ) {}

  @Mutation(() => ValuacionMessageResponse, {
    description: 'Inicia una valuación IA y devuelve el primer mensaje de Cubito',
  })
  async startValuacion(
    @Args('input', { type: () => StartValuacionRequest })
    input: StartValuacionRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionMessageResponse> {
    return this.valuacionAdapter.startValuacion(this.userId(context), input);
  }

  @Mutation(() => ValuacionMessageResponse, {
    description: 'Envía una respuesta del brief de valuación',
  })
  async sendValuacionMessage(
    @Args('input', { type: () => ValuacionMessageRequest })
    input: ValuacionMessageRequest,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionMessageResponse> {
    return this.valuacionAdapter.sendMessage(this.userId(context), input);
  }

  @Mutation(() => ValuacionMessageResponse, {
    description: 'Omite la pregunta actual del brief (baja la capa alcanzable)',
  })
  async skipValuacionBriefQuestion(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionMessageResponse> {
    return this.valuacionAdapter.skipBriefQuestion(
      this.userId(context),
      valuacionId,
    );
  }

  @Mutation(() => ValuacionResponse, {
    description: 'Genera el informe final de la valuación (sticker)',
  })
  async generateValuacionResult(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionResponse> {
    return this.valuacionAdapter.generateResult(
      this.userId(context),
      valuacionId,
    );
  }

  @Mutation(() => ValuacionResponse, {
    description: 'Acepta el resultado y lo mueve al panel derecho',
  })
  async saveValuacionResult(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionResponse> {
    return this.valuacionAdapter.saveResult(this.userId(context), valuacionId);
  }

  @Mutation(() => ValuacionResponse, {
    description: 'Devuelve un resultado guardado al tablero central para editarlo',
  })
  async restoreValuacionToBoard(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionResponse> {
    return this.valuacionAdapter.restoreToBoard(
      this.userId(context),
      valuacionId,
    );
  }

  @Mutation(() => ValuacionResponse, {
    description: 'Asocia la valuación a un anuncio existente',
  })
  async linkValuacionToPost(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Args('postId', { type: () => String }) postId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionResponse> {
    return this.valuacionAdapter.linkToPost(
      this.userId(context),
      valuacionId,
      postId,
    );
  }

  @Mutation(() => Boolean, {
    description: 'Elimina una valuación (borrado lógico: conserva el registro)',
  })
  async deleteValuacion(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<boolean> {
    return this.valuacionAdapter.deleteValuacion(
      this.userId(context),
      valuacionId,
    );
  }

  @Query(() => ValuacionListResponse, {
    description: 'Historial de valuaciones del usuario logueado',
  })
  async getUserValuaciones(
    @Context() context: { req: CustomContextRequestInterface },
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('page', { type: () => Int, nullable: true }) page?: number,
  ): Promise<ValuacionListResponse> {
    return this.valuacionAdapter.getUserValuaciones(
      this.userId(context),
      limit ?? 20,
      page ?? 1,
    );
  }

  @Query(() => ValuacionResponse, {
    description: 'Obtiene una valuación por id',
  })
  async getValuacion(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionResponse> {
    return this.valuacionAdapter.getValuacion(this.userId(context), valuacionId);
  }

  @Query(() => ValuacionResponse, {
    nullable: true,
    description: 'Valuación asociada a un anuncio (para la página del anuncio)',
  })
  async getValuacionByPost(
    @Args('postId', { type: () => String }) postId: string,
  ): Promise<ValuacionResponse | null> {
    return this.valuacionAdapter.getValuacionByPost(postId);
  }

  @Query(() => ValuacionToPostDraftResponse, {
    description:
      'Payload pre-cargado para abrir el wizard de creación de anuncio desde una valuación',
  })
  async getValuacionPostDraft(
    @Args('valuacionId', { type: () => String }) valuacionId: string,
    @Context() context: { req: CustomContextRequestInterface },
  ): Promise<ValuacionToPostDraftResponse> {
    return this.valuacionAdapter.buildPostDraft(
      this.userId(context),
      valuacionId,
    );
  }

  private userId(context: { req: CustomContextRequestInterface }): string {
    const userId = context?.req?.userRequestId;
    if (!userId) {
      throw new UnauthorizedException(
        'Necesitás iniciar sesión para usar la Valuación IA',
      );
    }
    return userId;
  }
}
