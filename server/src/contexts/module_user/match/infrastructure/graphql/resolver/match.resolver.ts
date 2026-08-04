import { Inject, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';

import { ClerkAuthGuardOptional } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard.optional';
import { CustomContextRequestInterface } from 'src/contexts/module_shared/auth/custom_request/custom.context.request.interface';
import { MatchServiceInterface } from '../../../domain/service/match.service.interface';
import { MatchResponse, SearchMatchRequest } from '../../../application/dto/match.dto';

@Resolver()
export class MatchResolver {
  constructor(
    @Inject('MatchServiceInterface')
    private readonly matchService: MatchServiceInterface,
  ) {}

  /**
   * Guard opcional: los anónimos pueden usar Match (consume de la cuota diaria
   * comunitaria, igual que el chat). Los resultados son siempre anuncios
   * públicos, así que no hay riesgo de exponer contenido de red.
   */
  @Mutation(() => MatchResponse, {
    description: 'Busca anuncios similares a partir de texto, imágenes o un anuncio',
  })
  @UseGuards(ClerkAuthGuardOptional)
  async searchMatch(
    @Args('input', { type: () => SearchMatchRequest })
    input: SearchMatchRequest,
    @Context() context?: { req: CustomContextRequestInterface },
  ): Promise<MatchResponse> {
    const userId = context?.req?.userRequestId;
    return this.matchService.searchMatch(userId, input);
  }
}
