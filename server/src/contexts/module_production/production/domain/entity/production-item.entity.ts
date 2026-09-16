import {
  ProductionFileType,
  ProductionItemKind,
  ProductionModerationStatus,
} from './enum/production.enums';
import { Visibility } from 'src/contexts/module_post/post/domain/entity/enum/post-visibility.enum';

/** Dorso de la postal (BLG-08). */
export interface ProductionPostcardBack {
  latitude?: number;
  longitude?: number;
  authorship?: string;
  dedication?: string;
  description?: string;
}

/** Bloque de Editor.js; `data` se persiste stringificado (patrón Novelty). */
export interface ProductionArticleBlock {
  type: string;
  data: string;
}

export interface ProductionItemBaseProps {
  _id?: string;
  production: string;
  parent?: string | null;
  name: string;
  // null/undefined = hereda la visibilidad del padre (VIS-03/04).
  visibility?: Visibility | null;
  moderationStatus?: ProductionModerationStatus;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductionFileProps extends ProductionItemBaseProps {
  fileName: string;
  fileType: ProductionFileType;
  key: string;
  postcard?: ProductionPostcardBack;
}

export interface ProductionArticleProps extends ProductionItemBaseProps {
  fileName: string;
  blocks: ProductionArticleBlock[];
}

/**
 * Nodo del árbol de una producción (BLG-07). Carpetas, archivos y artículos
 * comparten colección y se distinguen por `kind` (patrón discriminator de Post):
 * así la herencia de visibilidad, los tickets, la SeudoBase y las denuncias
 * recorren el árbol sin importar el tipo de nodo.
 */
export abstract class ProductionItem {
  protected readonly base: ProductionItemBaseProps;

  protected constructor(base: ProductionItemBaseProps) {
    this.base = {
      parent: null,
      visibility: null,
      moderationStatus: ProductionModerationStatus.active,
      ...base,
    };
  }

  abstract get getKind(): ProductionItemKind;

  /** Archivos y artículos cuentan para el cupo del plan (BLG-17, PLN-05). */
  get countsForQuota(): boolean {
    return this.getKind !== ProductionItemKind.folder;
  }

  get getId() {
    return this.base._id;
  }
  get getProduction() {
    return this.base.production;
  }
  get getParent() {
    return this.base.parent ?? null;
  }
  get getName() {
    return this.base.name;
  }
  get getVisibility() {
    return this.base.visibility ?? null;
  }
  get getModerationStatus() {
    return this.base.moderationStatus;
  }
  get getCreatedBy() {
    return this.base.createdBy;
  }
  get getCreatedAt() {
    return this.base.createdAt;
  }
  get getUpdatedAt() {
    return this.base.updatedAt;
  }

  protected basePersistence() {
    const { _id, ...rest } = this.base;
    return { ...rest, kind: this.getKind };
  }

  abstract toPersistence(): Record<string, any>;

  static fromDocument(doc: any): ProductionItem {
    const base: ProductionItemBaseProps = {
      _id: doc._id?.toString(),
      production: doc.production?.toString(),
      parent: doc.parent ? doc.parent.toString() : null,
      name: doc.name,
      visibility: doc.visibility ?? null,
      moderationStatus:
        doc.moderationStatus ?? ProductionModerationStatus.active,
      createdBy: doc.createdBy?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    switch (doc.kind) {
      case ProductionItemKind.folder:
        return new ProductionFolder(base);
      case ProductionItemKind.file:
        return new ProductionFile({
          ...base,
          fileName: doc.fileName,
          fileType: doc.fileType,
          key: doc.key,
          postcard: doc.postcard ?? undefined,
        });
      case ProductionItemKind.article:
        return new ProductionArticle({
          ...base,
          fileName: doc.fileName,
          blocks: doc.blocks ?? [],
        });
      default:
        throw new Error(`Tipo de ítem desconocido: ${doc.kind}`);
    }
  }
}

export class ProductionFolder extends ProductionItem {
  constructor(props: ProductionItemBaseProps) {
    super(props);
  }

  get getKind(): ProductionItemKind {
    return ProductionItemKind.folder;
  }

  toPersistence() {
    return this.basePersistence();
  }
}

export class ProductionFile extends ProductionItem {
  private readonly file: Omit<ProductionFileProps, keyof ProductionItemBaseProps>;

  constructor(props: ProductionFileProps) {
    const { fileName, fileType, key, postcard, ...base } = props;
    super(base);
    this.file = { fileName, fileType, key, postcard };
  }

  get getKind(): ProductionItemKind {
    return ProductionItemKind.file;
  }
  get getFileName() {
    return this.file.fileName;
  }
  get getFileType() {
    return this.file.fileType;
  }
  get getKey() {
    return this.file.key;
  }
  get getPostcard() {
    return this.file.postcard;
  }

  toPersistence() {
    return { ...this.basePersistence(), ...this.file };
  }
}

export class ProductionArticle extends ProductionItem {
  private readonly article: Omit<
    ProductionArticleProps,
    keyof ProductionItemBaseProps
  >;

  constructor(props: ProductionArticleProps) {
    const { fileName, blocks, ...base } = props;
    super(base);
    this.article = { fileName, blocks };
  }

  get getKind(): ProductionItemKind {
    return ProductionItemKind.article;
  }
  get getFileName() {
    return this.article.fileName;
  }
  get getBlocks() {
    return this.article.blocks;
  }

  toPersistence() {
    return { ...this.basePersistence(), ...this.article };
  }
}
