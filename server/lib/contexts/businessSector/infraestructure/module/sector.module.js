"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectorModule = void 0;
const common_1 = require("@nestjs/common");
const sector_schema_1 = require("../schema/sector.schema");
const mongoose_1 = require("@nestjs/mongoose");
const sector_repository_1 = require("../repository/sector.repository");
const sector_adapter_1 = require("../adapter/sector.adapter");
const sector_controller_1 = require("../controller/sector.controller");
const logger_service_1 = require("src/contexts/shared/logger/logger.service");
const sector_service_1 = require("../../application/service/sector.service");
let SectorModule = class SectorModule {
};
SectorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'Sector', schema: sector_schema_1.SectorSchema }]),
        ],
        controllers: [sector_controller_1.SectorController],
        providers: [
            logger_service_1.MyLoggerService,
            {
                provide: 'SectorRepositoryInterface',
                useClass: sector_repository_1.SectorRepository,
            },
            {
                provide: 'SectorServiceInterface',
                useClass: sector_service_1.SectorService,
            },
            {
                provide: 'SectorAdapterInterface',
                useClass: sector_adapter_1.SectorAdapter,
            },
        ],
        exports: [
            {
                provide: 'SectorServiceInterface',
                useClass: sector_service_1.SectorService,
            },
            mongoose_1.MongooseModule,
        ],
    })
], SectorModule);
exports.SectorModule = SectorModule;
//# sourceMappingURL=sector.module.js.map