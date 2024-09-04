"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectorRepository = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const sector_entity_1 = require("../../domain/entity/sector.entity");
let SectorRepository = class SectorRepository {
    constructor(sectorModel, logger) {
        this.sectorModel = sectorModel;
        this.logger = logger;
    }
    async validateSector(sectorId) {
        try {
            return this.sectorModel
                .findById(sectorId)
                .then((sector) => {
                if (!sector) {
                    this.logger.error('Sector not found, plase try again with a valid id');
                    throw Error('Sector not found');
                }
            })
                .catch((error) => {
                throw error;
            });
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    async getAll() {
        try {
            const sectorDocuments = await this.sectorModel.find();
            return sectorDocuments.map((doc) => sector_entity_1.Sector.formatDocumentToClass(doc));
        }
        catch (error) {
            throw error;
        }
    }
};
SectorRepository = __decorate([
    __param(0, (0, mongoose_1.InjectModel)('Sector'))
], SectorRepository);
exports.SectorRepository = SectorRepository;
//# sourceMappingURL=sector.repository.js.map