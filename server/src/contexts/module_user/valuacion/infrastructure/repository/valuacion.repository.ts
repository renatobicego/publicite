import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  ValuacionListResult,
  ValuacionRepositoryInterface,
} from '../../domain/repository/valuacion.repository.interface';
import { ValuacionEntity } from '../../domain/entity/valuacion.entity';
import { ValuacionStatus } from '../../domain/entity/enum/valuacion.enums';
import { ValuacionDocument } from '../schemas/valuacion.schema';

/** Filtro base: las valuaciones borradas lógicamente nunca se devuelven. */
const NOT_DELETED = { deletedAt: null };

@Injectable()
export class ValuacionRepository implements ValuacionRepositoryInterface {
  constructor(
    @InjectModel('Valuacion')
    private readonly valuacionModel: Model<ValuacionDocument>,
  ) {}

  async create(valuacion: Partial<ValuacionEntity>): Promise<ValuacionEntity> {
    const created = await this.valuacionModel.create(valuacion);
    return this.toEntity(created.toObject());
  }

  async findById(valuacionId: string): Promise<ValuacionEntity | null> {
    if (!Types.ObjectId.isValid(valuacionId)) return null;
    const found = await this.valuacionModel
      .findOne({ _id: valuacionId, ...NOT_DELETED })
      .lean();
    return found ? this.toEntity(found) : null;
  }

  async findByUser(
    userId: string,
    limit: number,
    page: number,
  ): Promise<ValuacionListResult> {
    const safeLimit = Math.min(Math.max(Math.floor(limit) || 20, 1), 100);
    const safePage = Math.max(Math.floor(page) || 1, 1);
    const filter = { userId, ...NOT_DELETED };

    const [rows, total] = await Promise.all([
      this.valuacionModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      this.valuacionModel.countDocuments(filter),
    ]);

    return {
      valuaciones: rows.map((row) => this.toEntity(row)),
      total,
      hasMore: safePage * safeLimit < total,
    };
  }

  async findByPostId(postId: string): Promise<ValuacionEntity | null> {
    if (!Types.ObjectId.isValid(postId)) return null;
    const found = await this.valuacionModel
      .findOne({ postId: new Types.ObjectId(postId), ...NOT_DELETED })
      .sort({ createdAt: -1 })
      .lean();
    return found ? this.toEntity(found) : null;
  }

  async update(
    valuacionId: string,
    changes: Record<string, any>,
  ): Promise<ValuacionEntity | null> {
    if (!Types.ObjectId.isValid(valuacionId)) return null;
    const updated = await this.valuacionModel
      .findOneAndUpdate(
        { _id: valuacionId, ...NOT_DELETED },
        changes,
        { new: true },
      )
      .lean();
    return updated ? this.toEntity(updated) : null;
  }

  async softDelete(valuacionId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(valuacionId)) return false;
    const result = await this.valuacionModel.updateOne(
      { _id: valuacionId, ...NOT_DELETED },
      { $set: { deletedAt: new Date(), status: ValuacionStatus.archived } },
    );
    return result.modifiedCount > 0;
  }

  async countCreatedSince(userId: string, since: Date): Promise<number> {
    // Cuenta también las borradas: si no, borrar sería una forma de resetear el límite.
    return this.valuacionModel.countDocuments({
      userId,
      createdAt: { $gte: since },
    });
  }

  private toEntity(doc: any): ValuacionEntity {
    return new ValuacionEntity({
      _id: doc._id?.toString(),
      userId: doc.userId,
      sessionId: doc.sessionId,
      postId: doc.postId ? doc.postId.toString() : null,
      category: doc.category,
      status: doc.status,
      mode: doc.mode,
      title: doc.title ?? null,
      layer: doc.layer ?? 1,
      completionPercent: doc.completionPercent ?? 0,
      confidencePercent: doc.confidencePercent ?? 0,
      coveredFields: doc.coveredFields ?? [],
      notApplicableFields: doc.notApplicableFields ?? [],
      briefItems: doc.briefItems ?? [],
      briefMessages: doc.briefMessages ?? [],
      briefAnswers: doc.briefAnswers ?? [],
      images: doc.images ?? [],
      photoAnalysis: doc.photoAnalysis ?? null,
      descriptiveAnalysis: doc.descriptiveAnalysis ?? null,
      estimatedValues: doc.estimatedValues ?? null,
      pricingRationale: doc.pricingRationale ?? null,
      finalScore: doc.finalScore ?? null,
      dataSources: doc.dataSources ?? [],
      versions: doc.versions ?? [],
      deletedAt: doc.deletedAt ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
