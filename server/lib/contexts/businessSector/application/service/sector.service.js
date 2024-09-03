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
exports.SectorService = void 0;
const common_1 = require("@nestjs/common");
const sector_dto_1 = require("../../infraestructure/controller/request/sector.dto");
let SectorService = class SectorService {
    constructor(logger, sectorRepository) {
        this.logger = logger;
        this.sectorRepository = sectorRepository;
    }
    async getAll() {
        try {
            this.logger.log('Getting all sectors in service');
            const sectors = await this.sectorRepository.getAll();
            return sectors.map((doc) => sector_dto_1.SectorResponseDto.formatClassToResponse(doc));
        }
        catch (error) {
            this.logger.error('An error has ocurred while getting all sectors: ' + error);
            throw error;
        }
    }
};
SectorService = __decorate([
    __param(1, (0, common_1.Inject)('SectorRepositoryInterface'))
], SectorService);
exports.SectorService = SectorService;
//# sourceMappingURL=sector.service.js.map