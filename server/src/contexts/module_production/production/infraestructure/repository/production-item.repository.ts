import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import {
  ProductionItem,
} from '../../domain/entity/production-item.entity';
import {
  ProductionItemKind,
  ProductionModerationStatus,
} from '../../domain/entity/enum/production.enums';
import {
  ProductionItemRepositoryInterface,
  ProductionItemSearchFilter,
  ProductionSubtree,
} from '../../domain/repository/production-item.repository.interface';
import ProductionItemModel, {
  ProductionItemDocument,
} from '../schemas/production-item.schema';
import { toSearchText } from '../../application/functions/production.text';

const MAX_TREE_DEPTH = 50;

const toObjectId = (id: string) => new Types.ObjectId(id);

@Injectable()
export class ProductionItemRepository
  implements ProductionItemRepositoryInterface
{
  constructor(
    @InjectModel(ProductionItemModel.modelName)
    private readonly itemModel: Model<ProductionItemDocument>,
    @InjectModel('ProductionFolder')
    private readonly folderModel: Model<ProductionItemDocument>,
    @InjectModel('ProductionFile')
    private readonly fileModel: Model<ProductionItemDocument>,
    @InjectModel('ProductionArticle')
    private readonly articleModel: Model<ProductionItemDocument>,
  ) {}

  private modelFor(kind: ProductionItemKind): Model<ProductionItemDocument> {
    switch (kind) {
      case ProductionItemKind.folder:
        return this.folderModel;
      case ProductionItemKind.file:
        return this.fileModel;
      case ProductionItemKind.article:
        return this.articleModel;
    }
  }

  async create(item: ProductionItem, session?: ClientSession): Promise<string> {
    const data: Record<string, any> = item.toPersistence();
    // `kind` lo setea el discriminator.
    delete data.kind;
    data.searchName = toSearchText(item.getName);
    const [created] = await this.modelFor(item.getKind).create([data], {
      session,
    });
    return String(created._id);
  }

  async findById(
    id: string,
    session?: ClientSession,
  ): Promise<ProductionItem | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.itemModel
      .findById(id)
      .session(session ?? null)
      .lean();
    return doc ? ProductionItem.fromDocument(doc) : null;
  }

  async findByIds(
    productionId: string,
    ids: string[],
    session?: ClientSession,
  ): Promise<ProductionItem[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    if (validIds.length === 0) return [];
    const docs = await this.itemModel
      .find({
        production: toObjectId(productionId),
        _id: { $in: validIds.map(toObjectId) },
      })
      .session(session ?? null)
      .lean();
    return docs.map((doc) => ProductionItem.fromDocument(doc));
  }

  async findChildren(
    productionId: string,
    parentId: string | null,
  ): Promise<ProductionItem[]> {
    const docs = await this.itemModel
      .find({
        production: toObjectId(productionId),
        parent: parentId ? toObjectId(parentId) : null,
      })
      // Carpetas primero, después el contenido más reciente.
      .sort({ kind: -1, createdAt: -1, _id: -1 })
      .lean();
    return docs.map((doc) => ProductionItem.fromDocument(doc));
  }

  async findAncestors(itemId: string): Promise<ProductionItem[]> {
    if (!Types.ObjectId.isValid(itemId)) return [];
    const [result] = await this.itemModel.aggregate([
      { $match: { _id: toObjectId(itemId) } },
      {
        $graphLookup: {
          from: this.itemModel.collection.name,
          startWith: '$parent',
          connectFromField: 'parent',
          connectToField: '_id',
          as: 'ancestors',
          depthField: 'depth',
          maxDepth: MAX_TREE_DEPTH,
        },
      },
      { $project: { ancestors: 1 } },
    ]);
    const ancestors: any[] = result?.ancestors ?? [];
    return ancestors
      .sort((a, b) => a.depth - b.depth)
      .map((doc) => ProductionItem.fromDocument(doc));
  }

  async existsFileName(
    productionId: string,
    parentId: string | null,
    fileName: string,
    excludeId?: string,
    session?: ClientSession,
  ): Promise<boolean> {
    const query: Record<string, any> = {
      production: toObjectId(productionId),
      parent: parentId ? toObjectId(parentId) : null,
      fileName,
    };
    if (excludeId) query._id = { $ne: toObjectId(excludeId) };
    const found = await this.itemModel
      .exists(query)
      .session(session ?? null);
    return !!found;
  }

  async countByContainer(
    productionId: string,
    parentId: string | null,
    session?: ClientSession,
  ): Promise<number> {
    return this.itemModel
      .countDocuments({
        production: toObjectId(productionId),
        parent: parentId ? toObjectId(parentId) : null,
      })
      .session(session ?? null);
  }

  async updateById(
    id: string,
    fields: Record<string, any>,
    session?: ClientSession,
  ): Promise<ProductionItem | null> {
    const update = { ...fields };
    if (typeof update.name === 'string') {
      update.searchName = toSearchText(update.name);
    }
    const existing = await this.itemModel
      .findById(id)
      .select('kind')
      .session(session ?? null)
      .lean();
    if (!existing) return null;
    // Se actualiza con el modelo del discriminator para que Mongoose no
    // descarte los campos propios del subtipo (fileName, blocks, postcard).
    const doc = await this.modelFor(existing.kind)
      .findByIdAndUpdate(id, { $set: update }, { new: true, session })
      .lean();
    return doc ? ProductionItem.fromDocument(doc) : null;
  }

  async findSubtree(
    itemId: string,
    session?: ClientSession,
  ): Promise<ProductionSubtree> {
    const [result] = await this.itemModel
      .aggregate([
        { $match: { _id: toObjectId(itemId) } },
        {
          $graphLookup: {
            from: this.itemModel.collection.name,
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'parent',
            as: 'descendants',
            maxDepth: MAX_TREE_DEPTH,
          },
        },
        {
          $project: {
            kind: 1,
            'descendants._id': 1,
            'descendants.kind': 1,
          },
        },
      ])
      .session(session ?? null);

    if (!result) return { ids: [], quotaIds: [] };

    const nodes = [
      { _id: result._id, kind: result.kind },
      ...(result.descendants ?? []),
    ];
    return {
      ids: nodes.map((node) => node._id.toString()),
      quotaIds: nodes
        .filter((node) => node.kind !== ProductionItemKind.folder)
        .map((node) => node._id.toString()),
    };
  }

  async deleteByIds(ids: string[], session?: ClientSession): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.itemModel.deleteMany(
      { _id: { $in: ids.map(toObjectId) } },
      { session },
    );
    return result.deletedCount ?? 0;
  }

  async deleteByProduction(
    productionId: string,
    session?: ClientSession,
  ): Promise<number> {
    const result = await this.itemModel.deleteMany(
      { production: toObjectId(productionId) },
      { session },
    );
    return result.deletedCount ?? 0;
  }

  async search(
    filter: ProductionItemSearchFilter,
    page: number,
    limit: number,
  ): Promise<{ items: ProductionItem[]; total: number; hasMore: boolean }> {
    const query: Record<string, any> = {
      production: toObjectId(filter.productionId),
    };
    if (filter.kinds?.length) query.kind = { $in: filter.kinds };
    if (filter.parentId !== undefined) {
      query.parent = filter.parentId ? toObjectId(filter.parentId) : null;
    }
    if (filter.itemIds) {
      query._id = {
        $in: filter.itemIds
          .filter((id) => Types.ObjectId.isValid(id))
          .map(toObjectId),
      };
    }
    if (filter.searchRegex) {
      query.$or = [
        { searchName: { $regex: filter.searchRegex, $options: 'i' } },
        { fileName: { $regex: filter.searchRegex, $options: 'i' } },
      ];
    }

    const [docs, total] = await Promise.all([
      this.itemModel
        .find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.itemModel.countDocuments(query),
    ]);

    return {
      items: docs.map((doc) => ProductionItem.fromDocument(doc)),
      total,
      hasMore: page * limit < total,
    };
  }

  async setVisibility(
    productionId: string,
    ids: string[],
    visibility: string | null,
    session?: ClientSession,
  ): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.itemModel.updateMany(
      {
        production: toObjectId(productionId),
        _id: { $in: ids.map(toObjectId) },
      },
      { $set: { visibility } },
      { session },
    );
    return result.matchedCount ?? 0;
  }

  async setModerationStatus(
    id: string,
    status: ProductionModerationStatus,
    session?: ClientSession,
  ): Promise<void> {
    await this.itemModel.updateOne(
      { _id: id },
      { $set: { moderationStatus: status } },
      { session },
    );
  }
}
