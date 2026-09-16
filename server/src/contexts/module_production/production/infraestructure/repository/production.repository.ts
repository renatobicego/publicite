import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { Production } from '../../domain/entity/production.entity';
import {
  ProductionModerationStatus,
  ProductionOwnerType,
} from '../../domain/entity/enum/production.enums';
import {
  ProductionGroupRoster,
  ProductionListFilter,
  ProductionOwnerInfo,
  ProductionRepositoryInterface,
} from '../../domain/repository/production.repository.interface';
import ProductionModel, { ProductionDocument } from '../schemas/production.schema';
import { toSearchText } from '../../application/functions/production.text';

@Injectable()
export class ProductionRepository implements ProductionRepositoryInterface {
  constructor(
    private readonly logger: MyLoggerService,
    @InjectModel(ProductionModel.modelName)
    private readonly productionModel: Model<ProductionDocument>,
    @InjectModel('User')
    private readonly userModel: Model<any>,
    @InjectModel('Group')
    private readonly groupModel: Model<any>,
  ) {}

  async create(
    production: Production,
    session?: ClientSession,
  ): Promise<string> {
    const [created] = await this.productionModel.create(
      [
        {
          ...production.toPersistence(),
          searchTitle: toSearchText(production.getTitle),
          searchDescription: toSearchText(production.getDescription),
        },
      ],
      { session },
    );
    const id = String(created._id);
    this.logger.log('Production created: ' + id);
    return id;
  }

  async findById(
    id: string,
    session?: ClientSession,
  ): Promise<Production | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.productionModel
      .findById(id)
      .session(session ?? null)
      .lean();
    return doc ? Production.fromDocument(doc) : null;
  }

  async findByUrl(url: string): Promise<Production | null> {
    const doc = await this.productionModel.findOne({ url }).lean();
    return doc ? Production.fromDocument(doc) : null;
  }

  async findByIds(ids: string[]): Promise<Production[]> {
    const validIds = ids.filter((id) => Types.ObjectId.isValid(id));
    if (validIds.length === 0) return [];
    const docs = await this.productionModel
      .find({ _id: { $in: validIds.map((id) => new Types.ObjectId(id)) } })
      .lean();
    return docs.map((doc) => Production.fromDocument(doc));
  }

  async findOwnerInfo(
    ownerId: string,
    ownerType: ProductionOwnerType,
  ): Promise<ProductionOwnerInfo | null> {
    const result = await this.findOwnersInfo([{ ownerId, ownerType }]);
    return result.get(ownerId) ?? null;
  }

  async findOwnersInfo(
    owners: { ownerId: string; ownerType: ProductionOwnerType }[],
  ): Promise<Map<string, ProductionOwnerInfo>> {
    const result = new Map<string, ProductionOwnerInfo>();
    const idsByType = (type: ProductionOwnerType) =>
      Array.from(
        new Set(
          owners
            .filter((owner) => owner.ownerType === type)
            .map((owner) => owner.ownerId),
        ),
      ).map((id) => new Types.ObjectId(id));

    const userIds = idsByType(ProductionOwnerType.User);
    const groupIds = idsByType(ProductionOwnerType.Group);

    const [users, groups] = await Promise.all([
      userIds.length
        ? this.userModel
            .find({ _id: { $in: userIds } })
            .select('name lastName businessName username profilePhotoUrl')
            .lean()
        : [],
      groupIds.length
        ? this.groupModel
            .find({ _id: { $in: groupIds } })
            .select('name alias profilePhotoUrl')
            .lean()
        : [],
    ]);

    [...(users as any[]), ...(groups as any[])].forEach((doc) => {
      result.set(doc._id.toString(), {
        _id: doc._id.toString(),
        name: doc.name,
        lastName: doc.lastName,
        businessName: doc.businessName,
        username: doc.username,
        alias: doc.alias,
        profilePhotoUrl: doc.profilePhotoUrl,
      });
    });
    return result;
  }

  private buildListQuery(filter: ProductionListFilter) {
    const and: Record<string, any>[] = [];

    if (!filter.includeModerated) {
      and.push({ moderationStatus: ProductionModerationStatus.active });
    }
    if (filter.ownerId) {
      and.push({ owner: new Types.ObjectId(filter.ownerId) });
    }
    if (filter.ownerType) {
      and.push({ ownerType: filter.ownerType });
    }

    // Con clave, el alcance no aplica (VIS-05): se listan sólo donde se pide
    // explícitamente (cartel del dueño), y ahí se muestran aunque el visitante
    // no esté dentro del alcance.
    const keyProtected = { accessKeyHash: { $ne: null } };
    const withoutKey = { accessKeyHash: null };
    const visibilityOr = filter.visibilityConditions.length
      ? { $or: filter.visibilityConditions }
      : null;

    if (filter.includeKeyProtected) {
      and.push({
        $or: [
          keyProtected,
          visibilityOr ? { $and: [withoutKey, visibilityOr] } : withoutKey,
        ],
      });
    } else {
      and.push(withoutKey);
      if (visibilityOr) and.push(visibilityOr);
    }

    if (filter.searchRegex) {
      and.push({
        $or: [
          { searchTitle: { $regex: filter.searchRegex, $options: 'i' } },
          { searchDescription: { $regex: filter.searchRegex, $options: 'i' } },
        ],
      });
    }

    return and.length ? { $and: and } : {};
  }

  async findList(
    filter: ProductionListFilter,
    page: number,
    limit: number,
  ): Promise<{ productions: Production[]; hasMore: boolean }> {
    const docs = await this.productionModel
      .find(this.buildListQuery(filter))
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .lean();

    return {
      productions: docs
        .slice(0, limit)
        .map((doc) => Production.fromDocument(doc)),
      hasMore: docs.length > limit,
    };
  }

  async findFeatured(
    filter: ProductionListFilter,
    limit: number,
  ): Promise<Production[]> {
    const docs = await this.productionModel
      .find(this.buildListQuery(filter))
      .sort({ isFeatured: -1, fansCount: -1, updatedAt: -1, _id: -1 })
      .limit(limit)
      .lean();
    return docs.map((doc) => Production.fromDocument(doc));
  }

  async updateById(
    id: string,
    fields: Record<string, any>,
    session?: ClientSession,
  ): Promise<Production | null> {
    const doc = await this.productionModel
      .findByIdAndUpdate(id, { $set: fields }, { new: true, session })
      .lean();
    return doc ? Production.fromDocument(doc) : null;
  }

  async deleteById(id: string, session?: ClientSession): Promise<void> {
    await this.productionModel.deleteOne({ _id: id }, { session });
  }

  async tryIncrementFilesCount(
    id: string,
    limit: number,
    session?: ClientSession,
  ): Promise<boolean> {
    const result = await this.productionModel.updateOne(
      { _id: id, filesCount: { $lt: limit } },
      { $inc: { filesCount: 1 } },
      { session },
    );
    return result.modifiedCount === 1;
  }

  async decrementFilesCount(
    id: string,
    amount: number,
    session?: ClientSession,
  ): Promise<void> {
    if (amount <= 0) return;
    await this.productionModel.updateOne(
      { _id: id },
      [
        {
          $set: {
            filesCount: {
              $max: [0, { $subtract: ['$filesCount', amount] }],
            },
          },
        },
      ],
      { session },
    );
  }

  async removeFromShowcase(
    id: string,
    itemIds: string[],
    session?: ClientSession,
  ): Promise<void> {
    if (itemIds.length === 0) return;
    await this.productionModel.updateOne(
      { _id: id },
      {
        $pull: {
          showcase: { $in: itemIds.map((itemId) => new Types.ObjectId(itemId)) },
        },
      },
      { session },
    );
  }

  async setAccessKeyHash(
    id: string,
    accessKeyHash: string | null,
  ): Promise<Production | null> {
    const doc = await this.productionModel
      .findByIdAndUpdate(
        id,
        { $set: { accessKeyHash }, $inc: { accessKeyVersion: 1 } },
        { new: true },
      )
      .lean();
    return doc ? Production.fromDocument(doc) : null;
  }

  async incrementFansCount(
    id: string,
    amount: number,
    session?: ClientSession,
  ): Promise<void> {
    await this.productionModel.updateOne(
      { _id: id },
      [
        {
          $set: {
            fansCount: { $max: [0, { $add: ['$fansCount', amount] }] },
          },
        },
      ],
      { session },
    );
  }

  async setModerationStatus(
    id: string,
    status: ProductionModerationStatus,
    session?: ClientSession,
  ): Promise<void> {
    await this.productionModel.updateOne(
      { _id: id },
      { $set: { moderationStatus: status } },
      { session },
    );
  }

  async findGroupRoster(groupId: string): Promise<ProductionGroupRoster | null> {
    if (!Types.ObjectId.isValid(groupId)) return null;
    const group: any = await this.groupModel
      .findById(groupId)
      .select('creator admins members')
      .lean();
    if (!group) return null;
    return {
      _id: group._id.toString(),
      creator: group.creator,
      admins: group.admins ?? [],
      members: group.members ?? [],
    };
  }

  async setGroupBlog(
    groupId: string,
    productionId: string | null,
    session?: ClientSession,
  ): Promise<void> {
    await this.groupModel.updateOne(
      { _id: groupId },
      { $set: { blog: productionId ? new Types.ObjectId(productionId) : null } },
      { session },
    );
  }
}
