import { ObjectId } from 'mongoose';
import { SubscriptionPlanResponse } from 'src/contexts/module_webhook/mercadopago/application/adapter/HTTP-RESPONSE/SubscriptionPlan.response';
import { getPlanNetPubliciteTokens } from 'src/contexts/module_shared/chatbot-tokens/chatbot.tokens.config';

export class SubscriptionPlan {
  private _id: ObjectId;
  private mpPreapprovalPlanId: string;
  private isActive: boolean;
  private reason: string;
  private description: string;
  private features: string[];
  private intervalTime: number;
  private price: number;
  private isFree: boolean;
  private postsLibresCount: number;
  private postsAgendaCount: number;
  private isPack: boolean;
  // Mis Producciones (RNF-06). Opcionales: los planes creados antes de MP no los
  // tienen cargados y caen al piso gratuito (ver production.limits.config.ts).
  private personalBlogsCount?: number;
  private groupBlogsCount?: number;
  private filesPerBlogCount?: number;

  constructor(
    _id: ObjectId,
    mpPreapprovalPlanId: string,
    isActive: boolean,
    reason: string,
    description: string,
    features: string[],
    intervalTime: number,
    price: number,
    isFree: boolean,
    postsLibresCount: number,
    postsAgendaCount: number,
    isPack: boolean,
    personalBlogsCount?: number,
    groupBlogsCount?: number,
    filesPerBlogCount?: number,
  ) {
    this._id = _id;
    this.mpPreapprovalPlanId = mpPreapprovalPlanId;
    this.isActive = isActive;
    this.reason = reason;
    this.description = description;
    this.features = features;
    this.intervalTime = intervalTime;
    this.price = price;
    this.isFree = isFree;
    this.postsLibresCount = postsLibresCount;
    this.postsAgendaCount = postsAgendaCount;
    this.isPack = isPack;
    this.personalBlogsCount = personalBlogsCount;
    this.groupBlogsCount = groupBlogsCount;
    this.filesPerBlogCount = filesPerBlogCount;
  }

  public getId(): ObjectId {
    return this._id;
  }
  public getMpPreapprovalPlanId(): string {
    return this.mpPreapprovalPlanId;
  }
  public getDescription(): string {
    return this.description;
  }
  public getFeatures(): string[] {
    return this.features;
  }
  public getIntervalTime(): number {
    return this.intervalTime;
  }
  public getPrice(): number {
    return this.price;
  }
  public getIsActive(): boolean {
    return this.isActive;
  }
  public getReason(): string {
    return this.reason;
  }
  public getIsFree(): boolean {
    return this.isFree;
  }

  public getPostsLibresCount(): number {
    return this.postsLibresCount;
  }

  public getPostsAgendaCount(): number {
    return this.postsAgendaCount;
  }

  public getIsPack(): boolean {
    return this.isPack;
  }

  public getPersonalBlogsCount(): number | undefined {
    return this.personalBlogsCount;
  }

  public getGroupBlogsCount(): number | undefined {
    return this.groupBlogsCount;
  }

  public getFilesPerBlogCount(): number | undefined {
    return this.filesPerBlogCount;
  }

  static fromDocument(doc: any): SubscriptionPlan {
    return new SubscriptionPlan(
      doc._id ? doc._id : '',
      doc.mpPreapprovalPlanId,
      doc.isActive,
      doc.reason,
      doc.description,
      doc.features,
      doc.intervalTime,
      doc.price,
      doc.isFree,
      doc.postsLibresCount,
      doc.postsAgendaCount,
      doc.isPack,
      doc.personalBlogsCount,
      doc.groupBlogsCount,
      doc.filesPerBlogCount,
    );
  }

  static formatEntityToResponse(
    subscriptionPlan: SubscriptionPlan,
  ): SubscriptionPlanResponse {
    return {
      _id: subscriptionPlan.getId(),
      mpPreapprovalPlanId: subscriptionPlan.getMpPreapprovalPlanId(),
      isActive: subscriptionPlan.getIsActive(),
      reason: subscriptionPlan.getReason(),
      description: subscriptionPlan.getDescription(),
      features: subscriptionPlan.getFeatures(),
      intervalTime: subscriptionPlan.getIntervalTime(),
      price: subscriptionPlan.getPrice(),
      isFree: subscriptionPlan.getIsFree(),
      postsLibresCount: subscriptionPlan.getPostsLibresCount(),
      postsAgendaCount: subscriptionPlan.getPostsAgendaCount(),
      isPack: subscriptionPlan.getIsPack(),
      personalBlogsCount: subscriptionPlan.getPersonalBlogsCount(),
      groupBlogsCount: subscriptionPlan.getGroupBlogsCount(),
      filesPerBlogCount: subscriptionPlan.getFilesPerBlogCount(),
      // Tokens de IA por mes (neto visible): sale de env vars, no de la DB.
      aiTokensPerMonth: getPlanNetPubliciteTokens({
        mpPreapprovalPlanId: subscriptionPlan.getMpPreapprovalPlanId(),
        reason: subscriptionPlan.getReason(),
        isFree: subscriptionPlan.getIsFree(),
        isPack: subscriptionPlan.getIsPack(),
      }),
    };
  }
}
