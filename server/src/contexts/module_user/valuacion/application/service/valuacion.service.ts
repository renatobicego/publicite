import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ValuacionServiceInterface } from '../../domain/service/valuacion.service.interface';
import { ValuacionRepositoryInterface } from '../../domain/repository/valuacion.repository.interface';
import {
  ValuacionAIServiceInterface,
  ValuacionComparable,
} from '../../domain/service/valuacion.ai.service.interface';
import { ChatbotTokenServiceInterface } from 'src/contexts/module_user/chatbot/domain/service/chatbot.token.service.interface';
import { PostRepositoryInterface } from 'src/contexts/module_post/post/domain/repository/post.repository.interface';
import { removeAccents_removeEmojisAndToLowerCase } from 'src/contexts/module_post/post/domain/utils/normalice.data';
import { MatchAIServiceInterface } from 'src/contexts/module_user/match/domain/service/match.ai.service.interface';
import { TokenGateResult } from 'src/contexts/module_user/chatbot/domain/entity/chatbot.token.types';
import { buildModeContext } from 'src/contexts/module_user/chatbot/domain/service/cubito-modes';
import {
  getMaxValuacionImages,
  sanitizeImageUrls,
} from 'src/contexts/module_shared/ai/ai.config';
import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';

import {
  StartValuacionRequest,
  ValuacionMessageRequest,
} from '../dto/HTTP-REQUEST/valuacion.requests';
import {
  ValuacionListResponse,
  ValuacionMessageResponse,
  ValuacionResponse,
  ValuacionToPostDraftResponse,
} from '../dto/HTTP-RESPONSE/valuacion.response';
import {
  ValuacionBriefField,
  ValuacionStatus,
  VALUACION_BRIEF_FIELDS,
} from '../../domain/entity/enum/valuacion.enums';
import {
  ValuacionBriefItem,
  ValuacionBriefMessage,
  ValuacionEntity,
} from '../../domain/entity/valuacion.entity';
import {
  capConfidenceByLayer,
  computeCompletion,
  computeCompletionFromItems,
  computeFinalScore,
} from '../../domain/service/valuacion.scoring';

const SALUDO_INICIAL =
  '¡Hola! ¡Comencemos! Contame qué querés valuar y te voy a hacer algunas preguntas para armar el informe 🙂';

/** Cuántos anuncios de la plataforma se usan como referencia en el informe. */
const COMPARABLES_LIMIT = 6;

/**
 * Tope duro de preguntas del brief. El "briefComplete" lo decide la IA, pero si
 * el modelo nunca lo marca (o sigue generando ítems "pendiente"), el brief
 * quedaría en un loop infinito y el botón "Generar Resultado" nunca aparece.
 * Pasado este número de respuestas del usuario, el backend fuerza el cierre del
 * brief para que siempre se pueda avanzar al informe.
 */
const MAX_BRIEF_USER_TURNS = 8;

function getMaxValuacionesPerDay(): number {
  const raw = Number(process.env.VALUACION_MAX_PER_DAY);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 10;
}

@Injectable()
export class ValuacionService implements ValuacionServiceInterface {
  constructor(
    @Inject('ValuacionRepositoryInterface')
    private readonly valuacionRepository: ValuacionRepositoryInterface,
    @Inject('ValuacionAIServiceInterface')
    private readonly valuacionAIService: ValuacionAIServiceInterface,
    @Inject('ChatbotTokenServiceInterface')
    private readonly tokenService: ChatbotTokenServiceInterface,
    @Inject('PostRepositoryInterface')
    private readonly postRepository: PostRepositoryInterface,
    @Inject('MatchAIServiceInterface')
    private readonly matchAIService: MatchAIServiceInterface,
    private readonly logger: MyLoggerService,
  ) {}

  async startValuacion(
    userId: string,
    request: StartValuacionRequest,
  ): Promise<ValuacionMessageResponse> {
    await this.assertDailyQuota(userId);

    const imageUrls = sanitizeImageUrls(
      request.imageUrls,
      getMaxValuacionImages(),
    );

    const now = new Date();
    const created = await this.valuacionRepository.create({
      userId,
      sessionId: request.sessionId,
      category: request.category,
      status: ValuacionStatus.draft,
      mode: request.mode,
      layer: 1,
      completionPercent: 0,
      confidencePercent: 0,
      coveredFields: [],
      briefMessages: [],
      briefAnswers: [],
      images: imageUrls.map((url) => ({ url, uploadedAt: now })),
      dataSources: [],
      versions: [],
    });

    // Sin descripción inicial no hay nada que analizar: se saluda y se espera al
    // usuario. Así no se gasta una llamada a OpenAI sólo para decir "hola".
    if (!request.description?.trim() && imageUrls.length === 0) {
      const withGreeting = await this.appendMessages(created._id!, [
        { role: 'assistant', content: SALUDO_INICIAL, timestamp: now },
      ]);
      return {
        reply: SALUDO_INICIAL,
        briefComplete: false,
        valuacion: this.toResponse(withGreeting ?? created),
      };
    }

    return this.runBriefTurn(
      userId,
      created,
      request.description?.trim() ||
        'Adjunté fotos de lo que quiero valuar. Decime qué ítem identificaste y arrancá el brief.',
    );
  }

  async sendMessage(
    userId: string,
    request: ValuacionMessageRequest,
  ): Promise<ValuacionMessageResponse> {
    const valuacion = await this.loadOwned(userId, request.valuacionId);
    this.assertEditable(valuacion);

    const newImages = sanitizeImageUrls(
      request.imageUrls,
      getMaxValuacionImages(),
    );

    let current = valuacion;
    if (newImages.length > 0) {
      const merged = this.mergeImages(valuacion, newImages, new Date());
      // Sólo se persiste si de verdad hay fotos nuevas: el front reenvía todas
      // las referencias en cada mensaje, y las repetidas ya se descartaron.
      if (merged.length !== valuacion.images.length) {
        current =
          (await this.valuacionRepository.update(valuacion._id!, {
            $set: { images: merged },
          })) ?? valuacion;
      }
    }

    return this.runBriefTurn(userId, current, request.message);
  }

  async skipBriefQuestion(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionMessageResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    this.assertEditable(valuacion);

    // Omitir no cubre el eje: baja la capa alcanzable, que es justo lo que pide
    // el AC08. Se manda como un mensaje más para que Cubito siga la conversación.
    return this.runBriefTurn(
      userId,
      valuacion,
      'Prefiero omitir esa pregunta, pasemos a la siguiente.',
    );
  }

  async generateResult(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (valuacion.status === ValuacionStatus.archived) {
      throw new BadRequestException('La valuación está archivada');
    }

    const gate = await this.tokenService.resolveAndCheck(userId, undefined);
    if (!gate.allowed) {
      throw new BadRequestException(this.tokenService.buildLimitMessage(gate));
    }

    await this.valuacionRepository.update(valuacionId, {
      $set: { status: ValuacionStatus.processing },
    });

    try {
      // Red de seguridad: una valuación vieja (o una foto cuyo análisis falló)
      // puede llegar acá sin notas. Se analiza ahora, una sola vez.
      const analyzed = await this.ensureImagesAnalyzed(valuacion, gate);
      const current = analyzed.valuacion;

      const comparables = await this.findComparables(current, gate);
      const result = await this.valuacionAIService.generateResult({
        category: current.category,
        modeContext: buildModeContext({ mode: current.mode }),
        title: current.title ?? null,
        history: current.briefMessages,
        imageNotes: this.collectImageNotes(current),
        comparables: comparables.comparables,
      });

      // La capa y la completitud son del backend; la confianza que declaró la IA
      // se acota al techo de la capa alcanzada.
      const completion = valuacion.briefItems.length
        ? computeCompletionFromItems(
            valuacion.briefItems,
            valuacion.images.length,
          )
        : computeCompletion(
            valuacion.coveredFields,
            valuacion.images.length,
            valuacion.notApplicableFields,
          );
      const confidencePercent = capConfidenceByLayer(
        result.confidencePercent,
        completion.layer,
      );
      const finalScore = computeFinalScore(
        result.photoAnalysis,
        result.descriptiveAnalysis,
      );

      // El gate se avanza con lo que ya consumió la búsqueda de comparables para
      // que el estado que ve el usuario incluya las dos llamadas, no sólo el informe.
      const tokenStatus = await this.tokenService.chargeAndBuildStatus(
        {
          ...gate,
          usedRealTokens:
            gate.usedRealTokens +
            analyzed.chargedRealTokens +
            comparables.chargedRealTokens,
        },
        result.usage,
        {
          sessionId: valuacion.sessionId,
          kind: 'valuacion',
          model: result.model,
        },
      );

      const changes: Record<string, any> = {
        $set: {
          status: ValuacionStatus.completed,
          layer: completion.layer,
          completionPercent: completion.completionPercent,
          confidencePercent,
          photoAnalysis: result.photoAnalysis,
          descriptiveAnalysis: result.descriptiveAnalysis,
          estimatedValues: result.estimatedValues,
          pricingRationale: result.pricingRationale,
          finalScore,
          dataSources: result.dataSources,
        },
      };

      // Si ya había un resultado, se archiva como versión antes de pisarlo.
      if (valuacion.finalScore != null || valuacion.estimatedValues) {
        changes.$push = {
          versions: {
            generatedAt: new Date(),
            layer: valuacion.layer,
            completionPercent: valuacion.completionPercent,
            confidencePercent: valuacion.confidencePercent,
            finalScore: valuacion.finalScore,
            photoAnalysis: valuacion.photoAnalysis,
            descriptiveAnalysis: valuacion.descriptiveAnalysis,
            estimatedValues: valuacion.estimatedValues,
          },
        };
      }

      const updated = await this.valuacionRepository.update(valuacionId, changes);
      if (!updated) throw new NotFoundException('Valuación no encontrada');

      return this.toResponse(updated, tokenStatus);
    } catch (error: any) {
      // No dejar la valuación colgada en 'processing' si la IA falló.
      await this.valuacionRepository.update(valuacionId, {
        $set: { status: valuacion.status },
      });
      this.logger.error(
        `Error generando resultado de valuación ${valuacionId}: ${error.message}`,
      );
      throw error;
    }
  }

  async saveResult(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (valuacion.status !== ValuacionStatus.completed) {
      throw new BadRequestException(
        'Sólo se pueden guardar valuaciones con un resultado generado',
      );
    }
    const updated = await this.valuacionRepository.update(valuacionId, {
      $set: { status: ValuacionStatus.saved },
    });
    return this.toResponse(updated!);
  }

  async restoreToBoard(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (valuacion.status !== ValuacionStatus.saved) {
      throw new BadRequestException(
        'Sólo se pueden devolver al tablero las valuaciones guardadas',
      );
    }
    // Ver un informe guardado es una acción de SÓLO LECTURA: no debe degradar el
    // estado. Antes esto pasaba la valuación de "saved" a "completed", y si el
    // usuario no volvía a guardar, desaparecía de la lista de guardadas (que
    // filtra por status === "saved"): para el usuario, "se borraba". Ahora la
    // devolvemos tal cual, sin tocar el status.
    return this.toResponse(valuacion);
  }

  async linkToPost(
    userId: string,
    valuacionId: string,
    postId: string,
  ): Promise<ValuacionResponse> {
    await this.loadOwned(userId, valuacionId);

    // No alcanza con ser dueño de la valuación: sin este chequeo, cualquiera
    // podría colgar su valuación del anuncio de otro y aparecer en su página.
    const isAuthor = await this.postRepository.isPostAuthor(postId, userId);
    if (!isAuthor) {
      throw new ForbiddenException(
        'Sólo podés asociar una valuación a un anuncio propio',
      );
    }

    const updated = await this.valuacionRepository.update(valuacionId, {
      $set: { postId },
    });
    if (!updated) throw new NotFoundException('Valuación no encontrada');
    return this.toResponse(updated);
  }

  async deleteValuacion(userId: string, valuacionId: string): Promise<boolean> {
    await this.loadOwned(userId, valuacionId);
    return this.valuacionRepository.softDelete(valuacionId);
  }

  async getUserValuaciones(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ValuacionListResponse> {
    const result = await this.valuacionRepository.findByUser(userId, limit, page);
    return {
      valuaciones: result.valuaciones.map((valuacion) =>
        this.toResponse(valuacion),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  async getValuacion(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    return this.toResponse(valuacion);
  }

  async getValuacionByPost(postId: string): Promise<ValuacionResponse | null> {
    const valuacion = await this.valuacionRepository.findByPostId(postId);
    return valuacion ? this.toResponse(valuacion) : null;
  }

  async buildPostDraft(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionToPostDraftResponse> {
    const valuacion = await this.loadOwned(userId, valuacionId);
    if (!valuacion.estimatedValues && !valuacion.photoAnalysis) {
      throw new BadRequestException(
        'Generá el resultado de la valuación antes de crear el anuncio',
      );
    }

    const photo = valuacion.photoAnalysis;
    // El título que armó la IA durante el brief identifica mejor el ítem que
    // concatenar marca+modelo (cubre servicios y objetos sin marca).
    const title =
      valuacion.title ||
      [photo?.brand, photo?.model].filter(Boolean).join(' ') ||
      photo?.description?.slice(0, 60) ||
      `Valuación ${valuacion.category}`;

    const descriptionParts = [
      photo?.description,
      valuacion.descriptiveAnalysis?.summary,
      photo?.condition ? `Estado: ${photo.condition}.` : null,
      photo?.damages?.length ? `Detalles: ${photo.damages.join(', ')}.` : null,
    ].filter(Boolean);

    return {
      title,
      description: descriptionParts.join('\n\n'),
      suggestedPrice: valuacion.estimatedValues?.mercado ?? null,
      imageUrls: valuacion.images.map((image) => {
        // Extract the UploadThing key from the full URL (e.g. https://utfs.io/f/KEY → KEY)
        const parts = image.url.split('/');
        return parts[parts.length - 1];
      }),
      brand: photo?.brand ?? null,
      modelType: photo?.model ?? null,
      condition: photo?.condition ?? null,
      valuacionId: valuacion._id!,
    };
  }

  // ─────────────────────────── internos ───────────────────────────

  /**
   * Ejecuta un turno del brief: cobra tokens, llama a la IA, actualiza el
   * checklist dinámico y recalcula capa y completitud.
   */
  private async runBriefTurn(
    userId: string,
    valuacion: ValuacionEntity,
    userMessage: string,
  ): Promise<ValuacionMessageResponse> {
    const gate = await this.tokenService.resolveAndCheck(
      userId,
      valuacion.sessionId,
    );
    if (!gate.allowed) {
      return this.buildLimitResponse(valuacion, gate);
    }

    // Las fotos nuevas se miran acá, una única vez. De este turno en adelante
    // el modelo recibe las notas guardadas, no los píxeles.
    const analyzed = await this.ensureImagesAnalyzed(valuacion, gate);
    const current = analyzed.valuacion;

    const turn = await this.valuacionAIService.runBriefTurn({
      category: current.category,
      modeContext: buildModeContext({ mode: current.mode }),
      title: current.title ?? null,
      briefItems: current.briefItems,
      history: current.briefMessages,
      userMessage,
      imageNotes: this.collectImageNotes(current),
    });

    const briefItems = this.mergeBriefItems(valuacion.briefItems, turn.briefItems);
    // Los ejes fijos legados se siguen derivando del checklist para no romper
    // consumidores viejos; la fuente de verdad ahora es briefItems.
    const coveredFields = this.mergeCoveredFields(
      valuacion.coveredFields,
      briefItems
        .filter((item) => item.status === 'cubierto')
        .map((item) => item.key),
    );
    const notApplicableFields = this.mergeCoveredFields(
      valuacion.notApplicableFields,
      briefItems
        .filter((item) => item.status === 'no_aplica')
        .map((item) => item.key),
    ).filter((field) => !coveredFields.includes(field));

    const completion = briefItems.length
      ? computeCompletionFromItems(briefItems, valuacion.images.length)
      : computeCompletion(
          coveredFields,
          valuacion.images.length,
          notApplicableFields,
        );

    // El "briefComplete" no puede quedar sólo en manos de la IA: si el modelo
    // nunca lo marca o sigue inventando ítems "pendiente", el brief entra en un
    // loop infinito y el usuario nunca puede generar el informe. El backend lo
    // fuerza de forma determinística cuando:
    //  (a) hay un checklist y ningún ítem quedó "pendiente" (todos resueltos), o
    //  (b) se alcanzó el tope de preguntas (MAX_BRIEF_USER_TURNS).
    // Este turno agrega una respuesta más del usuario, por eso el +1.
    const userTurns =
      valuacion.briefMessages.filter((message) => message.role === 'user')
        .length + 1;
    const hasChecklist = briefItems.length > 0;
    const noPendingItems =
      hasChecklist &&
      briefItems.every((item) => item.status !== 'pendiente');
    const reachedTurnCap = userTurns >= MAX_BRIEF_USER_TURNS;
    const briefComplete =
      turn.briefComplete || noPendingItems || reachedTurnCap;

    const tokenStatus = await this.tokenService.chargeAndBuildStatus(
      {
        ...gate,
        usedRealTokens: gate.usedRealTokens + analyzed.chargedRealTokens,
      },
      turn.usage,
      {
        sessionId: valuacion.sessionId,
        kind: 'valuacion',
        model: turn.model,
      },
    );

    // Si el cierre lo forzó el backend (tope de turnos) pero la IA seguía
    // preguntando, reemplazamos su reply por una confirmación de cierre para no
    // mostrarle al usuario otra pregunta después de decirle que ya está listo.
    const reply =
      briefComplete && !turn.briefComplete && reachedTurnCap
        ? 'Ya tengo suficiente información para armar tu informe. Generá el resultado cuando quieras 🙂'
        : turn.reply;

    const now = new Date();
    const changes: Record<string, any> = {
      $set: {
        briefItems,
        coveredFields,
        notApplicableFields,
        layer: completion.layer,
        completionPercent: completion.completionPercent,
      },
      $push: {
        briefMessages: {
          $each: [
            { role: 'user', content: userMessage, timestamp: now },
            { role: 'assistant', content: reply, timestamp: now },
          ],
        },
      },
    };
    // El título nuevo no pisa uno existente con null: sólo se actualiza si vino.
    if (turn.title) {
      changes.$set.title = turn.title.slice(0, 120);
    }

    const updated = await this.valuacionRepository.update(valuacion._id!, changes);

    return {
      reply,
      briefComplete,
      valuacion: this.toResponse(updated ?? valuacion, tokenStatus),
    };
  }

  /**
   * Une el checklist guardado con el que devolvió la IA. El de la IA manda
   * (trae los estados nuevos), pero un ítem guardado que la IA olvidó devolver
   * no se pierde: se conserva con su último estado conocido.
   */
  private mergeBriefItems(
    current: ValuacionBriefItem[],
    incoming: ValuacionBriefItem[],
  ): ValuacionBriefItem[] {
    if (!incoming?.length) return current ?? [];
    const seen = new Set(incoming.map((item) => item.key));
    const missing = (current ?? []).filter((item) => !seen.has(item.key));
    return [...incoming, ...missing];
  }

  /**
   * Analiza las fotos que todavía no tienen notas y las persiste.
   *
   * Es el corazón del "una sola vez": antes cada turno del brief re-adjuntaba
   * TODAS las imágenes de la valuación, así que un brief de 8 preguntas con 3
   * fotos pagaba 24 análisis visuales (más otros 3 en el informe) para mirar
   * siempre las mismas fotos. Ahora los píxeles se miran una vez por imagen y lo
   * que viaja después es el texto que quedó en images[].analysisNotes.
   *
   * Nunca puede romper el turno: si el análisis falla se sigue sin las notas de
   * esas fotos, que es peor informe pero no una conversación caída.
   */
  private async ensureImagesAnalyzed(
    valuacion: ValuacionEntity,
    gate: TokenGateResult,
  ): Promise<{ valuacion: ValuacionEntity; chargedRealTokens: number }> {
    const pending = valuacion.images.filter(
      (image) => !image.analysisNotes?.trim(),
    );
    if (pending.length === 0) return { valuacion, chargedRealTokens: 0 };

    try {
      const analysis = await this.valuacionAIService.analyzeImages({
        category: valuacion.category,
        title: valuacion.title ?? null,
        imageUrls: pending.map((image) => image.url),
      });

      const notesByUrl = new Map(
        analysis.notes.map((entry) => [entry.url, entry.notes]),
      );
      const images = valuacion.images.map((image) => {
        const notes = notesByUrl.get(image.url);
        return notes ? { ...image, analysisNotes: notes } : image;
      });

      const chargedRealTokens = analysis.usage
        ? await this.tokenService.recordUsage(gate, analysis.usage, {
            sessionId: valuacion.sessionId,
            channel: 'web',
            kind: 'valuacion',
            model: analysis.model,
          })
        : 0;

      const updated = await this.valuacionRepository.update(valuacion._id!, {
        $set: { images },
      });

      return { valuacion: updated ?? valuacion, chargedRealTokens };
    } catch (error: any) {
      this.logger.error(
        `No se pudieron analizar las fotos de la valuación ${valuacion._id}: ${error.message}`,
      );
      return { valuacion, chargedRealTokens: 0 };
    }
  }

  /** Notas de las fotos ya analizadas, en el orden en que se cargaron. */
  private collectImageNotes(valuacion: ValuacionEntity): string[] {
    return valuacion.images
      .map((image) => image.analysisNotes?.trim())
      .filter((notes): notes is string => !!notes);
  }

  /**
   * Busca anuncios reales de la plataforma parecidos a lo que se está valuando,
   * para que el informe se apoye en el mercado propio en vez de estimar de memoria.
   *
   * Reutiliza el extractor de criterios de Match (modelo barato) en vez de duplicar
   * la lógica. Nunca puede romper la generación del informe: ante cualquier fallo
   * se sigue sin comparables, que es exactamente el comportamiento anterior.
   *
   * Devuelve también lo cobrado, porque la extracción es una llamada más a OpenAI
   * y tiene que impactar en la cuota igual que las demás.
   */
  private async findComparables(
    valuacion: ValuacionEntity,
    gate: TokenGateResult,
  ): Promise<{ comparables: ValuacionComparable[]; chargedRealTokens: number }> {
    const empty = { comparables: [], chargedRealTokens: 0 };

    const briefText = valuacion.briefMessages
      .filter((message) => message.role === 'user')
      .map((message) => message.content)
      .join('. ')
      .slice(0, 1500);

    if (!briefText.trim()) return empty;

    try {
      const criteria = await this.matchAIService.extractCriteria({
        text: briefText,
        imageUrls: [],
      });

      const chargedRealTokens = criteria.usage
        ? await this.tokenService.recordUsage(gate, criteria.usage, {
            sessionId: valuacion.sessionId,
            channel: 'web',
            kind: 'valuacion',
            model: criteria.model,
          })
        : 0;

      const keywords = criteria.keywords
        .map((keyword) => removeAccents_removeEmojisAndToLowerCase(keyword))
        .filter(Boolean);

      const categoryIds = criteria.categories.length
        ? await this.postRepository.findCategoryIdsByLabels(criteria.categories)
        : [];

      const candidates = await this.postRepository.findCandidatesForMatch({
        keywords,
        categoryIds,
        // Sin filtro de precio a propósito: el brief habla en la moneda que se le
        // ocurra al usuario y los anuncios están en ARS; cruzarlos descartaría
        // comparables buenos por una comparación entre unidades distintas.
        priceMin: null,
        priceMax: null,
        postType: criteria.postType,
        excludeAuthorId: valuacion.userId,
        limit: COMPARABLES_LIMIT,
      });

      return {
        // Los anuncios con precio 0 o negativo son borradores o placeholders:
        // como referencia de mercado sólo aportarían ruido.
        comparables: candidates
          .filter((candidate) => candidate.price > 0)
          .map((candidate) => ({
            title: candidate.title,
            price: candidate.price,
            postType: candidate.postType,
            categoryLabels: candidate.categoryLabels,
          })),
        chargedRealTokens,
      };
    } catch (error: any) {
      this.logger.error(
        `No se pudieron buscar comparables para la valuación ${valuacion._id}: ${error.message}`,
      );
      return empty;
    }
  }

  private async appendMessages(
    valuacionId: string,
    messages: ValuacionBriefMessage[],
  ): Promise<ValuacionEntity | null> {
    return this.valuacionRepository.update(valuacionId, {
      $push: { briefMessages: { $each: messages } },
    });
  }

  /** Une los ejes ya cubiertos con los que reportó la IA, descartando inventados. */
  private mergeCoveredFields(
    current: ValuacionBriefField[],
    incoming: string[],
  ): ValuacionBriefField[] {
    const merged = new Set<ValuacionBriefField>(current ?? []);
    for (const field of incoming ?? []) {
      const normalized = field?.trim() as ValuacionBriefField;
      if (VALUACION_BRIEF_FIELDS.includes(normalized)) {
        merged.add(normalized);
      }
    }
    return Array.from(merged);
  }

  private mergeImages(
    valuacion: ValuacionEntity,
    newUrls: string[],
    now: Date,
  ) {
    const existing = new Set(valuacion.images.map((image) => image.url));
    const additions = newUrls
      .filter((url) => !existing.has(url))
      .map((url) => ({ url, uploadedAt: now }));
    return [...valuacion.images, ...additions].slice(
      0,
      getMaxValuacionImages(),
    );
  }

  private async loadOwned(
    userId: string,
    valuacionId: string,
  ): Promise<ValuacionEntity> {
    const valuacion = await this.valuacionRepository.findById(valuacionId);
    if (!valuacion) throw new NotFoundException('Valuación no encontrada');
    if (valuacion.userId !== userId) {
      throw new ForbiddenException('La valuación pertenece a otro usuario');
    }
    return valuacion;
  }

  private assertEditable(valuacion: ValuacionEntity): void {
    if (
      valuacion.status === ValuacionStatus.archived ||
      valuacion.status === ValuacionStatus.processing
    ) {
      throw new BadRequestException(
        'La valuación no admite cambios en este estado',
      );
    }
  }

  private async assertDailyQuota(userId: string): Promise<void> {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    const count = await this.valuacionRepository.countCreatedSince(userId, since);
    const max = getMaxValuacionesPerDay();
    if (count >= max) {
      throw new BadRequestException(
        `Alcanzaste el máximo de ${max} valuaciones por día. Probá de nuevo mañana 🙂`,
      );
    }
  }

  private buildLimitResponse(
    valuacion: ValuacionEntity,
    gate: TokenGateResult,
  ): ValuacionMessageResponse {
    return {
      reply: this.tokenService.buildLimitMessage(gate),
      briefComplete: false,
      limitReached: true,
      valuacion: this.toResponse(
        valuacion,
        this.tokenService.buildStatusFromGate(gate),
      ),
    };
  }

  private toResponse(
    valuacion: ValuacionEntity,
    tokenStatus?: any,
  ): ValuacionResponse {
    return {
      id: valuacion._id!,
      userId: valuacion.userId,
      sessionId: valuacion.sessionId,
      postId: valuacion.postId ?? null,
      category: valuacion.category,
      status: valuacion.status,
      mode: valuacion.mode,
      title: valuacion.title ?? null,
      layer: valuacion.layer,
      completionPercent: valuacion.completionPercent,
      confidencePercent: valuacion.confidencePercent,
      coveredFields: valuacion.coveredFields ?? [],
      briefItems: valuacion.briefItems ?? [],
      briefMessages: valuacion.briefMessages ?? [],
      images: valuacion.images ?? [],
      photoAnalysis: (valuacion.photoAnalysis as any) ?? null,
      descriptiveAnalysis: (valuacion.descriptiveAnalysis as any) ?? null,
      estimatedValues: (valuacion.estimatedValues as any) ?? null,
      pricingRationale: valuacion.pricingRationale ?? null,
      finalScore: valuacion.finalScore ?? null,
      dataSources: valuacion.dataSources ?? [],
      versionsCount: valuacion.versions?.length ?? 0,
      createdAt: valuacion.createdAt,
      updatedAt: valuacion.updatedAt,
      tokenStatus,
    };
  }
}
