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
exports.SectorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let SectorController = class SectorController {
    constructor(logger, sectorAdapter) {
        this.logger = logger;
        this.sectorAdapter = sectorAdapter;
    }
    async getAllSectors() {
        try {
            this.logger.log(`Searching all sectors of publicite`);
            const sectors = await this.sectorAdapter.getAll();
            return sectors;
        }
        catch (error) {
            throw error;
        }
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sectors of publicite' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Return all sectors.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: 'Internal server error.',
    })
], SectorController.prototype, "getAllSectors", null);
SectorController = __decorate([
    (0, swagger_1.ApiTags)('Business sector management'),
    (0, common_1.Controller)('/businessSector'),
    __param(1, (0, common_1.Inject)('SectorAdapterInterface'))
], SectorController);
exports.SectorController = SectorController;
//# sourceMappingURL=sector.controller.js.map